"use client";

import { Fragment, useMemo, useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import {
  KIND_LABELS,
  OPTION_KINDS,
  PRICE_UNITS,
  PRICE_UNIT_LABELS,
  type CustomTripOption,
  type OptionKind,
  type PriceUnit,
} from "@/data/custom-trip";

// الأنواع اللي بتبقى تابعة لمكان (صنف جوه مكان)
const CHILD_KINDS: Partial<Record<OptionKind, OptionKind>> = {
  breakfast_item: "breakfast_place",
  lunch_item: "lunch_place",
};

type FormState = {
  kind: OptionKind;
  parentId: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  images: string[];
  rating: string;
  price: string;
  priceUnit: PriceUnit;
  capacity: string;
  tier: string;
  includesBreakfast: boolean;
  active: boolean;
};

const emptyForm: FormState = {
  kind: "breakfast_place",
  parentId: "",
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
  images: [],
  rating: "0",
  price: "0",
  priceUnit: "per_person",
  capacity: "",
  tier: "",
  includesBreakfast: false,
  active: true,
};

function optionToForm(o: CustomTripOption): FormState {
  return {
    kind: o.kind,
    parentId: o.parentId,
    name: o.name,
    nameEn: o.nameEn,
    description: o.description,
    descriptionEn: o.descriptionEn,
    images: o.images,
    rating: String(o.rating),
    price: String(o.price),
    priceUnit: o.priceUnit,
    capacity: o.capacity ? String(o.capacity) : "",
    tier: o.tier,
    includesBreakfast: o.includesBreakfast,
    active: o.active,
  };
}

function toPayload(f: FormState) {
  return {
    ...f,
    price: Number(f.price) || 0,
    capacity: Number(f.capacity) || 0,
    rating: Number(f.rating) || 0,
  };
}

export default function AdminCustomTripView({ initialOptions }: { initialOptions: CustomTripOption[] }) {
  const [options, setOptions] = useState(initialOptions);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [adding, setAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editForms, setEditForms] = useState<Record<string, FormState>>(() =>
    Object.fromEntries(initialOptions.map((o) => [o.id, optionToForm(o)]))
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map: Record<string, CustomTripOption[]> = {};
    for (const o of options) (map[o.kind] ??= []).push(o);
    return map;
  }, [options]);

  function flash(msg: string, isError = false) {
    if (isError) setError(msg);
    else setMessage(msg);
    setTimeout(() => {
      setMessage("");
      setError("");
    }, 3000);
  }

  function parentsFor(kind: OptionKind) {
    const parentKind = CHILD_KINDS[kind];
    return parentKind ? (grouped[parentKind] ?? []) : [];
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch("/api/admin/custom-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(form)),
      });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
        return;
      }
      setOptions((prev) => [...prev, data.option]);
      setEditForms((prev) => ({ ...prev, [data.option.id]: optionToForm(data.option) }));
      setForm(emptyForm);
      setShowAddForm(false);
      flash("تمت الإضافة");
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setAdding(false);
    }
  }

  async function handleSave(id: string) {
    const f = editForms[id];
    if (!f) return;
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/custom-trip/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(f)),
      });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
      } else {
        setOptions((prev) => prev.map((o) => (o.id === id ? data.option : o)));
        setEditForms((prev) => ({ ...prev, [id]: optionToForm(data.option) }));
        flash("تم الحفظ");
      }
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: string, name: string, kind: OptionKind) {
    const isPlace = kind === "breakfast_place" || kind === "lunch_place";
    const warn = isPlace ? " (وكل أصنافه)" : "";
    if (!confirm(`متأكد إنك عايز تحذف "${name}"${warn}؟`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/custom-trip/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
      } else {
        setOptions((prev) => prev.filter((o) => o.id !== id && o.parentId !== id));
        flash("تم الحذف");
      }
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setDeletingId(null);
    }
  }

  function updateEdit<K extends keyof FormState>(id: string, key: K, value: FormState[K]) {
    setEditForms((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-blue sm:text-3xl">خيارات البرنامج المخصّص</h1>
          <p className="mt-1 text-sm text-neutral-500">
            كل اللي هنا بيظهر للعميل في صفحة برنامج كاستم، والسعر بيتحسب من هنا.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm((s) => !s)}
          className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-orange/90"
        >
          {showAddForm ? "إلغاء" : "+ إضافة خيار"}
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">{message}</p>
      )}
      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">{error}</p>}

      {showAddForm && (
        <form onSubmit={handleAdd} className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
          <OptionFields
            form={form}
            onChange={(k, v) => setForm((prev) => ({ ...prev, [k]: v }))}
            parents={parentsFor(form.kind)}
          />
          <button
            type="submit"
            disabled={adding}
            className="mt-4 rounded-lg bg-brand-blue px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
          >
            {adding ? "جاري الإضافة..." : "حفظ الخيار"}
          </button>
        </form>
      )}

      {OPTION_KINDS.map((kind) => {
        const items = grouped[kind] ?? [];
        return (
          <section key={kind} className="mt-8">
            <h2 className="mb-3 text-lg font-extrabold text-neutral-800">
              {KIND_LABELS[kind]}{" "}
              <span className="text-sm font-semibold text-neutral-400">({items.length})</span>
            </h2>

            <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
              <table className="w-full min-w-[620px] text-right text-sm">
                <thead className="bg-neutral-50 text-neutral-600">
                  <tr>
                    <th className="px-4 py-3 font-bold">الاسم</th>
                    <th className="px-4 py-3 font-bold">السعر</th>
                    <th className="px-4 py-3 font-bold">الحالة</th>
                    <th className="px-4 py-3 font-bold"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((o) => {
                    const parent = options.find((x) => x.id === o.parentId);
                    return (
                      <Fragment key={o.id}>
                        <tr className="border-t border-black/5">
                          <td className="px-4 py-3">
                            <span className="font-semibold text-brand-blue">{o.name}</span>
                            {parent && (
                              <span className="block text-xs text-neutral-400">جوه: {parent.name}</span>
                            )}
                            {o.tier && <span className="block text-xs text-neutral-400">{o.tier}</span>}
                          </td>
                          <td className="px-4 py-3 text-neutral-600">
                            {o.price.toLocaleString("en-US")}{" "}
                            <span className="text-xs text-neutral-400">{PRICE_UNIT_LABELS[o.priceUnit]}</span>
                            {o.capacity > 0 && (
                              <span className="block text-xs text-neutral-400">سعة: {o.capacity}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                o.active ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
                              }`}
                            >
                              {o.active ? "ظاهر" : "مخفي"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setExpandedId((p) => (p === o.id ? null : o.id))}
                                className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-bold text-neutral-700 transition hover:bg-neutral-50"
                              >
                                {expandedId === o.id ? "إخفاء" : "تعديل"}
                              </button>
                              <button
                                onClick={() => handleDelete(o.id, o.name, o.kind)}
                                disabled={deletingId === o.id}
                                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                              >
                                {deletingId === o.id ? "..." : "حذف"}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedId === o.id && (
                          <tr className="border-t border-black/5 bg-neutral-50">
                            <td colSpan={4} className="px-4 py-5">
                              <OptionFields
                                form={editForms[o.id] ?? optionToForm(o)}
                                onChange={(k, v) => updateEdit(o.id, k, v)}
                                parents={parentsFor((editForms[o.id] ?? optionToForm(o)).kind)}
                              />
                              <button
                                onClick={() => handleSave(o.id)}
                                disabled={savingId === o.id}
                                className="mt-4 rounded-lg bg-brand-blue px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
                              >
                                {savingId === o.id ? "جاري الحفظ..." : "حفظ التعديلات"}
                              </button>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-sm text-neutral-400">
                        مفيش خيارات هنا لسه
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function OptionFields({
  form,
  onChange,
  parents,
}: {
  form: FormState;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  parents: CustomTripOption[];
}) {
  const needsParent = Boolean(CHILD_KINDS[form.kind]);
  const isCar = form.kind === "safari_car";
  const isHotel = form.kind === "hotel";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label>النوع</Label>
        <select
          value={form.kind}
          onChange={(e) => onChange("kind", e.target.value as OptionKind)}
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-blue"
        >
          {OPTION_KINDS.map((k) => (
            <option key={k} value={k}>
              {KIND_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      {needsParent && (
        <div>
          <Label>تابع لمكان</Label>
          <select
            value={form.parentId}
            onChange={(e) => onChange("parentId", e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-blue"
          >
            <option value="">— اختار المكان —</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <Field label="الاسم (عربي)" value={form.name} onChange={(v) => onChange("name", v)} />
      <Field label="Name (English)" value={form.nameEn} onChange={(v) => onChange("nameEn", v)} />

      <Field label="السعر" value={form.price} onChange={(v) => onChange("price", v)} type="number" />

      <div>
        <Label>السعر محسوب</Label>
        <select
          value={form.priceUnit}
          onChange={(e) => onChange("priceUnit", e.target.value as PriceUnit)}
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-blue"
        >
          {PRICE_UNITS.map((u) => (
            <option key={u} value={u}>
              {PRICE_UNIT_LABELS[u]}
            </option>
          ))}
        </select>
      </div>

      {isCar && (
        <Field
          label="سعة العربية (عدد الأفراد)"
          value={form.capacity}
          onChange={(v) => onChange("capacity", v)}
          type="number"
        />
      )}

      {isHotel && (
        <Field label="المستوى (مثال: فاخر)" value={form.tier} onChange={(v) => onChange("tier", v)} />
      )}

      <Field
        label="التقييم (من 5)"
        value={form.rating}
        onChange={(v) => onChange("rating", v)}
        type="number"
      />

      <div className="sm:col-span-2">
        <Label>الوصف (عربي) — بيظهر للعميل لما يدوس &quot;تفاصيل&quot;</Label>
        <textarea
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-blue"
        />
      </div>

      <div className="sm:col-span-2">
        <Label>Description (English)</Label>
        <textarea
          value={form.descriptionEn}
          onChange={(e) => onChange("descriptionEn", e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-blue"
        />
      </div>

      <div className="sm:col-span-2">
        <Label>الصور</Label>
        <ImageUploader images={form.images} onChange={(imgs) => onChange("images", imgs)} />
      </div>

      <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
        {isHotel && (
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <input
              type="checkbox"
              checked={form.includesBreakfast}
              onChange={(e) => onChange("includesBreakfast", e.target.checked)}
            />
            شامل فطار اليوم التاني
          </label>
        )}
        <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => onChange("active", e.target.checked)}
          />
          ظاهر للعميل
        </label>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-neutral-700">{children}</label>;
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
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-blue"
      />
    </div>
  );
}
