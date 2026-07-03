import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

async function run() {
  console.log("🔍 Fetching last 5 payments & their clickwrap consent audits...\n");

  const { db } = await import('../src/db');
  const { payments, mppscUsers } = await import('../src/db/schema');
  const { desc, eq } = await import('drizzle-orm');

  const results = await db
    .select({
      paymentId: payments.paymentId,
      amount: payments.amount,
      planTier: payments.planTier,
      createdAt: payments.createdAt,
      notes: payments.notes,
      userName: mppscUsers.name,
      userEmail: mppscUsers.email,
      userPhone: mppscUsers.phone,
      userMetadata: mppscUsers.metadata,
    })
    .from(payments)
    .leftJoin(mppscUsers, eq(payments.userId, mppscUsers.id))
    .orderBy(desc(payments.createdAt))
    .limit(5);

  if (results.length === 0) {
    console.log("❌ No payments found.");
    process.exit(0);
  }

  results.forEach((row, i) => {
    console.log(`--- [Payment #${i + 1}] ---`);
    console.log(`👤 Student: ${row.userName} (${row.userEmail}) | Phone: ${row.userPhone}`);
    console.log(`💵 Plan: ${row.planTier?.toUpperCase()} | Amount: ₹${(row.amount ?? 0) / 100}`);
    console.log(`🔑 Payment ID: ${row.paymentId}`);
    
    // Parse payment notes consent
    let consentFromPayment = null;
    if (row.notes) {
      try {
        const notesObj = typeof row.notes === 'string' ? JSON.parse(row.notes) : row.notes;
        if (notesObj && notesObj.consent) {
          consentFromPayment = notesObj.consent;
        }
      } catch {}
    }

    if (consentFromPayment) {
      console.log(`🛡️  Consent captured on Payment:`);
      console.log(`   • Accepted: ${consentFromPayment.accepted || consentFromPayment.consentAccepted ? '✅ Yes' : '❌ No'}`);
      console.log(`   • IP Address: ${consentFromPayment.ip || consentFromPayment.ipAddress || 'N/A'}`);
      console.log(`   • Version: ${consentFromPayment.version || 'N/A'}`);
      console.log(`   • Timestamp: ${consentFromPayment.timestamp || 'N/A'}`);
      console.log(`   • User-Agent: ${consentFromPayment.userAgent || 'N/A'}`);
    } else {
      console.log(`⚠️  No consent metadata found on payment record notes.`);
    }

    console.log("");
  });

  process.exit(0);
}

run().catch(console.error);
