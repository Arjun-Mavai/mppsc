import { Resend } from 'resend';
import { renderMppscPaymentWelcomeEmail } from './src/lib/welcome-payment-email';
import { DEFAULT_MPPSC_PRODUCT_COPY } from './src/config/mppsc-product-copy';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromName = process.env.EMAIL_FROM_NAME || 'MPPSC ZEN';
  const fromAddress =
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FROM_ADDRESS ||
    'no-reply@mppsc.zenscroll.app';
  const fromEmail = `${fromName} <${fromAddress}>`;

  if (!apiKey) {
    console.error('❌ Error: RESEND_API_KEY is not set in .env.local');
    return;
  }

  console.log(`🔌 Testing Resend sending for COMBO...`);

  const resend = new Resend(apiKey);

  const rend = await renderMppscPaymentWelcomeEmail({
    name: 'Test Student Combo',
    actionUrl: 'https://mppsc.zenscroll.app/auth/set-password?token=test',
    segmentCopy: DEFAULT_MPPSC_PRODUCT_COPY.combo,
  });

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: ['yuyureka212@gmail.com'],
      subject: rend.subject,
      html: rend.html,
    });

    if (error) {
      console.error('❌ Resend Error:', error);
    } else {
      console.log('✅ Combo Email sent successfully!', data);
    }
  } catch (err) {
    console.error('💥 Unexpected Crash:', err);
  }
}

main().catch(console.error);
