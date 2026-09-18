import "server-only";
import { pool } from "@/lib/db";

export type TransportVehicle = {
  id: string;
  group: string; // safari | bus
  name: string;
  nameEn: string;
  capacity: number;
  price: number;
  active: boolean;
};

type Row = {
  id: string;
  vehicle_group: string;
  name: string;
  name_en: string;
  capacity: number;
  price: number;
  active: boolean;
};

const toVehicle = (r: Row): TransportVehicle => ({
  id: r.id,
  group: r.vehicle_group,
  name: r.name,
  nameEn: r.name_en,
  capacity: r.capacity,
  price: Number(r.price),
  active: r.active,
});

export async function listTransportVehicles(): Promise<TransportVehicle[]> {
  const result = await pool.query<Row>(
    "SELECT * FROM transport_vehicles ORDER BY vehicle_group ASC, capacity ASC"
  );
  return result.rows.map(toVehicle);
}

export type VehicleInput = Omit<TransportVehicle, "id"> & { id: string };

export async function createVehicle(input: VehicleInput): Promise<TransportVehicle> {
  const result = await pool.query<Row>(
    `INSERT INTO transport_vehicles (id, vehicle_group, name, name_en, capacity, price, active, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,(SELECT COALESCE(MAX(sort_order),0)+1 FROM transport_vehicles))
     RETURNING *`,
    [input.id, input.group, input.name, input.nameEn, input.capacity, input.price, input.active]
  );
  return toVehicle(result.rows[0]);
}

export async function updateVehicle(
  id: string,
  input: Partial<Omit<VehicleInput, "id">>
): Promise<TransportVehicle | null> {
  const fieldMap: Record<string, string> = {
    group: "vehicle_group",
    name: "name",
    nameEn: "name_en",
    capacity: "capacity",
    price: "price",
    active: "active",
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
  if (sets.length === 0) return null;

  values.push(id);
  const result = await pool.query<Row>(
    `UPDATE transport_vehicles SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );
  return result.rows[0] ? toVehicle(result.rows[0]) : null;
}

export async function deleteVehicle(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM transport_vehicles WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
