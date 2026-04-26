'use server';

import { db } from '@/db';
import { freeQuizAttempts, tests, feedbacks, supportTickets, mppscUsers, userAttempts, guests } from '@/db/schema';
import { desc, sql, eq } from 'drizzle-orm';
import { assertAdmin } from '@/lib/auth';

export interface ActivityEvent {
  id: string;
  type: 'TEST_SUBMIT' | 'GUEST_TEST' | 'FEEDBACK' | 'SUPPORT';
  user: string;
  detail: string;
  timestamp: Date;
  meta?: any;
}

export async function getLiveActivity(): Promise<ActivityEvent[]> {
  await assertAdmin();

  try {
    // 1. Fetch Guest Test Attempts
    const guestTests = await db
      .select({
        id: freeQuizAttempts.id,
        testTitle: tests.title,
        guestId: freeQuizAttempts.guestId,
        score: freeQuizAttempts.score,
        timestamp: freeQuizAttempts.completedAt,
        guestName: guests.name,
      })
      .from(freeQuizAttempts)
      .innerJoin(tests, eq(freeQuizAttempts.testId, tests.id))
      .leftJoin(guests, eq(freeQuizAttempts.guestId, guests.id))
      .orderBy(desc(freeQuizAttempts.completedAt))
      .limit(10);

    // 2. Fetch Logged-in User Attempts
    const userTests = await db
      .select({
        id: userAttempts.id,
        testTitle: tests.title,
        userName: mppscUsers.name,
        score: userAttempts.score,
        timestamp: userAttempts.endTime,
      })
      .from(userAttempts)
      .innerJoin(tests, eq(userAttempts.testId, tests.id))
      .innerJoin(mppscUsers, eq(userAttempts.userId, mppscUsers.id))
      .where(eq(userAttempts.isCompleted, true))
      .orderBy(desc(userAttempts.endTime))
      .limit(10);

    // 3. Fetch Feedbacks
    const recentFeedbacks = await db
      .select({
        id: feedbacks.id,
        name: feedbacks.name,
        rating: feedbacks.rating,
        message: feedbacks.message,
        timestamp: feedbacks.createdAt,
      })
      .from(feedbacks)
      .orderBy(desc(feedbacks.createdAt))
      .limit(10);

    // 4. Fetch Support Tickets
    const recentTickets = await db
      .select({
        id: supportTickets.id,
        name: supportTickets.name,
        category: supportTickets.category,
        timestamp: supportTickets.createdAt,
      })
      .from(supportTickets)
      .orderBy(desc(supportTickets.createdAt))
      .limit(10);

    // Combine and Sort
    const events: ActivityEvent[] = [];

    guestTests.forEach(t => {
      events.push({
        id: t.id,
        type: 'GUEST_TEST',
        user: t.guestName || 'Guest User',
        detail: `Attempted "${t.testTitle}" (Score: ${t.score})`,
        timestamp: t.timestamp || new Date(),
      });
    });

    userTests.forEach(t => {
      events.push({
        id: t.id,
        type: 'TEST_SUBMIT',
        user: t.userName || 'Student',
        detail: `Completed "${t.testTitle}" (Score: ${t.score})`,
        timestamp: t.timestamp || new Date(),
      });
    });

    recentFeedbacks.forEach(f => {
      events.push({
        id: f.id,
        type: 'FEEDBACK',
        user: f.name,
        detail: `Gave ${f.rating}⭐ feedback: "${f.message.substring(0, 50)}..."`,
        timestamp: f.timestamp || new Date(),
      });
    });

    recentTickets.forEach(s => {
      events.push({
        id: s.id,
        type: 'SUPPORT',
        user: s.name,
        detail: `Raised support ticket for ${s.category}`,
        timestamp: s.timestamp || new Date(),
      });
    });

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 20);
  } catch (error) {
    console.error('Activity Feed Error:', error);
    return [];
  }
}
