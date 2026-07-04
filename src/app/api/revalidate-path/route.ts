import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret');
    const path = request.nextUrl.searchParams.get('path');

    // Replace with actual env secret check if needed. We use ADMIN_SECRET_KEY or JWT_SECRET
    const validSecret = process.env.ADMIN_SECRET_KEY || process.env.JWT_SECRET;

    if (!validSecret || secret !== validSecret) {
      return NextResponse.json({ message: 'Invalid or missing secret' }, { status: 401 });
    }

    if (!path) {
      return NextResponse.json({ message: 'Path query parameter is required (e.g. ?path=/blogs)' }, { status: 400 });
    }

    // Revalidate the specific path, and layout to ensure full page flush
    revalidatePath(path, 'page');
    
    return NextResponse.json({ 
      revalidated: true, 
      path, 
      now: Date.now(),
      message: `Successfully flushed cache for ${path}`
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating path' }, { status: 500 });
  }
}
