// إنشاء جدول خيارات البرنامج المخصّص
// الأسعار والأماكن اللي جوه دي أمثلة مبدئية — تتعدل كلها من /admin/custom-trip
//
// ⚠️ لوحة الأدمن هي المصدر الوحيد للحقيقة: السكريبت بيزرع الأمثلة لو الجدول
// فاضي تمامًا بس، ومش بيرجّع أي حاجة اتمسحت من اللوحة.
// تشغيل: DATABASE_URL="..." node scripts/custom-trip-migration.mjs
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

// [id, kind, parentId, name, nameEn, price, priceUnit, capacity, tier, includesBreakfast]
const SAMPLES = [
  // أماكن المبيت
  ["hotel-tunis-eco", "hotel", null, "نزل اقتصادي — قرية تونس", "Budget lodge — Tunis Village", 350, "per_night", null, "اقتصادي", false],
  ["hotel-lake-view", "hotel", null, "فندق إطلالة البحيرة", "Lake View Hotel", 750, "per_night", null, "متوسط", true],
  ["hotel-premium", "hotel", null, "فندق فاخر", "Premium Hotel", 1400, "per_night", null, "فاخر", true],

  // أماكن الفطار
  ["bf-zawya", "breakfast_place", null, "واحة الزاواي", "Zawya Oasis", 0, "per_person", null, "", false],
  ["bf-tunis", "breakfast_place", null, "قرية تونس", "Tunis Village", 0, "per_person", null, "", false],

  // أصناف الفطار
  ["bf-item-feteer", "breakfast_item", "bf-zawya", "فطير مشلتت + عسل + جبنة + مش", "Feteer meshaltet + honey + cheese + mish", 90, "per_person", null, "", false],
  ["bf-item-eggs", "breakfast_item", "bf-zawya", "بيض بلدي + فول + طعمية", "Farm eggs + foul + falafel", 75, "per_person", null, "", false],
  ["bf-item-tunis-set", "breakfast_item", "bf-tunis", "فطار ريفي متكامل", "Full rustic breakfast", 110, "per_person", null, "", false],

  // عربيات السفاري
  ["car-6", "safari_car", null, "عربية سفاري — 6 أفراد", "Safari vehicle — 6 people", 3000, "per_car", 6, "", false],
  ["car-4", "safari_car", null, "عربية سفاري — 4 أفراد", "Safari vehicle — 4 people", 2400, "per_car", 4, "", false],

  // أماكن الغداء
  ["ln-zawya", "lunch_place", null, "واحة الزاواي", "Zawya Oasis", 0, "per_person", null, "", false],
  ["ln-magic", "lunch_place", null, "كامب الماجيك ليك", "Magic Lake Camp", 0, "per_person", null, "", false],

  // أصناف الغداء
  ["ln-item-chicken", "lunch_item", "ln-zawya", "ربع فرخة + أرز + سلطة + طحينة + عيش", "Quarter chicken + rice + salad + tahini + bread", 160, "per_person", null, "", false],
  ["ln-item-fish", "lunch_item", "ln-magic", "سمك بلطي مشوي + أرز + سلطة", "Grilled tilapia + rice + salad", 200, "per_person", null, "", false],
  ["ln-item-grill", "lunch_item", "ln-magic", "مشويات مشكّلة", "Mixed grill", 260, "per_person", null, "", false],

  // الإضافات
  ["add-wadi-hitan", "addon", null, "زيارة وادي الحيتان", "Wadi El Hitan visit", 120, "per_person", null, "", false],
  ["add-snacks", "addon", null, "سناكس", "Snacks", 45, "per_person", null, "", false],
  ["add-fruits", "addon", null, "فاكهة", "Fruit", 55, "per_person", null, "", false],
  ["add-bedouin-band", "addon", null, "فرقة بدوي", "Bedouin band", 3500, "flat", null, "", false],
  ["add-fire-show", "addon", null, "فاير شو", "Fire show", 3000, "flat", null, "", false],
  ["add-tanoura", "addon", null, "تنورة", "Tanoura show", 2500, "flat", null, "", false],
];

async function main() {
  console.log("بينشئ جدول خيارات البرنامج المخصّص...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS custom_trip_options (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      parent_id TEXT,
      name TEXT NOT NULL,
      name_en TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      description_en TEXT NOT NULL DEFAULT '',
      price NUMERIC NOT NULL DEFAULT 0,
      price_unit TEXT NOT NULL DEFAULT 'per_person',
      capacity INTEGER,
      tier TEXT NOT NULL DEFAULT '',
      includes_breakfast BOOLEAN NOT NULL DEFAULT false,
      image TEXT NOT NULL DEFAULT '',
      active BOOLEAN NOT NULL DEFAULT true,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `);

  // علامة إن البرنامج ده صفحته عبارة عن مكوّن رحلة مش مخطط عادي
  await pool.query(`
    ALTER TABLE corporate_programs
      ADD COLUMN IF NOT EXISTS is_builder BOOLEAN NOT NULL DEFAULT false;
  `);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS c FROM custom_trip_options");
  if (rows[0].c > 0) {
    console.log(`الجدول فيه ${rows[0].c} خيار بالفعل — مش هيتضاف أمثلة تاني.`);
  } else {
    console.log(`بيضيف ${SAMPLES.length} خيار كأمثلة مبدئية...`);
    let i = 1;
    for (const [id, kind, parentId, name, nameEn, price, unit, capacity, tier, incBf] of SAMPLES) {
      await pool.query(
        `INSERT INTO custom_trip_options
          (id, kind, parent_id, name, name_en, price, price_unit, capacity, tier, includes_breakfast, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO NOTHING`,
        [id, kind, parentId, name, nameEn, price, unit, capacity, tier, incBf, i++]
      );
    }
  }

  // ⚠️ البرنامج نفسه مش بيتضاف من هنا:
  // لوحة الأدمن هي المصدر الوحيد للحقيقة، فلو اتمسح من اللوحة يفضل متشال.
  // على قاعدة بيانات جديدة (جدول البرامج فاضي) بيتزرع من
  // scripts/programs-itinerary-migration.mjs مع باقي البرامج.
  const exists = await pool.query("SELECT 1 FROM corporate_programs WHERE id='custom-program'");
  if (!exists.rowCount) {
    console.log("برنامج كاستم مش موجود — مش هيترجع تلقائي (يتضاف من اللوحة لو محتاجه).");
  }

  console.log("تم بنجاح.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
