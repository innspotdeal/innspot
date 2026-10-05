// برامج التذاكر: نوع البرنامج (is_ticket) وسعر التذكرة الثابت للفرد (ticket_price)
// النوع بيتحدد من صفحة البرامج، والسعر من صفحة التسعير
// بيضيف الأعمدة بس — مش بيلمس أي بيانات
// تشغيل: DATABASE_URL="..." node scripts/ticket-price-migration.mjs
import pg from "pg";

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("خطأ: لازم تحدد DATABASE_URL");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
});

async function main() {
  await pool.query(`
    ALTER TABLE corporate_programs
      ADD COLUMN IF NOT EXISTS is_ticket BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS ticket_price NUMERIC NOT NULL DEFAULT 0;
  `);
  console.log("تم — أعمدة is_ticket و ticket_price جاهزة");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
