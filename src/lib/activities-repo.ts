import "server-only";
import { pool } from "@/lib/db";
import type { Activity } from "@/data/activities";

type ActivityRow = {
  id: string;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  image: string;
};

function rowToActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    description: row.description,
    descriptionEn: row.description_en,
    image: row.image,
  };
}

export async function listActivities(): Promise<Activity[]> {
  const result = await pool.query<ActivityRow>(
    "SELECT * FROM activities ORDER BY sort_order ASC, name ASC"
  );
  return result.rows.map(rowToActivity);
}

export async function getActivityById(id: string): Promise<Activity | null> {
  const result = await pool.query<ActivityRow>("SELECT * FROM activities WHERE id = $1", [id]);
  return result.rows[0] ? rowToActivity(result.rows[0]) : null;
}

export type ActivityInput = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  image: string;
};

export async function createActivity(input: ActivityInput): Promise<Activity> {
  const result = await pool.query<ActivityRow>(
    `INSERT INTO activities (id, name, name_en, description, description_en, image, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM activities))
     RETURNING *`,
    [input.id, input.name, input.nameEn, input.description, input.descriptionEn, input.image]
  );
  return rowToActivity(result.rows[0]);
}

export type ActivityUpdateInput = Partial<Omit<ActivityInput, "id">>;

export async function updateActivity(
  id: string,
  input: ActivityUpdateInput
): Promise<Activity | null> {
  const fieldMap: Record<string, string> = {
    name: "name",
    nameEn: "name_en",
    description: "description",
    descriptionEn: "description_en",
    image: "image",
  };

  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const [key, column] of Object.entries(fieldMap)) {
    const value = (input as Record<string, unknown>)[key];
    if (value !== undefined) {
      sets.push(`${column} = $${i}`);
      values.push(value);
      i++;
    }
  }

  if (sets.length === 0) {
    return getActivityById(id);
  }

  values.push(id);
  const result = await pool.query<ActivityRow>(
    `UPDATE activities SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );
  return result.rows[0] ? rowToActivity(result.rows[0]) : null;
}

export async function deleteActivity(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM activities WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
