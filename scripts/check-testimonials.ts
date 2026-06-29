import { db } from "../src/db";
import { testimonials } from "../src/db/schema";
import { sql } from "drizzle-orm";

async function main() {
  try {
    const res = await db.select({ count: sql`count(*)` }).from(testimonials);
    console.log("SUCCESS! Testimonials remote table exists. Count:", res[0].count);
  } catch (error: any) {
    console.error("ERROR! Table might not exist remotely:", error.message);
  }
}
main();
