"use client";

import Link from "next/link";
import { siteConfig, navLinks } from "@/data/site";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function Footer() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const name = lang === "en" ? siteConfig.nameEn : siteConfig.name;
  const tagline = lang === "en" ? siteConfig.taglineEn : siteConfig.tagline;

  return (
    <footer className="mt-auto bg-brand-blue text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-extrabold">{name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/80">{tagline}</p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white/90">{t.footer.quickLinks}</h4>
          <ul className="mt-3 flex flex-col gap-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/80 hover:text-white">
                  {t.nav[link.key]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white/90">{t.footer.contactUs}</h4>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-white/80">
            <li>{siteConfig.contact.phone}</li>
            <li>{siteConfig.contact.email}</li>
            <li>{siteConfig.contact.address}</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={buildWhatsAppLink(t.inquiry(name))}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.footer.whatsapp}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white/80 transition hover:bg-white/20 hover:text-white"
            >
              <i className="fi fi-brands-whatsapp" aria-hidden="true" />
            </a>
            <a
              href={siteConfig.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.footer.facebook}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white/80 transition hover:bg-white/20 hover:text-white"
            >
              <i className="fi fi-brands-facebook" aria-hidden="true" />
            </a>
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.footer.instagram}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white/80 transition hover:bg-white/20 hover:text-white"
            >
              <i className="fi fi-brands-instagram" aria-hidden="true" />
            </a>
            <a
              href={siteConfig.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.footer.linkedin}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white/80 transition hover:bg-white/20 hover:text-white"
            >
              <i className="fi fi-brands-linkedin" aria-hidden="true" />
            </a>
            <a
              href={siteConfig.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.footer.tiktok}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white/80 transition hover:bg-white/20 hover:text-white"
            >
              <i className="fi fi-brands-tik-tok" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} {name}. {t.footer.rightsReserved}
      </div>
    </footer>
  );
}
