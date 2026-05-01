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
        name: 'What is Mindful MPPSC?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mindful MPPSC is India\'s first bilingual mnemonic-based preparation platform for the MPPSC State Service Exam. It provides high-quality study materials, test series, and memory techniques to help students crack the exam effectively.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the content available in both Hindi and English?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Mindful MPPSC provides all study materials, test series, and explanations in both Hindi and English (Bilingual).',
        },
      },
      {
        '@type': 'Question',
        name: 'What is mnemonic-based learning?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mnemonic-based learning uses specialized memory techniques to help you retain complex facts, historical timelines, and geographical data with ease.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many tests are included in the MPPSC Test Series?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The MPPSC Test Series includes over 100+ topic-wise modules covering the entire syllabus from Unit 1 to Unit 10.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does it cover Previous Year Questions (PYQs)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Mindful MPPSC provides a rigorous analysis of 5+ years of Previous Year Papers to help students identify patterns and difficulty levels.',
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
              Crack MPPSC 2026: The Strategic Preparation Platform
            </h2>

            <div className="prose prose-slate max-w-none space-y-6 text-lg leading-relaxed text-slate-600">
              <p>
                Preparing for the <strong>MPPSC State Service Exam 2026</strong> requires a
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
              MPPSC 2026 की तैयारी: एक स्मार्ट और वैज्ञानिक तरीका
            </h2>

            <div className="prose prose-slate max-w-none space-y-6 text-lg leading-relaxed text-slate-600">
              <p>
                <strong>MPPSC राज्य सेवा परीक्षा 2026</strong> के लिए सिर्फ पढ़ाई काफी नहीं है। नए{' '}
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
