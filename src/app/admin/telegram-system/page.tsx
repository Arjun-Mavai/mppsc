import React from 'react';
import TelegramGeneratorClient from './components/TelegramGeneratorClient';
import { getTelegramTopics } from '@/actions/admin-telegram';

export const metadata = {
  title: 'Telegram Content Generator',
};

export default async function TelegramSystemPage() {
  const { prelims, mains } = await getTelegramTopics();

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">MPPSC Telegram System</h1>
          <p className="mt-2 text-slate-500">
            Generate highly-structured AI prompts for the MPPSC Learning Platform on Telegram.
          </p>
        </div>

        <TelegramGeneratorClient prelims={prelims} mains={mains} />
      </div>
    </div>
  );
}
