import "server-only";
import { pool } from "@/lib/db";
import type { Hotel, RoomType } from "@/data/hotels";
import { readRoomTypes } from "@/lib/room-types";

type HotelRow = {
  id: string;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  images: string[];
  room_types: RoomType[];
  has_pool: boolean;
  has_garden: boolean;
  amenities: string[];
  amenities_en: string[];
};

function rowToHotel(row: HotelRow): Hotel {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    description: row.description,
    descriptionEn: row.description_en,
    images: row.images ?? [],
    roomTypes: readRoomTypes(row.room_types),
    hasPool: row.has_pool,
    hasGarden: row.has_garden,
    amenities: row.amenities ?? [],
    amenitiesEn: row.amenities_en ?? [],
  };
}

export async function listHotels(): Promise<Hotel[]> {
  const result = await pool.query<HotelRow>(
    "SELECT * FROM hotels ORDER BY sort_order ASC, name ASC"
  );
  return result.rows.map(rowToHotel);
}

export async function getHotelById(id: string): Promise<Hotel | null> {
  const result = await pool.query<HotelRow>("SELECT * FROM hotels WHERE id = $1", [id]);
  return result.rows[0] ? rowToHotel(result.rows[0]) : null;
}

export type HotelInput = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  images: string[];
  roomTypes: RoomType[];
  hasPool: boolean;
  hasGarden: boolean;
  amenities: string[];
  amenitiesEn: string[];
};

export async function createHotel(input: HotelInput): Promise<Hotel> {
  const result = await pool.query<HotelRow>(
    `INSERT INTO hotels
      (id, name, name_en, description, description_en, images, room_types, has_pool, has_garden, amenities, amenities_en, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
       (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM hotels))
     RETURNING *`,
    [
      input.id,
      input.name,
      input.nameEn,
      input.description,
      input.descriptionEn,
      input.images,
      JSON.stringify(input.roomTypes),
      input.hasPool,
      input.hasGarden,
      input.amenities,
      input.amenitiesEn,
    ]
  );
  return rowToHotel(result.rows[0]);
}

export type HotelUpdateInput = Partial<Omit<HotelInput, "id">>;

export async function updateHotel(id: string, input: HotelUpdateInput): Promise<Hotel | null> {
  const fieldMap: Record<string, string> = {
    name: "name",
    nameEn: "name_en",
    description: "description",
    descriptionEn: "description_en",
    images: "images",
    roomTypes: "room_types",
    hasPool: "has_pool",
    hasGarden: "has_garden",
    amenities: "amenities",
    amenitiesEn: "amenities_en",
  };

  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const [key, column] of Object.entries(fieldMap)) {
    const value = (input as Record<string, unknown>)[key];
    if (value !== undefined) {
      sets.push(`${column} = $${i}`);
      values.push(key === "roomTypes" ? JSON.stringify(value) : value);
      i++;
    }
  }

  if (sets.length === 0) {
    return getHotelById(id);
  }

  values.push(id);
  const result = await pool.query<HotelRow>(
    `UPDATE hotels SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );
  return result.rows[0] ? rowToHotel(result.rows[0]) : null;
}

export async function deleteHotel(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM hotels WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
