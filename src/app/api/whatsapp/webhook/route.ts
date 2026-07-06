/**
 * WHATSAPP CLOUD API WEBHOOK
 * 
 * This is the public endpoint that Meta/WhatsApp hits when users send messages
 * to our business number. It handles incoming text/images, routes them to the DB
 * for the Admin Support Inbox, and triggers automated bot replies unless a human
 * admin has taken over the chat (humanActive = true).
 */

import { NextResponse, after } from 'next/server';
import { db } from '@/db';
import { whatsappCampaignLogs, supportMessages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { saveIncomingMessage, saveOutgoingMessage } from '@/actions/support-inbox-actions';
import { sendHumanRequestTelegramNotification } from '@/lib/telegram';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET;

const API_VERSION = 'v21.0';

// Helper to verify WhatsApp Webhook Signature
async function verifySignature(req: Request) {
  if (process.env.NODE_ENV === 'development') return true;

  const signature = req.headers.get('x-hub-signature-256');
  if (!signature || !WHATSAPP_APP_SECRET) return false;

  const body = await req.clone().text();
  const hmac = crypto.createHmac('sha256', WHATSAPP_APP_SECRET);
  const digest = 'sha256=' + hmac.update(body).digest('hex');
  
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Helper to send Interactive Messages (Buttons)
async function sendWhatsAppInteractive(toPhone: string, text: string, buttons: { id: string; title: string }[]) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) return null;
  const url = `https://graph.facebook.com/${API_VERSION}/${WHATSAPP_PHONE_ID}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toPhone,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text },
      action: {
        buttons: buttons.map((btn) => ({
          type: 'reply',
          reply: { id: btn.id, title: btn.title }
        }))
      }
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (error) {
    logger.error('WhatsApp Interactive API Error', error, { category: 'api' });
    return null;
  }
}

// Helper to send Text Messages
async function sendWhatsAppText(toPhone: string, text: string) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) return null;
  const url = `https://graph.facebook.com/${API_VERSION}/${WHATSAPP_PHONE_ID}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toPhone,
    type: 'text',
    text: { preview_url: false, body: text }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (error) {
    logger.error('WhatsApp Text API Error', error, { category: 'api' });
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return new NextResponse(challenge, { status: 200 });
    } else {
      return new NextResponse('Forbidden', { status: 403 });
    }
  } catch (error) {
    logger.error('Webhook verification error', error, { category: 'api' });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 🛡️ SECURITY: Verify Meta Signature
    const isAuthentic = await verifySignature(req);
    if (!isAuthentic) {
      logger.warn('Unauthorized Webhook Attempt: Invalid Signature', { category: 'api' });
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('--- WhatsApp Webhook Triggered (Vercel Force Deploy) ---');

    const body = await req.json();

    if (body.object === 'whatsapp_business_account') {
      if (body.entry && Array.isArray(body.entry)) {
        after(async () => {
          try {
            const promises = [];
            for (const entry of body.entry) {
              if (entry.changes && Array.isArray(entry.changes)) {
                for (const change of entry.changes) {
                  promises.push((async () => {
                    const value = change.value;
                    if (!value) return;

              // 1. Handle message status updates (sent, delivered, read)
              if (value.statuses && Array.isArray(value.statuses)) {
                for (const statusObj of value.statuses) {
                  const messageId = statusObj.id;
                  const newStatus = statusObj.status?.toUpperCase();

                  if (messageId && newStatus) {
                    const statusLower = newStatus.toLowerCase();
                    
                    if (statusLower === 'failed' && statusObj.errors) {
                      logger.error(`WhatsApp message failed to deliver`, new Error(JSON.stringify(statusObj.errors)), { category: 'api', context: { messageId } });
                    }

                    await Promise.allSettled([
                      db.update(whatsappCampaignLogs)
                        .set({ status: newStatus, updatedAt: new Date() })
                        .where(eq(whatsappCampaignLogs.messageId, messageId)),
                      db.update(supportMessages)
                        .set({ status: statusLower as 'sent' | 'delivered' | 'read' | 'failed' })
                        .where(eq(supportMessages.id, messageId))
                    ]);
                  }
                }
              }

              // 2. Handle incoming messages (replies)
              if (value.messages && value.messages.length > 0) {
                const messageObj = value.messages[0];
                const fromNumber = messageObj.from;
                const contactName = value.contacts?.[0]?.profile?.name || 'WhatsApp User';
                let incomingText = '';
                let interactiveData = null;
                let messageType: 'text' | 'image' | 'interactive' = 'text';
                let mediaUrl = undefined;

                if (messageObj.type === 'text') {
                  incomingText = messageObj.text?.body || '';
                } else if (messageObj.type === 'reaction') {
                  const emoji = messageObj.reaction?.emoji;
                  incomingText = emoji ? `[Reacted with ${emoji}]` : `[Removed reaction]`;
                  messageType = 'text';
                } else if (messageObj.type === 'interactive') {
                  // Extract the ID of the button clicked
                  interactiveData = messageObj.interactive?.button_reply?.id;
                  incomingText = `[Button: ${messageObj.interactive?.button_reply?.title || 'Unknown'}]`;
                  messageType = 'interactive';
                } else if (messageObj.type === 'button') {
                  // This is a Quick Reply button clicked from a Template message
                  interactiveData = messageObj.button?.payload;
                  incomingText = `[Template Button: ${messageObj.button?.text || 'Unknown'}]`;
                  messageType = 'interactive';
                } else if (messageObj.type === 'image') {
                  incomingText = `[IMAGE] ${messageObj.image?.caption || ''}`.trim();
                  messageType = 'image';
                  mediaUrl = messageObj.image?.id;
                } else {
                  incomingText = `[Unsupported Message Type: ${messageObj.type}]`;
                }

                if (fromNumber && incomingText) {
                  // --- DB SAVING FOR SUPPORT INBOX ---
                  const saveRes = await saveIncomingMessage({
                    platform: 'whatsapp',
                    guestPhone: fromNumber,
                    guestName: contactName,
                    text: incomingText,
                    messageType,
                    mediaUrl,
                  });
                  const convId = saveRes.conversationId;

                  // --- TELEGRAM ALERT FOR FIRST TIME USER ---
                  if (saveRes.isFirstMessage) {
                    const timeOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' };
                    const formattedTime = new Date().toLocaleString('en-IN', timeOptions);
                    await sendHumanRequestTelegramNotification(
                      `🎉 *New User Started Conversation!* 🎉\n\n` +
                      `👤 *Student:* ${contactName}\n` +
                      `📞 *Phone:* +${fromNumber}\n` +
                      `🟢 *Platform:* WhatsApp\n` +
                      `⏰ *Time:* ${formattedTime}\n\n` +
                      `_User has just initiated their first ever message on the platform._`
                    );
                  }

                  // --- BOT SUPPRESSION (IF HUMAN IS ACTIVE) ---
                  // If admin took over, don't auto-reply unless it's a feedback button response
                  if (saveRes.humanActive && !interactiveData?.startsWith('FDBK_')) {
                    return; // Skip bot processing entirely
                  }

                  // --- BOT AUTO-REPLY LOGIC ---
                  let responseText = '';
                  let buttons = null;

                  if (interactiveData === 'LANG_EN') {
                    responseText = `Great! How can we help you today? 👇\n\n` +
                      `📚 *Plans & Access*\n` +
                      `Understand the direction for Prelims & Mains.\n\n` +
                      `🔧 *Support Desk*\n` +
                      `Facing login or access issues? Let us help!\n\n` +
                      `🔗 *Free Resources*\n` +
                      `Access the Syllabus Library, PYQs, and Blogs.`;

                    buttons = [
                      { id: 'INFO_PLANS_EN', title: '📚 Plans & Access' },
                      { id: 'SUPPORT_EN', title: '🔧 Support Desk' },
                      { id: 'MENU_EN', title: '🔗 Free Resources' }
                    ];
                  } else if (interactiveData === 'LANG_HI') {
                    responseText = `बढ़िया! आज हम आपकी कैसे मदद कर सकते हैं? 👇\n\n` +
                      `📚 *प्लान और एक्सेस*\n` +
                      `Prelims और Mains की दिशा समझें।\n\n` +
                      `🔧 *सपोर्ट और सहायता*\n` +
                      `लॉगिन या एक्सेस में समस्या? हम मदद करेंगे!\n\n` +
                      `🔗 *फ्री रिसोर्सेज*\n` +
                      `Syllabus Library, PYQs, और ब्लॉग्स एक्सेस करें।`;

                    buttons = [
                      { id: 'INFO_PLANS_HI', title: '📚 प्लान और एक्सेस' },
                      { id: 'SUPPORT_HI', title: '🔧 सपोर्ट और सहायता' },
                      { id: 'MENU_HI', title: '🔗 फ्री रिसोर्सेज' }
                    ];
                  } else if (interactiveData === 'INFO_PLANS_EN' || interactiveData === 'INFO_PLANS_HI') {
                    const isHi = interactiveData.endsWith('_HI');
                    responseText = isHi 
                      ? `🚀 *MPPSC ZenScroll*\n\n` +
                        `हर गंभीर अभ्यर्थी के पास किताबें, नोट्स और PDFs होते हैं।\n` +
                        `फिर भी अक्सर प्रश्न वही रहते हैं:\n\n` +
                        `❓ क्या पढ़ना है?\n` +
                        `❓ कितना पढ़ना है?\n` +
                        `❓ PYQs से वास्तव में क्या सीखना है?\n` +
                        `❓ Mains में उत्तर की दिशा कैसे समझनी है?\n\n` +
                        `━━━━━━━━━━━━\n` +
                        `📖 *Prelims Library*\n` +
                        `Syllabus Understanding • PYQ Connections\n\n` +
                        `🏛️ *Mains Library*\n` +
                        `Question Demand • Answer Frameworks\n\n` +
                        `🎯 *Complete Preparation*\n` +
                        `Integrated Learning. Structured & Revision Friendly.\n\n` +
                        `🔗 *Explore:* https://mppsc.zenscroll.app/pricing\n\n` +
                        `क्या आपको कोई समस्या आ रही है? 👇`
                      : `🚀 *MPPSC ZenScroll*\n\n` +
                        `Every serious aspirant has books, notes, and PDFs.\n` +
                        `Yet, the core questions remain:\n\n` +
                        `❓ What to study?\n` +
                        `❓ How much to study?\n` +
                        `❓ What to actually learn from PYQs?\n` +
                        `❓ How to understand the direction of Mains answers?\n\n` +
                        `━━━━━━━━━━━━\n` +
                        `📖 *Prelims Library*\n` +
                        `Syllabus Understanding • PYQ Connections\n\n` +
                        `🏛️ *Mains Library*\n` +
                        `Question Demand • Answer Frameworks\n\n` +
                        `🎯 *Complete Preparation*\n` +
                        `Integrated Learning. Structured & Revision Friendly.\n\n` +
                        `🔗 *Explore:* https://mppsc.zenscroll.app/pricing\n\n` +
                        `Are you facing any issues? 👇`;
                    
                    buttons = [
                      { id: isHi ? 'SUPPORT_HI' : 'SUPPORT_EN', title: isHi ? '🔧 ऐप सपोर्ट' : '🔧 App Support' },
                      { id: isHi ? 'LANG_HI' : 'LANG_EN', title: isHi ? '🔙 मुख्य मेनू' : '🔙 Main Menu' }
                    ];
                  } else if (interactiveData === 'MENU_EN') {
                    responseText = `🌐 *MPPSC ZenScroll Resources*\n\n` +
                      `Preparation becomes easier when direction is clear.\n\n` +
                      `📖 *Syllabus Library*\n` +
                      `Understand what to study and how deeply to study.\n` +
                      `🔗 https://mppsc.zenscroll.app/syllabus\n\n` +
                      `🏛️ *Mains Library*\n` +
                      `Learn how to approach, structure and develop answers.\n` +
                      `🔗 https://mppsc.zenscroll.app/mains\n\n` +
                      `📝 *Articles & Insights*\n` +
                      `🔗 https://mppsc.zenscroll.app/blogs\n\n` +
                      `Do you have a specific query or need human assistance? 👇`;

                    buttons = [
                      { id: 'SUPPORT_EN', title: '🔧 App Support' },
                      { id: 'LANG_EN', title: '🔙 Main Menu' }
                    ];
                  } else if (interactiveData === 'MENU_HI') {
                    responseText = `🌐 *MPPSC ZenScroll Resources*\n\n` +
                      `तैयारी तब आसान हो जाती है जब दिशा स्पष्ट हो।\n\n` +
                      `📖 *Syllabus Library*\n` +
                      `समझें कि क्या पढ़ना है और कितनी गहराई से पढ़ना है।\n` +
                      `🔗 https://mppsc.zenscroll.app/syllabus\n\n` +
                      `🏛️ *Mains Library*\n` +
                      `सीखें कि उत्तर कैसे सोचें, कैसे लिखें और फ्रेम करें।\n` +
                      `🔗 https://mppsc.zenscroll.app/mains\n\n` +
                      `📝 *Articles & Insights*\n` +
                      `🔗 https://mppsc.zenscroll.app/blogs\n\n` +
                      `क्या आपकी कोई और क्वेरी है या आपको ह्यूमन सपोर्ट की आवश्यकता है? 👇`;

                    buttons = [
                      { id: 'SUPPORT_HI', title: '🔧 ऐप सपोर्ट' },
                      { id: 'LANG_HI', title: '🔙 मुख्य मेनू' }
                    ];
                  } else if (interactiveData === 'SUPPORT_EN' || interactiveData === 'SUPPORT_HI') {
                    const isHi = interactiveData.endsWith('_HI');
                    responseText = isHi
                      ? `🔧 *सपोर्ट डेस्क*\nआपको किस प्रकार की सहायता की आवश्यकता है? 👇`
                      : `🔧 *Support Desk*\nWhat kind of assistance do you need? 👇`;

                    buttons = [
                      { id: isHi ? 'ISSUE_PAY_HI' : 'ISSUE_PAY_EN', title: isHi ? '💳 पेमेंट इश्यू' : '💳 Payment Issue' },
                      { id: isHi ? 'ISSUE_LOG_HI' : 'ISSUE_LOG_EN', title: isHi ? '🔐 लॉगिन इश्यू' : '🔐 Login Issue' },
                      { id: isHi ? 'ISSUE_OTH_HI' : 'ISSUE_OTH_EN', title: isHi ? '💬 अन्य प्रश्न' : '💬 Other Query' }
                    ];
                  } else if (interactiveData && interactiveData.startsWith('ISSUE_')) {
                    const isHi = interactiveData.endsWith('_HI');
                    
                    let issueType = "Other Query";
                    if (interactiveData.includes('_PAY_')) issueType = "Payment Issue";
                    if (interactiveData.includes('_LOG_')) issueType = "Login Issue";
                    
                    responseText = isHi
                      ? `🎫 *Support Request Received*\n\n` +
                        `आपकी क्वेरी (${issueType}) हमारे पास पहुँच गई है।\n` +
                        `हमारी टीम जल्द ही आपकी सहायता करने की कोशिश करेगी।\n\n` +
                        `*MPPSC ZenScroll Team*\n\n` +
                        `कृपया अपनी समस्या या प्रश्न नीचे विस्तार से लिखें।\n` +
                        `जितनी स्पष्ट जानकारी देंगे, उतनी जल्दी सहायता मिल पाएगी। 👇`
                      : `🎫 *Support Request Received*\n\n` +
                        `Your query (${issueType}) has reached us.\n` +
                        `Our team will try to assist you shortly.\n\n` +
                        `*MPPSC ZenScroll Team*\n\n` +
                        `Please write your exact issue or question in detail below.\n` +
                        `The clearer the details, the faster we can resolve it! 👇`;
                    
                    const timeOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' };
                    const formattedTime = new Date().toLocaleString('en-IN', timeOptions);

                    // Alert Admin via Telegram
                    await sendHumanRequestTelegramNotification(
                      `🚨 *Human Support Requested!* 🚨\n\n` +
                      `👤 *Student:* ${contactName}\n` +
                      `📞 *Phone:* +${fromNumber}\n` +
                      `🟢 *Platform:* WhatsApp Business\n` +
                      `📌 *Issue Type:* ${issueType}\n` +
                      `⏰ *Time:* ${formattedTime}\n\n` +
                      `⚡ _Please reply via the Admin Support Inbox._`
                    );
                  } else if (interactiveData === 'FDBK_EXC' || interactiveData === 'FDBK_AVG') {
                    responseText = `🌟 बहुत-बहुत धन्यवाद! आपके फीडबैक से हमें और बेहतर काम करने की प्रेरणा मिलती है।\n\nकिसी और जानकारी के लिए कृपया 'Hi' भेजें।\n\n(Thank you for your feedback! Send 'Hi' to start again.)`;
                  } else if (interactiveData === 'FDBK_BAD') {
                    responseText = `😞 हमें खेद है कि आपको हमारा सपोर्ट पसंद नहीं आया।\n\nक्या आप हमें बता सकते हैं कि क्या समस्या रही? आपके सुझाव से हम खुद को बेहतर बना सकते हैं! (कृपया अपना जवाब टाइप करके भेजें)`;
                  } else {
                    const textContent = incomingText.trim().toLowerCase();
                    const isGreeting = ['hi', 'hello', 'hey', 'namaste', 'start', 'menu', 'main menu'].includes(textContent);
                    const isSupportRequest = textContent.includes('talk to support') || textContent.includes('help') || incomingText.includes('[Template Button:');

                    if (isSupportRequest) {
                      responseText = `🔧 *Support Desk / सपोर्ट डेस्क*\n\nPlease select your language to continue / अपनी भाषा चुनें 👇`;
                      buttons = [
                        { id: 'SUPPORT_EN', title: 'English' },
                        { id: 'SUPPORT_HI', title: 'हिंदी' }
                      ];
                    } else if (isGreeting) {
                      responseText = `🎉 *Welcome to MPPSC ZenScroll*\n\n` +
                        `MPPSC की तैयारी में सबसे बड़ी चुनौती सामग्री (Content) की कमी नहीं होती।\n\n` +
                        `चुनौती होती है:\n` +
                        `📌 क्या पढ़ना है\n` +
                        `📌 कितना पढ़ना है\n` +
                        `📌 और परीक्षा वास्तव में क्या पूछ रही है\n\n` +
                        `ZenScroll का उद्देश्य केवल सामग्री देना नहीं,\n` +
                        `बल्कि सिलेबस, PYQs और उत्तर लेखन के बीच संबंध को स्पष्ट करना है।\n` +
                        `ताकि तैयारी अधिक व्यवस्थित, स्पष्ट और उद्देश्यपूर्ण बन सके।\n\n` +
                        `🌐 Please select your language\n` +
                        `🌐 कृपया अपनी भाषा चुनें:`;
                      buttons = [
                        { id: 'LANG_EN', title: 'English' },
                        { id: 'LANG_HI', title: 'हिंदी' }
                      ];
                    } else {
                      if (saveRes.previousUserText?.startsWith('[Button:')) {
                        responseText = `✅ *सन्देश प्राप्त हुआ (Message Received)*\n\nआपकी बात हम तक पहुँच गई है। हमारी टीम जल्द ही आपसे संपर्क करेगी। धन्यवाद!`;
                      } 
                      // 1. Gratitude (Thanks)
                      else if (['thanks', 'thank you', 'tq', 'ty', 'dhanyawad', 'dhanyabad', 'shukriya'].some(word => textContent.includes(word))) {
                        responseText = `You're most welcome! 😊 We're always here to help. Let us know if you need anything else.\n(आपका बहुत-बहुत स्वागत है! अगर आपको कुछ और मदद चाहिए तो हमें बताएं।)`;
                      }
                      // 2. Acknowledgement (Ok, Okay, Haan)
                      else if (/^(ok|okay|k|thik|theek|haan|yes|yep|sure|achha)$/.test(textContent)) {
                        responseText = `Great! 👍 Keep your motivation high. If you need the menu again, just send a 'Hi'. Happy studying!`;
                      }
                      // 3. Pricing & Plans
                      else if (['price', 'pricing', 'fees', 'cost', 'kitne ka', 'plan'].some(word => textContent.includes(word))) {
                        responseText = `Pricing details & Plans are available here! 🌐\n\n🔗 https://mppsc.zenscroll.app/pricing\n\nIf you need help choosing a plan, just let us know! 👇`;
                        buttons = [
                          { id: 'SUPPORT_EN', title: 'Support Desk' },
                          { id: 'LANG_EN', title: 'Main Menu' }
                        ];
                      }
                      // 4. App Download Queries
                      else if (['app', 'download', 'play store', 'apk'].some(word => textContent.includes(word))) {
                        responseText = `📱 *How to Install MPPSC ZenScroll App*\n\n` +
                          `Our platform is a fast, seamless Web-App. You don't need the Play Store! Just follow these easy steps:\n\n` +
                          `🤖 *For Android Users (Chrome):*\n` +
                          `1️⃣ Open 🔗 https://mppsc.zenscroll.app\n` +
                          `2️⃣ Click the **Three Dots (⋮)** in the top right corner.\n` +
                          `3️⃣ Tap on **"Add to Home screen"**.\n` +
                          `4️⃣ Click **"Add"** again. Done! 🎉\n\n` +
                          `🍎 *For iPhone Users (Safari):*\n` +
                          `1️⃣ Open 🔗 https://mppsc.zenscroll.app\n` +
                          `2️⃣ Tap the **Share icon** (square with an up arrow) at the bottom.\n` +
                          `3️⃣ Scroll down and tap **"Add to Home Screen"** ➕.\n` +
                          `4️⃣ Tap **"Add"** in the top right. Done! 🎉\n\n` +
                          `Now you can use ZenScroll exactly like a native app! 🚀`;
                      }
                      // 5. Free / Demo Queries
                      else if (['demo', 'free', 'trial'].some(word => textContent.includes(word))) {
                        responseText = `We have plenty of Free Resources! 🎁\n\nYou can explore our Syllabus Library, attempt Free Tests, and read our Strategy Blogs without any payment.\n\nLet me show you the menu 👇`;
                        buttons = [
                          { id: 'LANG_EN', title: 'English Menu' },
                          { id: 'LANG_HI', title: 'हिंदी मेनू' }
                        ];
                      }
                      // 6. Call Requests
                      else if (['call', 'number', 'phone', 'baat karni', 'contact'].some(word => textContent.includes(word))) {
                        responseText = `Right now, we provide fast and reliable support via WhatsApp chat! 💬\n\nPlease share your exact query here, and I'll personally look into it to assist you.`;
                      }
                      // 7. Greetings (Morning/Night)
                      else if (textContent.includes('morning') || textContent.includes('night') || textContent.includes('evening') || textContent.includes('afternoon')) {
                        responseText = `Greetings! ☀️ Every day is a new opportunity for your MPPSC prep. How can we assist you today? Send 'Hi' to open the menu.`;
                      }
                      // 8. Compliments
                      else if (['awesome', 'great', 'nice', 'good', 'amazing', 'super', 'best', 'badhiya', 'mast', 'wow'].includes(textContent)) {
                        responseText = `Thank you for the kind words! 🌟 Your success is our ultimate goal. Keep scrolling, keep learning!`;
                      }
                      // 9. Bot Identity
                      else if (textContent.includes('who are you') || textContent.includes('tum kaun') || textContent.includes('bot')) {
                        responseText = `I am the automated assistant for MPPSC ZenScroll! 🤖 I'm here to help you navigate our resources instantly and connect you to our human support team if needed.`;
                      }
                      // 10. Login / Password Issues
                      else if (['password', 'login', 'open nahi ho raha', 'khol nahi raha', 'log in', 'bhul gaya'].some(word => textContent.includes(word))) {
                        responseText = `🔐 *Login & Password Help*\n\nAgar aap apna password bhul gaye hain ya login nahi kar pa rahe hain, to kripya niche click karke support ticket raise karein. Humari team turant aapse sampark karke password reset karne me madad karegi 👇`;
                        buttons = [
                          { id: 'ISSUE_LOG_HI', title: 'लॉगिन हेल्प दर्ज करें' },
                          { id: 'LANG_HI', title: '🔙 मुख्य मेनू' }
                        ];
                      }
                      // 11. Wait / Hold On
                      else if (['ruko', 'ek minute', 'wait', 'hold', '1 min', 'thodi der'].some(word => textContent.includes(word))) {
                        responseText = `Sure, take your time! ⏳\nWhenever you are ready to continue, just send a 'Hi' and I'll be right here.`;
                      }
                      // 12. Language Switch Request (Hindi)
                      else if (['hindi', 'hindi me batao', 'hindi please', 'hindi medium'].some(word => textContent.includes(word))) {
                        responseText = `जी बिल्कुल! हमारी पूरी प्रणाली हिंदी में उपलब्ध है।\n\nकृपया नीचे दिए गए बटन पर क्लिक करके हिंदी मेनू खोलें 👇`;
                        buttons = [
                          { id: 'LANG_HI', title: 'हिंदी मेनू (Menu)' }
                        ];
                      }
                      // 13. Discount / Offers / Promo Code
                      else if (['discount', 'offer', 'kam kardo', 'concession', 'promo', 'coupon'].some(word => textContent.includes(word))) {
                        responseText = `Humare sabhi plans already bohot affordable (student-friendly) prices par hain! 🎓\n\nAap current plans aur pricing yahan check kar sakte hain:\n🔗 https://mppsc.zenscroll.app/pricing\n\nKya aapko plan select karne me koi aur madad chahiye? 👇`;
                        buttons = [
                          { id: 'SUPPORT_HI', title: 'सपोर्ट से बात करें' }
                        ];
                      }
                      // 14. Payment Failed / Amount Deducted
                      else if (['fail', 'paise kat', 'deduct', 'amount cut', 'kat gaya', 'nahi hua'].some(word => textContent.includes(word))) {
                        responseText = `💳 *Payment Issue*\n\nDon't worry at all! Humari support team is transaction ko turant system me check karegi aur aapki puri madad karegi.\n\nKripya niche click karke apna issue raise karein, humein thodi detail provide karein aur hum ise jald se jald resolve karenge 👇`;
                        buttons = [
                          { id: 'ISSUE_PAY_HI', title: 'पेमेंट इश्यू दर्ज करें' }
                        ];
                      }
                      // 15. Strategy / How to Study
                      else if (['kaise padhu', 'strategy', 'notes kaise', 'kahan se', 'start karu', 'guidance'].some(word => textContent.includes(word))) {
                        responseText = `📚 *MPPSC Preparation Strategy*\n\nTaiyari ki sabse pehli seedhi hai 'Syllabus' ko samajhna aur 'PYQs' ko analyze karna.\n\nHumne specially MPPSC ke liye ek detailed Syllabus Library banayi hai. Apna preparation yahan se shuru karein:\n🔗 https://mppsc.zenscroll.app/syllabus`;
                      }
                      // 16. Human / Customer Care / Issues
                      else if (['insaan', 'customer care', 'human', 'agent', 'real person', 'koi hai', 'baat karna', 'issue', 'problem', 'dikkat', 'samasya'].some(word => textContent.includes(word))) {
                        responseText = `Aap bilkul humari support team se baat kar sakte hain! 👨‍💻\n\nKripya apni problem ya query yahan detail me type karke bhejein. Humari team jald hi (soon) aapse yahan chat par sampark karegi aur aapki madad karegi.`;
                      }
                      else {
                        // For random words that don't match, do nothing to avoid spamming the user.
                        return;
                      }
                    }
                  }

                  // Send the response back
                  let sentData = null;
                  if (buttons && buttons.length > 0 && buttons.length <= 3) { // WhatsApp supports max 3 buttons
                    sentData = await sendWhatsAppInteractive(fromNumber, responseText, buttons);
                  } else {
                    sentData = await sendWhatsAppText(fromNumber, responseText);
                  }

                  // Save outgoing bot message to DB with meta message ID
                  if (convId) {
                    const metaMessageId = sentData?.messages?.[0]?.id;
                    await saveOutgoingMessage(convId, responseText, 'bot', metaMessageId);
                  }
                }
              }
                  })());
                }
              }
            }
            await Promise.allSettled(promises);
          } catch (err) {
            logger.error('Background WhatsApp webhook error', err, { category: 'api' });
          }
        });
      }

      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    } else {
      return new NextResponse('Not Found', { status: 404 });
    }
  } catch (error) {
    logger.error('Webhook payload error', error, { category: 'api' });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
