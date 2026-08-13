import type { Metadata, Viewport } from 'next';
import { Inter, Outfit, Noto_Sans_Devanagari, Source_Serif_4 } from 'next/font/google';
import './globals.css';

import PwaRegistry from '@/components/PwaRegistry';
import { Suspense } from 'react';
import Providers from './Providers';
import { TelemetryTracker } from '@/components/TelemetryTracker';
import { AppFooter } from '@/components/layout/AppFooter';
import { GlobalLockModal } from '@/components/GlobalLockModal';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Toaster } from '@/components/ui/sonner';
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';
import { PWARouteTracker } from '@/components/PWARouteTracker';
import dynamic from 'next/dynamic';
import { VersionManager } from '@/components/VersionManager';
import { PrintWatermark } from '@/components/PrintWatermark';
import Script from 'next/script';

const InstallPrompt = dynamic(() =>
  import('@/components/InstallPrompt').then((m) => m.InstallPrompt)
);
const SupportButton = dynamic(() =>
  import('@/components/SupportButton').then((m) => m.SupportButton)
);

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-pyq-dev',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const serif = Source_Serif_4({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-pyq-serif',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#4c1d95',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mppsc.zenscroll.app';
export const metadata: Metadata = {
  title: {
    default: 'MPPSC 2026-2027 Preparation | Prelims Solution & Mains Notes - ZenScroll',
    template: '%s | MPPSC ZenScroll',
  },
  description:
    "Master your MPPSC 2026 & 2027 preparation with ZenScroll. Get the most authentic MPPSC Prelims Solutions, solved PYQs, bilingual notes, and exact syllabus decoding. Join for pure conceptual clarity.",
  keywords: [
    'MPPSC',
    'MPPSC 2026',
    'MPPSC 2027',
    'MPPSC 2027 Paper',
    'MPPSC Syllabus',
    'MPPSC Notification',
    'MPPSC Notes',
    'MPPSC Mains',
    'MPPSC PYQ',
    'Previous Year Question MPPSC',
    'Previous Year Paper MPPSC',
    'MPPSC Prelims 2026 Solved Solution',
    'MPPSC Paper Solution',
    'MPPSC Preparation',
  ],
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: baseUrl,
    title: 'MPPSC ZenScroll | Syllabus, PYQs & Right Direction',
    description:
      'क्या पढ़ना है, कितना पढ़ना है और परीक्षा वास्तव में क्या पूछ रही है? ZenScroll के साथ अपनी तैयारी को स्पष्ट और उद्देश्यपूर्ण बनाएं।',
    siteName: 'MPPSC ZenScroll',
    images: [
      {
        url: '/og-hero.png',
        width: 1200,
        height: 630,
        alt: 'MPPSC ZenScroll',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MPPSC ZenScroll | Clear Direction for MPPSC',
    description: "Preparation becomes easier when direction is clear. Understand the syllabus and connect PYQs effectively.",
    images: ['/og-hero.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mindful MPPSC',
  },
};

import { verifyAuthInternal } from '@/lib/auth';
import { parseAccessGrants } from '@/lib/access-grants';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { MainContentWrapper } from '@/components/layout/MainContentWrapper';
import type { AuthenticatedUser } from '@/types/auth';

// ... rest of imports ...

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ⚡ PERFORMANCE: Removed server-side auth check to make the layout and homepage static (SSG).
  // AppNavbar will handle user fetching on the client side.
  const navbarUser = null;

  // JSON-LD structured data — helps Google show rich results
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mindful MPPSC',
    url: baseUrl,
    description:
      'The #1 App for MPPSC 2026 Preparation with Mnemonics, Bilingual Notes, Tests & Quizzes',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/blogs?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Mindful MPPSC',
    url: baseUrl,
    description: "India's first bilingual mnemonic-based MPPSC preparation platform",
    sameAs: [],
  };

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${devanagari.variable} ${serif.variable}`}>
      <head>
        <Script
          id="schema-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Script
          id="schema-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Facebook Pixel Code */}
        <Script
          id="fb-pixel"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', '2337193063478696'); fbq('track', 'PageView');`,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2337193063478696&ev=PageView&noscript=1"
            alt="facebook pixel"
          />
        </noscript>
        {/* End Facebook Pixel Code */}
      </head>
      <body
        className="bg-gray-50 font-sans text-gray-900 antialiased"
      >
        {process.env.NEXT_PUBLIC_DISABLE_CONTENT_PROTECTION !== 'true' && (
          <Script id="global-content-protection" strategy="afterInteractive">
            {`
              document.addEventListener('copy', (e) => e.preventDefault());
              document.addEventListener('cut', (e) => e.preventDefault());
              document.addEventListener('contextmenu', (e) => e.preventDefault());
              document.body.style.userSelect = 'none';
              document.body.style.webkitUserSelect = 'none';
            `}
          </Script>
        )}
        <GlobalErrorBoundary>
          <PwaRegistry />
          <Providers>
            <Suspense fallback={null}>
              <TelemetryTracker />
              <PWARouteTracker />
            </Suspense>
            <Suspense fallback={null}>
              <AppNavbar user={navbarUser} />
            </Suspense>
            <MainContentWrapper>{children}</MainContentWrapper>

            <AppFooter />
            <GlobalLockModal />
            <ScrollToTop />
            <PrintWatermark />
          </Providers>
          <Suspense fallback={null}>
            <SupportButton />
          </Suspense>
          <Toaster position="top-right" richColors />
          <InstallPrompt />
          <VersionManager />
        </GlobalErrorBoundary>
        <Script
          id="service-worker-registration"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  try {
                    navigator.serviceWorker.register('/sw.js').then(function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    }, function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }).catch(function(err) {
                      console.log('ServiceWorker Promise caught error: ', err);
                    });
                  } catch (err) {
                    console.log('ServiceWorker sync error: ', err);
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
