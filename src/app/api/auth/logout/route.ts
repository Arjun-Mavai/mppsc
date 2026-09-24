import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteAuthCookies } from '@/lib/auth-constants';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  deleteAuthCookies(cookieStore);
  return NextResponse.json({ success: true });
}
