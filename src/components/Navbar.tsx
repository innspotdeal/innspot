"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navLinks } from "@/data/site";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { lang, toggleLang } = useLanguage();
  const t = translations[lang];

  // صفحة رحلات الشركات ليها هيدر خاص بيها جوه الصفحة نفسها (بتصميم مختلف)،
  // فبنخفي الهيدر العام هنا عشان ميتكررش
  if (pathname === "/corporate-trips") return null;

  const onBlue = false;

  return (
    <header
      className={`sticky top-0 z-50 ${
        onBlue ? "bg-brand-blue" : "border-b border-black/5 bg-white/95 backdrop-blur"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className={`flex items-center ${onBlue ? "rounded-2xl bg-white px-4 py-2" : ""}`}
        >
          <Image
            src="/images/logo.png"
            alt="Innspot"
            width={1649}
            height={712}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        {/* روابط التنقل - نسخة الشاشات الكبيرة */}
        <div className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm font-semibold transition ${
                      onBlue
                        ? `hover:text-white ${active ? "text-white" : "text-white/75"}`
                        : `hover:text-brand-orange ${active ? "text-brand-orange" : "text-brand-blue"}`
                    }`}
                  >
                    {t.nav[link.key]}
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={toggleLang}
            className={`rounded-full border px-4 py-1.5 text-sm font-bold transition ${
              onBlue
                ? "border-white/40 text-white hover:bg-white/10"
                : "border-brand-blue/20 text-brand-blue hover:bg-brand-blue/5"
            }`}
          >
            {t.languageToggle}
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleLang}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
              onBlue ? "border-white/40 text-white" : "border-brand-blue/20 text-brand-blue"
            }`}
          >
            {t.languageToggle}
          </button>

          {/* زر فتح القائمة - نسخة الموبايل */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              onBlue ? "text-white" : "text-brand-blue"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
              {open ? (
                <path d="M6.4 19L5 17.6l5.6-5.6L5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6z" />
              ) : (
                <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* القائمة المنسدلة للموبايل */}
      {open && (
        <ul
          className={`flex flex-col gap-1 px-4 py-3 md:hidden ${
            onBlue ? "bg-brand-blue" : "border-t border-black/5 bg-white"
          }`}
        >
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm font-semibold ${
                    onBlue
                      ? `text-white ${active ? "bg-white/15" : "hover:bg-white/10"}`
                      : active
                        ? "bg-brand-orange/10 text-brand-orange"
                        : "text-brand-blue hover:bg-brand-blue/5"
                  }`}
                >
                  {t.nav[link.key]}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </header>
  );
}
