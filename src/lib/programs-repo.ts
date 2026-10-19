import "server-only";
import { pool } from "@/lib/db";
import { MIN_PEOPLE } from "@/data/booking";
import { corporatePrograms, type CorporateProgram, type ItineraryStep } from "@/data/programs";

// برنامج الكاستم الأصلي (data/programs.ts): لو اتمسح من قاعدة البيانات، صفحة رحلات الشركات
// وصفحته بيعرضوه بالكلام ده لحد ما يترجّع من الأدمن ويبقى ليه نسخة تتعدّل
export const FALLBACK_BUILDER: CorporateProgram | null = corporatePrograms.find((p) => p.isBuilder) ?? null;

type ProgramRow = {
  id: string;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  itinerary: ItineraryStep[] | null;
  start_time: string | null;
  end_time: string | null;
  highlights: string[];
  highlights_en: string[];
  duration: string;
  duration_en: string;
  includes: string[];
  includes_en: string[];
  images: string[];
  is_custom: boolean;
  is_builder: boolean;
  is_ticket: boolean | null;
  ticket_price: string | null;
  min_people: number | null;
};

function rowToProgram(row: ProgramRow): CorporateProgram {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    description: row.description,
    descriptionEn: row.description_en,
    itinerary: row.itinerary ?? [],
    startTime: row.start_time ?? "",
    endTime: row.end_time ?? "",
    duration: row.duration,
    durationEn: row.duration_en,
    includes: row.includes ?? [],
    includesEn: row.includes_en ?? [],
    images: row.images ?? [],
    isCustom: row.is_custom,
    isBuilder: row.is_builder ?? false,
    // الأعمدة دي ممكن متكونش اتعملت لسه قبل الترحيل — و NUMERIC بيرجع نص من pg
    isTicket: row.is_ticket ?? false,
    ticketPrice: Number(row.ticket_price ?? 0),
    minPeople: row.min_people ?? MIN_PEOPLE,
  };
}

// عمود أقل عدد أفراد (نفس scripts/program-min-people-migration.mjs): لو الـ migration متشغّلش،
// أول حفظ لبرنامج بيضيفه هو. القراية مش محتاجاه (rowToProgram بيرجع للافتراضي)، ومرة واحدة لكل سيرفر
let minPeopleColumnReady: Promise<void> | null = null;

function ensureMinPeopleColumn(): Promise<void> {
  minPeopleColumnReady ??= (async () => {
    const { rows } = await pool.query<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM information_schema.columns
       WHERE table_schema = current_schema() AND table_name = 'corporate_programs' AND column_name = 'min_people'`
    );
    if (rows[0].count > 0) return;
    await pool.query(
      `ALTER TABLE corporate_programs ADD COLUMN IF NOT EXISTS min_people INTEGER NOT NULL DEFAULT ${MIN_PEOPLE}`
    );
  })().catch((err) => {
    // نجرب تاني مع الحفظ الجاي بدل ما نفضل شايلين الفشل
    minPeopleColumnReady = null;
    throw err;
  });
  return minPeopleColumnReady;
}

export async function listPrograms(): Promise<CorporateProgram[]> {
  const result = await pool.query<ProgramRow>(
    // برنامج الكاستم (is_builder) دايمًا آخر واحد مهما كان ترتيبه
    "SELECT * FROM corporate_programs ORDER BY is_builder ASC, sort_order ASC, name ASC"
  );
  return result.rows.map(rowToProgram);
}

// البرنامج زي ما الزائر بيشوفه: من قاعدة البيانات، أو برنامج الكاستم الأصلي لو اتمسح
export async function getPublicProgram(id: string): Promise<CorporateProgram | null> {
  return (await getProgramById(id)) ?? (FALLBACK_BUILDER?.id === id ? FALLBACK_BUILDER : null);
}

export async function getProgramById(id: string): Promise<CorporateProgram | null> {
  const result = await pool.query<ProgramRow>(
    "SELECT * FROM corporate_programs WHERE id = $1",
    [id]
  );
  return result.rows[0] ? rowToProgram(result.rows[0]) : null;
}

export type ProgramInput = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  itinerary: ItineraryStep[];
  startTime: string;
  endTime: string;
  duration: string;
  durationEn: string;
  includes: string[];
  includesEn: string[];
  images: string[];
  isCustom: boolean;
  isTicket: boolean;
  // برنامج الكاستم: صفحته مكوّن رحلة يركّبها العميل بنفسه بدل مخطط ثابت
  isBuilder: boolean;
  minPeople: number;
};

export async function createProgram(input: ProgramInput): Promise<CorporateProgram> {
  await ensureMinPeopleColumn();
  const result = await pool.query<ProgramRow>(
    `INSERT INTO corporate_programs
      (id, name, name_en, description, description_en, itinerary, start_time, end_time, duration, duration_en, includes, includes_en, images, is_custom, is_ticket, is_builder, min_people, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
       (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM corporate_programs))
     RETURNING *`,
    [
      input.id,
      input.name,
      input.nameEn,
      input.description,
      input.descriptionEn,
      JSON.stringify(input.itinerary),
      input.startTime || null,
      input.endTime || null,
      input.duration,
      input.durationEn,
      input.includes,
      input.includesEn,
      input.images,
      input.isCustom,
      input.isTicket,
      input.isBuilder,
      input.minPeople,
    ]
  );
  return rowToProgram(result.rows[0]);
}

// سعر التذكرة مش في فورم البرنامج — بيتحدد من صفحة التسعير
export type ProgramUpdateInput = Partial<Omit<ProgramInput, "id">> & { ticketPrice?: number };

export async function updateProgram(
  id: string,
  input: ProgramUpdateInput
): Promise<CorporateProgram | null> {
  await ensureMinPeopleColumn();
  const fieldMap: Record<string, string> = {
    name: "name",
    nameEn: "name_en",
    description: "description",
    descriptionEn: "description_en",
    itinerary: "itinerary",
    startTime: "start_time",
    endTime: "end_time",
    duration: "duration",
    durationEn: "duration_en",
    includes: "includes",
    includesEn: "includes_en",
    images: "images",
    isCustom: "is_custom",
    isTicket: "is_ticket",
    isBuilder: "is_builder",
    minPeople: "min_people",
    ticketPrice: "ticket_price",
  };

  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const [key, column] of Object.entries(fieldMap)) {
    const value = (input as Record<string, unknown>)[key];
    if (value !== undefined) {
      sets.push(`${column} = $${i}`);
      // itinerary عمود jsonb — لازم يتبعت كنص JSON
      values.push(key === "itinerary" ? JSON.stringify(value) : value);
      i++;
    }
  }

  if (sets.length === 0) {
    return getProgramById(id);
  }

  values.push(id);
  const result = await pool.query<ProgramRow>(
    `UPDATE corporate_programs SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );
  return result.rows[0] ? rowToProgram(result.rows[0]) : null;
}

export async function deleteProgram(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM corporate_programs WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
