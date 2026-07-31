"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";

export type Lang = "ar" | "en";

const STORAGE_KEY = "innspot-lang";

type LanguageContextValue = {
  lang: Lang;
  toggleLang: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function applyDocumentLang(lang: Lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// القيمة الحقيقية في المتصفح (تُقرأ من localStorage)
function getSnapshot(): Lang {
  return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "ar";
}

// القيمة أثناء الرندر على السيرفر (لا يوجد localStorage) — يجب أن تطابق القيمة الافتراضية في layout.tsx
// لتفادي Hydration mismatch، ثم تتحدث تلقائيًا فور وصول الصفحة للمتصفح
function getServerSnapshot(): Lang {
  return "ar";
}

function setStoredLang(lang: Lang) {
  window.localStorage.setItem(STORAGE_KEY, lang);
  listeners.forEach((listener) => listener());
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    applyDocumentLang(lang);
  }, [lang]);

  function toggleLang() {
    setStoredLang(lang === "ar" ? "en" : "ar");
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
