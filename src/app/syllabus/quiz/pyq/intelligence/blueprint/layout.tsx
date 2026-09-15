import React from 'react';
import { JetBrains_Mono } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jetbrains',
});

export default function BlueprintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${jetbrainsMono.variable} font-mono`} style={{ fontFamily: 'var(--font-jetbrains), "JetBrains Mono", ui-monospace, monospace' }}>
      {children}
    </div>
  );
}
