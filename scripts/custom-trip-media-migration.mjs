// إضافة صور وتقييم لكل خيار في البرنامج المخصّص
// تشغيل: DATABASE_URL="..." node scripts/custom-trip-media-migration.mjs
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
    ALTER TABLE custom_trip_options
      ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS rating NUMERIC NOT NULL DEFAULT 0;
  `);

  // نقل الصورة المفردة القديمة للمصفوفة الجديدة
  await pool.query(`
    UPDATE custom_trip_options
    SET images = ARRAY[image]
    WHERE image <> '' AND cardinality(images) = 0;
  `);

  console.log("تم بنجاح.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
