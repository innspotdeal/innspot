// تجهيز أعمدة برامج الشركات + إضافة أي برنامج ناقص من src/data/programs.ts
//
// ⚠️ لوحة الأدمن هي المصدر الوحيد للحقيقة:
// السكريبت ده بيجهّز الأعمدة بس، وبيزرع البرامج لو الجدول فاضي تمامًا (قاعدة جديدة).
// لو فيه برامج موجودة، مش بيلمس حاجة خالص — لا بيعدّل ولا بيضيف ولا بيحذف —
// عشان أي تعديل أو حذف تعمله من اللوحة يفضل زي ما هو.
// تشغيل: DATABASE_URL="..." node scripts/programs-itinerary-migration.mjs
import pg from "pg";
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

async function main() {
  console.log("بيضيف الأعمدة الجديدة (لو مش موجودة)...");
  await pool.query(`
    ALTER TABLE corporate_programs
      ADD COLUMN IF NOT EXISTS itinerary JSONB NOT NULL DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS start_time TEXT,
      ADD COLUMN IF NOT EXISTS end_time TEXT,
      ADD COLUMN IF NOT EXISTS is_builder BOOLEAN NOT NULL DEFAULT false;
  `);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS c FROM corporate_programs");
  if (rows[0].c > 0) {
    console.log(`فيه ${rows[0].c} برنامج بالفعل — اللوحة هي المصدر، مش هيتلمس حاجة.`);
    console.log("تم بنجاح.");
    await pool.end();
    return;
  }

  console.log("الجدول فاضي — بيزرع البرامج الأساسية...");
  for (const p of corporatePrograms) {
    {
      await pool.query(
        `INSERT INTO corporate_programs
          (id, name, name_en, description, description_en, highlights, highlights_en,
           duration, duration_en, includes, includes_en, images, is_custom,
           itinerary, start_time, end_time, is_builder, sort_order)
         VALUES ($1,$2,$3,$4,$5,'{}','{}',$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
           (SELECT COALESCE(MAX(sort_order),0)+1 FROM corporate_programs))`,
        [
          p.id,
          p.name,
          p.nameEn,
          p.description,
          p.descriptionEn,
          p.duration,
          p.durationEn,
          p.includes,
          p.includesEn,
          p.images,
          p.isCustom,
          JSON.stringify(p.itinerary),
          p.startTime || null,
          p.endTime || null,
          p.isBuilder,
        ]
      );
      console.log(`تمت إضافة: ${p.id}`);
    }
  }


  console.log("تم بنجاح.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
