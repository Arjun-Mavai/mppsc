import { NextResponse, after } from 'next/server';
import { db } from '@/db';
import { whatsappCampaignLogs } from '@/db/schema';
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
              if (value.statuses && value.statuses.length > 0) {
                const statusObj = value.statuses[0];
                const messageId = statusObj.id;
                const newStatus = statusObj.status?.toUpperCase();

                if (messageId && newStatus) {
                  await db
                    .update(whatsappCampaignLogs)
                    .set({ status: newStatus, updatedAt: new Date() })
                    .where(eq(whatsappCampaignLogs.messageId, messageId));
                }
              }

              // 2. Handle incoming messages (replies)
              if (value.messages && value.messages.length > 0) {
                const messageObj = value.messages[0];
                const fromNumber = messageObj.from;
                const contactName = value.contacts?.[0]?.profile?.name || 'WhatsApp User';
                
                let incomingText = '';
                let interactiveData = null;

                if (messageObj.type === 'text') {
                  incomingText = messageObj.text?.body || '';
                } else if (messageObj.type === 'interactive') {
                  // Extract the ID of the button clicked
                  interactiveData = messageObj.interactive?.button_reply?.id;
                  incomingText = `[Button: ${messageObj.interactive?.button_reply?.title || 'Unknown'}]`;
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
                  });
                  const convId = saveRes.conversationId;

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
                        `मैं व्यक्तिगत रूप से आपकी सहायता करने की कोशिश करूँगा।\n\n` +
                        `👨‍💻 *Arjun*\n` +
                        `MPPSC ZenScroll\n\n` +
                        `कृपया अपनी समस्या या प्रश्न नीचे विस्तार से लिखें।\n` +
                        `जितनी स्पष्ट जानकारी देंगे, उतनी जल्दी सहायता मिल पाएगी। 👇`
                      : `🎫 *Support Request Received*\n\n` +
                        `Your query (${issueType}) has reached us.\n` +
                        `I will personally try to assist you.\n\n` +
                        `👨‍💻 *Arjun*\n` +
                        `MPPSC ZenScroll\n\n` +
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
                    // Default Greeting
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
                  }

                  // Send the response back
                  if (buttons && buttons.length > 0 && buttons.length <= 3) { // WhatsApp supports max 3 buttons
                    await sendWhatsAppInteractive(fromNumber, responseText, buttons);
                  } else {
                    await sendWhatsAppText(fromNumber, responseText);
                  }

                  // Save outgoing bot message to DB
                  if (convId) {
                    await saveOutgoingMessage(convId, responseText, 'bot');
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
