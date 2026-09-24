import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await verifyAuth();

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        name: user.name,
        email: user.email,
        is_subscribed: user.isSubscribed,
        role: user.role,
        plan_tier: user.planTier,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
