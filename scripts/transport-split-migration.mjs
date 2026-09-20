// فصل الانتقالات: كل برنامج ممكن يحتاج باص (يوصّلهم) وعربيات سفاري (للصحراء) — الاتنين مع بعض
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

  // تحويل الاختيار القديم الواحد: اللي كان "safari" بقى محتاج الاتنين
  // (الباص بيوصّلهم، والعربيات للصحراء)، واللي كان "bus" محتاج الباص بس
  await pool.query(`
    UPDATE program_pricing
    SET needs_bus = true, needs_safari = (transport_group = 'safari');
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
