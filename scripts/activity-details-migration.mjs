// تفاصيل الأنشطة: سعر النشاط للفرد (price)، المدة، وقايمة "يشمل النشاط"
// كله بيتعدل من صفحة الأنشطة في لوحة الأدمن
// بيضيف الأعمدة بس — مش بيلمس أي بيانات
// تشغيل: DATABASE_URL="..." node scripts/activity-details-migration.mjs
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
    ALTER TABLE activities
      ADD COLUMN IF NOT EXISTS price NUMERIC NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS duration TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS duration_en TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS includes TEXT[] NOT NULL DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS includes_en TEXT[] NOT NULL DEFAULT '{}';
  `);
  console.log("تم — أعمدة price و duration و includes للأنشطة جاهزة");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
