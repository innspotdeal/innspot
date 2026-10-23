// السفاري الاختيارية (safari_optional في program_pricing) وصورها ووصفها (جدول safari_info)
// الموقع كمان بيعملهم لوحده أول ما التسعير أو تفاصيل السفاري يتحفظوا
// بيضيف بس — مش بيلمس أي بيانات
// تشغيل: DATABASE_URL="..." node scripts/safari-optional-migration.mjs
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
    ALTER TABLE program_pricing
      ADD COLUMN IF NOT EXISTS safari_optional BOOLEAN NOT NULL DEFAULT false;
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS safari_info (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      description TEXT NOT NULL DEFAULT '',
      description_en TEXT NOT NULL DEFAULT '',
      images TEXT[] NOT NULL DEFAULT '{}'
    );
  `);
  console.log("تم — عمود safari_optional وجدول safari_info جاهزين");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
