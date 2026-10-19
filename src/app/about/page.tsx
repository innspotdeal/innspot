import type { Metadata } from "next";
import AboutView from "@/components/AboutView";
import { aboutContent } from "@/data/about";

export const metadata: Metadata = {
  title: "عن إنسبوت | حجز فنادق وترتيب رحلات داخل مصر",
  description:
    "إنسبوت شركة تسويق إلكتروني لحجز الفنادق وترتيب الرحلات داخل جمهورية مصر العربية. بدأنا من الفيوم، وبنرتّب لك الإقامة ورحلات الشركات من أول الحجز لآخر تفصيلة.",
};

// الأسئلة الشائعة لجوجل (FAQPage) — بالعربي زي الـ title والـ description
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: aboutContent.ar.faq.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <AboutView />
    </>
  );
}
