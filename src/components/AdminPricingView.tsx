"use client";

import { useState } from "react";
import type { MarginTier, PricingSettings, ProgramPricing } from "@/lib/pricing";

type ProgramSummary = { id: string; name: string; isCustom: boolean };
type AddonOption = { key: string; label: string };

const emptyPricing: ProgramPricing = {
  breakfastPerPerson: 0,
  lunchPerPerson: 0,
  ticketsPerPerson: 0,
  carPrice: 0,
  transportGroup: "safari",
};

export default function AdminPricingView({
  programs,
  initialProgramPricing,
  addonOptions,
  initialAddonPrices,
  initialSettings,
}: {
  programs: ProgramSummary[];
  initialProgramPricing: Record<string, ProgramPricing>;
  addonOptions: AddonOption[];
  initialAddonPrices: Record<string, number>;
  initialSettings: PricingSettings;
}) {
  const [programPricing, setProgramPricing] = useState<Record<string, ProgramPricing>>(() => {
    const map: Record<string, ProgramPricing> = {};
    for (const p of programs) {
      map[p.id] = initialProgramPricing[p.id] ?? emptyPricing;
    }
    return map;
  });
  const [addonPrices, setAddonPrices] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const a of addonOptions) {
      map[a.key] = initialAddonPrices[a.key] ?? 0;
    }
    return map;
  });
  const [peoplePerCar, setPeoplePerCar] = useState(String(initialSettings.peoplePerCar));
  const [marginTiers, setMarginTiers] = useState<MarginTier[]>(
    initialSettings.marginTiers.length
      ? initialSettings.marginTiers
      : [{ fromPeople: 0, toPeople: 0, margin: 0 }]
  );

  const [savingProgram, setSavingProgram] = useState<string | null>(null);
  const [savingAddons, setSavingAddons] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function flash(msg: string, isError = false) {
    if (isError) setError(msg);
    else setMessage(msg);
    setTimeout(() => {
      setMessage("");
      setError("");
    }, 3000);
  }

  async function patchPricing(body: Record<string, unknown>) {
    const res = await fetch("/api/admin/pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function handleSaveProgram(programId: string) {
    setSavingProgram(programId);
    try {
      const data = await patchPricing({ programPricing: { [programId]: programPricing[programId] } });
      if (!data.ok) flash(data.error || "حدث خطأ", true);
      else flash("تم حفظ التسعير");
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setSavingProgram(null);
    }
  }

  async function handleSaveAddons() {
    setSavingAddons(true);
    try {
      const data = await patchPricing({ addonPrices });
      if (!data.ok) flash(data.error || "حدث خطأ", true);
      else flash("تم حفظ أسعار الإضافات");
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setSavingAddons(false);
    }
  }

  async function handleSaveSettings() {
    setSavingSettings(true);
    try {
      const data = await patchPricing({
        settings: { peoplePerCar: Number(peoplePerCar) || 1, marginTiers },
      });
      if (!data.ok) flash(data.error || "حدث خطأ", true);
      else flash("تم حفظ الإعدادات العامة");
    } catch {
      flash("تعذر الاتصال بالسيرفر", true);
    } finally {
      setSavingSettings(false);
    }
  }

  function updateTier(index: number, field: keyof MarginTier, value: string) {
    setMarginTiers((prev) =>
      prev.map((tier, i) => (i === index ? { ...tier, [field]: Number(value) || 0 } : tier))
    );
  }

  function addTier() {
    setMarginTiers((prev) => [...prev, { fromPeople: 0, toPeople: 0, margin: 0 }]);
  }

  function removeTier(index: number) {
    setMarginTiers((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold text-brand-blue sm:text-3xl">تعديل التسعير الداخلي</h1>
      <p className="mt-2 text-sm text-neutral-500">
        الأرقام دي بتستخدم في حساب سعر رحلات الشركات، والفرونت إند بيشوف الناتج النهائي بس.
      </p>

      {message && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">{message}</p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">{error}</p>
      )}

      {/* تسعير كل برنامج */}
      <section className="mt-8">
        <h2 className="text-lg font-extrabold text-neutral-800">تسعير البرامج (لكل فرد)</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-black/10 bg-white">
          <table className="w-full min-w-[720px] text-right text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="px-3 py-3 font-bold">البرنامج</th>
                <th className="px-3 py-3 font-bold">فطار/فرد</th>
                <th className="px-3 py-3 font-bold">غدا/فرد</th>
                <th className="px-3 py-3 font-bold">تذاكر/فرد</th>
                <th className="px-3 py-3 font-bold">الانتقالات</th>
                <th className="px-3 py-3 font-bold"></th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => {
                const pricing = programPricing[program.id] ?? emptyPricing;
                if (program.isCustom) {
                  return (
                    <tr key={program.id} className="border-t border-black/5">
                      <td className="px-3 py-3 font-semibold text-brand-blue">{program.name}</td>
                      <td colSpan={4} className="px-3 py-3 text-neutral-400">
                        برنامج مخصّص — من غير سعر ثابت
                      </td>
                      <td />
                    </tr>
                  );
                }
                return (
                  <tr key={program.id} className="border-t border-black/5">
                    <td className="px-3 py-3 font-semibold text-brand-blue">{program.name}</td>
                    {(["breakfastPerPerson", "lunchPerPerson", "ticketsPerPerson"] as const).map(
                      (field) => (
                        <td key={field} className="px-3 py-3">
                          <input
                            type="number"
                            value={pricing[field]}
                            onChange={(e) =>
                              setProgramPricing((prev) => ({
                                ...prev,
                                [program.id]: { ...prev[program.id], [field]: Number(e.target.value) || 0 },
                              }))
                            }
                            className="w-24 rounded-lg border border-black/10 px-2 py-1 outline-none focus:border-brand-blue"
                          />
                        </td>
                      )
                    )}
                    <td className="px-3 py-3">
                      <select
                        value={pricing.transportGroup}
                        onChange={(e) =>
                          setProgramPricing((prev) => ({
                            ...prev,
                            [program.id]: { ...prev[program.id], transportGroup: e.target.value },
                          }))
                        }
                        className="rounded-lg border border-black/10 px-2 py-1 text-sm outline-none focus:border-brand-blue"
                      >
                        <option value="safari">عربيات سفاري</option>
                        <option value="bus">باصات (حسب العدد)</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleSaveProgram(program.id)}
                        disabled={savingProgram === program.id}
                        className="rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
                      >
                        {savingProgram === program.id ? "جاري الحفظ..." : "حفظ"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* أسعار الإضافات */}
      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-neutral-800">أسعار الإضافات</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 rounded-2xl border border-black/10 bg-white p-6 sm:grid-cols-3">
          {addonOptions.map((addon) => (
            <div key={addon.key}>
              <label className="block text-sm font-semibold text-neutral-700">{addon.label}</label>
              <input
                type="number"
                value={addonPrices[addon.key] ?? 0}
                onChange={(e) =>
                  setAddonPrices((prev) => ({ ...prev, [addon.key]: Number(e.target.value) || 0 }))
                }
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-blue"
              />
            </div>
          ))}
          <div className="sm:col-span-3">
            <button
              onClick={handleSaveAddons}
              disabled={savingAddons}
              className="rounded-lg bg-brand-blue px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
            >
              {savingAddons ? "جاري الحفظ..." : "حفظ أسعار الإضافات"}
            </button>
          </div>
        </div>
      </section>

      {/* الإعدادات العامة */}
      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-neutral-800">إعدادات عامة</h2>
        <div className="mt-3 rounded-2xl border border-black/10 bg-white p-6">
          <div className="max-w-xs">
            <label className="block text-sm font-semibold text-neutral-700">عدد الأفراد في العربية الواحدة</label>
            <input
              type="number"
              value={peoplePerCar}
              onChange={(e) => setPeoplePerCar(e.target.value)}
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-neutral-700">
              شرائح هامش الربح (من عدد — لعدد — المبلغ المضاف)
            </label>
            <p className="mt-1 text-xs text-neutral-400">
              سيب خانة &quot;إلى&quot; بصفر لو الشريحة مالهاش حد أقصى.
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {marginTiers.map((tier, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-neutral-500">من</span>
                  <input
                    type="number"
                    value={tier.fromPeople}
                    onChange={(e) => updateTier(i, "fromPeople", e.target.value)}
                    className="w-20 rounded-lg border border-black/10 px-2 py-1 text-sm outline-none focus:border-brand-blue"
                  />
                  <span className="text-sm text-neutral-500">إلى</span>
                  <input
                    type="number"
                    value={tier.toPeople}
                    onChange={(e) => updateTier(i, "toPeople", e.target.value)}
                    placeholder="بدون حد"
                    className="w-20 rounded-lg border border-black/10 px-2 py-1 text-sm outline-none focus:border-brand-blue"
                  />
                  <span className="text-sm text-neutral-500">فرد → أضف</span>
                  <input
                    type="number"
                    value={tier.margin}
                    onChange={(e) => updateTier(i, "margin", e.target.value)}
                    className="w-28 rounded-lg border border-black/10 px-2 py-1 text-sm outline-none focus:border-brand-blue"
                  />
                  <button
                    onClick={() => removeTier(i)}
                    className="rounded-lg px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    حذف
                  </button>
                </div>
              ))}
              <button
                onClick={addTier}
                className="mt-1 w-fit rounded-lg border border-black/10 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
              >
                + إضافة شريحة
              </button>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="mt-6 rounded-lg bg-brand-blue px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
          >
            {savingSettings ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      </section>
    </div>
  );
}
