import { usePathname } from "next/navigation";
import { siteConfig } from "@/data/site";

// دالة مساعدة لإنشاء رابط واتساب مع رسالة جاهزة مسبقًا
// تُستخدم في كل أزرار "تواصل معنا / احجز" على الموقع
export function buildWhatsAppLink(message: string, phone: string = siteConfig.whatsappNumber): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// رقم الواتساب حسب الصفحة: رحلات الشركات وبرامجها ليها رقمها، وأفراد وإقامة ليها رقمها،
// والباقي (الرئيسية وعن إنسبوت) على الرقم الأساسي
export function useWhatsAppNumber(): string {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/corporate-trips")) return siteConfig.corporateWhatsappNumber;
  if (pathname.startsWith("/accommodation")) return siteConfig.accommodationWhatsappNumber;
  return siteConfig.whatsappNumber;
}
