// Bhai ye home page h — SSG (Static Site Generation) se ultimate fast render hota h
// AppNavbar + UpgradePage + Testimonials = poora landing page
import UpgradePage from './upgrade/page';
import dynamic from 'next/dynamic';
import Script from 'next/script';

const Testimonials = dynamic(() =>
  import('@/components/home/Testimonials').then((m) => m.Testimonials)
);

export default function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mppsc.zenscroll.app';

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Does Mindful MPPSC provide traditional textbook or PDF notes?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Mindful MPPSC does not provide bulky, boring, or traditional textbook PDF notes to memorize blindly. Instead, we offer complete conceptual clarity of the entire syllabus, topic-by-topic structural breakdowns, smart explanations, and memory mnemonics for active retention.',
        },
      },
      {
        '@type': 'Question',
        name: 'How are the Prelims questions and PYQs organized on the platform?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For Prelims, everything is systematically organized: Year-wise (2020–2026), Unit-wise (Units 1 to 10), and Subject-wise. Every single question comes with detailed explanations, analytics, and bilingual mnemonics (memory techniques) to boost retention.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does the Mains module include?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Mains module features topic-by-topic deep syllabus clarity mapped directly to the syllabus tree. Every single Mains PYQ and core question includes "Double-Style Answer Variations" (2 completely distinct ways of structuring the same model answer, written naturally by experts, not machine-translated) paired with Expert Insights, constitutional articles, SC judgements, and Madhya Pradesh specific dynamic facts.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the content fully bilingual in Hindi and English?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Mindful MPPSC is fully bilingual. All mock tests, PYQs, model answers, and strategic analytics are natively available in both Hindi and English with a single-click language toggle.',
        },
      },
    ],
  };

  return (
    <main>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h1 className="sr-only">Mindful MPPSC - Crack MPPSC 2026 with Bilingual Tests & Mnemonics</h1>

      <UpgradePage />

      {/* SEO-Rich Content Section (Server Rendered) */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-6">
          {/* English Section */}
          <div className="mb-12 border-b border-slate-100 pb-12">
            <h2 className="mb-8 text-3xl font-extrabold text-slate-900 md:text-4xl">
              Crack MPPSC: The Strategic Preparation Platform
            </h2>

            <div className="prose prose-slate max-w-none space-y-6 text-lg leading-relaxed text-slate-600">
              <p>
                Preparing for the <strong>MPPSC State Service Exam</strong> requires a
                data-driven approach. With the introduction of the new{' '}
                <strong>1/3rd negative marking system</strong> and the shift to{' '}
                <strong>3 marks per question</strong>, accuracy is now your most valuable asset.
                Mindful MPPSC is a leading platform designed to help you navigate these changes
                effectively.
              </p>

              <h3 className="text-2xl font-bold text-slate-800">
                Advanced Bilingual Mnemonic-Based Learning
              </h3>
              <p>
                Language should never be a hurdle. Our platform provides high-quality study
                materials and test series in both <strong>Hindi and English</strong>. We focus on{' '}
                <strong>Mnemonics</strong>—specialized memory techniques that help you retain
                complex facts, historical timelines, and geographical data with ease.
              </p>

              <h3 className="text-2xl font-bold text-slate-800">
                Extensive Test Series & PYQ Analysis
              </h3>
              <p>
                Our <strong>MPPSC Test Series</strong> covers over 100+ topic-wise modules. We
                provide a rigorous analysis of{' '}
                <strong>5+ years of Previous Year Papers (PYQs)</strong> to help you identify
                repeating patterns and the exact difficulty level of the actual exam.
              </p>
            </div>
          </div>

          {/* Hindi SEO Section */}
          <div className="mt-12">
            <h2 className="mb-8 text-3xl font-extrabold text-slate-900 md:text-4xl">
              MPPSC की तैयारी: एक स्मार्ट और वैज्ञानिक तरीका
            </h2>

            <div className="prose prose-slate max-w-none space-y-6 text-lg leading-relaxed text-slate-600">
              <p>
                <strong>MPPSC राज्य सेवा परीक्षा</strong> के लिए सिर्फ पढ़ाई काफी नहीं है। नए{' '}
                <strong>1/3rd नेगेटिव मार्किंग</strong> और <strong>3 अंक प्रति प्रश्न</strong> वाले
                पैटर्न के साथ, अब हर सवाल का चुनाव संभलकर करना होगा। माइंडफुल MPPSC छात्रों को इस
                बदलते पैटर्न के अनुसार ढलने में मदद करता है।
              </p>

              <h3 className="text-2xl font-bold text-slate-800">
                अग्रणी द्विभाषी (Bilingual) लर्निंग प्लेटफॉर्म
              </h3>
              <p>
                हमारा मानना है कि भाषा कभी भी सफलता के बीच नहीं आनी चाहिए। इसीलिए हमारी सामग्री{' '}
                <strong>हिंदी और अंग्रेजी</strong> दोनों में उपलब्ध है। हम{' '}
                <strong>Mnemonics</strong> (स्मृति तकनीक) का उपयोग करते हैं, जिससे आप कठिन तथ्यों और
                तारीखों को लंबे समय तक याद रख सकते हैं।
              </p>

              <h3 className="text-2xl font-bold text-slate-800">
                प्रीमियम टेस्ट सीरीज़ और PYQ विश्लेषण
              </h3>
              <p>
                हमारी <strong>MPPSC टेस्ट सीरीज़</strong> में 100 से अधिक टॉपिक-वाइज़ टेस्ट शामिल
                हैं। हमने <strong>पिछले 5+ वर्षों के पेपर्स (PYQs)</strong> का गहरा विश्लेषण किया है
                ताकि आप समझ सकें कि परीक्षा में किस तरह के प्रश्न पूछे जाने की संभावना सबसे अधिक है।
              </p>

              <p>
                चाहे आप पहली बार तैयारी कर रहे हों या पहले भी प्रयास कर चुके हों, माइंडफुल MPPSC
                आपको <strong>Flashcards</strong> और <strong>Smart Explanations</strong> जैसे डिजिटल
                टूल्स प्रदान करता है जो आपकी सफलता की संभावनाओं को बढ़ाते हैं।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AppInstallGuide moved to UpgradePage */}
      <Testimonials />
    </main>
  );
}
