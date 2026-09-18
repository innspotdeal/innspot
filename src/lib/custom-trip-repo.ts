import "server-only";
import { pool } from "@/lib/db";
import type { CustomTripOption, OptionKind, PriceUnit } from "@/data/custom-trip";

type OptionRow = {
  id: string;
  kind: OptionKind;
  parent_id: string | null;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  price: number;
  price_unit: PriceUnit;
  capacity: number | null;
  tier: string;
  includes_breakfast: boolean;
  image: string;
  active: boolean;
  sort_order: number;
};

function rowToOption(row: OptionRow): CustomTripOption {
  return {
    id: row.id,
    kind: row.kind,
    parentId: row.parent_id ?? "",
    name: row.name,
    nameEn: row.name_en,
    description: row.description,
    descriptionEn: row.description_en,
    price: Number(row.price),
    priceUnit: row.price_unit,
    capacity: row.capacity ?? 0,
    tier: row.tier,
    includesBreakfast: row.includes_breakfast,
    image: row.image,
    active: row.active,
    sortOrder: row.sort_order,
  };
}

// كل الخيارات (للأدمن)
export async function listAllOptions(): Promise<CustomTripOption[]> {
  const result = await pool.query<OptionRow>(
    "SELECT * FROM custom_trip_options ORDER BY kind ASC, sort_order ASC, name ASC"
  );
  return result.rows.map(rowToOption);
}

// الخيارات المتاحة للعميل بس
export async function listActiveOptions(): Promise<CustomTripOption[]> {
  const result = await pool.query<OptionRow>(
    "SELECT * FROM custom_trip_options WHERE active = true ORDER BY kind ASC, sort_order ASC, name ASC"
  );
  return result.rows.map(rowToOption);
}

export type OptionInput = Omit<CustomTripOption, "sortOrder">;

export async function createOption(input: OptionInput): Promise<CustomTripOption> {
  const result = await pool.query<OptionRow>(
    `INSERT INTO custom_trip_options
      (id, kind, parent_id, name, name_en, description, description_en,
       price, price_unit, capacity, tier, includes_breakfast, image, active, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,
       (SELECT COALESCE(MAX(sort_order),0)+1 FROM custom_trip_options WHERE kind = $2))
     RETURNING *`,
    [
      input.id,
      input.kind,
      input.parentId || null,
      input.name,
      input.nameEn,
      input.description,
      input.descriptionEn,
      input.price,
      input.priceUnit,
      input.capacity || null,
      input.tier,
      input.includesBreakfast,
      input.image,
      input.active,
    ]
  );
  return rowToOption(result.rows[0]);
}

export type OptionUpdateInput = Partial<Omit<OptionInput, "id">>;

export async function updateOption(
  id: string,
  input: OptionUpdateInput
): Promise<CustomTripOption | null> {
  const fieldMap: Record<string, string> = {
    kind: "kind",
    parentId: "parent_id",
    name: "name",
    nameEn: "name_en",
    description: "description",
    descriptionEn: "description_en",
    price: "price",
    priceUnit: "price_unit",
    capacity: "capacity",
    tier: "tier",
    includesBreakfast: "includes_breakfast",
    image: "image",
    active: "active",
  };

  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const [key, column] of Object.entries(fieldMap)) {
    const value = (input as Record<string, unknown>)[key];
    if (value !== undefined) {
      sets.push(`${column} = $${i}`);
      // parent_id و capacity بيقبلوا NULL لما يبقوا فاضيين
      values.push(
        (key === "parentId" && !value) || (key === "capacity" && !value) ? null : value
      );
      i++;
    }
  }

  if (sets.length === 0) {
    const current = await pool.query<OptionRow>("SELECT * FROM custom_trip_options WHERE id=$1", [id]);
    return current.rows[0] ? rowToOption(current.rows[0]) : null;
  }

  values.push(id);
  const result = await pool.query<OptionRow>(
    `UPDATE custom_trip_options SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );
  return result.rows[0] ? rowToOption(result.rows[0]) : null;
}

export async function deleteOption(id: string): Promise<boolean> {
  // لو المحذوف مكان، بنحذف أصنافه معاه
  await pool.query("DELETE FROM custom_trip_options WHERE parent_id = $1", [id]);
  const result = await pool.query("DELETE FROM custom_trip_options WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
