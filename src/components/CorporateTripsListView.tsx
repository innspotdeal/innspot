"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ProgramsSlider from "@/components/ProgramsSlider";
import { clients } from "@/data/clients";
import type { CorporateProgram } from "@/data/programs";
import { navLinks } from "@/data/site";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";

const PILL_EASE =
  "ease-[linear(0,0.029_0.8%,0.13_1.8%,0.908_7.2%,1.051_9.1%,1.112_11.2%,1.116_12.2%,1.106_13.4%,1.007_19.5%,0.987_23.1%,1.001_35%,1)]";

function ArrowRightIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
    </svg>
  );
}

export default function CorporateTripsListView({
  corporatePrograms,
}: {
  corporatePrograms: CorporateProgram[];
}) {
  const { lang, toggleLang } = useLanguage();
  const t = translations[lang];
  const tp = t.corporateTripsPage;
  const [menuOpen, setMenuOpen] = useState(false);
  const textDir = lang === "en" ? "ltr" : "rtl";

  return (
    // dir="ltr" عشان تكوين التصميم (المواضع والحواف الدائرية) يفضل مطابق للتصميم المرجعي،
    // والنصوص العربية جواه بتاخد dir="rtl" لوحدها
    <div dir="ltr" className="px-3.5 pt-3.5 text-[#090909]">
      <nav className="relative z-5 mx-auto flex max-w-5xl items-center justify-between overflow-hidden">
        <Link
          href="/"
          className="relative flex w-full max-w-45 self-stretch items-center gap-1.5 rounded-br-4xl bg-white px-5 after:absolute after:-bottom-1 after:-right-1 after:-z-5 after:h-1/2 after:w-1/2 after:bg-[#183fad] after:content-['']"
        >
          <Image
            src="/images/logo.png"
            alt="Innspot"
            width={1649}
            height={712}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <div className="flex flex-1 items-center justify-end gap-4 rounded-t-4xl bg-[#183fad] p-3.5 text-white min-[480px]:justify-between">
          <div className="hidden md:block" />

          <ul className="hidden items-center gap-6 py-2.5 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-[#F1BF0A]">
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-9">
              <path
                fillRule="evenodd"
                d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={toggleLang}
            className={`relative hidden cursor-pointer items-center gap-2 overflow-hidden rounded-full bg-[#F1BF0A] py-1.5 pl-1.5 pr-4 whitespace-nowrap text-[#090909] after:absolute after:left-1.5 after:top-1/2 after:h-9 after:w-9 after:-translate-y-1/2 after:rounded-full after:bg-white after:transition-[width] after:duration-1600 ${PILL_EASE} after:content-[''] hover:after:left-0 hover:after:h-full hover:after:w-full min-[480px]:flex`}
          >
            <div className="relative z-10 rounded-full p-1.5">
              <ArrowRightIcon />
            </div>
            <span className="relative z-10">{t.languageToggle}</span>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <ul className="mx-auto flex max-w-5xl flex-col gap-1 bg-[#183fad] px-4 pb-3 text-white md:hidden">
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

      <header className="relative z-0 mx-auto max-w-5xl overflow-hidden rounded-b-4xl rounded-tl-4xl bg-[#183fad] px-3.5 pb-3.5 pt-8 text-white sm:pt-14">
        <p
          aria-hidden="true"
          className="mx-auto w-full max-w-[60rem] text-center text-[16vw] leading-none font-extrabold lowercase select-none sm:text-[7.5rem]"
        >
          innspot
        </p>

        <div className="mt-6 rounded-4xl bg-[#4565bc] pt-7 sm:mt-12">
          <div className="relative z-10 flex flex-col justify-between rounded-b-4xl px-3 pb-6 sm:flex-row sm:items-stretch sm:bg-[#4565bc] sm:px-6">
            <div className="flex flex-col justify-between">
              <h1 className="text-5xl text-[#F1BF0A]">{tp.title}</h1>
              <p dir={textDir} className="z-200 mb-6 mt-2 sm:mb-0 sm:mt-0 sm:max-w-xs">
                {tp.subtitle}
              </p>
            </div>

            {/* شعارات الشركات اللي نفّذنا لها رحلات (مصدرها data/clients.ts) */}
            <div className="rounded-2xl bg-[#abb9de] p-4 text-[#090909] sm:max-w-[185px]">
              <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-0">
                <div className="my-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {clients.map((client) => (
                    <span
                      key={client.logo}
                      title={client.name}
                      className="inline-flex size-10 items-center justify-center overflow-hidden rounded-full bg-white outline -outline-offset-1 outline-black/5"
                    >
                      <Image
                        src={client.logo}
                        alt={client.name}
                        width={200}
                        height={200}
                        className="size-full object-contain p-1"
                      />
                    </span>
                  ))}
                </div>
              </div>
              <p dir={textDir} className="text-sm">
                {tp.trustedByHeading}
              </p>
            </div>
          </div>

          <div className="relative z-5 flex items-stretch justify-between before:absolute before:-top-1/2 before:right-0 before:-z-5 before:hidden before:h-20 before:w-24 before:bg-[#183fad] before:content-[''] after:absolute after:-top-1/2 after:left-0 after:-z-5 after:hidden after:h-20 after:w-24 after:bg-[#183fad] after:content-[''] sm:before:block sm:after:block">
            <div className="relative rounded-bl-4xl rounded-tr-4xl pb-3 pl-3 after:absolute after:bottom-0 after:-right-1/2 after:-z-5 after:hidden after:h-1/2 after:w-full after:bg-[#183fad] after:content-[''] sm:bg-[#183fad] sm:p-6 sm:after:block">
              <a
                href="#programs"
                className={`relative flex items-center gap-2 overflow-hidden rounded-full bg-[#F1BF0A] py-1.5 pl-1.5 pr-4 whitespace-nowrap text-[#090909] after:absolute after:left-1.5 after:top-1/2 after:h-9 after:w-9 after:-translate-y-1/2 after:rounded-full after:bg-white after:transition-[width] after:duration-1600 ${PILL_EASE} after:content-[''] hover:after:left-0 hover:after:h-full hover:after:w-full`}
              >
                <div className="relative z-10 rounded-full p-1.5">
                  <ArrowRightIcon />
                </div>
                <span className="relative z-10">{tp.exploreCta}</span>
              </a>
            </div>
            <div className="relative z-10 hidden flex-1 rounded-b-4xl bg-[#4565bc] sm:block" />
            <div className="relative hidden items-center gap-3 rounded-br-4xl rounded-tl-4xl bg-[#183fad] p-6 after:absolute after:bottom-0 after:-left-1/2 after:-z-5 after:h-1/2 after:w-full after:bg-[#183fad] after:content-[''] sm:flex" />
          </div>
        </div>

        <Image
          src="/images/trips-hero-person.png"
          alt=""
          width={2684}
          height={3542}
          priority
          draggable={false}
          className="pointer-events-none absolute bottom-6 left-[53%] z-100 hidden h-[55vw] max-h-140 w-auto -translate-x-1/2 object-contain select-none md:block"
          style={{ filter: "drop-shadow(5px 5px 10px rgba(0, 0, 0, 0.5))" }}
        />
      </header>

      <main id="programs" className="mx-auto mt-20 max-w-5xl scroll-mt-8 sm:px-9.5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-10">
          <h2 dir={textDir} className="flex-1 text-5xl/14 font-extrabold md:text-6xl/18">
            {tp.programsHeading}
          </h2>
          <div className="flex-1 space-y-4">
            <p dir={textDir}>{tp.subtitle}</p>
          </div>
        </div>

        <div className="mt-10">
          <ProgramsSlider programs={corporatePrograms} />
        </div>
      </main>
    </div>
  );
}
