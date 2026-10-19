"use client";

import CheckIcon from "@/components/CheckIcon";
import ProgramCard from "@/components/ProgramCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { CorporateProgram } from "@/data/programs";
import { tripsGuide } from "@/data/trips-guide";
import { useLanguage } from "@/lib/language-context";

type Safari = (typeof tripsGuide)["ar"]["safari"];

// سفاري جولة قصاد سفاري كاملة: جدول على الشاشات الكبيرة، وكارتين تحت بعض على الموبايل
function SafariComparison({ safari }: { safari: Safari }) {
  return (
    <>
      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-brand-blue/15 sm:block">
        <table className="w-full text-sm">
          <thead className="bg-brand-blue text-white">
            <tr>
              <td className="w-1/5" />
              {safari.columns.map((column) => (
                <th key={column} scope="col" className="px-4 py-3 text-start text-base font-extrabold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safari.rows.map((row, index) => (
              <tr key={row.label} className={index % 2 ? "bg-brand-cream/70" : "bg-white"}>
                <th scope="row" className="px-4 py-3 text-start font-bold text-brand-blue">
                  {row.label}
                </th>
                <td className="px-4 py-3 leading-relaxed text-neutral-700">{row.tour}</td>
                <td className="px-4 py-3 leading-relaxed text-neutral-700">{row.full}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 sm:hidden">
        {(["tour", "full"] as const).map((key, index) => (
          <div key={key} className="overflow-hidden rounded-2xl border border-brand-blue/15 bg-white">
            <p className="bg-brand-blue px-4 py-3 font-extrabold text-white">{safari.columns[index]}</p>
            <dl className="divide-y divide-brand-blue/10">
              {safari.rows.map((row) => (
                <div key={row.label} className="px-4 py-3">
                  <dt className="text-sm font-bold text-brand-blue">{row.label}</dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-neutral-700">{row[key]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}

export default function TripsGuide({
  fixedProgram,
  customProgram,
  fixedStartingPrice,
}: {
  fixedProgram: CorporateProgram | null;
  customProgram: CorporateProgram | null;
  fixedStartingPrice?: number;
}) {
  const { lang } = useLanguage();
  const g = tripsGuide[lang];

  const choices = [
    { choice: g.choose.fixed, program: fixedProgram, startingPrice: fixedStartingPrice, accent: "var(--color-brand-orange)" },
    { choice: g.choose.custom, program: customProgram, startingPrice: undefined, accent: "var(--color-brand-blue)" },
  ];

  return (
    <main dir={lang === "en" ? "ltr" : "rtl"} className="mx-auto mt-16 max-w-5xl sm:px-9.5">
      {/* قبل ما تشوف البرامج: إزاي بنحسب سعر الرحلة */}
      <section>
        <h2 className="max-w-3xl text-4xl/tight font-extrabold text-brand-blue sm:text-5xl/tight">{g.intro.heading}</h2>
        <div className="mt-5 max-w-3xl space-y-3 text-lg leading-relaxed text-neutral-700">
          {g.intro.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-8 text-xl font-extrabold text-brand-orange">{g.intro.leadIn}</p>
      </section>

      <ol className="mt-4 flex flex-col gap-5">
        {g.stages.map((stage) => (
          <li key={stage.number} className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-orange text-xl font-extrabold text-white">
                {stage.number}
              </span>
              <h3 className="text-2xl font-extrabold text-brand-blue">{stage.title}</h3>
            </div>

            {stage.text && <p className="mt-4 leading-relaxed text-neutral-700">{stage.text}</p>}

            {stage.points && (
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                {stage.points.map((point) => (
                  <div key={point.label} className="rounded-2xl bg-brand-cream p-4">
                    <dt className="font-extrabold text-brand-blue">{point.label}</dt>
                    <dd className="mt-1 leading-relaxed text-neutral-700">{point.text}</dd>
                  </div>
                ))}
              </dl>
            )}

            {stage.safari && <SafariComparison safari={g.safari} />}

            {stage.after && (
              <div className="mt-6 border-s-4 border-brand-orange-light ps-4">
                <p className="font-extrabold text-brand-blue">{stage.after.label}</p>
                <p className="mt-1 leading-relaxed text-neutral-700">{stage.after.text}</p>
              </div>
            )}
          </li>
        ))}
      </ol>

      <section className="mt-10 rounded-3xl bg-brand-blue p-7 sm:p-10">
        <h2 className="text-2xl font-extrabold text-brand-cream sm:text-3xl">{g.paperGap.heading}</h2>
        <p className="mt-4 text-lg leading-relaxed text-white/90">{g.paperGap.text}</p>
      </section>

      {/* اختار الطريقة: البرنامج الثابت والكاستم، وتحت كل واحد الكارت بتاعه */}
      <section id="programs" className="mt-20 scroll-mt-8">
        <h2 className="text-4xl font-extrabold text-brand-blue sm:text-5xl">{g.choose.heading}</h2>
        <div className="mt-8 grid gap-12 md:grid-cols-2 md:gap-8">
          {choices.map(({ choice, program, startingPrice, accent }) => (
            <div key={choice.title} className="flex flex-col">
              <p className="text-sm font-extrabold text-brand-orange">{choice.tag}</p>
              <h3 className="mt-1 text-3xl font-extrabold text-brand-blue">{choice.title}</h3>
              <div className="mt-3 space-y-3 leading-relaxed text-neutral-700">
                {choice.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {program && (
                <div className="mt-auto pt-6">
                  <ProgramCard program={program} startingPrice={startingPrice} accent={accent} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl border-2 border-dashed border-brand-orange-light bg-white p-7 sm:p-8">
        <h2 className="text-2xl font-extrabold text-brand-blue">{g.beyond.heading}</h2>
        <p className="mt-3 text-lg leading-relaxed text-neutral-700">{g.beyond.text}</p>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-extrabold text-brand-blue sm:text-4xl">{g.easy.heading}</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {g.easy.points.map((point) => (
            <li key={point} className="flex gap-3 rounded-3xl bg-white p-6 shadow-sm">
              <CheckIcon />
              <p className="leading-relaxed text-neutral-700">{point}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="my-16 rounded-[2rem] bg-brand-blue px-6 py-12 text-center sm:px-12">
        <h2 className="text-3xl font-extrabold text-brand-cream sm:text-4xl">{g.start.heading}</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">{g.start.text}</p>
        <WhatsAppButton message={g.start.message} label={g.start.button} className="mt-8 px-7 py-3.5 text-base" />
      </section>
    </main>
  );
}
