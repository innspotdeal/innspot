// تسعير حسب عدد الأفراد: كل بند (فطار/غدا/تذاكر) ليه شرائح "من عدد لعدد بسعر كذا"
// + الانتقالات بقت اختيارية في الحاسبة
// تشغيل: DATABASE_URL="..." node scripts/price-tiers-migration.mjs
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
  console.log("بينشئ جدول شرائح الأسعار...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS program_price_tiers (
      id SERIAL PRIMARY KEY,
      program_id TEXT NOT NULL REFERENCES corporate_programs(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,              -- breakfast | lunch | tickets
      from_people INTEGER NOT NULL DEFAULT 0,
      to_people INTEGER NOT NULL DEFAULT 0,  -- 0 = وما فوق
      price NUMERIC NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS program_price_tiers_lookup
      ON program_price_tiers (program_id, kind);
  `);

  // نقل الأسعار الثابتة الحالية لشريحة واحدة مفتوحة (من 0 وما فوق)
  const { rows } = await pool.query("SELECT COUNT(*)::int AS c FROM program_price_tiers");
  if (rows[0].c > 0) {
    console.log(`فيه ${rows[0].c} شريحة بالفعل — مش هيتم النقل تاني.`);
  } else {
    const existing = await pool.query(
      "SELECT program_id, breakfast_per_person, lunch_per_person, tickets_per_person FROM program_pricing"
    );
    for (const row of existing.rows) {
      const entries = [
        ["breakfast", row.breakfast_per_person],
        ["lunch", row.lunch_per_person],
        ["tickets", row.tickets_per_person],
      ];
      for (const [kind, price] of entries) {
        await pool.query(
          `INSERT INTO program_price_tiers (program_id, kind, from_people, to_people, price)
           VALUES ($1,$2,0,0,$3)`,
          [row.program_id, kind, price]
        );
      }
    }
    console.log(`تم نقل أسعار ${existing.rowCount} برنامج لشرائح مفتوحة.`);
  }

  // تحويل شرائح هامش الربح من الصيغة القديمة (minPeople وما فوق) لصيغة من–إلى
  const settings = await pool.query("SELECT margin_tiers FROM pricing_settings WHERE id=1");
  const current = settings.rows[0]?.margin_tiers ?? [];
  const needsConversion = current.some((t) => t.minPeople !== undefined);
  if (needsConversion) {
    const sorted = [...current]
      .map((t) => ({ minPeople: Number(t.minPeople) || 0, margin: Number(t.margin) || 0 }))
      .sort((a, b) => a.minPeople - b.minPeople);

    const converted = sorted.map((t, i) => ({
      fromPeople: t.minPeople,
      // الحد الأعلى = بداية الشريحة اللي بعدها ناقص واحد، وآخر شريحة مفتوحة
      toPeople: i < sorted.length - 1 ? sorted[i + 1].minPeople - 1 : 0,
      margin: t.margin,
    }));

    await pool.query("UPDATE pricing_settings SET margin_tiers=$1 WHERE id=1", [
      JSON.stringify(converted),
    ]);
    console.log(`تم تحويل ${converted.length} شريحة هامش ربح لصيغة من–إلى.`);
  }

  console.log("تم بنجاح.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
