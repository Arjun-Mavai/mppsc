'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const TRACKING_KEY = 'mppsc_pwa_last_route'; // Apun ka khufiya bahi-khata jisme last location likha jayega
const EXPIRY_HOURS = 8; // 8 ghante ke baad memory wash, uske baad user sidha dashboard pe land karega!

/**
 * 🚀 PWA Route Tracker (Apun ka Smart Bouncer / Tracker)
 * 
 * KYA HAI YE BANTAYI?
 * Jab user app minimize karke sota hai, aur OS app ko dhakka maar ke background se nikal deta hai,
 * toh wapas aane pe PWA nakhre karke default '/dashboard' pe fekta hai (kyuki manifest me wahi likha hai).
 * Ye component apun ka khufiya bouncer hai jo yaad rakhta hai ki user aakhiri baar
 * kis gali (route/page) me tha, aur usko turant wahi wapas chhod ke aata hai, bina kisi ko bataye!
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

    // 2. AUTO-RESUME LOGIC: Agar user direct Dashboard pe tapka hai, toh usko uski purani jagah bhejo
    if (pathname === '/dashboard' && !hasResumed.current) {
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
    } else if (pathname === '/dashboard') {
      // Agar user KHUD chal ke wapas dashboard pe aaya hai, toh pichla record saaf kar de, nai toh agli baar zabardasti wapas fek dega
      localStorage.removeItem(TRACKING_KEY);
    }
  }, [pathname, router]);

  // Ye component UI pe dikhta nahi hai, sirf pichhe se game karta hai. Solid bouncer!
  return null;
}