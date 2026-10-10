"use client";

import { Fragment, useState } from "react";
import type { Activity } from "@/data/activities";
import ImageUploader from "@/components/ImageUploader";

type ActivityForm = {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: string;
  duration: string;
  durationEn: string;
  includes: string;
  includesEn: string;
};

const emptyForm: ActivityForm = {
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
  price: "",
  duration: "",
  durationEn: "",
  includes: "",
  includesEn: "",
};

function activityToForm(a: Activity): ActivityForm {
  return {
    name: a.name,
    nameEn: a.nameEn,
    description: a.description,
    descriptionEn: a.descriptionEn,
    price: a.price > 0 ? String(a.price) : "",
    duration: a.duration,
    durationEn: a.durationEn,
    includes: a.includes.join("\n"),
    includesEn: a.includesEn.join("\n"),
  };
}

export default function AdminActivitiesView({ initialActivities }: { initialActivities: Activity[] }) {
  const [activities, setActivities] = useState(initialActivities);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<ActivityForm>(emptyForm);
  const [newImage, setNewImage] = useState("");
  const [adding, setAdding] = useState(false);

  // تعديل نشاط موجود: كل التفاصيل والصورة في مكان واحد
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editForms, setEditForms] = useState<Record<string, ActivityForm>>(() =>
    Object.fromEntries(initialActivities.map((a) => [a.id, activityToForm(a)]))
  );
  const [editImage, setEditImage] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialActivities.map((a) => [a.id, a.image]))
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
      const res = await fetch(`/api/admin/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, image: editImage[id] ?? "" }),
      });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
      } else {
        setActivities((prev) => prev.map((a) => (a.id === id ? data.activity : a)));
        setEditForms((prev) => ({ ...prev, [id]: activityToForm(data.activity) }));
        setEditImage((prev) => ({ ...prev, [id]: data.activity.image }));
        flash("تم حفظ التعديلات");
      }
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setSavingEditId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`متأكد إنك عايز تحذف "${name}"؟`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/activities/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
      } else {
        setActivities((prev) => prev.filter((a) => a.id !== id));
        flash("تم حذف النشاط");
      }
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAddActivity(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/admin/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image: newImage }),
      });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
        return;
      }
      setActivities((prev) => [...prev, data.activity]);
      setEditForms((prev) => ({ ...prev, [data.activity.id]: activityToForm(data.activity) }));
      setEditImage((prev) => ({ ...prev, [data.activity.id]: data.activity.image }));
      setForm(emptyForm);
      setNewImage("");
      setShowAddForm(false);
      flash("تمت إضافة النشاط");
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setAdding(false);
    }
  }

  function updateEdit(id: string, key: keyof ActivityForm, value: string) {
    setEditForms((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-brand-blue sm:text-3xl">لوحة إدارة الأنشطة</h1>
        <button
          onClick={() => setShowAddForm((s) => !s)}
          className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-orange/90"
        >
          {showAddForm ? "إلغاء" : "+ إضافة نشاط"}
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
          onSubmit={handleAddActivity}
          className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-black/10 bg-white p-6 sm:grid-cols-2"
        >
          <ActivityFields
            form={form}
            onChange={(key, value) => setForm({ ...form, [key]: value })}
            required
          />

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-neutral-700">الصورة</label>
            <ImageUploader
              images={newImage ? [newImage] : []}
              onChange={(imgs) => setNewImage(imgs[0] ?? "")}
              multiple={false}
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={adding}
              className="rounded-lg bg-brand-blue px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
            >
              {adding ? "جاري الإضافة..." : "حفظ النشاط"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-black/10 bg-white">
        <table className="w-full min-w-[520px] text-right text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-bold">النشاط</th>
              <th className="px-4 py-3 font-bold">السعر للفرد</th>
              <th className="px-4 py-3 font-bold">المدة</th>
              <th className="px-4 py-3 font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <Fragment key={activity.id}>
              <tr className="border-t border-black/5">
                <td className="px-4 py-3 font-semibold text-brand-blue">{activity.name}</td>
                <td className="px-4 py-3 text-neutral-600">
                  {activity.price > 0 ? `${activity.price.toLocaleString("ar-EG")} جنيه` : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-600">{activity.duration || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setExpandedId((prev) => (prev === activity.id ? null : activity.id))}
                      className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-bold text-neutral-700 transition hover:bg-neutral-50"
                    >
                      {expandedId === activity.id ? "إخفاء التعديل" : "تعديل"}
                    </button>
                    <button
                      onClick={() => handleDelete(activity.id, activity.name)}
                      disabled={deletingId === activity.id}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                      {deletingId === activity.id ? "جاري الحذف..." : "حذف"}
                    </button>
                  </div>
                </td>
              </tr>
              {expandedId === activity.id && editForms[activity.id] && (
                <tr className="border-t border-black/5 bg-neutral-50">
                  <td colSpan={4} className="px-4 py-5">
                    <p className="mb-3 text-sm font-bold text-neutral-800">تعديل {activity.name}</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <ActivityFields
                        form={editForms[activity.id]}
                        onChange={(key, value) => updateEdit(activity.id, key, value)}
                      />
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-semibold text-neutral-700">الصورة</label>
                        <ImageUploader
                          images={editImage[activity.id] ? [editImage[activity.id]] : []}
                          onChange={(imgs) =>
                            setEditImage((prev) => ({ ...prev, [activity.id]: imgs[0] ?? "" }))
                          }
                          multiple={false}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleSaveEdit(activity.id)}
                      disabled={savingEditId === activity.id}
                      className="mt-4 rounded-lg bg-brand-blue px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
                    >
                      {savingEditId === activity.id ? "جاري الحفظ..." : "حفظ التعديلات"}
                    </button>
                  </td>
                </tr>
              )}
              </Fragment>
            ))}
            {activities.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                  لا توجد أنشطة حاليًا
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// نفس الحقول في الإضافة والتعديل
function ActivityFields({
  form,
  onChange,
  required = false,
}: {
  form: ActivityForm;
  onChange: (key: keyof ActivityForm, value: string) => void;
  required?: boolean;
}) {
  return (
    <>
      <Field label="الاسم (عربي)" value={form.name} onChange={(v) => onChange("name", v)} required={required} />
      <Field label="Name (English)" value={form.nameEn} onChange={(v) => onChange("nameEn", v)} required={required} />
      <Field label="الوصف (عربي)" value={form.description} onChange={(v) => onChange("description", v)} textarea />
      <Field
        label="Description (English)"
        value={form.descriptionEn}
        onChange={(v) => onChange("descriptionEn", v)}
        textarea
      />
      <div>
        <Field
          label="السعر للفرد (بالجنيه)"
          value={form.price}
          onChange={(v) => onChange("price", v)}
          type="number"
        />
        <span className="mt-1 block text-xs text-neutral-400">
          فاضي أو صفر = السعر مش هيظهر، والزوار هيلاقوا زرار الاستفسار بس
        </span>
      </div>
      <div className="hidden sm:block" />
      <Field label="المدة (عربي، مثال: ساعتين)" value={form.duration} onChange={(v) => onChange("duration", v)} />
      <Field label="Duration (English, e.g. 2 hours)" value={form.durationEn} onChange={(v) => onChange("durationEn", v)} />
      <Field
        label="يشمل النشاط (سطر لكل عنصر، عربي)"
        value={form.includes}
        onChange={(v) => onChange("includes", v)}
        textarea
      />
      <Field
        label="Includes (one per line, English)"
        value={form.includesEn}
        onChange={(v) => onChange("includesEn", v)}
        textarea
      />
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea = false,
  required = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  required?: boolean;
  type?: "text" | "number";
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
          type={type}
          min={type === "number" ? 0 : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-blue"
          required={required}
        />
      )}
    </div>
  );
}
