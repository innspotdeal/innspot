import "server-only";
import { pool } from "@/lib/db";
import type { CorporateProgram, ItineraryStep } from "@/data/programs";

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
  };
}

export async function listPrograms(): Promise<CorporateProgram[]> {
  const result = await pool.query<ProgramRow>(
    "SELECT * FROM corporate_programs ORDER BY sort_order ASC, name ASC"
  );
  return result.rows.map(rowToProgram);
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
};

export async function createProgram(input: ProgramInput): Promise<CorporateProgram> {
  const result = await pool.query<ProgramRow>(
    `INSERT INTO corporate_programs
      (id, name, name_en, description, description_en, itinerary, start_time, end_time, duration, duration_en, includes, includes_en, images, is_custom, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,
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
    ]
  );
  return rowToProgram(result.rows[0]);
}

export type ProgramUpdateInput = Partial<Omit<ProgramInput, "id">>;

export async function updateProgram(
  id: string,
  input: ProgramUpdateInput
): Promise<CorporateProgram | null> {
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
