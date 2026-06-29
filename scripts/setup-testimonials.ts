import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env', override: false });
import { db } from '../src/db/index';
import { sql } from 'drizzle-orm';
import { testimonials } from '../src/db/schema';
import { nanoid } from 'nanoid';

async function main() {
  console.log('Creating testimonials table...');
  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS testimonials (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'Aspirant',
        location TEXT,
        comment TEXT NOT NULL,
        image TEXT,
        stars INTEGER DEFAULT 5,
        is_active INTEGER DEFAULT 1,
        display_order INTEGER DEFAULT 0,
        exam_type TEXT DEFAULT 'mppsc' NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);
    
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials (is_active);`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_testimonials_order ON testimonials (display_order);`);
    
    console.log('Table created successfully.');
    
    // Check if empty before seeding
    const existing = await db.select().from(testimonials).limit(1);
    if (existing.length > 0) {
      console.log('Testimonials already seeded.');
      process.exit(0);
    }

    // Seed data
    const seedData = [
      { name: 'Palak sahu', role: 'Aspirant', location: 'Indore', comment: 'Unlike you,no one is providing such quality analysis at such depth. Serious aspirants can definately take its holistic advantage for sure! The best part is you have such robust feedback system which ensured that every relevant suggestions should be heard.', stars: 5 },
      { name: 'Arjun Gurjar', role: 'Aspirant', location: 'Gwalior', comment: 'PYQs ke liye ek gazab ki cheez mili hai. Main abhi tak sirf ratta maar raha tha, par is website (mppsc.zenscroll.app) par explanation ka tarika ekdum alag hai', image: '/testimonials/arjun.png', stars: 5 },
      { name: 'Shivam Gurjar', role: 'Aspirant', location: 'Ujjain', comment: 'Recent history and explanation of answers is next level h.', image: '/testimonials/shivam.png', stars: 5 },
      { name: 'Rahul Tiwari', role: 'Aspirant', location: 'Satna', comment: 'Bhai app ka analysis part bahut sahi hai. Har question ka timing dikhta hai, jo help karta hai speed badhane me.', image: '/testimonials/rahul.png', stars: 5 },
      { name: 'Priya Sharma', role: 'Aspirant', location: 'Rewa', comment: 'बस एक ही शब्द में - बेहतरीन!', image: '/testimonials/priya.png', stars: 5 },
      { name: 'Amit Patel', role: 'Aspirant', location: 'Bhopal', comment: 'Syllabus ke har topic ka analysis acha laga. Pata chalta hai ki kaunsa topic strong hai aur kisme mehnat karni hai.', image: '/testimonials/amit.png', stars: 5 },
      { name: 'Sneha Gupta', role: 'Aspirant', location: 'Gwalior', comment: 'English medium walo ke liye hindi terms samajhna mushkil hota tha, par is app ne wo problem solve kar di.', image: '/testimonials/sneha.png', stars: 5 },
      { name: 'Vikram Singh', role: 'Aspirant', location: 'Shivpuri', comment: 'Test series ka level actual exam jaisa hai. Analysis dekh kar weak areas clearly pata chal jate hain.', image: '/testimonials/vikram.png', stars: 5 },
      { name: 'Anjali Verma', role: 'Aspirant', location: 'Ashoknagar', comment: 'Mnemonics wale flashcards bahut creative hain.', image: '/testimonials/anjali.png', stars: 5 },
      { name: 'Sandeep Yadav', role: 'Aspirant', location: 'Morena', comment: 'Daily quizzes se continuity bani rahti hai. Question timings feature ne meri speed improve kar di.', image: '/testimonials/sandeep.png', stars: 5 },
      { name: 'Divya Jain', role: 'Aspirant', location: 'Bhind', comment: 'Syllabus ko cards ke form me and flashcards me convert karna bahut creative hai.', image: '/testimonials/divya.png', stars: 5 },
    ];

    console.log('Seeding data...');
    for (const [index, item] of seedData.entries()) {
      await db.insert(testimonials).values({
        id: nanoid(),
        name: item.name,
        role: item.role,
        location: item.location,
        comment: item.comment,
        image: item.image || null,
        stars: item.stars,
        displayOrder: index,
        isActive: true,
        examType: 'mppsc'
      });
    }
    
    console.log('Seeding complete.');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
