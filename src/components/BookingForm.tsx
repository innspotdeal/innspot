"use client";

import { useState, type FormEvent } from "react";
import type { CorporateProgram } from "@/data/programs";
import { ADDON_OPTIONS, type AddonKey } from "@/data/addons";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";
import ResultCard, { type PriceResult } from "@/components/ResultCard";

export default function BookingForm({
  programs,
  initialProgramId = "",
}: {
  programs: CorporateProgram[];
  initialProgramId?: string;
}) {
  const { lang } = useLanguage();
  const t = translations[lang].bookingForm;

  const [programId, setProgramId] = useState(initialProgramId);
  const [people, setPeople] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<AddonKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PriceResult | null>(null);

  function toggleAddon(key: AddonKey) {
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
            onChange={(e) => setProgramId(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm focus:border-brand-blue focus:outline-none"
          >
            <option value="">{t.programPlaceholder}</option>
            {programs
              .filter((program) => !program.isCustom)
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
          <span className="mb-2 block text-sm font-bold text-neutral-800">{t.addonsLabel}</span>
          <div className="flex flex-col gap-2">
            {ADDON_OPTIONS.map((addon) => (
              <label
                key={addon.key}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 hover:border-brand-orange/50"
              >
                <input
                  type="checkbox"
                  checked={selectedAddons.includes(addon.key)}
                  onChange={() => toggleAddon(addon.key)}
                  className="h-4 w-4 accent-brand-orange"
                />
                {lang === "en" ? addon.labelEn : addon.label}
              </label>
            ))}
          </div>
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
    </div>
  );
}
