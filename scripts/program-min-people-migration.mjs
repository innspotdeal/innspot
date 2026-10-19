// أقل عدد أفراد لكل برنامج (min_people) — بيتعدّل من صفحة البرامج في لوحة الأدمن
// البرامج الموجودة بتاخد 10 (الحد القديم الثابت). الموقع كمان بيضيف العمود لوحده أول ما برنامج يتحفظ
// بيضيف العمود بس — مش بيلمس أي بيانات
// تشغيل: DATABASE_URL="..." node scripts/program-min-people-migration.mjs
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
      ADD COLUMN IF NOT EXISTS min_people INTEGER NOT NULL DEFAULT 10;
  `);
  console.log("تم — عمود min_people جاهز");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
