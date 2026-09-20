// فصل الانتقالات: كل برنامج ممكن يحتاج باص (يوصّلهم) وعربيات سفاري (للصحراء) — الاتنين مع بعض
//
// ⚠️ بيضيف الأعمدة بس. نقل البيانات القديمة اتعمل مرة واحدة وخلاص،
// والاختيارات بقت بتتحدد من /admin/pricing
// تشغيل: DATABASE_URL="..." node scripts/transport-split-migration.mjs
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
      ADD COLUMN IF NOT EXISTS needs_bus BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS needs_safari BOOLEAN NOT NULL DEFAULT false;
  `);


  const { rows } = await pool.query(
    "SELECT program_id, needs_bus, needs_safari FROM program_pricing ORDER BY program_id"
  );
  rows.forEach((r) =>
    console.log(
      ` - ${r.program_id}: باص=${r.needs_bus ? "أيوه" : "لأ"} · سفاري=${r.needs_safari ? "أيوه" : "لأ"}`
    )
  );

  console.log("تم بنجاح.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
