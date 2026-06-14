import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { targetNumber } = await request.json();

    const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

    const payload = {
      messaging_product: 'whatsapp',
      to: targetNumber || '9131960207',
      type: 'template',
      template: {
        name: 'zenscroll_alert',
        language: { code: 'en_US' },
        components: [
          {
            type: 'header',
            parameters: [
              {
                type: 'image',
                image: {
                  link: 'https://mppsc.zenscroll.app/og-hero.png',
                },
              },
            ],
          },
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: 'Aspirant',
              },
            ],
          },
        ],
      },
    };

    const response = await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'WhatsApp message sent successfully',
        meta_response: data,
      });
    } else {
      return NextResponse.json({ success: false, error: data }, { status: response.status });
    }
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
