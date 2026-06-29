import PricingClient from './PricingClient';
import { Testimonials } from '@/components/home/Testimonials';

export default function PricingPage() {
  return <PricingClient testimonialsNode={<Testimonials />} />;
}
