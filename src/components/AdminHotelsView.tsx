"use client";

import { Fragment, useState } from "react";
import type { Hotel, RoomType } from "@/data/hotels";
import ImageUploader from "@/components/ImageUploader";
import AdminRoomsEditor from "@/components/AdminRoomsEditor";

type NewHotelForm = {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  hasPool: boolean;
  hasGarden: boolean;
  amenities: string;
  amenitiesEn: string;
};

const emptyForm: NewHotelForm = {
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
  hasPool: false,
  hasGarden: false,
  amenities: "",
  amenitiesEn: "",
};

export default function AdminHotelsView({ initialHotels }: { initialHotels: Hotel[] }) {
  const [hotels, setHotels] = useState(initialHotels);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<NewHotelForm>(emptyForm);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newRooms, setNewRooms] = useState<RoomType[]>([]);

  // تعديل غرف فندق موجود
  const [expandedRoomsId, setExpandedRoomsId] = useState<string | null>(null);
  const [editRooms, setEditRooms] = useState<Record<string, RoomType[]>>(() =>
    Object.fromEntries(initialHotels.map((h) => [h.id, h.roomTypes]))
  );
  const [savingRoomsId, setSavingRoomsId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const [expandedImagesId, setExpandedImagesId] = useState<string | null>(null);
  const [editImages, setEditImages] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(initialHotels.map((h) => [h.id, h.images]))
  );
  const [savingImagesId, setSavingImagesId] = useState<string | null>(null);

  function flash(msg: string, isError = false) {
    if (isError) setError(msg);
    else setMessage(msg);
    setTimeout(() => {
      setMessage("");
      setError("");
    }, 3000);
  }

  async function handleSaveImages(id: string) {
    setSavingImagesId(id);
    try {
      const res = await fetch(`/api/admin/hotels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: editImages[id] ?? [] }),
      });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
      } else {
        setHotels((prev) => prev.map((h) => (h.id === id ? data.hotel : h)));
        flash("تم تحديث الصور");
      }
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setSavingImagesId(null);
    }
  }

  async function handleSaveRooms(id: string) {
    setSavingRoomsId(id);
    try {
      const res = await fetch(`/api/admin/hotels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomTypes: editRooms[id] ?? [] }),
      });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
      } else {
        setHotels((prev) => prev.map((h) => (h.id === id ? data.hotel : h)));
        setEditRooms((prev) => ({ ...prev, [id]: data.hotel.roomTypes }));
        flash("تم حفظ الغرف");
      }
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setSavingRoomsId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`متأكد إنك عايز تحذف "${name}"؟`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/hotels/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
      } else {
        setHotels((prev) => prev.filter((h) => h.id !== id));
        flash("تم حذف الفندق");
      }
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAddHotel(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/admin/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images: newImages, roomTypes: newRooms }),
      });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
        return;
      }
      setHotels((prev) => [...prev, data.hotel]);
      setEditImages((prev) => ({ ...prev, [data.hotel.id]: data.hotel.images }));
      setEditRooms((prev) => ({ ...prev, [data.hotel.id]: data.hotel.roomTypes }));
      setForm(emptyForm);
      setNewImages([]);
      setNewRooms([]);
      setShowAddForm(false);
      flash("تمت إضافة الفندق");
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-brand-blue sm:text-3xl">لوحة إدارة الفنادق</h1>
        <button
          onClick={() => setShowAddForm((s) => !s)}
          className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-orange/90"
        >
          {showAddForm ? "إلغاء" : "+ إضافة فندق"}
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">{message}</p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">{error}</p>
      )}

      {showAddForm && (
        <form
          onSubmit={handleAddHotel}
          className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-black/10 bg-white p-6 sm:grid-cols-2"
        >
          <Field label="الاسم (عربي)" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label="Name (English)" value={form.nameEn} onChange={(v) => setForm({ ...form, nameEn: v })} required />
          <Field label="الوصف (عربي)" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea />
          <Field label="Description (English)" value={form.descriptionEn} onChange={(v) => setForm({ ...form, descriptionEn: v })} textarea />
          <div className="flex items-center gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <input type="checkbox" checked={form.hasPool} onChange={(e) => setForm({ ...form, hasPool: e.target.checked })} />
              مسبح
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <input type="checkbox" checked={form.hasGarden} onChange={(e) => setForm({ ...form, hasGarden: e.target.checked })} />
              حديقة
            </label>
          </div>
          <Field label="المرافق (عربي، مفصولة بفاصلة)" value={form.amenities} onChange={(v) => setForm({ ...form, amenities: v })} />
          <Field label="Amenities (English, comma separated)" value={form.amenitiesEn} onChange={(v) => setForm({ ...form, amenitiesEn: v })} />

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-neutral-700">الصور</label>
            <ImageUploader images={newImages} onChange={setNewImages} />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-neutral-700">الغرف</label>
            <AdminRoomsEditor rooms={newRooms} onChange={setNewRooms} />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={adding}
              className="rounded-lg bg-brand-blue px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
            >
              {adding ? "جاري الإضافة..." : "حفظ الفندق"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-black/10 bg-white">
        <table className="w-full min-w-[480px] text-right text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-bold">الفندق</th>
              <th className="px-4 py-3 font-bold">الغرف</th>
              <th className="px-4 py-3 font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((hotel) => (
              <Fragment key={hotel.id}>
              <tr className="border-t border-black/5">
                <td className="px-4 py-3 font-semibold text-brand-blue">{hotel.name}</td>
                <td className="px-4 py-3 text-neutral-600">
                  {hotel.roomTypes.length
                    ? `${hotel.roomTypes.length} — ${hotel.roomTypes.map((rt) => rt.name).join("، ")}`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setExpandedRoomsId((prev) => (prev === hotel.id ? null : hotel.id));
                        setExpandedImagesId(null);
                      }}
                      className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-bold text-neutral-700 transition hover:bg-neutral-50"
                    >
                      {expandedRoomsId === hotel.id ? "إخفاء الغرف" : "الغرف"}
                    </button>
                    <button
                      onClick={() => setExpandedImagesId((prev) => (prev === hotel.id ? null : hotel.id))}
                      className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-bold text-neutral-700 transition hover:bg-neutral-50"
                    >
                      {expandedImagesId === hotel.id ? "إخفاء الصور" : "الصور"}
                    </button>
                    <button
                      onClick={() => handleDelete(hotel.id, hotel.name)}
                      disabled={deletingId === hotel.id}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                      {deletingId === hotel.id ? "جاري الحذف..." : "حذف"}
                    </button>
                  </div>
                </td>
              </tr>
              {expandedRoomsId === hotel.id && (
                <tr className="border-t border-black/5 bg-neutral-50">
                  <td colSpan={3} className="px-4 py-4">
                    <p className="mb-3 text-sm font-semibold text-neutral-700">غرف {hotel.name}</p>
                    <AdminRoomsEditor
                      rooms={editRooms[hotel.id] ?? []}
                      onChange={(rooms) => setEditRooms((prev) => ({ ...prev, [hotel.id]: rooms }))}
                    />
                    <button
                      onClick={() => handleSaveRooms(hotel.id)}
                      disabled={savingRoomsId === hotel.id}
                      className="mt-4 rounded-lg bg-brand-blue px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
                    >
                      {savingRoomsId === hotel.id ? "جاري الحفظ..." : "حفظ الغرف"}
                    </button>
                  </td>
                </tr>
              )}
              {expandedImagesId === hotel.id && (
                <tr className="border-t border-black/5 bg-neutral-50">
                  <td colSpan={3} className="px-4 py-4">
                    <p className="mb-2 text-sm font-semibold text-neutral-700">صور {hotel.name}</p>
                    <ImageUploader
                      images={editImages[hotel.id] ?? []}
                      onChange={(imgs) => setEditImages((prev) => ({ ...prev, [hotel.id]: imgs }))}
                    />
                    <button
                      onClick={() => handleSaveImages(hotel.id)}
                      disabled={savingImagesId === hotel.id}
                      className="mt-3 rounded-lg bg-brand-blue px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
                    >
                      {savingImagesId === hotel.id ? "جاري الحفظ..." : "حفظ الصور"}
                    </button>
                  </td>
                </tr>
              )}
              </Fragment>
            ))}
            {hotels.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-neutral-500">
                  لا توجد فنادق حاليًا
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-blue"
          rows={3}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-blue"
          required={required}
        />
      )}
    </div>
  );
}
