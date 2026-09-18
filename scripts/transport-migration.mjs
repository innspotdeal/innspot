// جدول المركبات + ربط كل برنامج بمجموعة انتقالات
// السفاري: عربية بسعة 6 وسعر ثابت للعربية مهما كان اللي فيها
// الباصات: النوع بيتحدد أوتوماتيك حسب العدد (هاي إس / كوستر / ميني باص / باص)
// الأسعار اللي هنا مبدئية — تتعدل كلها من /admin/transport
// تشغيل: DATABASE_URL="..." node scripts/transport-migration.mjs
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

// [id, group, name, nameEn, capacity, price]
const VEHICLES = [
  ["safari-car", "safari", "عربية سفاري", "Safari vehicle", 6, 4000],
  ["hiace", "bus", "ميني باص هاي إس", "Hiace mini bus", 12, 0],
  ["coaster", "bus", "كوستر", "Coaster", 22, 0],
  ["minibus", "bus", "ميني باص", "Mini bus", 30, 0],
  ["big-bus", "bus", "باص كبير", "Large bus", 50, 0],
];

async function main() {
  console.log("بينشئ جدول المركبات...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transport_vehicles (
      id TEXT PRIMARY KEY,
      vehicle_group TEXT NOT NULL DEFAULT 'bus',
      name TEXT NOT NULL,
      name_en TEXT NOT NULL DEFAULT '',
      capacity INTEGER NOT NULL DEFAULT 0,
      price NUMERIC NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT true,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `);

  // كل برنامج بيستخدم أنهي مجموعة انتقالات
  await pool.query(`
    ALTER TABLE program_pricing
      ADD COLUMN IF NOT EXISTS transport_group TEXT NOT NULL DEFAULT 'safari';
  `);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS c FROM transport_vehicles");
  if (rows[0].c > 0) {
    console.log(`الجدول فيه ${rows[0].c} مركبة بالفعل — مش هيتضاف تاني.`);
  } else {
    let i = 1;
    for (const [id, group, name, nameEn, capacity, price] of VEHICLES) {
      await pool.query(
        `INSERT INTO transport_vehicles (id, vehicle_group, name, name_en, capacity, price, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
        [id, group, name, nameEn, capacity, price, i++]
      );
    }
    console.log(`تمت إضافة ${VEHICLES.length} مركبة (أسعار الباصات لسه 0 — تتحط من اللوحة).`);
  }

  // برامج الباص بتستخدم مجموعة الباصات
  await pool.query(
    "UPDATE program_pricing SET transport_group='bus' WHERE program_id IN ('innspot-classic')"
  );
  await pool.query(
    "UPDATE program_pricing SET transport_group='safari' WHERE program_id IN ('classic-safari','advance-safari')"
  );

  console.log("تم بنجاح.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
