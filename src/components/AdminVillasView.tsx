"use client";

import { Fragment, useState } from "react";
import type { Accommodation } from "@/data/accommodations";
import ImageUploader from "@/components/ImageUploader";

type NewVillaForm = {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  rooms: string;
  beds: string;
  capacity: string;
  hasPool: boolean;
  hasGarden: boolean;
  amenities: string;
  amenitiesEn: string;
  priceWeekday: string;
  priceWeekend: string;
};

const emptyForm: NewVillaForm = {
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
  rooms: "",
  beds: "",
  capacity: "",
  hasPool: false,
  hasGarden: false,
  amenities: "",
  amenitiesEn: "",
  priceWeekday: "",
  priceWeekend: "",
};

type EditVillaForm = {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  rooms: string;
  beds: string;
  capacity: string;
  hasPool: boolean;
  hasGarden: boolean;
  amenities: string;
  amenitiesEn: string;
};

function villaToEditForm(v: Accommodation): EditVillaForm {
  return {
    name: v.name,
    nameEn: v.nameEn,
    description: v.description,
    descriptionEn: v.descriptionEn,
    rooms: String(v.rooms),
    beds: String(v.beds),
    capacity: String(v.capacity),
    hasPool: v.hasPool,
    hasGarden: v.hasGarden,
    amenities: v.amenities.join(", "),
    amenitiesEn: v.amenitiesEn.join(", "),
  };
}

export default function AdminVillasView({ initialVillas }: { initialVillas: Accommodation[] }) {
  const [villas, setVillas] = useState(initialVillas);
  const [prices, setPrices] = useState<Record<string, { weekday: string; weekend: string }>>(
    Object.fromEntries(
      initialVillas.map((v) => [v.id, { weekday: String(v.priceWeekday), weekend: String(v.priceWeekend) }])
    )
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<NewVillaForm>(emptyForm);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editImages, setEditImages] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(initialVillas.map((v) => [v.id, v.images]))
  );
  const [editForms, setEditForms] = useState<Record<string, EditVillaForm>>(() =>
    Object.fromEntries(initialVillas.map((v) => [v.id, villaToEditForm(v)]))
  );
  const [savingEditId, setSavingEditId] = useState<string | null>(null);

  function flash(msg: string, isError = false) {
    if (isError) setError(msg);
    else setMessage(msg);
    setTimeout(() => {
      setMessage("");
      setError("");
    }, 3000);
  }

  async function handleSavePrice(id: string) {
    const p = prices[id];
    if (!p) return;
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/villas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceWeekday: Number(p.weekday),
          priceWeekend: Number(p.weekend),
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
      } else {
        setVillas((prev) => prev.map((v) => (v.id === id ? data.villa : v)));
        flash("تم تحديث السعر");
      }
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setSavingId(null);
    }
  }

  async function handleSaveEdit(id: string) {
    const f = editForms[id];
    if (!f) return;
    setSavingEditId(id);
    try {
      const res = await fetch(`/api/admin/villas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name,
          nameEn: f.nameEn,
          description: f.description,
          descriptionEn: f.descriptionEn,
          rooms: Number(f.rooms) || 0,
          beds: Number(f.beds) || 0,
          capacity: Number(f.capacity) || 0,
          hasPool: f.hasPool,
          hasGarden: f.hasGarden,
          amenities: f.amenities,
          amenitiesEn: f.amenitiesEn,
          images: editImages[id] ?? [],
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
      } else {
        setVillas((prev) => prev.map((v) => (v.id === id ? data.villa : v)));
        setEditForms((prev) => ({ ...prev, [id]: villaToEditForm(data.villa) }));
        setEditImages((prev) => ({ ...prev, [id]: data.villa.images }));
        flash("تم حفظ التعديلات");
      }
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setSavingEditId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`متأكد إنك عايز تحذف "${name}"؟ الإجراء ده مش هيتراجع.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/villas/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
      } else {
        setVillas((prev) => prev.filter((v) => v.id !== id));
        flash("تم حذف الفيلا");
      }
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAddVilla(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/admin/villas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rooms: Number(form.rooms) || 0,
          beds: Number(form.beds) || 0,
          capacity: Number(form.capacity) || 0,
          priceWeekday: Number(form.priceWeekday) || 0,
          priceWeekend: Number(form.priceWeekend) || 0,
          images: newImages,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
        return;
      }
      setVillas((prev) => [...prev, data.villa]);
      setPrices((prev) => ({
        ...prev,
        [data.villa.id]: {
          weekday: String(data.villa.priceWeekday),
          weekend: String(data.villa.priceWeekend),
        },
      }));
      setEditImages((prev) => ({ ...prev, [data.villa.id]: data.villa.images }));
      setEditForms((prev) => ({ ...prev, [data.villa.id]: villaToEditForm(data.villa) }));
      setForm(emptyForm);
      setNewImages([]);
      setShowAddForm(false);
      flash("تمت إضافة الفيلا");
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-brand-blue sm:text-3xl">لوحة إدارة الفيلات</h1>
        <button
          onClick={() => setShowAddForm((s) => !s)}
          className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-orange/90"
        >
          {showAddForm ? "إلغاء" : "+ إضافة فيلا"}
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      {showAddForm && (
        <form
          onSubmit={handleAddVilla}
          className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-black/10 bg-white p-6 sm:grid-cols-2"
        >
          <Field label="الاسم (عربي)" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label="Name (English)" value={form.nameEn} onChange={(v) => setForm({ ...form, nameEn: v })} required />
          <Field
            label="الوصف (عربي)"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            textarea
          />
          <Field
            label="Description (English)"
            value={form.descriptionEn}
            onChange={(v) => setForm({ ...form, descriptionEn: v })}
            textarea
          />
          <Field label="عدد الغرف" value={form.rooms} onChange={(v) => setForm({ ...form, rooms: v })} type="number" />
          <Field label="عدد الأسرّة" value={form.beds} onChange={(v) => setForm({ ...form, beds: v })} type="number" />
          <Field
            label="أقصى عدد أفراد"
            value={form.capacity}
            onChange={(v) => setForm({ ...form, capacity: v })}
            type="number"
          />
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <input
                type="checkbox"
                checked={form.hasPool}
                onChange={(e) => setForm({ ...form, hasPool: e.target.checked })}
              />
              مسبح
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <input
                type="checkbox"
                checked={form.hasGarden}
                onChange={(e) => setForm({ ...form, hasGarden: e.target.checked })}
              />
              حديقة
            </label>
          </div>
          <Field
            label="المرافق (عربي، مفصولة بفاصلة)"
            value={form.amenities}
            onChange={(v) => setForm({ ...form, amenities: v })}
          />
          <Field
            label="Amenities (English, comma separated)"
            value={form.amenitiesEn}
            onChange={(v) => setForm({ ...form, amenitiesEn: v })}
          />
          <Field
            label="سعر أيام الأسبوع"
            value={form.priceWeekday}
            onChange={(v) => setForm({ ...form, priceWeekday: v })}
            type="number"
            required
          />
          <Field
            label="سعر الويكند"
            value={form.priceWeekend}
            onChange={(v) => setForm({ ...form, priceWeekend: v })}
            type="number"
            required
          />

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-neutral-700">الصور</label>
            <ImageUploader images={newImages} onChange={setNewImages} />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={adding}
              className="rounded-lg bg-brand-blue px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
            >
              {adding ? "جاري الإضافة..." : "حفظ الفيلا"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-black/10 bg-white">
        <table className="w-full min-w-[640px] text-right text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-bold">الفيلا</th>
              <th className="px-4 py-3 font-bold">سعر أيام الأسبوع</th>
              <th className="px-4 py-3 font-bold">سعر الويكند</th>
              <th className="px-4 py-3 font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {villas.map((villa) => (
              <Fragment key={villa.id}>
              <tr className="border-t border-black/5">
                <td className="px-4 py-3 font-semibold text-brand-blue">{villa.name}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={prices[villa.id]?.weekday ?? ""}
                    onChange={(e) =>
                      setPrices((prev) => ({
                        ...prev,
                        [villa.id]: { ...prev[villa.id], weekday: e.target.value },
                      }))
                    }
                    className="w-28 rounded-lg border border-black/10 px-2 py-1 outline-none focus:border-brand-blue"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={prices[villa.id]?.weekend ?? ""}
                    onChange={(e) =>
                      setPrices((prev) => ({
                        ...prev,
                        [villa.id]: { ...prev[villa.id], weekend: e.target.value },
                      }))
                    }
                    className="w-28 rounded-lg border border-black/10 px-2 py-1 outline-none focus:border-brand-blue"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleSavePrice(villa.id)}
                      disabled={savingId === villa.id}
                      className="rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
                    >
                      {savingId === villa.id ? "جاري الحفظ..." : "حفظ"}
                    </button>
                    <button
                      onClick={() => setExpandedId((prev) => (prev === villa.id ? null : villa.id))}
                      className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-bold text-neutral-700 transition hover:bg-neutral-50"
                    >
                      {expandedId === villa.id ? "إخفاء التعديل" : "تعديل"}
                    </button>
                    <button
                      onClick={() => handleDelete(villa.id, villa.name)}
                      disabled={deletingId === villa.id}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                      {deletingId === villa.id ? "جاري الحذف..." : "حذف"}
                    </button>
                  </div>
                </td>
              </tr>
              {expandedId === villa.id && (
                <tr className="border-t border-black/5 bg-neutral-50">
                  <td colSpan={4} className="px-4 py-5">
                    <p className="mb-3 text-sm font-bold text-neutral-800">تعديل {villa.name}</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="الاسم (عربي)"
                        value={editForms[villa.id]?.name ?? ""}
                        onChange={(v) =>
                          setEditForms((prev) => ({ ...prev, [villa.id]: { ...prev[villa.id], name: v } }))
                        }
                      />
                      <Field
                        label="Name (English)"
                        value={editForms[villa.id]?.nameEn ?? ""}
                        onChange={(v) =>
                          setEditForms((prev) => ({ ...prev, [villa.id]: { ...prev[villa.id], nameEn: v } }))
                        }
                      />
                      <Field
                        label="الوصف (عربي)"
                        value={editForms[villa.id]?.description ?? ""}
                        onChange={(v) =>
                          setEditForms((prev) => ({ ...prev, [villa.id]: { ...prev[villa.id], description: v } }))
                        }
                        textarea
                      />
                      <Field
                        label="Description (English)"
                        value={editForms[villa.id]?.descriptionEn ?? ""}
                        onChange={(v) =>
                          setEditForms((prev) => ({ ...prev, [villa.id]: { ...prev[villa.id], descriptionEn: v } }))
                        }
                        textarea
                      />
                      <Field
                        label="عدد الغرف"
                        value={editForms[villa.id]?.rooms ?? ""}
                        onChange={(v) =>
                          setEditForms((prev) => ({ ...prev, [villa.id]: { ...prev[villa.id], rooms: v } }))
                        }
                        type="number"
                      />
                      <Field
                        label="عدد الأسرّة"
                        value={editForms[villa.id]?.beds ?? ""}
                        onChange={(v) =>
                          setEditForms((prev) => ({ ...prev, [villa.id]: { ...prev[villa.id], beds: v } }))
                        }
                        type="number"
                      />
                      <Field
                        label="أقصى عدد أفراد"
                        value={editForms[villa.id]?.capacity ?? ""}
                        onChange={(v) =>
                          setEditForms((prev) => ({ ...prev, [villa.id]: { ...prev[villa.id], capacity: v } }))
                        }
                        type="number"
                      />
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                          <input
                            type="checkbox"
                            checked={editForms[villa.id]?.hasPool ?? false}
                            onChange={(e) =>
                              setEditForms((prev) => ({
                                ...prev,
                                [villa.id]: { ...prev[villa.id], hasPool: e.target.checked },
                              }))
                            }
                          />
                          مسبح
                        </label>
                        <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                          <input
                            type="checkbox"
                            checked={editForms[villa.id]?.hasGarden ?? false}
                            onChange={(e) =>
                              setEditForms((prev) => ({
                                ...prev,
                                [villa.id]: { ...prev[villa.id], hasGarden: e.target.checked },
                              }))
                            }
                          />
                          حديقة
                        </label>
                      </div>
                      <Field
                        label="المرافق (عربي، مفصولة بفاصلة)"
                        value={editForms[villa.id]?.amenities ?? ""}
                        onChange={(v) =>
                          setEditForms((prev) => ({ ...prev, [villa.id]: { ...prev[villa.id], amenities: v } }))
                        }
                      />
                      <Field
                        label="Amenities (English, comma separated)"
                        value={editForms[villa.id]?.amenitiesEn ?? ""}
                        onChange={(v) =>
                          setEditForms((prev) => ({ ...prev, [villa.id]: { ...prev[villa.id], amenitiesEn: v } }))
                        }
                      />
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-semibold text-neutral-700">الصور</label>
                        <ImageUploader
                          images={editImages[villa.id] ?? []}
                          onChange={(imgs) => setEditImages((prev) => ({ ...prev, [villa.id]: imgs }))}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleSaveEdit(villa.id)}
                      disabled={savingEditId === villa.id}
                      className="mt-4 rounded-lg bg-brand-blue px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
                    >
                      {savingEditId === villa.id ? "جاري الحفظ..." : "حفظ التعديلات"}
                    </button>
                  </td>
                </tr>
              )}
              </Fragment>
            ))}
            {villas.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                  لا توجد فيلات حاليًا
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
  type = "text",
  textarea = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
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
          rows={2}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-blue"
          required={required}
        />
      )}
    </div>
  );
}
