import { createElement } from 'react';
import { render } from '@react-email/render';
import EmailTemplate from '@/components/email-template';
import type { MppscSegmentCopyBlock } from '@/config/mppsc-product-copy';

/** Dynamic welcome email HTML + subject for MPPSC payments (/lite/pro/upgrade/mains/combo). */
export async function renderMppscPaymentWelcomeEmail(params: {
  name: string;
  actionUrl: string;
  segmentCopy: MppscSegmentCopyBlock;
}) {
  const { name, actionUrl, segmentCopy } = params;

  const html = await render(
    createElement(EmailTemplate, {
      name,
      actionUrl,
      planName: 'Premium',
      headerLine1: segmentCopy.emailBrandLineEn,
      headerSubtitle: segmentCopy.emailBrandTaglineEn,
      welcomeLead: segmentCopy.emailLeadEn,
      featureRows: segmentCopy.emailFeaturesEn,
    })
  );

  return { subject: segmentCopy.emailSubjectEn, html };
}
