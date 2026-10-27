"use client";

import Image from "next/image";
import Link from "next/link";
import { siteConfig, navLinks } from "@/data/site";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";
import { buildWhatsAppLink, useWhatsAppNumber } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/lib/meta-pixel";

// رمز سوشيال على طريقة أيقونات الهوية: رمز أزرق فوق مربع برتقالي مايل
function BrandGlyph({ icon }: { icon: string }) {
  return (
    <span className="relative grid size-7 place-items-center">
      <span aria-hidden="true" className="absolute inset-0.5 -rotate-6 rounded-[5px] bg-brand-orange-light" />
      <i className={`fi ${icon} relative text-lg leading-none text-brand-blue`} aria-hidden="true" />
    </span>
  );
}

export default function Footer() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const name = lang === "en" ? siteConfig.nameEn : siteConfig.name;
  const tagline = lang === "en" ? siteConfig.taglineEn : siteConfig.tagline;
  // أيقونة الواتساب بتروح لرقم الصفحة (رحلات الشركات وأفراد وإقامة ليهم أرقامهم)
  const whatsappNumber = useWhatsAppNumber();

  // إنستجرام وفيسبوك من أيقونات الهوية المرسومة، والباقي بنفس شكلها.
  // أي حساب لينكه فاضي في data/site.ts مش بيظهر
  const socials = [
    {
      href: buildWhatsAppLink(t.inquiry(name), whatsappNumber),
      label: t.footer.whatsapp,
      icon: <BrandGlyph icon="fi-brands-whatsapp" />,
      onClick: trackWhatsAppClick,
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
    { href: siteConfig.social.linkedin, label: t.footer.linkedin, icon: <BrandGlyph icon="fi-brands-linkedin" /> },
    { href: siteConfig.social.tiktok, label: t.footer.tiktok, icon: <BrandGlyph icon="fi-brands-tik-tok" /> },
  ].filter((social) => social.href);

  const contacts = [
    { icon: "fi-rr-phone-call", text: siteConfig.contact.phone, href: `tel:+${siteConfig.whatsappNumber}`, ltr: true },
    { icon: "fi-rr-envelope", text: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}`, ltr: true },
    { icon: "fi-rr-marker", text: siteConfig.contact.address },
  ];

  return (
    <footer className="mt-auto bg-brand-blue text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
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
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/80">{tagline}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                onClick={"onClick" in social ? social.onClick : undefined}
                className="flex size-11 items-center justify-center rounded-xl bg-brand-cream transition hover:-translate-y-0.5"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-brand-cream">{t.footer.quickLinks}</h4>
          <ul className="mt-4 flex flex-col gap-2.5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/80 transition hover:text-white">
                  {t.nav[link.key]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-brand-cream">{t.footer.contactUs}</h4>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-white/80">
            {contacts.map((contact) => {
              const text = <span dir={contact.ltr ? "ltr" : undefined}>{contact.text}</span>;
              return (
                <li key={contact.icon} className="flex items-center gap-3">
                  <i className={`fi ${contact.icon} text-base leading-none text-brand-orange-light`} aria-hidden="true" />
                  {contact.href ? (
                    <a href={contact.href} className="transition hover:text-white">
                      {text}
                    </a>
                  ) : (
                    text
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} {name}. {t.footer.rightsReserved}
      </div>
    </footer>
  );
}
