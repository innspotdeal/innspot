"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ArrowIcon from "@/components/ArrowIcon";
import TripsGuide from "@/components/TripsGuide";
import { clients } from "@/data/clients";
import type { CorporateProgram } from "@/data/programs";
import { navLinks } from "@/data/site";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";

const PILL_EASE =
  "ease-[linear(0,0.029_0.8%,0.13_1.8%,0.908_7.2%,1.051_9.1%,1.112_11.2%,1.116_12.2%,1.106_13.4%,1.007_19.5%,0.987_23.1%,1.001_35%,1)]";

export default function CorporateTripsListView({
  fixedProgram,
  customProgram,
  fixedStartingPrice,
}: {
  fixedProgram: CorporateProgram | null;
  customProgram: CorporateProgram | null;
  fixedStartingPrice?: number;
}) {
  const { lang, toggleLang } = useLanguage();
  const t = translations[lang];
  const tp = t.corporateTripsPage;
  const [menuOpen, setMenuOpen] = useState(false);
  const textDir = lang === "en" ? "ltr" : "rtl";

  // شعارات الشركات اللي نفّذنا لها رحلات (مصدرها data/clients.ts)
  const trustedBy = (
    <div dir={textDir} className="flex flex-col items-center gap-2">
      <p className="text-sm font-semibold text-white/85">{tp.trustedByHeading}</p>
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {clients.map((client) => (
          <li
            key={client.logo}
            title={client.name}
            className="flex size-11 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm"
          >
            <Image src={client.logo} alt={client.name} width={200} height={200} className="size-full object-contain p-1.5" />
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    // dir="ltr" عشان تكوين التصميم (المواضع والحواف الدائرية) يفضل مطابق للتصميم المرجعي،
    // والنصوص العربية جواه بتاخد dir="rtl" لوحدها
    <div dir="ltr" className="px-3.5 pt-3.5 text-[#090909]">
      <nav className="relative z-5 mx-auto flex max-w-5xl items-center justify-between overflow-hidden">
        <Link
          href="/"
          className="relative flex w-full max-w-45 self-stretch items-center gap-1.5 rounded-br-4xl bg-brand-cream px-5 after:absolute after:-bottom-1 after:-right-1 after:-z-5 after:h-1/2 after:w-1/2 after:bg-brand-blue after:content-['']"
        >
          <Image
            src="/brand/wordmark.png"
            alt="Innspot"
            width={514}
            height={226}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <div className="flex flex-1 items-center justify-end gap-4 rounded-t-4xl bg-brand-blue p-3.5 text-white min-[480px]:justify-between">
          <div className="hidden md:block" />

          <ul className="hidden items-center gap-6 py-2.5 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-brand-orange-light">
                  {t.nav[link.key]}
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="cursor-pointer rounded md:hidden"
            aria-label="Toggle Menu"
            aria-expanded={menuOpen}
          >
            <Image src="/brand/icons/menu-cream.png" alt="" width={166} height={124} className="h-7 w-auto" />
          </button>

          <button
            type="button"
            onClick={toggleLang}
            className={`relative hidden cursor-pointer items-center gap-2 overflow-hidden rounded-full bg-brand-orange-light py-1.5 pl-1.5 pr-4 whitespace-nowrap text-[#090909] after:absolute after:left-1.5 after:top-1/2 after:h-9 after:w-9 after:-translate-y-1/2 after:rounded-full after:bg-white after:transition-[width] after:duration-1600 ${PILL_EASE} after:content-[''] hover:after:left-0 hover:after:h-full hover:after:w-full min-[480px]:flex`}
          >
            <div className="relative z-10 rounded-full p-1.5">
              <ArrowIcon direction="next" followText={false} className="h-5 w-auto" />
            </div>
            <span className="relative z-10">{t.languageToggle}</span>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <ul className="mx-auto flex max-w-5xl flex-col gap-1 bg-brand-blue px-4 pb-3 text-white md:hidden">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 hover:bg-white/10"
              >
                {t.nav[link.key]}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <header className="relative z-0 mx-auto max-w-5xl overflow-hidden rounded-b-4xl rounded-tl-4xl bg-brand-blue px-3.5 pb-3.5 pt-3.5 text-white">
        <div className="rounded-4xl bg-brand-blue-light pt-7">
          <div className="relative z-10 flex flex-col gap-8 rounded-b-4xl px-3 pb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:bg-brand-blue-light sm:px-6 md:flex-nowrap">
            <div className="flex flex-col gap-4 sm:max-w-md sm:flex-1 sm:basis-0">
              <h1 className="text-5xl text-brand-cream">{tp.title}</h1>
              <p dir={textDir}>{tp.subtitle}</p>
            </div>

            {/* اللوجو على كارت كريمي مايل، زي المربع المايل اللي في اللوجو نفسه */}
            <div className="mx-auto w-52 shrink-0 -rotate-3 rounded-3xl bg-brand-cream p-5 shadow-xl sm:mx-0 sm:me-4 sm:w-48 md:w-60">
              <Image src="/brand/logo.png" alt="Innspot" width={640} height={744} priority className="h-auto w-full" />
            </div>

            {/* الشركات تحت لوجو إنسبوت: هنا على الموبايل والتابلت، وفي الشريط اللي تحت على الشاشات الكبيرة */}
            <div className="w-full sm:flex sm:justify-end md:hidden">{trustedBy}</div>
          </div>

          <div className="relative z-5 flex items-stretch justify-between after:absolute after:-top-1/2 after:left-0 after:-z-5 after:hidden after:h-20 after:w-24 after:bg-brand-blue after:content-[''] sm:after:block">
            <div className="relative rounded-bl-4xl rounded-tr-4xl pb-3 pl-3 after:absolute after:bottom-0 after:-right-1/2 after:-z-5 after:hidden after:h-1/2 after:w-full after:bg-brand-blue after:content-[''] sm:bg-brand-blue sm:p-6 sm:after:block">
              <a
                href="#programs"
                className={`relative flex items-center gap-2 overflow-hidden rounded-full bg-brand-orange-light py-1.5 pl-1.5 pr-4 whitespace-nowrap text-[#090909] after:absolute after:left-1.5 after:top-1/2 after:h-9 after:w-9 after:-translate-y-1/2 after:rounded-full after:bg-white after:transition-[width] after:duration-1600 ${PILL_EASE} after:content-[''] hover:after:left-0 hover:after:h-full hover:after:w-full`}
              >
                <div className="relative z-10 rounded-full p-1.5">
                  <ArrowIcon direction="next" followText={false} className="h-5 w-auto" />
                </div>
                <span className="relative z-10">{tp.exploreCta}</span>
              </a>
            </div>
            <div className="relative z-10 hidden flex-1 items-center justify-end rounded-b-4xl bg-brand-blue-light ps-6 pe-3 sm:flex">
              <div className="hidden md:block">{trustedBy}</div>
            </div>
          </div>
        </div>
      </header>

      <TripsGuide fixedProgram={fixedProgram} customProgram={customProgram} fixedStartingPrice={fixedStartingPrice} />
    </div>
  );
}
