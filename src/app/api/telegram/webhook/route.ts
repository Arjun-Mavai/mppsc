import { NextResponse } from 'next/server';
import { saveIncomingMessage, saveOutgoingMessage } from '@/actions/support-inbox-actions';
import { sendHumanRequestTelegramNotification } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const BOT_TOKEN = process.env.TELEGRAM_CONVERSATION_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

    if (!BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN not found');
      return new NextResponse('OK', { status: 200 }); // Return 200 so Telegram stops retrying
    }

    const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    let chatId = null;
    let responseText = '';
    let inlineKeyboard = null;
    
    // For DB tracking
    let incomingText = '';
    let guestName = 'Telegram User';

    // 1. Handle Regular Text Messages and Commands
    if (body.message && body.message.text) {
      chatId = body.message.chat.id;
      const text = body.message.text.trim().toLowerCase();
      incomingText = body.message.text;
      if (body.message.from && body.message.from.first_name) {
        guestName = body.message.from.first_name + (body.message.from.last_name ? ' ' + body.message.from.last_name : '');
      }

      if (text === '/start' || text === '/help') {
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
        inlineKeyboard = {
          inline_keyboard: [
            [
              { text: 'English 🇬🇧', callback_data: 'LANG_EN' },
              { text: 'हिंदी 🇮🇳', callback_data: 'LANG_HI' }
            ]
          ]
        };
      } else if (text === '/mains') {
        responseText = `🔥 *Mains Syllabus Hub:*\nNot a traditional PDF dump! Get deep structural clarity mapped directly to the syllabus tree.`;
        inlineKeyboard = {
          inline_keyboard: [[{ text: 'Chat with Human', callback_data: 'SUPPORT_EN' }]]
        };
      } else if (text === '/prelims') {
        responseText = `🎯 *Prelims Intelligence:*\nSystematically organized (Year-wise, Unit-wise) PYQ analytics and retention mnemonics. No rote learning.`;
        inlineKeyboard = {
          inline_keyboard: [[{ text: 'Chat with Human', callback_data: 'SUPPORT_EN' }]]
        };
      } else {
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
        inlineKeyboard = {
          inline_keyboard: [
            [
              { text: 'English 🇬🇧', callback_data: 'LANG_EN' },
              { text: 'हिंदी 🇮🇳', callback_data: 'LANG_HI' }
            ]
          ]
        };
      }
    } 
    else if (body.callback_query) {
      chatId = body.callback_query.message.chat.id;
      const data = body.callback_query.data;
      incomingText = `[Button Clicked: ${data}]`;
      if (body.callback_query.from && body.callback_query.from.first_name) {
        guestName = body.callback_query.from.first_name;
      }

      if (data === 'LANG_EN') {
        responseText = `Great! How can we help you today? 👇\n\n` +
          `📚 *Plans & Access*\n` +
          `Understand the direction for Prelims & Mains.\n\n` +
          `🔧 *Support Desk*\n` +
          `Facing login or access issues? Let us help!\n\n` +
          `🔗 *Free Resources*\n` +
          `Access the Syllabus Library, PYQs, and Blogs.`;

        inlineKeyboard = {
          inline_keyboard: [
            [{ text: '📚 Plans & Access', callback_data: 'INFO_PLANS_EN' }],
            [{ text: '🔧 Support Desk', callback_data: 'SUPPORT_EN' }],
            [{ text: '🔗 Free Resources', callback_data: 'MENU_EN' }]
          ]
        };
      } 
      else if (data === 'LANG_HI') {
        responseText = `बढ़िया! आज हम आपकी कैसे मदद कर सकते हैं? 👇\n\n` +
          `📚 *प्लान और एक्सेस*\n` +
          `Prelims और Mains की दिशा समझें।\n\n` +
          `🔧 *सपोर्ट और सहायता*\n` +
          `लॉगिन या एक्सेस में समस्या? हम मदद करेंगे!\n\n` +
          `🔗 *फ्री रिसोर्सेज*\n` +
          `Syllabus Library, PYQs, और ब्लॉग्स एक्सेस करें।`;

        inlineKeyboard = {
          inline_keyboard: [
            [{ text: '📚 प्लान और एक्सेस', callback_data: 'INFO_PLANS_HI' }],
            [{ text: '🔧 सपोर्ट और सहायता', callback_data: 'SUPPORT_HI' }],
            [{ text: '🔗 फ्री रिसोर्सेज', callback_data: 'MENU_HI' }]
          ]
        };
      }
      else if (data === 'INFO_PLANS_EN' || data === 'INFO_PLANS_HI') {
        const isHi = data.endsWith('_HI');
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
            `🔗 [यहाँ एक्सप्लोर करें](https://mppsc.zenscroll.app/pricing)\n\n` +
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
            `🔗 [Explore Here](https://mppsc.zenscroll.app/pricing)\n\n` +
            `Are you facing any issues? 👇`;
        
        inlineKeyboard = {
          inline_keyboard: [
            [{ text: isHi ? '🔧 ऐप सपोर्ट' : '🔧 App Support', callback_data: isHi ? 'SUPPORT_HI' : 'SUPPORT_EN' }],
            [{ text: isHi ? '🔙 मुख्य मेनू' : '🔙 Main Menu', callback_data: isHi ? 'LANG_HI' : 'LANG_EN' }]
          ]
        };
      }
      else if (data === 'MENU_EN') {
        responseText = `🌐 *MPPSC ZenScroll Resources*\n\n` +
          `Preparation becomes easier when direction is clear.\n\n` +
          `📖 [Syllabus Library](https://mppsc.zenscroll.app/syllabus)\n` +
          `Understand what to study and how deeply to study.\n\n` +
          `🏛️ [Mains Library](https://mppsc.zenscroll.app/mains)\n` +
          `Learn how to approach, structure and develop answers.\n\n` +
          `📝 [Articles & Insights](https://mppsc.zenscroll.app/blogs)\n\n` +
          `Do you have a specific query or need human assistance? 👇`;

        inlineKeyboard = {
          inline_keyboard: [
            [{ text: '🔧 App Support', callback_data: 'SUPPORT_EN' }],
            [{ text: '🔙 Main Menu', callback_data: 'LANG_EN' }]
          ]
        };
      } 
      else if (data === 'MENU_HI') {
        responseText = `🌐 *MPPSC ZenScroll Resources*\n\n` +
          `तैयारी तब आसान हो जाती है जब दिशा स्पष्ट हो।\n\n` +
          `📖 [Syllabus Library](https://mppsc.zenscroll.app/syllabus)\n` +
          `समझें कि क्या पढ़ना है और कितनी गहराई से पढ़ना है।\n\n` +
          `🏛️ [Mains Library](https://mppsc.zenscroll.app/mains)\n` +
          `सीखें कि उत्तर कैसे सोचें, कैसे लिखें और फ्रेम करें।\n\n` +
          `📝 [Articles & Insights](https://mppsc.zenscroll.app/blogs)\n\n` +
          `क्या आपकी कोई और क्वेरी है या आपको ह्यूमन सपोर्ट की आवश्यकता है? 👇`;

        inlineKeyboard = {
          inline_keyboard: [
            [{ text: '🔧 ऐप सपोर्ट', callback_data: 'SUPPORT_HI' }],
            [{ text: '🔙 मुख्य मेनू', callback_data: 'LANG_HI' }]
          ]
        };
      }
      else if (data === 'SUPPORT_EN' || data === 'SUPPORT_HI') {
        const isHi = data.endsWith('_HI');
        responseText = isHi
          ? `🔧 *सपोर्ट डेस्क*\nआपको किस प्रकार की सहायता की आवश्यकता है? 👇`
          : `🔧 *Support Desk*\nWhat kind of assistance do you need? 👇`;

        inlineKeyboard = {
          inline_keyboard: [
            [{ text: isHi ? '💳 पेमेंट इश्यू' : '💳 Payment Issue', callback_data: isHi ? 'ISSUE_PAY_HI' : 'ISSUE_PAY_EN' }],
            [{ text: isHi ? '🔐 लॉगिन इश्यू' : '🔐 Login Issue', callback_data: isHi ? 'ISSUE_LOG_HI' : 'ISSUE_LOG_EN' }],
            [{ text: isHi ? '💬 अन्य प्रश्न' : '💬 Other Query', callback_data: isHi ? 'ISSUE_OTH_HI' : 'ISSUE_OTH_EN' }]
          ]
        };
      }
      else if (data && data.startsWith('ISSUE_')) {
        const isHi = data.endsWith('_HI');
        
        let issueType = "Other Query";
        if (data.includes('_PAY_')) issueType = "Payment Issue";
        if (data.includes('_LOG_')) issueType = "Login Issue";
        
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
          `👤 *Student:* ${guestName}\n` +
          `💬 *Chat ID:* ${chatId}\n` +
          `🔵 *Platform:* Telegram Bot\n` +
          `📌 *Issue Type:* ${issueType}\n` +
          `⏰ *Time:* ${formattedTime}\n\n` +
          `⚡ _Please reply via the Admin Support Inbox._`
        );
      }
      else if (data === 'FDBK_EXC' || data === 'FDBK_AVG') {
        responseText = `🌟 बहुत-बहुत धन्यवाद! आपके फीडबैक से हमें और बेहतर काम करने की प्रेरणा मिलती है।\n\nकिसी और जानकारी के लिए कृपया '/start' भेजें।\n\n(Thank you for your feedback! Send '/start' to explore again.)`;
      }
      else if (data === 'FDBK_BAD') {
        responseText = `😞 हमें खेद है कि आपको हमारा सपोर्ट पसंद नहीं आया।\n\nक्या आप हमें बता सकते हैं कि क्या समस्या रही? आपके सुझाव से हम खुद को बेहतर बना सकते हैं! (कृपया अपना जवाब टाइप करके भेजें)`;
      }
      else {
        responseText = "We've received your request! A human agent will reply to you shortly.";
      }
    }

    // DB: Save Incoming
    let convId = null;
    if (chatId && incomingText) {
      const res = await saveIncomingMessage({
        platform: 'telegram',
        guestPhone: chatId.toString(), // Using chatId as phone equivalent
        guestName: guestName,
        text: incomingText,
      });
      convId = res.conversationId;
    }

    // 3. Send Response to Telegram
    if (chatId && responseText) {
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: responseText,
          parse_mode: 'Markdown',
          reply_markup: inlineKeyboard ? inlineKeyboard : undefined
        }),
      });

      // DB: Save Outgoing Bot Message
      if (convId) {
        await saveOutgoingMessage(convId, responseText, 'bot');
      }
    }

    // Always return 200 OK so Telegram doesn't retry
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Telegram Webhook Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
