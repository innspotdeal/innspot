import { siteConfig } from "@/data/site";

// دالة مساعدة لإنشاء رابط واتساب مع رسالة جاهزة مسبقًا
// تُستخدم في كل أزرار "تواصل معنا / احجز" على الموقع
export function buildWhatsAppLink(message: string, phone: string = siteConfig.whatsappNumber): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
