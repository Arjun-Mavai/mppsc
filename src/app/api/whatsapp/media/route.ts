import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// This acts as a secure proxy to fetch images from WhatsApp servers
// Since media URLs expire and require the Bearer token, we fetch and stream the binary

import { assertAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    // SECURITY: Ensure only logged-in admins can access these private user images
    await assertAdmin();

    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get('id');

    if (!mediaId) {
      return new NextResponse('Missing media ID', { status: 400 });
    }

    const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!WHATSAPP_TOKEN) {
      return new NextResponse('Server configuration error', { status: 500 });
    }

    // 1. First, GET the media URL from the Media ID
    const urlRes = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`
      }
    });

    if (!urlRes.ok) {
      const err = await urlRes.text();
      logger.error('WhatsApp Media API failed to get URL', new Error(err), { category: 'api' });
      return new NextResponse('Image not found', { status: 404 });
    }

    const mediaData = await urlRes.json();
    const actualMediaUrl = mediaData.url;

    if (!actualMediaUrl) {
      return new NextResponse('Media URL not found in response', { status: 404 });
    }

    // 2. Fetch the actual binary media using the token
    const imageRes = await fetch(actualMediaUrl, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`
      }
    });

    if (!imageRes.ok || !imageRes.body) {
      return new NextResponse('Failed to download image', { status: 500 });
    }

    // Stream the binary body to the browser with proper content type
    return new NextResponse(imageRes.body as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': imageRes.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      }
    });

  } catch (error) {
    logger.error('Error fetching WhatsApp media', error, { category: 'api' });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
