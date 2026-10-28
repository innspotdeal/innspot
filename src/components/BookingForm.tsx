"use client";

import { useState, type FormEvent } from "react";
import type { CorporateProgram } from "@/data/programs";
import type { PublicAddon } from "@/lib/program-addons";
import type { SafariMode } from "@/lib/pricing";
import type { SafariInfo } from "@/lib/safari-info";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";
import ResultCard, { type PriceResult } from "@/components/ResultCard";
import AddonDetails from "@/components/AddonDetails";

// السفاري مش إضافة من القايمة: معرّف لصفحة صورها وتفاصيلها بس، مستحيل يتكرر مع إضافة
const SAFARI_ID = "__safari";

export default function BookingForm({
  programs,
  programAddons,
  safariModes,
  safariInfo,
  initialProgramId = "",
}: {
  programs: CorporateProgram[];
  // لكل برنامج: الإضافات المشمولة والمتاحة للاختيار (من غير أسعار)
  programAddons: Record<string, PublicAddon[]>;
  // لكل برنامج فيه سفاري: مشمولة، أو اختيارية يعلّم عليها العميل
  safariModes: Record<string, SafariMode>;
  safariInfo: SafariInfo;
  initialProgramId?: string;
}) {
  const { lang } = useLanguage();
  const t = translations[lang].bookingForm;

  const [programId, setProgramId] = useState(initialProgramId);
  const [people, setPeople] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [includeSafari, setIncludeSafari] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PriceResult | null>(null);
  // الإضافة اللي صفحة صورها وتفاصيلها مفتوحة
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const addons = programAddons[programId] ?? [];
  const includedAddons = addons.filter((a) => a.included);
  const optionalAddons = addons.filter((a) => !a.included);
  const addonName = (a: PublicAddon) => (lang === "en" ? a.nameEn || a.name : a.name);
  const hasDetails = (a: PublicAddon) => Boolean(a.images.length || (lang === "en" ? a.descriptionEn || a.description : a.description));
  const safariMode = safariModes[programId];
  // السفاري بتفتح نفس صفحة «الصور والتفاصيل» بتاعة الإضافات
  const safari: PublicAddon = {
    id: SAFARI_ID,
    name: t.safariName,
    nameEn: t.safariName,
    included: safariMode === "included",
    ...safariInfo,
  };
  const shown = detailsId === SAFARI_ID ? safari : (addons.find((a) => a.id === detailsId) ?? null);

  function toggleAddon(key: string) {
    setSelectedAddons((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!programId) {
      setError(t.errorSelectProgram);
      return;
    }

    const peopleNumber = Number(people);
    if (!Number.isInteger(peopleNumber) || peopleNumber <= 0) {
      setError(t.errorPeopleInvalid);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId,
          people: peopleNumber,
          addons: selectedAddons,
          includeSafari: safariMode === "optional" && includeSafari,
          lang,
        }),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error ?? t.errorGeneric);
        return;
      }

      setResult(data);
    } catch {
      setError(t.errorNetwork);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-extrabold text-brand-blue">{t.heading}</h2>
      <p className="mt-2 text-sm text-neutral-600">{t.subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <div>
          <label htmlFor="programId" className="mb-2 block text-sm font-bold text-neutral-800">
            {t.programLabel}
          </label>
          <select
            id="programId"
            value={programId}
            onChange={(e) => {
              setProgramId(e.target.value);
              // كل برنامج ليه إضافاته — الاختيار القديم ممكن ميكونش متاح في الجديد
              setSelectedAddons([]);
              setIncludeSafari(false);
              setResult(null);
            }}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm focus:border-brand-blue focus:outline-none"
          >
            <option value="">{t.programPlaceholder}</option>
            {programs
              // المخصّص مالوش سعر ثابت، والتذاكر سعرها ثابت من غير حاسبة
              .filter((program) => !program.isCustom && !program.isTicket)
              .map((program) => (
                <option key={program.id} value={program.id}>
                  {lang === "en" ? program.nameEn : program.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label htmlFor="people" className="mb-2 block text-sm font-bold text-neutral-800">
            {t.peopleLabel}
          </label>
          <input
            id="people"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            placeholder={t.peoplePlaceholder}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm focus:border-brand-blue focus:outline-none"
          />
        </div>

        <div>
          {/* السفاري هي الاختيار الوحيد (المالك، 2026-10-29): الباص مش اختيار للعميل،
              بيتحسب لوحده لو البرنامج «محتاج باص». الاختيارية بتتحسب بعدد العربيات */}
          {safariMode === "optional" && (
            <div className="mb-5">
              <span className="mb-2 block text-sm font-bold text-neutral-800">{t.safariLabel}</span>
              <div className="rounded-xl border border-neutral-300 text-sm">
                <label className="flex cursor-pointer items-center gap-3 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={includeSafari}
                    onChange={(e) => setIncludeSafari(e.target.checked)}
                    className="size-4 accent-brand-orange"
                  />
                  <span className="font-medium text-neutral-700">{t.safariInclude}</span>
                </label>
                {/* تحت الكلام مش جنبه: الاسم طويل ومكانه على الموبايل ضيق */}
                {hasDetails(safari) && (
                  <button
                    type="button"
                    onClick={() => setDetailsId(SAFARI_ID)}
                    className="-mt-1 mb-3 ms-11 text-xs font-bold text-brand-blue underline underline-offset-2"
                  >
                    {t.addonDetails}
                  </button>
                )}
              </div>
            </div>
          )}

          {(includedAddons.length > 0 || safariMode === "included") && (
            <div className="mb-5">
              <span className="mb-2 block text-sm font-bold text-neutral-800">{t.includedLabel}</span>
              <div className="flex flex-wrap gap-2">
                {[...(safariMode === "included" ? [safari] : []), ...includedAddons].map((addon) => (
                  <span
                    key={addon.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue/5 px-3 py-1.5 text-sm font-semibold text-brand-blue"
                  >
                    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4 fill-current">
                      <path d="M8 13.2 4.8 10l-1.1 1.1L8 15.4l8.3-8.3-1.1-1.1z" />
                    </svg>
                    {addonName(addon)}
                    {hasDetails(addon) && (
                      <button
                        type="button"
                        onClick={() => setDetailsId(addon.id)}
                        className="ms-1 text-xs font-bold underline underline-offset-2"
                      >
                        {t.addonDetails}
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {optionalAddons.length > 0 && (
            <>
              <span className="mb-2 block text-sm font-bold text-neutral-800">{t.addonsLabel}</span>
              <div className="flex flex-col gap-2">
                {optionalAddons.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-center gap-2 rounded-xl border border-neutral-200 pe-2 text-sm font-medium text-neutral-700 hover:border-brand-orange/50"
                  >
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedAddons.includes(addon.id)}
                        onChange={() => toggleAddon(addon.id)}
                        className="h-4 w-4 accent-brand-orange"
                      />
                      {addonName(addon)}
                    </label>
                    {hasDetails(addon) && (
                      <button
                        type="button"
                        onClick={() => setDetailsId(addon.id)}
                        className="shrink-0 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-600 transition hover:border-brand-blue hover:text-brand-blue"
                      >
                        {t.addonDetails}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-brand-orange px-8 text-base font-extrabold text-white shadow-lg transition hover:bg-brand-orange-dark disabled:opacity-60"
        >
          {loading ? t.submitLoading : t.submitIdle}
        </button>
      </form>

      {result && (
        <div className="mt-8">
          <ResultCard result={result} />
        </div>
      )}

      {shown && (
        <AddonDetails
          addon={shown}
          isEn={lang === "en"}
          selected={shown.id === SAFARI_ID ? includeSafari : selectedAddons.includes(shown.id)}
          onAdd={() => {
            if (shown.id === SAFARI_ID) setIncludeSafari(true);
            else if (!selectedAddons.includes(shown.id)) toggleAddon(shown.id);
            setDetailsId(null);
          }}
          onClose={() => setDetailsId(null)}
          labels={{
            close: t.addonClose,
            add: t.addonAdd,
            added: t.addonAdded,
            included: t.addonIncluded,
            photo: t.addonPhoto,
          }}
        />
      )}
    </div>
  );
}
