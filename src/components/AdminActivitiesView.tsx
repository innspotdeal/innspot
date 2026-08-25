"use client";

import { Fragment, useState } from "react";
import type { Activity } from "@/data/activities";
import ImageUploader from "@/components/ImageUploader";

type NewActivityForm = {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
};

const emptyForm: NewActivityForm = {
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
};

export default function AdminActivitiesView({ initialActivities }: { initialActivities: Activity[] }) {
  const [activities, setActivities] = useState(initialActivities);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<NewActivityForm>(emptyForm);
  const [newImage, setNewImage] = useState("");
  const [adding, setAdding] = useState(false);

  const [expandedImageId, setExpandedImageId] = useState<string | null>(null);
  const [editImage, setEditImage] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialActivities.map((a) => [a.id, a.image]))
  );
  const [savingImageId, setSavingImageId] = useState<string | null>(null);

  function flash(msg: string, isError = false) {
    if (isError) setError(msg);
    else setMessage(msg);
    setTimeout(() => {
      setMessage("");
      setError("");
    }, 3000);
  }

  async function handleSaveImage(id: string) {
    setSavingImageId(id);
    try {
      const res = await fetch(`/api/admin/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: editImage[id] ?? "" }),
      });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
      } else {
        setActivities((prev) => prev.map((a) => (a.id === id ? data.activity : a)));
        flash("تم تحديث الصورة");
      }
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setSavingImageId(null);
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
          <Field label="الاسم (عربي)" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label="Name (English)" value={form.nameEn} onChange={(v) => setForm({ ...form, nameEn: v })} required />
          <Field label="الوصف (عربي)" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea />
          <Field label="Description (English)" value={form.descriptionEn} onChange={(v) => setForm({ ...form, descriptionEn: v })} textarea />

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
        <table className="w-full min-w-[420px] text-right text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-bold">النشاط</th>
              <th className="px-4 py-3 font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <Fragment key={activity.id}>
              <tr className="border-t border-black/5">
                <td className="px-4 py-3 font-semibold text-brand-blue">{activity.name}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setExpandedImageId((prev) => (prev === activity.id ? null : activity.id))}
                      className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-bold text-neutral-700 transition hover:bg-neutral-50"
                    >
                      {expandedImageId === activity.id ? "إخفاء الصورة" : "الصورة"}
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
              {expandedImageId === activity.id && (
                <tr className="border-t border-black/5 bg-neutral-50">
                  <td colSpan={2} className="px-4 py-4">
                    <p className="mb-2 text-sm font-semibold text-neutral-700">صورة {activity.name}</p>
                    <ImageUploader
                      images={editImage[activity.id] ? [editImage[activity.id]] : []}
                      onChange={(imgs) =>
                        setEditImage((prev) => ({ ...prev, [activity.id]: imgs[0] ?? "" }))
                      }
                      multiple={false}
                    />
                    <button
                      onClick={() => handleSaveImage(activity.id)}
                      disabled={savingImageId === activity.id}
                      className="mt-3 rounded-lg bg-brand-blue px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
                    >
                      {savingImageId === activity.id ? "جاري الحفظ..." : "حفظ الصورة"}
                    </button>
                  </td>
                </tr>
              )}
              </Fragment>
            ))}
            {activities.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-neutral-500">
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
          rows={2}
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
