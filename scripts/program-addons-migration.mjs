// الإضافات بقت قايمة واحدة لكل البرامج (جدول custom_trip_options بنوع addon)
// وكل برنامج بيحدد لكل إضافة: متاحة كإضافة (الافتراضي) / مشمولة في السعر / مش متاحة
//
// ⚠️ لوحة الأدمن هي المصدر الوحيد للحقيقة:
// - الجدول بيتعمل لو مش موجود
// - إضافات القايمة القديمة (addon_prices) بتتنقل للقايمة الموحدة لو مش موجودة فيها
// - المركب والساند بورد بيتضافوا لو مش موجودين (بسعر 0 — يتحط من اللوحة)
// - إعدادات البرامج بتتزرع مرة واحدة بس، لو الجدول فاضي تمامًا
// تشغيل: DATABASE_URL="..." node scripts/program-addons-migration.mjs
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

// برنامج رحلة الباص — المركب والساند بورد مشمولين فيه
const BUS_PROGRAM_ID = "innspot-classic";

// الإضافات القديمة اللي كانت مكتوبة في الكود (src/data/addons.ts)
// [المفتاح القديم, المعرّف الجديد, الاسم, الاسم بالإنجليزي]
const LEGACY_ADDONS = [
  ["bedouinBand", "add-bedouin-band", "فرقة بدوي", "Bedouin band"],
  ["fireShow", "add-fire-show", "فاير شو", "Fire show"],
  ["mizmarReception", "add-mizmar", "مزمار بلدي للاستقبال", "Mizmar welcome"],
];

// [المعرّف, الاسم, الاسم بالإنجليزي]
const NEW_ADDONS = [
  ["add-boat", "المركب", "Boat ride"],
  ["add-sandboard", "الساند بورد", "Sandboarding"],
];

async function addonExists(id, name) {
  const { rowCount } = await pool.query(
    "SELECT 1 FROM custom_trip_options WHERE kind='addon' AND (id=$1 OR name=$2)",
    [id, name]
  );
  return rowCount > 0;
}

// المعرّف الفعلي للإضافة — ممكن تكون موجودة بنفس الاسم بمعرّف تاني
async function resolveAddonId(id, name) {
  const { rows } = await pool.query(
    "SELECT id FROM custom_trip_options WHERE kind='addon' AND (id=$1 OR name=$2) ORDER BY (id=$1) DESC LIMIT 1",
    [id, name]
  );
  return rows[0]?.id ?? null;
}

async function insertAddon(id, name, nameEn, price, unit) {
  await pool.query(
    `INSERT INTO custom_trip_options (id, kind, name, name_en, price, price_unit, active, sort_order)
     VALUES ($1,'addon',$2,$3,$4,$5,true,
       (SELECT COALESCE(MAX(sort_order),0)+1 FROM custom_trip_options WHERE kind='addon'))
     ON CONFLICT (id) DO NOTHING`,
    [id, name, nameEn, price, unit]
  );
}

async function main() {
  console.log("بينشئ جدول إضافات البرامج...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS program_addons (
      program_id TEXT NOT NULL REFERENCES corporate_programs(id) ON DELETE CASCADE,
      option_id TEXT NOT NULL REFERENCES custom_trip_options(id) ON DELETE CASCADE,
      mode TEXT NOT NULL CHECK (mode IN ('included', 'hidden')),
      PRIMARY KEY (program_id, option_id)
    );
  `);

  // نقل الإضافات القديمة بأسعارها — مرة واحدة بس (لو اتمسحت من اللوحة بعد كده مش هترجع
  // لأن addon_prices بيتفضّى بعد النقل)
  const legacy = await pool
    .query("SELECT key, price FROM addon_prices")
    .then((r) => Object.fromEntries(r.rows.map((row) => [row.key, Number(row.price)])))
    .catch(() => ({}));

  for (const [key, id, name, nameEn] of LEGACY_ADDONS) {
    if (!(key in legacy)) continue;
    if (await addonExists(id, name)) {
      console.log(`  ${name}: موجودة في القايمة بالفعل`);
    } else {
      await insertAddon(id, name, nameEn, legacy[key], "flat");
      console.log(`  ${name}: اتنقلت بسعر ${legacy[key]}`);
    }
  }
  if (Object.keys(legacy).length) {
    await pool.query("DELETE FROM addon_prices");
    console.log("تم تفضية جدول الإضافات القديم (addon_prices).");
  }

  // الجدول لسه فاضي = أول تشغيل → نزرع المركب والساند بورد وإعدادات البرامج.
  // لو فيه أي إعداد، يبقى الأدمن اشتغل عليه — مش هنلمس حاجة.
  const { rows } = await pool.query("SELECT COUNT(*)::int AS c FROM program_addons");
  if (rows[0].c > 0) {
    console.log(`فيه ${rows[0].c} إعداد بالفعل — اللوحة هي المصدر، مش هيتلمس حاجة.`);
    console.log("تم بنجاح.");
    await pool.end();
    return;
  }

  for (const [id, name, nameEn] of NEW_ADDONS) {
    if (!(await addonExists(id, name))) {
      await insertAddon(id, name, nameEn, 0, "per_person");
      console.log(`  ${name}: اتضافت (السعر 0 — حطه من اللوحة)`);
    }
  }

  const programs = await pool.query("SELECT id FROM corporate_programs");
  const busExists = programs.rows.some((p) => p.id === BUS_PROGRAM_ID);

  const boatId = await resolveAddonId("add-boat", "المركب");
  const sandboardId = await resolveAddonId("add-sandboard", "الساند بورد");

  if (busExists) {
    for (const id of [boatId, sandboardId]) {
      if (!id) continue;
      await pool.query(
        `INSERT INTO program_addons (program_id, option_id, mode) VALUES ($1,$2,'included')
         ON CONFLICT DO NOTHING`,
        [BUS_PROGRAM_ID, id]
      );
    }
    console.log("  برنامج رحلة الباص: المركب والساند بورد مشمولين في السعر");
  } else {
    console.log(`  (برنامج ${BUS_PROGRAM_ID} مش موجود — مفيش حاجة مشمولة)`);
  }

  // الساند بورد جزء من برنامج الباص بس — مش إضافة في باقي البرامج.
  // المركب يفضل متاح كإضافة في كل البرامج التانية (الافتراضي).
  for (const { id } of programs.rows) {
    if (id === BUS_PROGRAM_ID || !sandboardId) continue;
    await pool.query(
      `INSERT INTO program_addons (program_id, option_id, mode) VALUES ($1,$2,'hidden')
       ON CONFLICT DO NOTHING`,
      [id, sandboardId]
    );
  }
  console.log("  الساند بورد: مش متاح في باقي البرامج");

  console.log("تم بنجاح.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
