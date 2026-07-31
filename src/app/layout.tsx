import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/data/site";
import { LanguageProvider } from "@/lib/language-context";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: `${siteConfig.name} | ${siteConfig.nameEn}`,
  description: siteConfig.tagline,
};

// سكريبت صغير يعمل قبل أي رسم للصفحة، يقرأ اللغة المحفوظة سابقًا من localStorage
// ويضبط اتجاه الصفحة (dir/lang) فورًا، لتفادي "ومضة" اتجاه خاطئ عند إعادة التحميل
const NO_FLASH_SCRIPT = `
try {
  var l = localStorage.getItem("innspot-lang");
  if (l === "en") {
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  }
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn-uicons.flaticon.com/2.6.0/uicons-bold-rounded/css/uicons-bold-rounded.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-straight/css/uicons-regular-straight.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn-uicons.flaticon.com/2.6.0/uicons-solid-straight/css/uicons-solid-straight.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn-uicons.flaticon.com/2.6.0/uicons-solid-rounded/css/uicons-solid-rounded.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn-uicons.flaticon.com/2.6.0/uicons-brands/css/uicons-brands.css"
        />
      </head>
      <body className="flex min-h-full flex-col bg-white text-neutral-900">
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
        <LanguageProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
