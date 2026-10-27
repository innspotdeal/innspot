import { usePathname } from "next/navigation";
import { siteConfig } from "@/data/site";

// دالة مساعدة لإنشاء رابط واتساب مع رسالة جاهزة مسبقًا
// تُستخدم في كل أزرار "تواصل معنا / احجز" على الموقع
export function buildWhatsAppLink(message: string, phone: string = siteConfig.whatsappNumber): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// كل صفحة تابعة لقسم: رحلات الشركات وبرامجها، أفراد وإقامة، أو باقي الموقع (الرئيسية وعن إنسبوت).
// القسم بيحدد رقم الواتساب، وبيحدد الحدث اللي بيتبعت للبكسل (lib/meta-pixel.ts)
export type WhatsAppSection = "corporate" | "accommodation" | "general";

export function whatsAppSection(pathname: string): WhatsAppSection {
  if (pathname.startsWith("/corporate-trips")) return "corporate";
  if (pathname.startsWith("/accommodation")) return "accommodation";
  return "general";
}

const SECTION_NUMBERS: Record<WhatsAppSection, string> = {
  corporate: siteConfig.corporateWhatsappNumber,
  accommodation: siteConfig.accommodationWhatsappNumber,
  general: siteConfig.whatsappNumber,
};

// رقم الواتساب حسب قسم الصفحة
export function useWhatsAppNumber(): string {
  return SECTION_NUMBERS[whatsAppSection(usePathname() ?? "")];
}
