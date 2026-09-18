"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import type { CorporateProgram } from "@/data/programs";
import ImageUploader from "@/components/ImageUploader";
import { itineraryToText } from "@/lib/program-input";

type NewProgramForm = {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  itinerary: string;
  itineraryEn: string;
  startTime: string;
  endTime: string;
  duration: string;
  durationEn: string;
  includes: string;
  includesEn: string;
  isCustom: boolean;
};

const emptyForm: NewProgramForm = {
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
  itinerary: "",
  itineraryEn: "",
  startTime: "",
  endTime: "",
  duration: "",
  durationEn: "",
  includes: "",
  includesEn: "",
  isCustom: false,
};

type EditProgramForm = {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  itinerary: string;
  itineraryEn: string;
  startTime: string;
  endTime: string;
  duration: string;
  durationEn: string;
  includes: string;
  includesEn: string;
  isCustom: boolean;
};

function programToEditForm(p: CorporateProgram): EditProgramForm {
  return {
    name: p.name,
    nameEn: p.nameEn,
    description: p.description,
    descriptionEn: p.descriptionEn,
    itinerary: itineraryToText(p.itinerary, "ar"),
    itineraryEn: itineraryToText(p.itinerary, "en"),
    startTime: p.startTime,
    endTime: p.endTime,
    duration: p.duration,
    durationEn: p.durationEn,
    includes: p.includes.join("\n"),
    includesEn: p.includesEn.join("\n"),
    isCustom: p.isCustom,
  };
}

export default function AdminProgramsView({ initialPrograms }: { initialPrograms: CorporateProgram[] }) {
  const [programs, setPrograms] = useState(initialPrograms);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<NewProgramForm>(emptyForm);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  const [editImages, setEditImages] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(initialPrograms.map((p) => [p.id, p.images]))
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editForms, setEditForms] = useState<Record<string, EditProgramForm>>(() =>
    Object.fromEntries(initialPrograms.map((p) => [p.id, programToEditForm(p)]))
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

  async function handleSaveEdit(id: string) {
    const f = editForms[id];
    if (!f) return;
    setSavingEditId(id);
    try {
      const res = await fetch(`/api/admin/programs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, images: editImages[id] ?? [] }),
      });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
      } else {
        setPrograms((prev) => prev.map((p) => (p.id === id ? data.program : p)));
        setEditForms((prev) => ({ ...prev, [id]: programToEditForm(data.program) }));
        setEditImages((prev) => ({ ...prev, [id]: data.program.images }));
        flash("تم حفظ التعديلات");
      }
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setSavingEditId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`متأكد إنك عايز تحذف "${name}"؟ ده هيمسح تسعيره كمان.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/programs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
      } else {
        setPrograms((prev) => prev.filter((p) => p.id !== id));
        flash("تم حذف البرنامج");
      }
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAddProgram(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images: newImages }),
      });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
        return;
      }
      setPrograms((prev) => [...prev, data.program]);
      setEditImages((prev) => ({ ...prev, [data.program.id]: data.program.images }));
      setEditForms((prev) => ({ ...prev, [data.program.id]: programToEditForm(data.program) }));
      setForm(emptyForm);
      setNewImages([]);
      setShowAddForm(false);
      flash("تمت إضافة البرنامج — روح صفحة التسعير عشان تحدد سعره لو مش مخصّص (Custom)");
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setAdding(false);
    }
  }

  function updateEdit(id: string, key: keyof EditProgramForm, value: string) {
    setEditForms((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-brand-blue sm:text-3xl">لوحة إدارة برامج الشركات</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/pricing"
            className="rounded-lg border border-black/10 px-4 py-2 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50"
          >
            تعديل التسعير
          </Link>
          <button
            onClick={() => setShowAddForm((s) => !s)}
            className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-orange/90"
          >
            {showAddForm ? "إلغاء" : "+ إضافة برنامج"}
          </button>
        </div>
      </div>

      {message && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">{message}</p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">{error}</p>
      )}

      {showAddForm && (
        <form
          onSubmit={handleAddProgram}
          className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-black/10 bg-white p-6 sm:grid-cols-2"
        >
          <Field label="الاسم (عربي)" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label="Name (English)" value={form.nameEn} onChange={(v) => setForm({ ...form, nameEn: v })} required />
          <Field label="الوصف (عربي)" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea />
          <Field label="Description (English)" value={form.descriptionEn} onChange={(v) => setForm({ ...form, descriptionEn: v })} textarea />
          <Field label="مدة البرنامج (عربي)" value={form.duration} onChange={(v) => setForm({ ...form, duration: v })} />
          <Field label="Duration (English)" value={form.durationEn} onChange={(v) => setForm({ ...form, durationEn: v })} />
          <Field
            label="وقت التحرك (24 ساعة، مثال 07:00)"
            value={form.startTime}
            onChange={(v) => setForm({ ...form, startTime: v })}
          />
          <Field
            label="وقت العودة (24 ساعة، مثال 21:00)"
            value={form.endTime}
            onChange={(v) => setForm({ ...form, endTime: v })}
          />
          <Field
            label="مخطط الرحلة (سطر لكل خطوة — التفصيل بعد علامة |)"
            value={form.itinerary}
            onChange={(v) => setForm({ ...form, itinerary: v })}
            textarea
          />
          <Field
            label="Itinerary (one step per line — detail after |)"
            value={form.itineraryEn}
            onChange={(v) => setForm({ ...form, itineraryEn: v })}
            textarea
          />
          <Field
            label="يشمل السعر (سطر لكل عنصر، عربي)"
            value={form.includes}
            onChange={(v) => setForm({ ...form, includes: v })}
            textarea
          />
          <Field
            label="Includes (one per line, English)"
            value={form.includesEn}
            onChange={(v) => setForm({ ...form, includesEn: v })}
            textarea
          />
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-neutral-700">الصور</label>
            <ImageUploader images={newImages} onChange={setNewImages} />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <input
              type="checkbox"
              checked={form.isCustom}
              onChange={(e) => setForm({ ...form, isCustom: e.target.checked })}
            />
            برنامج مخصّص بالكامل (Custom) — من غير سعر ثابت للفرد
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={adding}
              className="rounded-lg bg-brand-blue px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
            >
              {adding ? "جاري الإضافة..." : "حفظ البرنامج"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-black/10 bg-white">
        <table className="w-full min-w-[480px] text-right text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-bold">البرنامج</th>
              <th className="px-4 py-3 font-bold">المدة</th>
              <th className="px-4 py-3 font-bold">النوع</th>
              <th className="px-4 py-3 font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {programs.map((program) => (
              <Fragment key={program.id}>
              <tr className="border-t border-black/5">
                <td className="px-4 py-3 font-semibold text-brand-blue">{program.name}</td>
                <td className="px-4 py-3 text-neutral-600">{program.duration || "—"}</td>
                <td className="px-4 py-3 text-neutral-600">{program.isCustom ? "مخصّص" : "سعر ثابت"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setExpandedId((prev) => (prev === program.id ? null : program.id))}
                      className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-bold text-neutral-700 transition hover:bg-neutral-50"
                    >
                      {expandedId === program.id ? "إخفاء التعديل" : "تعديل"}
                    </button>
                    <button
                      onClick={() => handleDelete(program.id, program.name)}
                      disabled={deletingId === program.id}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                      {deletingId === program.id ? "جاري الحذف..." : "حذف"}
                    </button>
                  </div>
                </td>
              </tr>
              {expandedId === program.id && (
                <tr className="border-t border-black/5 bg-neutral-50">
                  <td colSpan={4} className="px-4 py-5">
                    <p className="mb-3 text-sm font-bold text-neutral-800">تعديل {program.name}</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <EditField
                        label="اسم البرنامج (عربي)"
                        value={editForms[program.id]?.name ?? ""}
                        onChange={(v) => updateEdit(program.id, "name", v)}
                      />
                      <EditField
                        label="Program name (English)"
                        value={editForms[program.id]?.nameEn ?? ""}
                        onChange={(v) => updateEdit(program.id, "nameEn", v)}
                      />
                      <EditField
                        label="الوصف (عربي)"
                        value={editForms[program.id]?.description ?? ""}
                        onChange={(v) => updateEdit(program.id, "description", v)}
                        textarea
                      />
                      <EditField
                        label="Description (English)"
                        value={editForms[program.id]?.descriptionEn ?? ""}
                        onChange={(v) => updateEdit(program.id, "descriptionEn", v)}
                        textarea
                      />
                      <EditField
                        label="المدة (عربي)"
                        value={editForms[program.id]?.duration ?? ""}
                        onChange={(v) => updateEdit(program.id, "duration", v)}
                      />
                      <EditField
                        label="Duration (English)"
                        value={editForms[program.id]?.durationEn ?? ""}
                        onChange={(v) => updateEdit(program.id, "durationEn", v)}
                      />
                      <EditField
                        label="وقت التحرك (24 ساعة، مثال 07:00)"
                        value={editForms[program.id]?.startTime ?? ""}
                        onChange={(v) => updateEdit(program.id, "startTime", v)}
                      />
                      <EditField
                        label="وقت العودة (24 ساعة، مثال 21:00)"
                        value={editForms[program.id]?.endTime ?? ""}
                        onChange={(v) => updateEdit(program.id, "endTime", v)}
                      />
                      <EditField
                        label="مخطط الرحلة (سطر لكل خطوة — التفصيل بعد علامة |)"
                        value={editForms[program.id]?.itinerary ?? ""}
                        onChange={(v) => updateEdit(program.id, "itinerary", v)}
                        textarea
                        rows={10}
                      />
                      <EditField
                        label="Itinerary (one step per line — detail after |)"
                        value={editForms[program.id]?.itineraryEn ?? ""}
                        onChange={(v) => updateEdit(program.id, "itineraryEn", v)}
                        textarea
                        rows={10}
                      />
                      <EditField
                        label="يشمل السعر (سطر لكل عنصر، عربي)"
                        value={editForms[program.id]?.includes ?? ""}
                        onChange={(v) => updateEdit(program.id, "includes", v)}
                        textarea
                      />
                      <EditField
                        label="Includes (one per line, English)"
                        value={editForms[program.id]?.includesEn ?? ""}
                        onChange={(v) => updateEdit(program.id, "includesEn", v)}
                        textarea
                      />
                      <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                        <input
                          type="checkbox"
                          checked={editForms[program.id]?.isCustom ?? false}
                          onChange={(e) =>
                            setEditForms((prev) => ({
                              ...prev,
                              [program.id]: { ...prev[program.id], isCustom: e.target.checked },
                            }))
                          }
                        />
                        برنامج مخصّص (سعر بالطلب — من غير حاسبة سعر)
                      </label>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-semibold text-neutral-700">الصور</label>
                        <ImageUploader
                          images={editImages[program.id] ?? []}
                          onChange={(imgs) => setEditImages((prev) => ({ ...prev, [program.id]: imgs }))}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleSaveEdit(program.id)}
                      disabled={savingEditId === program.id}
                      className="mt-4 rounded-lg bg-brand-blue px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
                    >
                      {savingEditId === program.id ? "جاري الحفظ..." : "حفظ التعديلات"}
                    </button>
                  </td>
                </tr>
              )}
              </Fragment>
            ))}
            {programs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                  لا توجد برامج حاليًا
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

function EditField({
  label,
  value,
  onChange,
  textarea = false,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-blue"
          rows={rows}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-blue"
        />
      )}
    </div>
  );
}
