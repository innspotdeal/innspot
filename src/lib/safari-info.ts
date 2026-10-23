import "server-only";
import { pool } from "@/lib/db";

// ============================================================
// «عايز سفاري» — الصور والوصف اللي بيظهروا للعميل جنب السفاري (من غير سعر)
// ============================================================
// صف واحد بيتعدل من الـ ERP (الانتقالات ← عربيات السفاري). الجدول بيتعمل لوحده
// أول ما حد يحفظ (نفس scripts/safari-optional-migration.mjs)، وقبل كده القراية بترجع فاضي
// ============================================================

export type SafariInfo = {
  description: string;
  descriptionEn: string;
  images: string[];
};

export const EMPTY_SAFARI_INFO: SafariInfo = { description: "", descriptionEn: "", images: [] };

type Row = { description: string; description_en: string; images: string[] | null };

let tableReady: Promise<void> | null = null;

function ensureSafariInfoTable(): Promise<void> {
  tableReady ??= pool
    .query(
      `CREATE TABLE IF NOT EXISTS safari_info (
         id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
         description TEXT NOT NULL DEFAULT '',
         description_en TEXT NOT NULL DEFAULT '',
         images TEXT[] NOT NULL DEFAULT '{}'
       )`
    )
    .then(() => undefined)
    .catch((err) => {
      // نجرب تاني مع الحفظ الجاي بدل ما نفضل شايلين الفشل
      tableReady = null;
      throw err;
    });
  return tableReady;
}

export async function getSafariInfo(): Promise<SafariInfo> {
  try {
    const result = await pool.query<Row>("SELECT description, description_en, images FROM safari_info WHERE id = 1");
    const row = result.rows[0];
    if (!row) return EMPTY_SAFARI_INFO;
    return { description: row.description, descriptionEn: row.description_en, images: row.images ?? [] };
  } catch (err) {
    // الجدول لسه متعملش (محدش حفظ لسه)
    if ((err as { code?: string }).code === "42P01") return EMPTY_SAFARI_INFO;
    throw err;
  }
}

export async function setSafariInfo(info: SafariInfo): Promise<void> {
  await ensureSafariInfoTable();
  await pool.query(
    `INSERT INTO safari_info (id, description, description_en, images) VALUES (1,$1,$2,$3)
     ON CONFLICT (id) DO UPDATE SET
       description = EXCLUDED.description,
       description_en = EXCLUDED.description_en,
       images = EXCLUDED.images`,
    [info.description, info.descriptionEn, info.images]
  );
}
