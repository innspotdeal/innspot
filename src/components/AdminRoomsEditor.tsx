"use client";

import type { RoomType } from "@/data/hotels";
import ImageUploader from "@/components/ImageUploader";

// ============================================================
// محرر غرف الفندق — كل غرفة ليها اسم ووصف وسعة وسعر الليلة
// بيعدّل القايمة في الذاكرة بس؛ الحفظ بيحصل من الصفحة اللي مستخدماه
// ============================================================

export const emptyRoom: RoomType = {
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
  capacity: 2,
  price: 0,
  images: [],
};

const inputClass =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue";

export default function AdminRoomsEditor({
  rooms,
  onChange,
}: {
  rooms: RoomType[];
  onChange: (rooms: RoomType[]) => void;
}) {
  function update(index: number, patch: Partial<RoomType>) {
    onChange(rooms.map((room, i) => (i === index ? { ...room, ...patch } : room)));
  }

  function remove(index: number) {
    const room = rooms[index];
    if (room?.name && !confirm(`تشيل «${room.name}»؟`)) return;
    onChange(rooms.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      {rooms.length === 0 && (
        <p className="rounded-xl border border-dashed border-black/15 px-4 py-5 text-center text-sm text-neutral-500">
          مفيش غرف لسه
        </p>
      )}

      {rooms.map((room, index) => (
        <div key={index} className="rounded-xl border border-black/10 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-brand-blue">
              {room.name || `غرفة ${index + 1}`}
            </p>
            <button
              type="button"
              onClick={() => remove(index)}
              className="rounded-lg px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
            >
              شيل الغرفة
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-neutral-600">
              اسم الغرفة
              <input
                value={room.name}
                onChange={(e) => update(index, { name: e.target.value })}
                placeholder="مثال: غرفة مزدوجة بإطلالة على البحيرة"
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-neutral-600">
              Room name (English)
              <input
                dir="ltr"
                value={room.nameEn}
                onChange={(e) => update(index, { nameEn: e.target.value })}
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-neutral-600">
              الوصف
              <textarea
                rows={2}
                value={room.description}
                onChange={(e) => update(index, { description: e.target.value })}
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-neutral-600">
              Description (English)
              <textarea
                dir="ltr"
                rows={2}
                value={room.descriptionEn}
                onChange={(e) => update(index, { descriptionEn: e.target.value })}
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-neutral-600">
              السعة (عدد الأفراد)
              <input
                type="number"
                min={1}
                value={room.capacity}
                onChange={(e) => update(index, { capacity: Number(e.target.value) || 0 })}
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-neutral-600">
              سعر الليلة (جنيه)
              <input
                type="number"
                min={0}
                value={room.price}
                onChange={(e) => update(index, { price: Number(e.target.value) || 0 })}
                className={`mt-1 ${inputClass}`}
              />
              <span className="mt-1 block font-normal text-neutral-400">صفر = السعر مش هيظهر للزوار</span>
            </label>
          </div>

          <div className="mt-3">
            <p className="mb-1 text-xs font-semibold text-neutral-600">صور الغرفة (الأولى هي الغلاف)</p>
            <ImageUploader images={room.images} onChange={(images) => update(index, { images })} />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...rooms, { ...emptyRoom }])}
        className="w-fit rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50"
      >
        + إضافة غرفة
      </button>
    </div>
  );
}
