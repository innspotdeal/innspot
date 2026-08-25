import "server-only";
import { pool } from "@/lib/db";
import type { Accommodation } from "@/data/accommodations";

type VillaRow = {
  id: string;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  images: string[];
  rooms: number;
  beds: number;
  has_pool: boolean;
  has_garden: boolean;
  capacity: number;
  amenities: string[];
  amenities_en: string[];
  price_weekday: number;
  price_weekend: number;
};

function rowToVilla(row: VillaRow): Accommodation {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    description: row.description,
    descriptionEn: row.description_en,
    images: row.images ?? [],
    rooms: row.rooms,
    beds: row.beds,
    hasPool: row.has_pool,
    hasGarden: row.has_garden,
    capacity: row.capacity,
    amenities: row.amenities ?? [],
    amenitiesEn: row.amenities_en ?? [],
    priceWeekday: Number(row.price_weekday),
    priceWeekend: Number(row.price_weekend),
  };
}

export async function listVillas(): Promise<Accommodation[]> {
  const result = await pool.query<VillaRow>(
    "SELECT * FROM villas ORDER BY sort_order ASC, name ASC"
  );
  return result.rows.map(rowToVilla);
}

export async function getVillaById(id: string): Promise<Accommodation | null> {
  const result = await pool.query<VillaRow>("SELECT * FROM villas WHERE id = $1", [id]);
  return result.rows[0] ? rowToVilla(result.rows[0]) : null;
}

export type VillaInput = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  images: string[];
  rooms: number;
  beds: number;
  hasPool: boolean;
  hasGarden: boolean;
  capacity: number;
  amenities: string[];
  amenitiesEn: string[];
  priceWeekday: number;
  priceWeekend: number;
};

export async function createVilla(input: VillaInput): Promise<Accommodation> {
  const result = await pool.query<VillaRow>(
    `INSERT INTO villas
      (id, name, name_en, description, description_en, images, rooms, beds, has_pool, has_garden, capacity, amenities, amenities_en, price_weekday, price_weekend, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
       (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM villas))
     RETURNING *`,
    [
      input.id,
      input.name,
      input.nameEn,
      input.description,
      input.descriptionEn,
      input.images,
      input.rooms,
      input.beds,
      input.hasPool,
      input.hasGarden,
      input.capacity,
      input.amenities,
      input.amenitiesEn,
      input.priceWeekday,
      input.priceWeekend,
    ]
  );
  return rowToVilla(result.rows[0]);
}

export type VillaUpdateInput = Partial<Omit<VillaInput, "id">>;

export async function updateVilla(
  id: string,
  input: VillaUpdateInput
): Promise<Accommodation | null> {
  const fieldMap: Record<string, string> = {
    name: "name",
    nameEn: "name_en",
    description: "description",
    descriptionEn: "description_en",
    images: "images",
    rooms: "rooms",
    beds: "beds",
    hasPool: "has_pool",
    hasGarden: "has_garden",
    capacity: "capacity",
    amenities: "amenities",
    amenitiesEn: "amenities_en",
    priceWeekday: "price_weekday",
    priceWeekend: "price_weekend",
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
    return getVillaById(id);
  }

  values.push(id);
  const result = await pool.query<VillaRow>(
    `UPDATE villas SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );
  return result.rows[0] ? rowToVilla(result.rows[0]) : null;
}

export async function deleteVilla(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM villas WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
