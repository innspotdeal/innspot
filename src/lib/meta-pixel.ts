import { whatsAppSection } from "@/lib/whatsapp";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// ضغطة زرار واتساب في صفحات الشركات = Lead (طلب عرض سعر لرحلة شركة)، وفي باقي الموقع = Contact،
// فكامبين الشركات وكامبين الأفراد كل واحدة بتتحسّن على حدثها من نفس البكسل.
// content_category بيقول القسم بالظبط (corporate / accommodation / general).
// لو البكسل مش شغال (رقمه فاضي في data/site.ts) مفيش حاجة بتحصل
export function trackWhatsAppClick() {
  const section = whatsAppSection(window.location.pathname);
  window.fbq?.("track", section === "corporate" ? "Lead" : "Contact", { content_category: section });
}
