import { Metadata } from 'next';
import { OfflineClient } from './OfflineClient';

export const metadata: Metadata = {
  title: 'Offline | MPPSC Zen',
  description: 'You are currently offline. Check connection or study offline with study tips.',
};

export default function OfflinePage() {
  return <OfflineClient />;
}
