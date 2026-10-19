"use client";

import Image from "next/image";
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

  // إنستجرام وفيسبوك من أيقونات الهوية، والباقي مالوش أيقونة فيها فبيتلوّن بالأزرق
  const socials = [
    {
      href: buildWhatsAppLink(t.inquiry(name)),
      label: t.footer.whatsapp,
      icon: <i className="fi fi-brands-whatsapp leading-none" aria-hidden="true" />,
    },
    {
      href: siteConfig.social.facebook,
      label: t.footer.facebook,
      icon: <Image src="/brand/icons/facebook.png" alt="" width={185} height={164} className="h-7 w-auto" />,
    },
    {
      href: siteConfig.social.instagram,
      label: t.footer.instagram,
      icon: <Image src="/brand/icons/instagram.png" alt="" width={184} height={172} className="h-7 w-auto" />,
    },
    {
      href: siteConfig.social.linkedin,
      label: t.footer.linkedin,
      icon: <i className="fi fi-brands-linkedin leading-none" aria-hidden="true" />,
    },
    {
      href: siteConfig.social.tiktok,
      label: t.footer.tiktok,
      icon: <i className="fi fi-brands-tik-tok leading-none" aria-hidden="true" />,
    },
  ];

  return (
    <footer className="mt-auto bg-brand-blue text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-4">
            <Image
              src="/brand/footer-badge.png"
              alt=""
              width={320}
              height={320}
              className="size-20 shrink-0 rounded-full ring-4 ring-brand-orange-light"
            />
            <Image src="/brand/wordmark-cream.png" alt={name} width={514} height={226} className="h-12 w-auto" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/80">{tagline}</p>
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
            <li>
              <span dir="ltr">{siteConfig.contact.phone}</span>
            </li>
            <li>{siteConfig.contact.email}</li>
            <li>{siteConfig.contact.address}</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex size-11 items-center justify-center rounded-xl bg-brand-cream text-xl text-brand-blue transition hover:-translate-y-0.5"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} {name}. {t.footer.rightsReserved}
      </div>
    </footer>
  );
}
