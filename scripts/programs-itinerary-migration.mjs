// ترحيل برامج الشركات لمخطط رحلة منظّم (خطوة + تفصيلها) + وقت تحرك/عودة
// - بيضيف أعمدة: itinerary (jsonb) و start_time و end_time
// - بيحدّث محتوى البرامج من src/data/programs.ts (المصدر الوحيد للمحتوى)
// - بيحذف أي برنامج قديم مش موجود في الملف (زي advance-program بعد ما بقى مكرر)
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

  for (const p of corporatePrograms) {
    const exists = await pool.query("SELECT 1 FROM corporate_programs WHERE id=$1", [p.id]);

    if (exists.rowCount) {
      // مش بنلمس start_time/end_time لو الأدمن ظبّطهم من اللوحة قبل كده
      await pool.query(
        `UPDATE corporate_programs
         SET name=$2, name_en=$3, description=$4, description_en=$5,
             itinerary=$6, duration=$7, duration_en=$8, includes=$9, includes_en=$10,
             is_custom=$11, is_builder=$12, highlights='{}', highlights_en='{}'
         WHERE id=$1`,
        [
          p.id,
          p.name,
          p.nameEn,
          p.description,
          p.descriptionEn,
          JSON.stringify(p.itinerary),
          p.duration,
          p.durationEn,
          p.includes,
          p.includesEn,
          p.isCustom,
          p.isBuilder,
        ]
      );
      console.log(`تم تحديث: ${p.id}`);
    } else {
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

  // حذف أي برنامج قديم مبقاش موجود في ملف المحتوى
  const keepIds = corporatePrograms.map((p) => p.id);
  const removed = await pool.query(
    `DELETE FROM corporate_programs WHERE id <> ALL($1::text[]) RETURNING id`,
    [keepIds]
  );
  removed.rows.forEach((r) => console.log(`تم حذف: ${r.id}`));

  console.log("تم بنجاح.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
