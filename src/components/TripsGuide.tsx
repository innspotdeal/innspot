"use client";

import CheckIcon from "@/components/CheckIcon";
import ProgramCard from "@/components/ProgramCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { CorporateProgram } from "@/data/programs";
import { tripsGuide } from "@/data/trips-guide";
import { useLanguage } from "@/lib/language-context";

type Safari = (typeof tripsGuide)["ar"]["safari"];

// ✓ للسفاري الكاملة (اللي بنعملها) و✗ للجولة (اللي مش بنعملها)
function Mark({ ok }: { ok: boolean }) {
  return ok ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 size-5 shrink-0 fill-current text-brand-blue-light">
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 size-5 shrink-0 fill-current text-brand-orange">
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

// سفاري جولة قصاد سفاري كاملة: جدول على الشاشات الكبيرة، وكارتين تحت بعض على الموبايل
function SafariComparison({ safari }: { safari: Safari }) {
  const cells = [
    { key: "tour" as const, ok: false },
    { key: "full" as const, ok: true },
  ];
  return (
    <>
      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-brand-blue/15 sm:block">
        <table className="w-full text-sm">
          <thead className="bg-brand-blue text-white">
            <tr>
              <td className="w-1/5" />
              {cells.map(({ key, ok }, index) => (
                <th key={key} scope="col" className="px-4 py-3 text-start">
                  <span className="block text-base font-extrabold">{safari.columns[index]}</span>
                  <span className={`mt-0.5 block text-xs font-bold ${ok ? "text-brand-cream" : "text-brand-orange-light"}`}>
                    {safari.columnNotes[index]}
                  </span>
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
                {cells.map(({ key, ok }) => (
                  <td key={key} className="px-4 py-3">
                    <span className={`flex gap-2 leading-relaxed ${ok ? "font-semibold text-neutral-800" : "text-neutral-500"}`}>
                      <Mark ok={ok} />
                      {row[key]}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 sm:hidden">
        {cells.map(({ key, ok }, index) => (
          <div key={key} className="overflow-hidden rounded-2xl border border-brand-blue/15 bg-white">
            <p className="bg-brand-blue px-4 py-3 text-white">
              <span className="block font-extrabold">{safari.columns[index]}</span>
              <span className={`block text-xs font-bold ${ok ? "text-brand-cream" : "text-brand-orange-light"}`}>
                {safari.columnNotes[index]}
              </span>
            </p>
            <dl className="divide-y divide-brand-blue/10">
              {safari.rows.map((row) => (
                <div key={row.label} className="px-4 py-3">
                  <dt className="text-sm font-bold text-brand-blue">{row.label}</dt>
                  <dd className={`mt-0.5 flex gap-2 text-sm leading-relaxed ${ok ? "font-semibold text-neutral-800" : "text-neutral-500"}`}>
                    <Mark ok={ok} />
                    {row[key]}
                  </dd>
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
  fixedPrograms,
  customProgram,
}: {
  fixedPrograms: CorporateProgram[];
  customProgram: CorporateProgram | null;
}) {
  const { lang } = useLanguage();
  const g = tripsGuide[lang];
  const number = (n: number) => n.toLocaleString(lang === "en" ? "en-US" : "ar-EG");

  // البرامج الجاهزة من غير سعر (الصفحة بتركّز على الجودة)، والكاستم معاهم لو شغال
  const programs = [
    ...fixedPrograms.map((program) => ({ program, accent: "var(--color-brand-orange)" })),
    ...(customProgram ? [{ program: customProgram, accent: "var(--color-brand-blue)" }] : []),
  ];
  const programsGrid =
    programs.length > 2 ? "sm:grid-cols-2 lg:grid-cols-3" : programs.length === 2 ? "md:grid-cols-2" : "max-w-xl";

  return (
    <main dir={lang === "en" ? "ltr" : "rtl"} className="mx-auto mt-16 max-w-5xl sm:px-9.5">
      {/* على الورق كل البرامج شبه بعض — الفرق في اللي مش مكتوب */}
      <section>
        <h2 className="max-w-3xl text-4xl/tight font-extrabold text-brand-blue sm:text-5xl/tight">{g.paper.heading}</h2>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-neutral-700">{g.paper.text}</p>
        <div className="mt-8 grid gap-5 md:grid-cols-[1fr_1.7fr]">
          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-sm font-extrabold text-neutral-500">{g.paper.writtenLabel}</p>
            <ul className="mt-4 flex flex-col gap-3">
              {g.paper.written.map((item) => (
                <li key={item} className="flex items-center gap-3 text-lg font-bold text-neutral-800">
                  <CheckIcon /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-brand-blue p-6">
            <p className="text-sm font-extrabold text-brand-orange-light">{g.paper.unwrittenLabel}</p>
            <ul className="mt-4 flex flex-col gap-3">
              {g.paper.unwritten.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed text-white/90">
                  <span aria-hidden="true" className="mt-2.5 size-2 shrink-0 rounded-full bg-brand-orange-light" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-lg font-bold leading-relaxed text-brand-blue">{g.paper.closing}</p>
      </section>

      {/* اللي بيقلق المسؤول عن الرحلة، وإحنا بنتعامل معاه إزاي */}
      <section className="mt-20">
        <h2 className="text-3xl font-extrabold text-brand-blue sm:text-4xl">{g.pains.heading}</h2>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-neutral-700">{g.pains.intro}</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {g.pains.items.map((item, index) => (
            <div key={item.title} className="flex flex-col rounded-3xl bg-white p-6 shadow-sm">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-orange text-lg font-extrabold text-white">
                {number(index + 1)}
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-brand-blue">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-neutral-700">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* التفاصيل اللي بنختارها بنفسنا */}
      <section className="mt-20">
        <h2 className="text-3xl font-extrabold text-brand-blue sm:text-4xl">{g.details.heading}</h2>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-neutral-700">{g.details.intro}</p>
        <ol className="mt-6 flex flex-col gap-5">
          {g.details.stages.map((stage) => (
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
      </section>

      <section className="mt-12 rounded-3xl border-2 border-dashed border-brand-orange-light bg-white p-7 sm:p-8">
        <h2 className="text-2xl font-extrabold text-brand-blue">{g.beyond.heading}</h2>
        <p className="mt-3 text-lg leading-relaxed text-neutral-700">{g.beyond.text}</p>
      </section>

      {/* البرامج الجاهزة — من غير سعر */}
      {programs.length > 0 && (
        <section id="programs" className="mt-20 scroll-mt-8">
          <h2 className="text-3xl font-extrabold text-brand-blue sm:text-4xl">{g.programs.heading}</h2>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-neutral-700">{g.programs.text}</p>
          <div className={`mt-8 grid gap-8 ${programsGrid}`}>
            {programs.map(({ program, accent }) => (
              <ProgramCard key={program.id} program={program} accent={accent} hidePrice />
            ))}
          </div>
        </section>
      )}

      {/* كلّمنا على واتساب */}
      <section className="my-16 rounded-[2rem] bg-brand-blue px-6 py-12 text-center sm:px-12">
        <h2 className="text-3xl font-extrabold text-brand-cream sm:text-4xl">{g.start.heading}</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">{g.start.text}</p>
        <WhatsAppButton message={g.start.message} label={g.start.button} className="mt-8 px-7 py-3.5 text-base" />
      </section>
    </main>
  );
}
