// سكريبت لمرة واحدة: بينشئ كل جداول لوحة الأدمن (فيلات، فنادق، أنشطة،
// برامج شركات، وتسعير) وينقل لها البيانات الحالية من ملفات src/data و src/lib
// (لو الجدول فيه بيانات بالفعل، السكريبت مش بيلمسه)
// تشغيل: DATABASE_URL="..." node scripts/init-db.mjs
import pg from "pg";
import { villas } from "../src/data/accommodations.ts";
import { hotels } from "../src/data/hotels.ts";
import { activities } from "../src/data/activities.ts";
import { corporatePrograms } from "../src/data/programs.ts";

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

// أرقام التسعير الداخلية القديمة (كانت مكتوبة مباشرة في lib/pricing.ts)
// بنستخدمها هنا مرة واحدة بس عشان نعمل seed أولي لقاعدة البيانات
const LEGACY_PROGRAM_PRICING = {
  "innspot-classic": { breakfastPerPerson: 75, lunchPerPerson: 150, ticketsPerPerson: 25, carPrice: 3000 },
  "classic-safari": { breakfastPerPerson: 75, lunchPerPerson: 150, ticketsPerPerson: 25, carPrice: 3000 },
};
const LEGACY_ADDON_PRICES = { bedouinBand: 3500, fireShow: 3000, mizmarReception: 1500 };
const LEGACY_MARGIN_TIERS = [
  { minPeople: 32, margin: 15000 },
  { minPeople: 26, margin: 10000 },
  { minPeople: 20, margin: 7000 },
];
const LEGACY_PEOPLE_PER_CAR = 6;

async function tableCount(table) {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
  return rows[0].count;
}

async function main() {
  console.log("بينشئ الجداول (لو مش موجودة)...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS villas (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_en TEXT NOT NULL,
      description TEXT NOT NULL,
      description_en TEXT NOT NULL,
      images TEXT[] NOT NULL DEFAULT '{}',
      rooms INTEGER NOT NULL DEFAULT 0,
      beds INTEGER NOT NULL DEFAULT 0,
      has_pool BOOLEAN NOT NULL DEFAULT false,
      has_garden BOOLEAN NOT NULL DEFAULT false,
      capacity INTEGER NOT NULL DEFAULT 0,
      amenities TEXT[] NOT NULL DEFAULT '{}',
      amenities_en TEXT[] NOT NULL DEFAULT '{}',
      price_weekday NUMERIC NOT NULL DEFAULT 0,
      price_weekend NUMERIC NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS hotels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_en TEXT NOT NULL,
      description TEXT NOT NULL,
      description_en TEXT NOT NULL,
      images TEXT[] NOT NULL DEFAULT '{}',
      room_types JSONB NOT NULL DEFAULT '[]',
      has_pool BOOLEAN NOT NULL DEFAULT false,
      has_garden BOOLEAN NOT NULL DEFAULT false,
      amenities TEXT[] NOT NULL DEFAULT '{}',
      amenities_en TEXT[] NOT NULL DEFAULT '{}',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_en TEXT NOT NULL,
      description TEXT NOT NULL,
      description_en TEXT NOT NULL,
      image TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS corporate_programs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_en TEXT NOT NULL,
      description TEXT NOT NULL,
      description_en TEXT NOT NULL,
      highlights TEXT[] NOT NULL DEFAULT '{}',
      highlights_en TEXT[] NOT NULL DEFAULT '{}',
      duration TEXT NOT NULL DEFAULT '',
      duration_en TEXT NOT NULL DEFAULT '',
      includes TEXT[] NOT NULL DEFAULT '{}',
      includes_en TEXT[] NOT NULL DEFAULT '{}',
      images TEXT[] NOT NULL DEFAULT '{}',
      is_custom BOOLEAN NOT NULL DEFAULT false,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS program_pricing (
      program_id TEXT PRIMARY KEY REFERENCES corporate_programs(id) ON DELETE CASCADE,
      breakfast_per_person NUMERIC NOT NULL DEFAULT 0,
      lunch_per_person NUMERIC NOT NULL DEFAULT 0,
      tickets_per_person NUMERIC NOT NULL DEFAULT 0,
      car_price NUMERIC NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS addon_prices (
      key TEXT PRIMARY KEY,
      price NUMERIC NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS pricing_settings (
      id SMALLINT PRIMARY KEY DEFAULT 1,
      people_per_car INTEGER NOT NULL DEFAULT 6,
      margin_tiers JSONB NOT NULL DEFAULT '[]'
    );
  `);

  // --- فيلات ---
  if ((await tableCount("villas")) === 0) {
    console.log(`بينقل ${villas.length} فيلا...`);
    let sortOrder = 1;
    for (const v of villas) {
      await pool.query(
        `INSERT INTO villas
          (id, name, name_en, description, description_en, images, rooms, beds, has_pool, has_garden, capacity, amenities, amenities_en, price_weekday, price_weekend, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         ON CONFLICT (id) DO NOTHING`,
        [v.id, v.name, v.nameEn, v.description, v.descriptionEn, v.images, v.rooms, v.beds, v.hasPool, v.hasGarden, v.capacity, v.amenities, v.amenitiesEn, v.priceWeekday, v.priceWeekend, sortOrder++]
      );
    }
  } else {
    console.log("جدول الفيلات فيه بيانات بالفعل — تم التخطي.");
  }

  // --- فنادق ---
  if ((await tableCount("hotels")) === 0) {
    console.log(`بينقل ${hotels.length} فندق...`);
    let sortOrder = 1;
    for (const h of hotels) {
      await pool.query(
        `INSERT INTO hotels
          (id, name, name_en, description, description_en, images, room_types, has_pool, has_garden, amenities, amenities_en, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (id) DO NOTHING`,
        [h.id, h.name, h.nameEn, h.description, h.descriptionEn, h.images, JSON.stringify(h.roomTypes), h.hasPool, h.hasGarden, h.amenities, h.amenitiesEn, sortOrder++]
      );
    }
  } else {
    console.log("جدول الفنادق فيه بيانات بالفعل — تم التخطي.");
  }

  // --- أنشطة ---
  if ((await tableCount("activities")) === 0) {
    console.log(`بينقل ${activities.length} نشاط...`);
    let sortOrder = 1;
    for (const a of activities) {
      await pool.query(
        `INSERT INTO activities (id, name, name_en, description, description_en, image, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO NOTHING`,
        [a.id, a.name, a.nameEn, a.description, a.descriptionEn, a.image, sortOrder++]
      );
    }
  } else {
    console.log("جدول الأنشطة فيه بيانات بالفعل — تم التخطي.");
  }

  // --- برامج شركات ---
  if ((await tableCount("corporate_programs")) === 0) {
    console.log(`بينقل ${corporatePrograms.length} برنامج...`);
    let sortOrder = 1;
    for (const p of corporatePrograms) {
      await pool.query(
        `INSERT INTO corporate_programs
          (id, name, name_en, description, description_en, highlights, highlights_en, duration, duration_en, includes, includes_en, images, is_custom, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.name, p.nameEn, p.description, p.descriptionEn, p.highlights, p.highlightsEn, p.duration, p.durationEn, p.includes, p.includesEn, p.images, p.isCustom, sortOrder++]
      );
    }
  } else {
    console.log("جدول برامج الشركات فيه بيانات بالفعل — تم التخطي.");
  }

  // --- تسعير البرامج ---
  if ((await tableCount("program_pricing")) === 0) {
    console.log("بينقل تسعير البرامج...");
    for (const [programId, pricing] of Object.entries(LEGACY_PROGRAM_PRICING)) {
      await pool.query(
        `INSERT INTO program_pricing (program_id, breakfast_per_person, lunch_per_person, tickets_per_person, car_price)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT (program_id) DO NOTHING`,
        [programId, pricing.breakfastPerPerson, pricing.lunchPerPerson, pricing.ticketsPerPerson, pricing.carPrice]
      );
    }
  } else {
    console.log("جدول تسعير البرامج فيه بيانات بالفعل — تم التخطي.");
  }

  // --- أسعار الإضافات ---
  if ((await tableCount("addon_prices")) === 0) {
    console.log("بينقل أسعار الإضافات...");
    for (const [key, price] of Object.entries(LEGACY_ADDON_PRICES)) {
      await pool.query(
        `INSERT INTO addon_prices (key, price) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING`,
        [key, price]
      );
    }
  } else {
    console.log("جدول أسعار الإضافات فيه بيانات بالفعل — تم التخطي.");
  }

  // --- إعدادات التسعير العامة (عدد الأفراد للعربية + شرائح هامش الربح) ---
  if ((await tableCount("pricing_settings")) === 0) {
    console.log("بيحفظ إعدادات التسعير الافتراضية...");
    await pool.query(
      `INSERT INTO pricing_settings (id, people_per_car, margin_tiers) VALUES (1,$1,$2) ON CONFLICT (id) DO NOTHING`,
      [LEGACY_PEOPLE_PER_CAR, JSON.stringify(LEGACY_MARGIN_TIERS)]
    );
  } else {
    console.log("إعدادات التسعير موجودة بالفعل — تم التخطي.");
  }

  console.log("تم بنجاح.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
