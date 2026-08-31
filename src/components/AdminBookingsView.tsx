"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildReceiptHtml,
  computeBookingTotals,
  formatMoney,
  type ReceiptData,
} from "@/lib/receipt";
import { RECEIPT_DEFAULT_LOGO_URL } from "@/data/booking-policies";

type FormState = {
  reference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  property: string;
  location: string;
  checkIn: string;
  checkInTime: string;
  checkOut: string;
  checkOutTime: string;
  guests: string;
  nights: string;
  accommodation: string;
  extraLabel: string;
  extraAmount: string;
  paid: string;
  paidMethod: string;
  senderName: string;
  senderTitle: string;
  domain: string;
  logoUrl: string;
  whatsapp: string;
};

// الحقول دي بس بتتحفظ في localStorage (بيانات ثابتة مش بتتغير كل حجز)
const STICKY_KEYS = [
  "senderName",
  "senderTitle",
  "domain",
  "logoUrl",
  "whatsapp",
  "location",
  "extraLabel",
  "paidMethod",
  "checkInTime",
  "checkOutTime",
] as const;

const STORAGE_KEY = "innspot_booking_defaults";

const emptyForm: Omit<FormState, "reference"> = {
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  property: "",
  location: "Fayoum, Egypt",
  checkIn: "",
  checkInTime: "1:00 PM",
  checkOut: "",
  checkOutTime: "11:00 AM",
  guests: "",
  nights: "2 nights",
  accommodation: "0",
  extraLabel: "Safari day",
  extraAmount: "0",
  paid: "0",
  paidMethod: "deposit, Instapay",
  senderName: "Ali Mohamed",
  senderTitle: "Reservations Manager",
  domain: "innspotagency.com",
  logoUrl: RECEIPT_DEFAULT_LOGO_URL,
  whatsapp: "201061840111",
};

export default function AdminBookingsView({ initialReference }: { initialReference: string }) {
  // رقم المرجع بيتولّد على السيرفر (صفحة الأدمن) عشان يبقى ثابت من أول تحميل من غير وميض
  const [form, setForm] = useState<FormState>({ ...emptyForm, reference: initialReference });
  const [toast, setToast] = useState("");
  const receiptRef = useRef<HTMLDivElement>(null);

  // البيانات الثابتة (المُرسِل، الدومين...) بتتحمّل من localStorage — مصدر خارجي
  // متاح في المتصفح بس، فمفيش طريقة نقراه غير جوه useEffect بعد أول render
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<FormState>;
      // تعمّد: ده تحميل مرة واحدة بس من localStorage بعد أول render لتفادي
      // hydration mismatch (السيرفر ملوش وصول لـ localStorage) — مش قيمة متزامنة
      // باستمرار زي ما قاعدة set-state-in-effect بتفترض، فتعطيلها هنا مقصود
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((prev) => ({ ...prev, ...saved }));
    } catch {
      // لو localStorage مش متاح، منعملش حاجة — الفورم هيفضل بالقيم الافتراضية
    }
  }, []);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function flash(msg: string, durationMs = 2600) {
    setToast(msg);
    setTimeout(() => setToast(""), durationMs);
  }

  const receiptData: ReceiptData = useMemo(
    () => ({
      reference: form.reference,
      guestName: form.guestName,
      property: form.property,
      location: form.location,
      checkIn: form.checkIn,
      checkInTime: form.checkInTime,
      checkOut: form.checkOut,
      checkOutTime: form.checkOutTime,
      guests: form.guests,
      nights: form.nights,
      accommodation: Number(form.accommodation) || 0,
      extraLabel: form.extraLabel,
      extraAmount: Number(form.extraAmount) || 0,
      paid: Number(form.paid) || 0,
      paidMethod: form.paidMethod,
      senderName: form.senderName,
      senderTitle: form.senderTitle,
      domain: form.domain,
      logoUrl: form.logoUrl,
      whatsapp: form.whatsapp,
    }),
    [form]
  );

  const { total, remaining } = computeBookingTotals({
    accommodation: receiptData.accommodation,
    extraAmount: receiptData.extraAmount,
    paid: receiptData.paid,
  });

  const receiptHtml = useMemo(() => buildReceiptHtml(receiptData), [receiptData]);

  // بالظبط زي selectReceipt() في الأداة الأصلية: تحديد بالـ Range/Selection API
  // (مش navigator.clipboard.writeText عشان مش بيحافظ على التنسيق)
  function selectReceipt() {
    const node = receiptRef.current;
    if (!node) return;
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(node);
    sel?.removeAllRanges();
    sel?.addRange(range);
    // الـ toast بيتأخر تيك واحد (setTimeout 0) عشان تحديث الـ state ما يعملش
    // re-render يمسح التحديد اللي عملناه لسه — التحديد نفسه لازم يفضل زي ما هو
    setTimeout(() => flash("اتحدد ← دوس Cmd+C دلوقتي"), 0);
  }

  function saveDefaults() {
    try {
      const toSave: Partial<FormState> = {};
      for (const key of STICKY_KEYS) toSave[key] = form[key];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      flash("اتحفظت", 1800);
    } catch {
      alert("المتصفح مش سامح بالحفظ هنا — البيانات هتفضل مكتوبة في الصفحة عادي.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold text-brand-blue sm:text-3xl">الحجوزات</h1>
      <p className="mt-2 text-sm text-neutral-500">
        املا بيانات الحجز، دوس &quot;حدّد الإيصال&quot;، بعدين Cmd/Ctrl+C والصقه في نافذة الإيميل.
      </p>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* الفورم */}
        <div className="w-full rounded-2xl border border-black/10 bg-white p-6 lg:w-[400px] lg:shrink-0">
          <Section title="الحجز">
            <Field label="رقم المرجع" value={form.reference} onChange={(v) => set("reference", v)} />
            <Field label="اسم العميل" value={form.guestName} onChange={(v) => set("guestName", v)} />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="إيميل العميل"
                value={form.guestEmail}
                onChange={(v) => set("guestEmail", v)}
                type="email"
              />
              <Field
                label="موبايل العميل"
                value={form.guestPhone}
                onChange={(v) => set("guestPhone", v)}
                type="tel"
              />
            </div>
            <p className="-mt-1 text-[11px] text-neutral-400">
              للاستخدام الداخلي بس (هتتبعت لـ HubSpot لاحقًا) — مش هتظهر في الإيصال المنسوخ.
            </p>
            <Field label="اسم الوحدة / الرحلة" value={form.property} onChange={(v) => set("property", v)} />
            <Field label="المكان" value={form.location} onChange={(v) => set("location", v)} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="الوصول" value={form.checkIn} onChange={(v) => set("checkIn", v)} />
              <Field label="الساعة" value={form.checkInTime} onChange={(v) => set("checkInTime", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="المغادرة" value={form.checkOut} onChange={(v) => set("checkOut", v)} />
              <Field label="الساعة" value={form.checkOutTime} onChange={(v) => set("checkOutTime", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="عدد الضيوف" value={form.guests} onChange={(v) => set("guests", v)} />
              <Field label="عدد الليالي" value={form.nights} onChange={(v) => set("nights", v)} />
            </div>
          </Section>

          <Section title="الحساب">
            <Field
              label="قيمة الإقامة (جنيه)"
              value={form.accommodation}
              onChange={(v) => set("accommodation", v)}
              type="number"
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label="بند إضافي" value={form.extraLabel} onChange={(v) => set("extraLabel", v)} />
              <Field
                label="قيمته"
                value={form.extraAmount}
                onChange={(v) => set("extraAmount", v)}
                type="number"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="المدفوع" value={form.paid} onChange={(v) => set("paid", v)} type="number" />
              <Field label="طريقة الدفع" value={form.paidMethod} onChange={(v) => set("paidMethod", v)} />
            </div>

            <div className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm">
              <div className="flex justify-between py-0.5">
                <span className="text-neutral-500">الإجمالي</span>
                <span>{formatMoney(total)} EGP</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-neutral-500">المدفوع</span>
                <span>{formatMoney(receiptData.paid)} EGP</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-neutral-500">المتبقي</span>
                <span className="font-extrabold text-brand-orange">{formatMoney(remaining)} EGP</span>
              </div>
            </div>
          </Section>

          <Section title="المُرسِل — بيانات ثابتة">
            <Field label="الاسم" value={form.senderName} onChange={(v) => set("senderName", v)} />
            <Field label="المنصب" value={form.senderTitle} onChange={(v) => set("senderTitle", v)} />
            <Field label="الدومين" value={form.domain} onChange={(v) => set("domain", v)} />
            <Field label="رابط اللوجو" value={form.logoUrl} onChange={(v) => set("logoUrl", v)} />
            <Field label="واتساب (بدون +)" value={form.whatsapp} onChange={(v) => set("whatsapp", v)} />
          </Section>

          <button
            onClick={selectReceipt}
            className="mt-2 w-full rounded-lg bg-brand-orange px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-orange/90"
          >
            حدّد الإيصال ← ثم Cmd/Ctrl+C
          </button>
          <button
            onClick={saveDefaults}
            className="mt-2 w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50"
          >
            احفظ البيانات الثابتة
          </button>
          <p className="mt-3 text-center text-xs text-neutral-400">
            البيانات الثابتة بتتحفظ في هذا المتصفح بس، مش بتتشارك مع أجهزة تانية.
          </p>

          {toast && (
            <p className="mt-3 rounded-lg bg-neutral-900 px-3 py-2 text-center text-xs font-semibold text-white">
              {toast}
            </p>
          )}
        </div>

        {/* معاينة الإيصال — إنجليزي LTR معزول تمامًا عن باقي الصفحة */}
        <div className="min-w-0 flex-1 overflow-x-auto rounded-2xl bg-[#F1EFEA] p-2">
          <div ref={receiptRef} dangerouslySetInnerHTML={{ __html: receiptHtml }} />
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="mb-5 border-0 p-0">
      <legend className="mb-2 text-[11px] font-bold uppercase tracking-wider text-brand-orange">
        {title}
      </legend>
      <div className="flex flex-col gap-3">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-neutral-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir="auto"
        className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-blue"
      />
    </div>
  );
}
