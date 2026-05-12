/**
 * API: Track guest leads (name, phone, email, page visited)
 * Endpoint: POST /api/tracking/guest-lead
 * 
 * Logs all guest access attempts for lead generation + analytics
 */

import { logger } from '@/lib/logger';

export interface GuestLeadPayload {
  name: string;
  phone: string;
  email?: string;
  page: string;
  timestamp: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GuestLeadPayload;

    // Validate
    if (!body.name || !body.phone || !body.page) {
      return Response.json(
        { error: 'Missing required fields: name, phone, page' },
        { status: 400 }
      );
    }

    // Log guest lead
    logger.info('Guest lead captured', {
      category: 'lead_generation',
      metadata: {
        name: body.name,
        phone: body.phone,
        email: body.email || 'not-provided',
        page: body.page,
        timestamp: body.timestamp,
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
    });

    // Optional: Store in database for CRM integration
    // await db.insert(guestLeads).values({
    //   id: uuidv4(),
    //   name: body.name,
    //   phone: body.phone,
    //   email: body.email,
    //   page: body.page,
    //   source: req.headers.get('referer') || 'direct',
    //   timestamp: new Date(body.timestamp),
    // });

    // Optional: Send to CRM/Telegram
    // await notifyAdminNewLead(body);

    return Response.json({
      success: true,
      message: 'Lead captured',
    });
  } catch (error) {
    logger.error('Failed to track guest lead', error as Error, {
      category: 'lead_generation',
    });

    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
