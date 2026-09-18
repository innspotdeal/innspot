// ============================================================
// توزيع المركبات على عدد الأفراد
// القاعدة: نستخدم أكبر مركبة متاحة طول ما العدد أكبر من سعتها،
// وباقي العدد ياخد أصغر مركبة تكفيه.
// مثال: 80 فرد (باص 50 + ميني باص 30) = باص + ميني باص
// ============================================================

export type Vehicle = {
  id: string;
  name: string;
  nameEn: string;
  capacity: number;
  price: number;
};

export type FleetLine = {
  vehicle: Vehicle;
  count: number;
  total: number;
};

export type Fleet = {
  lines: FleetLine[];
  total: number;
};

export function allocateFleet(people: number, vehicles: Vehicle[]): Fleet {
  const usable = vehicles
    .filter((v) => v.capacity > 0)
    .sort((a, b) => b.capacity - a.capacity); // من الأكبر للأصغر

  if (people <= 0 || usable.length === 0) return { lines: [], total: 0 };

  const largest = usable[0];
  const counts = new Map<string, { vehicle: Vehicle; count: number }>();

  const add = (v: Vehicle) => {
    const entry = counts.get(v.id) ?? { vehicle: v, count: 0 };
    entry.count += 1;
    counts.set(v.id, entry);
  };

  let remaining = people;

  // أكبر مركبة تتكرر طول ما الباقي أكبر من سعتها
  while (remaining > largest.capacity) {
    add(largest);
    remaining -= largest.capacity;
  }

  // الباقي: أصغر مركبة تكفيه
  if (remaining > 0) {
    const fitting = [...usable].reverse().find((v) => v.capacity >= remaining) ?? largest;
    add(fitting);
  }

  const lines: FleetLine[] = [...counts.values()]
    .map(({ vehicle, count }) => ({ vehicle, count, total: vehicle.price * count }))
    .sort((a, b) => b.vehicle.capacity - a.vehicle.capacity);

  return { lines, total: lines.reduce((sum, l) => sum + l.total, 0) };
}
