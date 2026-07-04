import { Metadata } from 'next';
import { FileText, Download, CheckCircle, Clock, BookOpen, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { SupportButton } from '@/components/SupportButton';

export const metadata: Metadata = {
  title: 'MPPSC Prelims 2026 & 2027 Solved Paper Solution | Previous Year Question (PYQ)',
  description: 'Download MPPSC Prelims 2026 and 2027 solved paper solution, official answer keys, and detailed PYQ analysis. Best MPPSC notes and previous year paper solutions.',
  keywords: [
    'MPPSC Prelims 2026 Solved Solution',
    'MPPSC 2026',
    'MPPSC 2027',
    'MPPSC 2027 Paper',
    'Previous Year Question',
    'Previous Year Paper MPPSC',
    'MPPSC PYQ',
    'MPPSC Paper Solution',
    'MPPSC Notes',
    'MPPSC Syllabus',
    'MPPSC Mains',
    'MPPSC Notification',
    'MPPSC Official Answer Key'
  ],
  openGraph: {
    title: 'MPPSC Prelims 2026 Solved Solution | PYQ Analysis',
    description: 'Detailed analysis and solved paper for MPPSC Prelims 2026 & 2027. Download Previous Year Questions (PYQ) and syllabus.',
    type: 'website',
  }
};

export default function PaperSolutionPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight font-outfit">
              MPPSC <span className="text-indigo-600">2026 & 2027</span> Solved Paper Solution
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Get the most accurate, detailed, and bilingual (Hindi/English) MPPSC Prelims 2026 solved solution. Master the MPPSC Syllabus with our comprehensive Previous Year Question (PYQ) analysis and MPPSC Notes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="#download">
                <button className="bg-indigo-600 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all duration-300 flex items-center gap-2">
                  <Download size={20} />
                  Download Solution PDF
                </button>
              </Link>
              <Link href="/mains">
                <button className="bg-white text-indigo-600 px-8 py-3 rounded-full font-medium shadow-md hover:shadow-lg border border-indigo-100 transition-all duration-300 flex items-center gap-2">
                  <BookOpen size={20} />
                  Explore MPPSC Mains
                </button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-outfit">Detailed PYQ Analysis</h3>
              <p className="text-slate-600">
                Every Previous Year Question (PYQ) from MPPSC Prelims 2026 is analyzed in-depth with references to standard MPPSC Notes and Syllabus.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-outfit">100% Accurate Key</h3>
              <p className="text-slate-600">
                Aligned with the MPPSC official answer key. We resolve disputed questions with proof from authoritative MPPSC resources.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-6">
                <Clock size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-outfit">MPPSC 2027 Roadmap</h3>
              <p className="text-slate-600">
                Use the 2026 paper trends to shape your strategy for the upcoming MPPSC 2027 paper. Stay updated with the latest MPPSC notification.
              </p>
            </div>
          </div>

          {/* SEO Optimized Content Section */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mb-16" id="download">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <AlertCircle size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-outfit">MPPSC Prelims 2026 Paper Details</h2>
                <p className="text-slate-500">General Studies & CSAT</p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 leading-relaxed mb-6">
                The <strong>MPPSC Prelims 2026</strong> paper sets the standard for upcoming examinations. Understanding the <em>MPPSC paper solution</em> is critical for aspirants targeting the <strong>MPPSC 2027 paper</strong>. Our team at ZenScroll has compiled the most comprehensive, bilingual (Hindi/English) answer key and detailed explanation for every question.
              </p>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-4 font-outfit">Why Download Our Previous Year Paper MPPSC Solution?</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-500 mt-1 flex-shrink-0" size={18} />
                  <span className="text-slate-700"><strong>Subject-wise Breakdown:</strong> See exactly how many questions came from MP, History, Geography, and Current Affairs according to the updated MPPSC Syllabus.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-500 mt-1 flex-shrink-0" size={18} />
                  <span className="text-slate-700"><strong>Integration with MPPSC Notes:</strong> Discover how our premium notes directly cover the asked questions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-500 mt-1 flex-shrink-0" size={18} />
                  <span className="text-slate-700"><strong>Bridge to MPPSC Mains:</strong> Learn which Prelims facts are essential for your Mains answer writing.</span>
                </li>
              </ul>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center mt-10">
                <h4 className="text-lg font-medium text-slate-900 mb-2">Available for Download</h4>
                <p className="text-slate-500 mb-6">PDF Format • 15 MB • English & Hindi Medium</p>
                
                {/* Simulated Download Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2">
                    <Download size={18} />
                    Download GS Paper 1 Solution
                  </button>
                  <button className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2">
                    <Download size={18} />
                    Download CSAT Paper 2 Solution
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <SupportButton />
    </div>
  );
}
