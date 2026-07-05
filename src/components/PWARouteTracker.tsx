'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { run } from 'node:test';

const TRACKING_KEY = 'mppsc_pwa_last_route'; // Apun ka khufiya bahi-khata jisme last location likha jayega
const EXPIRY_HOURS = 8; // 8 ghante ke baad memory wash, uske baad user sidha dashboard pe land karega!

/**
 * 🚀 PWA Route Tracker (Apun ka Smart Bouncer / Tracker)
 * 
 * 
 *  * WHAT IS THIS?
 * This is a headless (no UI) Client Component that solves a major UX issue in PWAs.
 * When a PWA (Progressive Web App) is installed on iOS/Android, and the user leaves the app, 
 * the OS might suspend or kill it to save battery. When re-opened, the PWA strictly follows 
 * the `start_url` defined in `manifest.json` (which is `/dashboard` in our case).
 * This causes users to lose their current context (e.g., they were deep inside a PYQ paper).
 * 
 * KYA HAI YE BANTAYI?
 * Jab user app minimize karke sota hai, aur OS app ko dhakka maar ke background se nikal deta hai,
 * toh wapas aane pe PWA nakhre karke default '/dashboard' pe fekta hai (kyuki manifest me wahi likha hai).
 * Ye component apun ka khufiya bouncer hai jo yaad rakhta hai ki user aakhiri baar
 * kis gali (route/page) me tha, aur usko turant wahi wapas chhod ke aata hai, bina kisi ko bataye!
 * 
 *  * HOW IT WORKS:
 * 1. Tracking: Every time the user navigates (except auth/dashboard), we save the path to `localStorage`.
 * 2. Auto-Resume: If the user opens the PWA and lands on `/dashboard`, we instantly intercept 
 *    and seamlessly redirect them to their last saved path (if it's within the EXPIRY_HOURS window).
 * 
 * ARCHITECTURE & SAFETY:
 * - 0% Server Load: Runs entirely on the client browser.
 * - Hydration Safe: Uses `useEffect` strictly for external synchronization.
 * - Access-Agnostic: Relies on existing server middleware for security. If a Free user tries 
 *   to resume to a Premium URL, the middleware will naturally block them.
 * 
 * KAISE KAAM KARTA HAI?
 * 1. Pichha Karna (Tracking): Jaise hi user kisi naye page pe jata hai, ye chupke se localStorage me uski location likh leta hai.
 * 2. Wapas Lana (Auto-Resume): Jab user wapas aata hai aur '/dashboard' pe land hota hai, 
 *    ye turant check karta hai ki "Bhai ko pichhli baar kaha dekha tha?", aur fatafat wahi bhej deta hai.
 */
export function PWARouteTracker() {
  const pathname = usePathname(); // Abhi user kis page ki gali me khada hai
  const router = useRouter(); // Apun ka driver jo redirect marega
  const hasResumed = useRef(false); // Ek hi baar resume marne ka, baar-baar chipakne ka nahi

  useEffect(() => {
    // 1. Agar ye server-side pe run ho raha hai, toh kat le yaha se. Apun sirf browser (client) pe game karta hai!
    if (typeof window === 'undefined' || !pathname) return;

    // 2. AUTO-RESUME LOGIC: Agar user direct App me tapka hai (Fresh Launch)
    // PWA `manifest.json` ka start_url '/' hai. Toh jab app khulti hai, wo '/' ya '/dashboard' pe land hoti hai.
    if ((pathname === '/' || pathname === '/dashboard') && !hasResumed.current) {
      hasResumed.current = true; // Set kar diya ki ek baar kaam ho gaya hai, ab chill mar
      try {
        const savedData = localStorage.getItem(TRACKING_KEY); // Purana thikana dhoondo
        if (savedData) {
          const { path, timestamp } = JSON.parse(savedData);
          const hoursSinceSaved = (Date.now() - timestamp) / 3600000; // Kitne ghante pehle ki baat hai?

          // Agar location solid hai, aur 8 ghante ke andar ki baat hai, toh chal bidu wahi chalte hai!
          if (path && path !== '/dashboard' && hoursSinceSaved < EXPIRY_HOURS) {
            localStorage.removeItem(TRACKING_KEY); // Purani entry hata de, varna aage loop me ghumte rahenge
            router.replace(path); // Bina history me kachra kiye (replace), turant wahi teleport kar de
            return; // Yaha se nikal le jaldi
          }
        }
      } catch (e) {
        // Kuch locha hua toh chup rehne ka, console me lafda nahi karne ka
      }
    }

    // 3. TRACKING LOGIC: User nayi gali me gaya, toh entry maar le
    // Lekin in sab jagaho pe entry nahi marne ka (Public/Auth pages apun track nahi karte)
    const isExcluded = 
      pathname === '/' || 
      pathname === '/dashboard' || 
      pathname.startsWith('/signin') || 
      pathname.startsWith('/register') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/upgrade');

    if (!isExcluded) {
      try {
        // User kisi kaam ke page (jaise PYQ) pe hai, toh localStorage ke khopche me likh ke rakh le
        localStorage.setItem(TRACKING_KEY, JSON.stringify({
          path: pathname,
          timestamp: Date.now() // Abhi ka waqt daal de
        }));
      } catch (e) {
        // Storage full hai ya kuch locha hai toh ignore maar
      }
    } else if (pathname === '/' || pathname === '/dashboard') {
      // Agar user KHUD chal ke wapas home ya dashboard pe aaya hai, toh pichla record saaf kar de
      localStorage.removeItem(TRACKING_KEY);
    }
  }, [pathname, router]);
 // This component renders absolutely nothing. 
  // Purely a client-side headless tracker.
  // Ye component UI pe dikhta nahi hai, sirf pichhe se game karta hai. Solid bouncer!
  return null;
}


// # pwa learning

// Viewed PWARouteTracker.tsx:1-35
// Edited PWARouteTracker.tsx
// Edited PWARouteTracker.tsx
// Ran command: `git add src/components/PWARouteTracker.tsx && git commit -m "docs: add comprehensive JSDoc for PWA Route Tracker architecture" && git push`

// भाई, मैंने आपके कहे अनुसार `PWARouteTracker.tsx` में पूरी प्रॉपर इंटरनल डॉक्यूमेंटेशन (JSDoc) लिख दी है। इसमें मैंने साफ-साफ समझाया है कि यह क्या करता है, सर्वर पर इसका कोई लोड क्यों नहीं है, और यह कितना सिक्योर है। साथ ही मैंने इस अपडेट को PR (#158) में **Push** भी कर दिया है!

// चलिए अब मैं आपको **PWA (Progressive Web App)** की पूरी फील और क्लैरिटी देता हूँ कि यह क्या बला है, कैसे बनता है और अब आपके यूज़र्स को क्या "New Feel" मिलेगा:

// ### 1. PWA क्या है? (What is PWA?)
// PWA असल में एक नार्मल वेबसाइट (जैसे Next.js ऐप) ही होती है, लेकिन इसमें कुछ "सुपरपावर्स" डाल दी जाती हैं जिससे यह मोबाइल में बिल्कुल एक असली (Native) Android या iOS ऐप की तरह बर्ताव करती है।
// - **फायदा:** यूज़र को Play Store या App Store पर जाने की ज़रूरत नहीं। वो वेबसाइट से ही "Install App" पर क्लिक करेगा और ऐप उसके फोन की होम स्क्रीन पर आ जाएगी।
// - **फील:** जब वो इसे खोलेगा तो ऊपर URL बार (Browser UI) नहीं दिखेगा। यह फुल-स्क्रीन चलेगी।

// ### 2. PWA की नींव (Origin & Main Files)
// PWA हवा में काम नहीं करता, इसकी नींव में 2 सबसे ज़रूरी फाइल्स होती हैं (जो आपके ऐप में पहले से सेटअप हैं):

// 1. **`manifest.json` (The Identity Card):** 
//    - यह फाइल OS (Apple/Android) को बताती है कि ऐप का नाम क्या है (`"name": "Mindful MPPSC"`), ऐप का आइकॉन कौन सा है, थीम कलर क्या होगा, और सबसे ज़रूरी: **`"start_url": "/dashboard"`** (यानी जब भी यूज़र आइकॉन पर क्लिक करे, तो उसे कहाँ लैंड करवाना है)।
// 2. **`sw.js` (Service Worker - The Brain):** 
//    - यह एक JavaScript फाइल होती है जो ब्राउज़र के **बैकग्राउंड** में चलती है। 
//    - इसका काम है: इंटरनेट न होने पर भी पेजेस दिखाना (Offline Caching), ऐप को फास्ट लोड करना और बैकग्राउंड में डेटा सिंक करना।

// ### 3. यूज़र्स को अब क्या "New Feel" मिलेगा? (The Magic)
// पहले क्या होता था:
// - एक यूज़र रात को "Mains 2020 Paper" पढ़ रहा है। उसे नींद आ गई और उसने फोन लॉक कर दिया। 
// - सुबह उठकर जब वो ऐप खोलता, तो OS उसे PWA के नियम (`manifest.json`) के अनुसार वापस `/dashboard` पर फेंक देता। यूज़र चिढ़ जाता कि *"अरे यार! वापस सिलेबस में जाओ, फिर 2020 चुनो!"*

// **अब क्या होगा (The New Feel):**
// - यूज़र फोन लॉक करेगा।
// - जब वो 2-3 घंटे बाद वापस ऐप खोलेगा, तो हमारा नया `<PWARouteTracker />` एक मिलीसेकंड में काम करेगा।
// - यूज़र को लगेगा कि ऐप वहीं से शुरू हुई है जहाँ उसने छोड़ी थी! उसे एक झटके में वापस "Mains 2020 Paper" खुला हुआ मिलेगा। 
// - **लेकिन,** अगर वो 8 घंटे बाद (यानी अगले दिन) ऐप खोलता है, तो हमारा कोड समझ जाएगा कि "यह नया दिन है, यूज़र को फ्रेश Dashboard दिखाओ।"

// यह वो "Enterprise Level" फीलिंग है जो Instagram Lite, Twitter PWA या Pinterest अपने यूज़र्स को देते हैं। अब आपका ऐप भी तकनीकी रूप से उसी वर्ल्ड-क्लास लीग में आ गया है! 🚀


## dry run
Viewed PWARouteTracker.tsx:78-109

भाई, मैं समझ गया आपका कन्फ्यूजन कहाँ है! जब तक कोड को **"Dry Run" (यानी यूज़र बनकर एक-एक स्टेप चलाना)** न किया जाए, तब तक ये चीज़ें दिमाग में नहीं बैठतीं।

चलो, मैं आपको एकदम प्रॉपर यूज़र जर्नी (User Journey) के साथ समझाता हूँ कि **"पर्ची (Record)" कैसे बनती है, कैसे फटती है, और बग (Bug) क्या था।**

---

### सिनेरियो 1: सही कोड का काम (जब `/dashboard` क्लियर लिस्ट में है)

**Step 1:** यूज़र ने सुबह 10 बजे ऐप खोली। वो सीधे `/dashboard` पर आया।
- *कोड क्या करेगा:* कुछ नहीं। पर्ची खाली है।

**Step 2:** यूज़र ने "Mains PYQ" वाले बटन पर क्लिक किया और वो **`/mains/syllabus/pyq`** पेज पर चला गया। 
- *कोड (Line 86) क्या करेगा:* यह पेज एक्सक्लूड (Exclude) लिस्ट में नहीं है। बाउन्सर तुरंत `localStorage` में पर्ची लिख देगा: 
  👉 **पर्ची:** `{ path: "/mains/syllabus/pyq", time: 10:00 AM }`

**Step 3:** यूज़र ने 15 मिनट पढ़ाई की। अब उसका मन भर गया। उसने ऐप का "Home" (Back) बटन दबाया और वो **खुद वापस `/dashboard` पर आ गया।**
- *कोड (Line 93) क्या करेगा:* क्योंकि हमने `else if (pathname === '/dashboard')` लिखा हुआ है, बाउन्सर देखेगा कि "अरे, भाई तो वापस हॉल (Dashboard) में आ गया!" 
- बाउन्सर तुरंत `removeItem` चलाकर **पर्ची फाड़ देगा।**
  👉 **पर्ची का स्टेटस:** एकदम खाली (Empty)।

**Step 4:** यूज़र ने ऐप क्लोज़ कर दी (Recent से हटा दी)।

**Step 5:** 2 घंटे बाद (दोपहर 12 बजे) यूज़र ने दोबारा ऐप खोली। 
- OS ने उसे `/dashboard` पर उतारा। 
- *कोड (Line 53 - Auto Resume) क्या करेगा:* वो सबसे पहले `localStorage` (पर्ची) चेक करेगा। 
- क्योंकि Step 3 में पर्ची फट चुकी थी, उसे कुछ नहीं मिलेगा! 
- **रिजल्ट:** यूज़र शांति से `/dashboard` पर ही रहेगा। एकदम परफेक्ट UX! 🏆

---

### सिनेरियो 2: बग वाला कोड (अगर आप `removeItem` से `/dashboard` हटा देते)

Step 1 और Step 2 बिल्कुल सेम रहेंगे। 
👉 **पर्ची बन गई:** `{ path: "/mains/syllabus/pyq", time: 10:00 AM }`

**Step 3:** यूज़र खुद वापस **`/dashboard`** पर आ गया। 
- *बग वाला कोड क्या करेगा:* क्योंकि आपने क्लियर लिस्ट से `/dashboard` हटा दिया था, लाइन 93 चलेगी ही नहीं!
- `removeItem` नहीं चलेगा। 
  👉 **पर्ची का स्टेटस:** अभी भी ज़िंदा है! पर्ची पर `/mains/syllabus/pyq` लिखा है।

**Step 4:** यूज़र ने ऐप क्लोज़ कर दी।

**Step 5 (द एक्सीडेंट 🚨):** 2 घंटे बाद यूज़र ने दोबारा ऐप खोली। 
- OS ने उसे `/dashboard` पर उतारा। 
- *कोड (Auto Resume) क्या करेगा:* वो तुरंत पर्ची चेक करेगा। 
- बाउन्सर को पर्ची में **`/mains/syllabus/pyq`** लिखा हुआ मिल जाएगा! 
- बाउन्सर बिना सोचे-समझे यूज़र की गर्दन पकड़ेगा और उसे ज़बरदस्ती `/mains/syllabus/pyq` में टेलीपोर्ट (`router.replace`) कर देगा!
- **यूज़र का रिएक्शन:** *"अबे यार! मैं तो 10 बजे ही पढ़ाई खत्म करके खुद Dashboard पर आ गया था। अब मैंने ऐप खोली है तो मुझे Dashboard दिखना चाहिए था ना, वापस PYQ में क्यों फेंक दिया मुझे?!"*

### सारांश (Summary)
अगर हम `/dashboard` पर आने पर पर्ची नहीं फाड़ेंगे, तो बाउन्सर हमेशा यह मानता रहेगा कि यूज़र अभी भी कमरे में ही है। 

इसीलिए **Line 93 पर `/dashboard` को रखना सबसे क्रिटिकल है**, ताकि जब यूज़र खुद बाहर आ जाए, तो हम उसका पुराना ट्रैक रिकॉर्ड डिलीट कर दें और उसे अगली बार कोई फालतू टेलीपोर्टेशन न झेलनी पड़े! 

अब आया एकदम प्रॉपर फील? 😎