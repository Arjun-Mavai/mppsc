import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { env } from '@/lib/env';

// "Bhai, jab naya maal aaye toh cupboard saaf karne ka button hai ye"
export async function POST(request: NextRequest) {
  try {
    const { secret, tag } = await request.json();

    // Check for secret to prevent abuse
    if (secret !== env.JWT_SECRET && secret !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    if (!tag) {
      return NextResponse.json({ message: 'Tag required' }, { status: 400 });
    }

    revalidateTag(tag, { expire: 0 });
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
