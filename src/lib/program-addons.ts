import "server-only";
import { pool } from "@/lib/db";
import { listAllOptions } from "@/lib/custom-trip-repo";
import type { CustomTripOption } from "@/data/custom-trip";

// ============================================================
// الإضافات — قايمة واحدة لكل البرامج
// ============================================================
// القايمة نفسها هي إضافات البرنامج الكاستم (custom_trip_options بنوع addon)
// وبتتعدل (إضافة/حذف/سعر) من /admin/custom-trip أو من قسم الإضافات في /admin/pricing
//
// كل برنامج بيحدد لكل إضافة وضع من التلاتة:
//   available — متاحة كإضافة يختارها العميل (الافتراضي، مش متخزن)
//   included  — مشمولة في سعر البرنامج (بتتحسب أوتوماتيك ومش بتظهر كاختيار)
//   hidden    — مش متاحة في البرنامج ده
// جدول program_addons بيخزن included و hidden بس
// ============================================================

export const ADDON_MODES = ["available", "included", "hidden"] as const;
export type AddonMode = (typeof ADDON_MODES)[number];

// الإضافة زي ما بتوصل للمتصفح — من غير سعر (الأسعار سيرفر بس)
export type PublicAddon = {
  id: string;
  name: string;
  nameEn: string;
  included: boolean;
};

type StoredMode = Exclude<AddonMode, "available">;

export async function listAddonCatalogue(): Promise<CustomTripOption[]> {
  const all = await listAllOptions();
  return all.filter((o) => o.kind === "addon");
}

// programId → optionId → included | hidden
export async function listProgramAddonModes(): Promise<Record<string, Record<string, StoredMode>>> {
  const result = await pool.query<{ program_id: string; option_id: string; mode: StoredMode }>(
    "SELECT program_id, option_id, mode FROM program_addons"
  );
  const map: Record<string, Record<string, StoredMode>> = {};
  for (const r of result.rows) (map[r.program_id] ??= {})[r.option_id] = r.mode;
  return map;
}

// بيستبدل إعدادات البرنامج كلها باللي اتبعت — "available" معناها مفيش صف
export async function setProgramAddonModes(
  programId: string,
  modes: Record<string, AddonMode>
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM program_addons WHERE program_id=$1", [programId]);
    for (const [optionId, mode] of Object.entries(modes)) {
      if (mode === "available") continue;
      await client.query(
        "INSERT INTO program_addons (program_id, option_id, mode) VALUES ($1,$2,$3)",
        [programId, optionId, mode]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// الإضافات اللي تخص برنامج معيّن: المشمولة والمتاحة للاختيار
// (المتوقفة من القايمة active=false مش بتظهر خالص، حتى لو مشمولة)
export function resolveProgramAddons(
  catalogue: CustomTripOption[],
  modes: Record<string, StoredMode> | undefined
): { included: CustomTripOption[]; available: CustomTripOption[] } {
  const included: CustomTripOption[] = [];
  const available: CustomTripOption[] = [];
  for (const option of catalogue) {
    if (!option.active) continue;
    const mode = modes?.[option.id] ?? "available";
    if (mode === "included") included.push(option);
    else if (mode === "available") available.push(option);
  }
  return { included, available };
}

export async function getProgramAddons(programId: string) {
  const [catalogue, modes] = await Promise.all([listAddonCatalogue(), listProgramAddonModes()]);
  return resolveProgramAddons(catalogue, modes[programId]);
}

// تكلفة إضافة واحدة للمجموعة
export function addonTotal(option: CustomTripOption, people: number): number {
  switch (option.priceUnit) {
    case "per_person":
    case "per_night":
      return option.price * people;
    case "per_car":
      return option.capacity > 0 ? Math.ceil(people / option.capacity) * option.price : option.price;
    case "flat":
      return option.price;
  }
}

// لكل برنامج: الإضافات اللي تظهر في الحاسبة (من غير أسعار)
export async function listPublicProgramAddons(
  programIds: string[]
): Promise<Record<string, PublicAddon[]>> {
  const [catalogue, modes] = await Promise.all([listAddonCatalogue(), listProgramAddonModes()]);
  const map: Record<string, PublicAddon[]> = {};
  for (const programId of programIds) {
    const { included, available } = resolveProgramAddons(catalogue, modes[programId]);
    map[programId] = [
      ...included.map((o) => ({ id: o.id, name: o.name, nameEn: o.nameEn, included: true })),
      ...available.map((o) => ({ id: o.id, name: o.name, nameEn: o.nameEn, included: false })),
    ];
  }
  return map;
}
