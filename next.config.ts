import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // معطّل في التطوير المحلي فقط: قرص المشروع (Lexar) بصيغة exFAT، وكاش مُحسِّن
    // الصور في Next.js بيتعارض مع ملفات AppleDouble (._) على النوع ده من الأقراص.
    // على Vercel المشكلة دي مش موجودة، فبيشتغل التحسين عادي — وده مهم جدًا هنا
    // لأن صور الفيلات حجمها كبير (أكتر من 140 ميجا).
    unoptimized: process.env.NODE_ENV === "development",
    // الصور اللي بترفع من لوحة الأدمن بتتخزن على Vercel Blob (نطاق فرعي عشوائي
    // تحت public.blob.vercel-storage.com) — لازم يتضاف هنا عشان next/image يقدر يعرضها
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // يسمح بفتح سيرفر التطوير من جهاز تاني على نفس الشبكة (زي الموبايل) عبر عنوان الشبكة المحلي
  // ملاحظة: العنوان بيتغير مع تغيير الشبكة/الراوتر — ضيف العنوان الجديد هنا لو اتغير
  allowedDevOrigins: ["172.20.10.3", "192.168.1.2", "192.168.1.*"],
};

export default nextConfig;
