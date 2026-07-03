'use client';

import { Mail, Phone, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { ContactForm } from '@/components/ContactForm';

import { useSettingsStore } from '@/store/useSettingsStore';
export const contactEmail = 'mppsc@zenscroll.app';
export default function ContactPage() {
  const { language } = useSettingsStore();

  const text = {
    en: {
      title: 'Get in Touch',
      subtitle:
        "We'd love to hear from you. Whether you have a question about features, pricing, or just want to say hi, our team is ready to answer all your questions.",
      contactInfo: 'Contact Information',
      email: 'Email',
      messageTitle: 'Send us a message',
    },
    hi: {
      title: 'संपर्क करें',
      subtitle:
        "हम आपसे सुनना चाहेंगे। चाहे आपके पास किसी फीचर, शुल्क को लेकर कोई प्रश्न हो या आप बस 'नमस्ते' कहना चाहते हों, हमारी टीम आपकी सहायता के लिए तैयार है।",
      contactInfo: 'संपर्क जानकारी',
      email: 'ईमेल',
      messageTitle: 'हमें संदेश भेजें',
    },
  };

  const t = language === 'hi' ? text.hi : text.en;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="mb-16 space-y-4 text-center">
            <h1 className="font-display text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              {t.title}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-500">{t.subtitle}</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">{t.contactInfo}</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{t.email}</p>
                      <p className="text-sm text-slate-500">{contactEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => {
                        const waNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER || '917489388350';
                        window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent('Hi, I need help with the MPPSC App. My query is:')}`, '_blank');
                      }}
                      className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600 transition-colors hover:bg-green-100"
                    >
                      <Phone size={18} className="transition-transform group-hover:scale-110" />
                    </button>
                    <div>
                      <p className="font-bold text-slate-900 cursor-pointer hover:text-green-600 transition-colors" onClick={() => {
                        const waNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER || '917489388350';
                        window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent('Hi, I need help with the MPPSC App. My query is:')}`, '_blank');
                      }}>
                        WhatsApp
                      </p>
                      <p className="text-sm text-slate-500">Fastest response for queries</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => {
                        const botUsername = process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM_BOT_USERNAME || 'mppsc_conversation_bot';
                        window.open(`https://t.me/${botUsername}?start=general`, '_blank');
                      }}
                      className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 transition-colors hover:bg-sky-100"
                    >
                      <Send size={18} className="transition-transform group-hover:scale-110" />
                    </button>
                    <div>
                      <p className="font-bold text-slate-900 cursor-pointer hover:text-sky-600 transition-colors" onClick={() => {
                        const botUsername = process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM_BOT_USERNAME || 'mppsc_conversation_bot';
                        window.open(`https://t.me/${botUsername}?start=general`, '_blank');
                      }}>
                        Telegram
                      </p>
                      <p className="text-sm text-slate-500">Dedicated bot support</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-indigo-100/50 md:p-10">
                <h2 className="font-display mb-6 text-2xl font-bold">{t.messageTitle}</h2>
                <ContactForm />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
