"use client";

import WhatsAppButton from "@/components/WhatsAppButton";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";

export type PriceResult = {
  programName: string;
  people: number;
  addonLabels: string[];
  // الإضافات المشمولة في سعر البرنامج نفسه (زي المركب في رحلة الباص)
  includedLabels?: string[];
  pricePerPerson: number;
  total: number;
};

export default function ResultCard({ result }: { result: PriceResult }) {
  const { lang } = useLanguage();
  const t = translations[lang].resultCard;
  const { programName, people, addonLabels, includedLabels = [], pricePerPerson, total } = result;

  const join = (items: string[]) => items.join(lang === "en" ? ", " : "، ");
  const addonsText = addonLabels.length ? join(addonLabels) : t.whatsappNoAddons;

  const whatsappMessage = [
    t.whatsappConfirmHeading,
    t.whatsappProgram(programName),
    t.whatsappPeople(people),
    ...(includedLabels.length ? [t.whatsappIncluded(join(includedLabels))] : []),
    t.whatsappAddons(addonsText),
    t.whatsappTotal(t.currency(total)),
  ].join("\n");

  return (
    <div className="rounded-3xl border border-brand-orange/20 bg-brand-orange/5 p-6 sm:p-8">
      <h3 className="text-center text-lg font-bold text-brand-blue">{t.title}</h3>

      <div className="mt-4 text-center">
        <p className="text-sm font-semibold text-neutral-600">{t.pricePerPerson}</p>
        <p className="text-4xl font-extrabold text-brand-orange sm:text-5xl">
          {t.currency(pricePerPerson)}
        </p>
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl bg-white p-5 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-neutral-600">{t.programLabel}</span>
          <span className="font-bold text-brand-blue">{programName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-neutral-600">{t.peopleLabel}</span>
          <span className="font-bold text-brand-blue">{people}</span>
        </div>
        {includedLabels.length > 0 && (
          <div className="flex items-start justify-between gap-4">
            <span className="font-semibold text-neutral-600">{t.includedLabel}</span>
            <span className="text-left font-bold text-brand-blue">{join(includedLabels)}</span>
          </div>
        )}
        <div className="flex items-start justify-between gap-4">
          <span className="font-semibold text-neutral-600">{t.addonsLabel}</span>
          <span className="text-left font-bold text-brand-blue">
            {addonLabels.length ? join(addonLabels) : t.noAddons}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-black/5 pt-3">
          <span className="font-semibold text-neutral-600">{t.totalLabel}</span>
          <span className="text-lg font-extrabold text-brand-blue">{t.currency(total)}</span>
        </div>
      </div>

      <div className="mt-6">
        <WhatsAppButton
          message={whatsappMessage}
          label={t.confirmCta}
          className="w-full py-3.5 text-base"
        />
      </div>
    </div>
  );
}
