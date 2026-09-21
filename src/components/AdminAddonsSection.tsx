"use client";

import { useState } from "react";
import type { PriceUnit } from "@/data/custom-trip";

// ============================================================
// الإضافات — قايمة واحدة لكل البرامج
// كل إضافة ليها سعر واحد، وكل برنامج بيحدد لكل إضافة:
// متاحة كإضافة / مشمولة في سعر البرنامج / مش متاحة
// ============================================================

export type AddonRow = {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  priceUnit: PriceUnit;
  active: boolean;
};

type Mode = "available" | "included" | "hidden";
type ProgramSummary = { id: string; name: string };

const MODE_LABELS: Record<Mode, string> = {
  available: "متاحة كإضافة",
  included: "مشمولة في السعر",
  hidden: "مش متاحة",
};

const UNIT_LABELS: Record<string, string> = {
  per_person: "للفرد",
  flat: "سعر ثابت",
  per_car: "للعربية",
  per_night: "للفرد/الليلة",
};

const inputClass =
  "rounded-lg border border-black/10 px-2 py-1.5 text-sm outline-none focus:border-brand-blue";

export default function AdminAddonsSection({
  programs,
  initialAddons,
  initialModes,
}: {
  programs: ProgramSummary[];
  initialAddons: AddonRow[];
  initialModes: Record<string, Record<string, "included" | "hidden">>;
}) {
  const [addons, setAddons] = useState<AddonRow[]>(initialAddons);
  const [savedPrices, setSavedPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialAddons.map((a) => [a.id, `${a.price}|${a.priceUnit}`]))
  );
  const [modes, setModes] = useState<Record<string, Record<string, Mode>>>(() => {
    const map: Record<string, Record<string, Mode>> = {};
    for (const p of programs) {
      map[p.id] = {};
      for (const a of initialAddons) map[p.id][a.id] = initialModes[p.id]?.[a.id] ?? "available";
    }
    return map;
  });

  const [draft, setDraft] = useState({ name: "", nameEn: "", price: "", priceUnit: "per_person" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function flash(msg: string, isError = false) {
    if (isError) setError(msg);
    else setMessage(msg);
    setTimeout(() => {
      setMessage("");
      setError("");
    }, 3500);
  }

  function setMode(programId: string, addonId: string, mode: Mode) {
    setModes((prev) => ({ ...prev, [programId]: { ...prev[programId], [addonId]: mode } }));
  }

  function updateAddon(id: string, field: "price" | "priceUnit", value: string) {
    setAddons((prev) =>
      prev.map((a) =>
        a.id !== id
          ? a
          : field === "price"
            ? { ...a, price: Number(value) || 0 }
            : { ...a, priceUnit: value as PriceUnit }
      )
    );
  }

  async function handleAdd() {
    if (!draft.name.trim()) {
      flash("اكتب اسم الإضافة", true);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/custom-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "addon",
          name: draft.name.trim(),
          nameEn: draft.nameEn.trim(),
          price: Number(draft.price) || 0,
          priceUnit: draft.priceUnit,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
        return;
      }
      const o = data.option;
      const row: AddonRow = {
        id: o.id,
        name: o.name,
        nameEn: o.nameEn,
        price: o.price,
        priceUnit: o.priceUnit,
        active: o.active,
      };
      setAddons((prev) => [...prev, row]);
      setSavedPrices((prev) => ({ ...prev, [row.id]: `${row.price}|${row.priceUnit}` }));
      // إضافة جديدة بتبقى متاحة في كل البرامج — تقدر تغيّرها من الجدول
      setModes((prev) => {
        const next = { ...prev };
        for (const p of programs) next[p.id] = { ...next[p.id], [row.id]: "available" };
        return next;
      });
      setDraft({ name: "", nameEn: "", price: "", priceUnit: "per_person" });
      flash(`اتضافت «${row.name}» — متاحة في كل البرامج`);
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(addon: AddonRow) {
    if (!confirm(`حذف «${addon.name}» من كل البرامج؟`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/custom-trip/${encodeURIComponent(addon.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.ok) {
        flash(data.error || "حدث خطأ", true);
        return;
      }
      setAddons((prev) => prev.filter((a) => a.id !== addon.id));
      flash(`اتحذفت «${addon.name}»`);
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    setBusy(true);
    try {
      // الأسعار اللي اتغيرت بس
      for (const a of addons) {
        if (savedPrices[a.id] === `${a.price}|${a.priceUnit}`) continue;
        const res = await fetch(`/api/admin/custom-trip/${encodeURIComponent(a.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price: a.price, priceUnit: a.priceUnit }),
        });
        const data = await res.json();
        if (!data.ok) {
          flash(data.error || `تعذر حفظ سعر «${a.name}»`, true);
          return;
        }
      }
      setSavedPrices(Object.fromEntries(addons.map((a) => [a.id, `${a.price}|${a.priceUnit}`])));

      const res = await fetch("/api/admin/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programAddons: modes }),
      });
      const data = await res.json();
      if (!data.ok) flash(data.error || "حدث خطأ", true);
      else flash("تم حفظ الإضافات");
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-extrabold text-neutral-800">الإضافات</h2>
      <p className="mt-1 text-sm text-neutral-500">
        قايمة واحدة لكل البرامج (ونفس إضافات البرنامج الكاستم). لكل برنامج اختار: متاحة
        كإضافة يختارها العميل، أو مشمولة في سعر البرنامج، أو مش متاحة.
      </p>

      {message && (
        <p className="mt-3 rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">{message}</p>
      )}
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">{error}</p>
      )}

      <div className="mt-3 overflow-x-auto rounded-2xl border border-black/10 bg-white">
        <table className="w-full min-w-[760px] text-right text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-3 py-3 font-bold">الإضافة</th>
              <th className="px-3 py-3 font-bold">السعر</th>
              {programs.map((p) => (
                <th key={p.id} className="px-3 py-3 font-bold">
                  {p.name}
                </th>
              ))}
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {addons.length === 0 && (
              <tr>
                <td colSpan={programs.length + 3} className="px-3 py-6 text-center text-neutral-400">
                  مفيش إضافات — ضيف واحدة من تحت
                </td>
              </tr>
            )}
            {addons.map((a) => (
              <tr key={a.id} className="border-t border-black/5">
                <td className="px-3 py-3">
                  <p className="font-semibold text-brand-blue">{a.name}</p>
                  {!a.active && <p className="text-xs text-amber-600">متوقفة من قايمة الكاستم</p>}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={a.price}
                      onChange={(e) => updateAddon(a.id, "price", e.target.value)}
                      aria-label={`سعر ${a.name}`}
                      className={`${inputClass} w-24`}
                    />
                    <select
                      value={a.priceUnit}
                      onChange={(e) => updateAddon(a.id, "priceUnit", e.target.value)}
                      aria-label={`طريقة حساب ${a.name}`}
                      className={inputClass}
                    >
                      <option value="per_person">{UNIT_LABELS.per_person}</option>
                      <option value="flat">{UNIT_LABELS.flat}</option>
                    </select>
                  </div>
                  {a.price === 0 && <p className="mt-1 text-xs text-amber-600">السعر لسه صفر</p>}
                </td>
                {programs.map((p) => {
                  const mode = modes[p.id]?.[a.id] ?? "available";
                  return (
                    <td key={p.id} className="px-3 py-3">
                      <select
                        value={mode}
                        onChange={(e) => setMode(p.id, a.id, e.target.value as Mode)}
                        aria-label={`${a.name} في ${p.name}`}
                        className={`${inputClass} ${
                          mode === "included"
                            ? "border-brand-blue/40 bg-brand-blue/5 font-semibold text-brand-blue"
                            : mode === "hidden"
                              ? "text-neutral-400"
                              : ""
                        }`}
                      >
                        {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
                          <option key={m} value={m}>
                            {MODE_LABELS[m]}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                })}
                <td className="px-3 py-3">
                  <button
                    onClick={() => handleDelete(a)}
                    disabled={busy}
                    className="rounded-lg px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <button
          onClick={handleSave}
          disabled={busy}
          className="rounded-lg bg-brand-blue px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
        >
          {busy ? "جاري الحفظ..." : "حفظ الإضافات"}
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-black/10 bg-white p-5">
        <p className="mb-3 text-sm font-bold text-neutral-800">إضافة جديدة</p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-neutral-600">
            الاسم
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className={`${inputClass} w-44`}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-neutral-600">
            الاسم بالإنجليزي
            <input
              dir="ltr"
              value={draft.nameEn}
              onChange={(e) => setDraft((d) => ({ ...d, nameEn: e.target.value }))}
              className={`${inputClass} w-44`}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-neutral-600">
            السعر
            <input
              type="number"
              value={draft.price}
              onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
              className={`${inputClass} w-24`}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-neutral-600">
            طريقة الحساب
            <select
              value={draft.priceUnit}
              onChange={(e) => setDraft((d) => ({ ...d, priceUnit: e.target.value }))}
              className={inputClass}
            >
              <option value="per_person">{UNIT_LABELS.per_person}</option>
              <option value="flat">{UNIT_LABELS.flat}</option>
            </select>
          </label>
          <button
            onClick={handleAdd}
            disabled={busy}
            className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-orange-dark disabled:opacity-60"
          >
            + إضافة
          </button>
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          الصور والوصف والتقييم بتاع الإضافة بيتعدلوا من صفحة البرنامج الكاستم.
        </p>
      </div>
    </section>
  );
}
