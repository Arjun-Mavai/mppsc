import { renderMppscPaymentWelcomeEmail } from './src/lib/welcome-payment-email';
import { DEFAULT_MPPSC_PRODUCT_COPY } from './src/config/mppsc-product-copy';

async function test() {
  console.log("Testing email template rendering...");
  
  try {
    const preRes = await renderMppscPaymentWelcomeEmail({
      name: 'Test Student',
      actionUrl: 'https://mppsc.zenscroll.app/auth/set-password?token=123',
      segmentCopy: DEFAULT_MPPSC_PRODUCT_COPY.pre,
    });
    console.log("✅ Pre email rendered successfully! Subject:", preRes.subject);
  } catch (error) {
    console.error("❌ Pre email rendering failed:", error);
  }

  try {
    const mainsRes = await renderMppscPaymentWelcomeEmail({
      name: 'Test Student',
      actionUrl: 'https://mppsc.zenscroll.app/auth/set-password?token=123',
      segmentCopy: DEFAULT_MPPSC_PRODUCT_COPY.mains,
    });
    console.log("✅ Mains email rendered successfully! Subject:", mainsRes.subject);
  } catch (error) {
    console.error("❌ Mains email rendering failed:", error);
  }

  try {
    const comboRes = await renderMppscPaymentWelcomeEmail({
      name: 'Test Student',
      actionUrl: 'https://mppsc.zenscroll.app/auth/set-password?token=123',
      segmentCopy: DEFAULT_MPPSC_PRODUCT_COPY.combo,
    });
    console.log("✅ Combo email rendered successfully! Subject:", comboRes.subject);
  } catch (error) {
    console.error("❌ Combo email rendering failed:", error);
  }
}

test().catch(console.error);
