'use client';

import { SupportChat } from './SupportChat';
import { LiveChatWidget } from './LiveChatWidget';

export function SupportButton() {
  return (
    <>
      <SupportChat />
      <LiveChatWidget />
    </>
  );
}
