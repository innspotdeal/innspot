"use client";

import { useMemo, useState } from "react";
import type { TransportVehicle } from "@/lib/transport-repo";
import { allocateFleet } from "@/lib/transport";

const GROUP_LABELS: Record<string, string> = {
  safari: "عربيات السفاري",
  bus: "الباصات (بتتحدد حسب العدد)",
};

type FormState = {
  group: string;
  name: string;
  nameEn: string;
  capacity: string;
  price: string;
  active: boolean;
};

const emptyForm: FormState = {
  group: "bus",
  name: "",
  nameEn: "",
  capacity: "",
  price: "0",
  active: true,
};

const toForm = (v: TransportVehicle): FormState => ({
  group: v.group,
  name: v.name,
  nameEn: v.nameEn,
  capacity: String(v.capacity),
  price: String(v.price),
  active: v.active,
});

const payload = (f: FormState) => ({
  ...f,
  capacity: Number(f.capacity) || 0,
  price: Number(f.price) || 0,
});

export default function AdminTransportView({ initialVehicles }: { initialVehicles: TransportVehicle[] }) {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showAdd, setShowAdd] = useState(false);
  const [editForms, setEditForms] = useState<Record<string, FormState>>(() =>
    Object.fromEntries(initialVehicles.map((v) => [v.id, toForm(v)]))
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("40");

  function flash(msg: string, isError = false) {
    if (isError) setError(msg);
    else setMessage(msg);
    setTimeout(() => {
      setMessage("");
      setError("");
    }, 3000);
  }

  const grouped = useMemo(() => {
    const map: Record<string, TransportVehicle[]> = { safari: [], bus: [] };
    for (const v of vehicles) (map[v.group] ??= []).push(v);
    return map;
  }, [vehicles]);

  // معاينة: العدد ده هياخد أنهي مركبات وبكام
  const previewFleet = useMemo(() => {
    const busVehicles = (grouped.bus ?? [])
      .filter((v) => v.active)
      .map((v) => ({ id: v.id, name: v.name, nameEn: v.nameEn, capacity: v.capacity, price: v.price }));
    return allocateFleet(Number(preview) || 0, busVehicles);
  }, [grouped, preview]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setBusy("add");
    try {
      const res = await fetch("/api/admin/transport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(form)),
      });
      const data = await res.json();
      if (!data.ok) return flash(data.error || "حدث خطأ", true);
      setVehicles((prev) => [...prev, data.vehicle]);
      setEditForms((prev) => ({ ...prev, [data.vehicle.id]: toForm(data.vehicle) }));
      setForm(emptyForm);
      setShowAdd(false);
      flash("تمت الإضافة");
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setBusy(null);
    }
  }

  async function handleSave(id: string) {
    const f = editForms[id];
    if (!f) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/transport/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(f)),
      });
      const data = await res.json();
      if (!data.ok) return flash(data.error || "حدث خطأ", true);
      setVehicles((prev) => prev.map((v) => (v.id === id ? data.vehicle : v)));
      flash("تم الحفظ");
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`متأكد إنك عايز تحذف "${name}"؟`)) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/transport/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) return flash(data.error || "حدث خطأ", true);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      flash("تم الحذف");
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-blue sm:text-3xl">الانتقالات</h1>
          <p className="mt-1 text-sm text-neutral-500">
            سعر كل مركبة وسعتها. نوع الباص بيتحدد أوتوماتيك حسب عدد الأفراد.
          </p>
        </div>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-orange/90"
        >
          {showAdd ? "إلغاء" : "+ إضافة مركبة"}
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">{message}</p>
      )}
      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">{error}</p>}

      {showAdd && (
        <form onSubmit={handleAdd} className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
          <Fields form={form} onChange={(k, v) => setForm((p) => ({ ...p, [k]: v }))} />
          <button
            type="submit"
            disabled={busy === "add"}
            className="mt-4 rounded-lg bg-brand-blue px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
          >
            {busy === "add" ? "جاري الإضافة..." : "حفظ المركبة"}
          </button>
        </form>
      )}

      {/* معاينة التوزيع */}
      <section className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-lg font-extrabold text-neutral-800">جرّب التوزيع</h2>
        <p className="mt-1 text-sm text-neutral-500">اكتب عدد أفراد وشوف هياخد أنهي باصات وبكام.</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="number"
            value={preview}
            onChange={(e) => setPreview(e.target.value)}
            className="w-28 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />
          <span className="text-sm text-neutral-500">فرد</span>
        </div>
        {previewFleet.lines.length > 0 ? (
          <div className="mt-3 text-sm">
            <p className="font-semibold text-neutral-700">
              {previewFleet.lines.map((l) => `${l.count}× ${l.vehicle.name}`).join("  +  ")}
            </p>
            <p className="mt-1 text-neutral-500">
              الإجمالي: <b className="text-brand-orange">{previewFleet.total.toLocaleString("en-US")} ج</b>
              {Number(preview) > 0 && (
                <>
                  {" · "}للفرد:{" "}
                  <b className="text-brand-blue">
                    {Math.ceil(previewFleet.total / Number(preview)).toLocaleString("en-US")} ج
                  </b>
                </>
              )}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-neutral-400">محتاج تضيف باصات بأسعار الأول.</p>
        )}
      </section>

      {["safari", "bus"].map((group) => (
        <section key={group} className="mt-8">
          <h2 className="mb-3 text-lg font-extrabold text-neutral-800">{GROUP_LABELS[group]}</h2>
          <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
            <table className="w-full min-w-[560px] text-right text-sm">
              <thead className="bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="px-4 py-3 font-bold">المركبة</th>
                  <th className="px-4 py-3 font-bold">السعة</th>
                  <th className="px-4 py-3 font-bold">السعر</th>
                  <th className="px-4 py-3 font-bold"></th>
                </tr>
              </thead>
              <tbody>
                {(grouped[group] ?? []).map((v) => (
                  <tr key={v.id} className="border-t border-black/5 align-top">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-brand-blue">{v.name}</span>
                      {!v.active && <span className="block text-xs text-neutral-400">مخفي</span>}
                      {expandedId === v.id && (
                        <div className="mt-3 w-full">
                          <Fields
                            form={editForms[v.id] ?? toForm(v)}
                            onChange={(k, val) =>
                              setEditForms((prev) => ({ ...prev, [v.id]: { ...prev[v.id], [k]: val } }))
                            }
                          />
                          <button
                            onClick={() => handleSave(v.id)}
                            disabled={busy === v.id}
                            className="mt-3 rounded-lg bg-brand-blue px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                          >
                            {busy === v.id ? "جاري الحفظ..." : "حفظ"}
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{v.capacity} فرد</td>
                    <td className="px-4 py-3 text-neutral-600">
                      {v.price > 0 ? `${v.price.toLocaleString("en-US")} ج` : <span className="text-red-500">لسه</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setExpandedId((p) => (p === v.id ? null : v.id))}
                          className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                        >
                          {expandedId === v.id ? "إخفاء" : "تعديل"}
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.name)}
                          disabled={busy === v.id}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(grouped[group] ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-neutral-400">
                      مفيش مركبات هنا
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function Fields({
  form,
  onChange,
}: {
  form: FormState;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-semibold text-neutral-700">المجموعة</label>
        <select
          value={form.group}
          onChange={(e) => onChange("group", e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-blue"
        >
          <option value="safari">عربيات السفاري</option>
          <option value="bus">الباصات</option>
        </select>
      </div>
      <Field label="الاسم (عربي)" value={form.name} onChange={(v) => onChange("name", v)} />
      <Field label="Name (English)" value={form.nameEn} onChange={(v) => onChange("nameEn", v)} />
      <Field
        label="السعة (أقصى عدد أفراد)"
        value={form.capacity}
        onChange={(v) => onChange("capacity", v)}
        type="number"
      />
      <Field label="سعر المركبة" value={form.price} onChange={(v) => onChange("price", v)} type="number" />
      <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
        <input type="checkbox" checked={form.active} onChange={(e) => onChange("active", e.target.checked)} />
        مفعّلة
      </label>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-blue"
      />
    </div>
  );
}
