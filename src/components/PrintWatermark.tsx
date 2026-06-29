'use client';

/**
 * ==========================================
 * 🛡️ LEARNING: PRINT WATERMARK SECURITY & PERFORMANCE 🛡️
 * ==========================================
 * 
 * 1. CSS Obfuscation (Psychological Security):
 *    Humne yaha classes ka naam 'protected-watermark' se badalkar 'sys-layer-core' aur 'metrics-label-uid' kar diya hai. 
 *    Reason: Agar koi tech-savvy student Inspect Element (DevTools) khol kar isko delete karne ka sochega, 
 *    toh usko lagega ki ye React ya Next.js ka koi core UI system (System Layer Core) ya metrics tracker hai. 
 *    Ye ek psychological trick hai jisse hackers isey touch karne se darte hain ki "Kahi website crash na ho jaye".
 * 
 * 2. Zero-Cost Performance (Lightweight):
 *    - DOM Footprint: Sirf ek chhota sa <style> tag aur 4-5 choti <div> hain jo by default display:none par rehti hain.
 *    - JS Footprint: Koi bhari setInterval ya loops nahi hain. Ek sota hua 'beforeprint' event listener hai jo sirf 
 *      tabhi jagega jab user finally Cmd+P dabayega.
 *    - Network Footprint: TanStack 'useMutation' ekdum lazy hai, network tab bilkul khali rahega jab tak ki print event
 *      trigger na ho. Is wajah se app ki load speed ya battery par 0.00% asar padega.
 */

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useMutation } from '@tanstack/react-query';

// Bhai, API route ka naam obfuscate kar diya (matlab chupa diya)
// Taki koi smart bacha network tab me 'print-tracking' dekh kar block na kar de.
// Ye ekdum normal system metrics jaisa dikhega network tab me.
const SYS_METRICS_ENDPOINT = '/api/system/ui-metrics';

export function PrintWatermark() {
  const { user } = useSettingsStore();

  // Yaha hum TanStack Query ka useMutation use kar rahe hain fetch ki jagah.
  // Isse code zyada clean, scalable aur standard React practice me aa gaya hai.
  // Ye background me chup chap execute hoga.
  const { mutate: logPrintEvent } = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const res = await fetch(SYS_METRICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          path: window.location.pathname + window.location.search,
        }),
      });
      if (!res.ok) throw new Error('Failed to log');
      return res.json();
    },
    // Chup-chap fail ho jaye agar kuch dikkat ho, user ko pata nahi chalna chahiye.
    onError: () => {
      // console.error purposely hata diya taaki console logs clean rahe.
    }
  });

  useEffect(() => {
    if (!user) return;

    let hasNotified = false;

    // Ye function trigger hoga jaise hi koi PDF banayega ya Print (Ctrl+P) dabayega.
    const handlePrintIntent = () => {
      if (hasNotified) return;
      
      // Lock laga diya taaki ek bar me multiple requests na jayein (10 second ka cooldown).
      hasNotified = true;

      // TanStack Query ka mutate call kar diya. Mast background me call jayegi.
      logPrintEvent();

      // 10 second baad lock wapas khol do.
      setTimeout(() => {
        hasNotified = false;
      }, 10000);
    };

    // Modern browsers ke liye best event.
    window.addEventListener('beforeprint', handlePrintIntent);

    // Kuch purane browsers (jaise old Safari) ke liye fallback.
    const mql = window.matchMedia('print');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        handlePrintIntent();
      }
    };

    if (mql.addEventListener) {
      mql.addEventListener('change', handleChange);
    } else {
      // @ts-ignore
      mql.addListener(handleChange);
    }

    // Clean up function - memory leak bachane ke liye (Good practice)
    return () => {
      window.removeEventListener('beforeprint', handlePrintIntent);
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleChange);
      } else {
        // @ts-ignore
        mql.removeListener(handleChange);
      }
    };
  }, [user, logPrintEvent]);

  // Agar user logged in nahi hai, to watermark ka koi fayda nahi
  if (!user) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Normal web page par ye element hide rahega */
        .sys-layer-core {
          display: none;
        }

        /* Print hone par ye active hoga */
        @media print {
          /* background colors aane chahiye PDF me */
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .sys-layer-core {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 2147483647;
            pointer-events: none;
            
            background-image: repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 100px,
              rgba(0, 0, 0, 0.05) 100px,
              rgba(0, 0, 0, 0.05) 200px
            );
            background-color: rgba(255, 255, 255, 0.85);
          }
          
          .ui-frame-bounds {
            transform: rotate(-45deg);
            text-align: center;
            color: rgba(0, 0, 0, 0.4);
            font-family: sans-serif;
          }
          
          .metrics-label-uid {
            font-size: 3rem;
            font-weight: bold;
            white-space: nowrap;
          }
          
          .sys-warn-node {
            font-size: 1.5rem;
            font-weight: 800;
            margin-top: 1rem;
            color: rgba(255, 0, 0, 0.5);
          }
          
          .sys-sub-node {
            font-size: 1.2rem;
            font-weight: bold;
            margin-top: 0.5rem;
            max-width: 80%;
            margin-left: auto;
            margin-right: auto;
            white-space: normal;
          }
        }
      `}} />
      {/* 
        aria-hidden="true" aur role="presentation" de diya taaki aur bhi stealthy rahe.
      */}
      <div className="sys-layer-core" aria-hidden="true" role="presentation">
        <div className="ui-frame-bounds">
          <div className="sys-warn-node" style={{ color: 'rgba(0,0,0,0.2)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>MPPSC ZenScroll</div>
          <div className="metrics-label-uid">{user.name} • {user.email}</div>
          <div className="sys-warn-node">CONFIDENTIAL & PROTECTED</div>
          <div className="sys-sub-node">
            Printing this document is ILLEGAL according to Mindful MPPSC Terms of Service.<br/>
            Your account details have been logged and you may face permanent account suspension.
          </div>
        </div>
      </div>
    </>
  );
}
