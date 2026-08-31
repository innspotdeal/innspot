// ============================================================
// نصوص السياسات الثابتة اللي بتظهر في إيصال الحجز (كلها إنجليزي —
// الإيصال نفسه إنجليزي بالكامل حتى لو واجهة الأدمن عربي)
// عدّل هنا بس عشان تتغيّر في كل الإيصالات المُرسَلة بعد كده
// ============================================================

export const RECEIPT_HERO_INTRO =
  "We've reserved your stay. Everything you need is below — keep this email handy on the day.";

export const RECEIPT_NEED_CHANGE_NOTE = "Need to change something? Just reply — we answer fast.";

export const RECEIPT_DOCUMENTS_TITLE = "Documents we need before arrival";

export const RECEIPT_DOCUMENTS_ITEMS: { strong: string; text: string }[] = [
  {
    strong: "Egyptian guests:",
    text: "a clear photo of the national ID — front and back — for every adult.",
  },
  {
    strong: "Non-Egyptian guests:",
    text: "a photo of the passport page for every adult.",
  },
  {
    strong: "Couples and families:",
    text: "a marriage certificate or family record, as proof of relationship.",
  },
];

export const RECEIPT_DOCUMENTS_NOTE =
  'Send them on WhatsApp at least <strong style="color:#1F1F1F;">48 hours before check-in</strong>. Check-in can\'t be completed without them — this is required by the property.';

export const RECEIPT_POLICIES_TITLE = "Booking policies";

export const RECEIPT_CANCELLATION_TITLE = "CANCELLATION";

export const RECEIPT_CANCELLATION_RULES: { when: string; color: string; text: string }[] = [
  { when: "7+ days before", color: "#2E7D4F", text: "Full refund, deposit included." },
  { when: "Less than 7 days", color: "#B23B14", text: "The deposit is non-refundable." },
];

export const RECEIPT_DAMAGES_TITLE = "DAMAGES";

export const RECEIPT_DAMAGES_TEXT =
  "Any damage to the property or its contents during your stay is charged to the guest in full, assessed on check-out.";

export const RECEIPT_BOTTOM_NOTES = [
  "We'll send you the exact location pin the day before.",
  "The remaining balance is paid on arrival — cash or Instapay.",
];

export const RECEIPT_FOOTER_NOTE = "This email confirms a booking you made with InnSpot.";

// نفس اللوجو المستخدم فعليًا في الموقع (public/images/logo.png) — أول ما الدومين
// يتربط هيبقى شغال أوتوماتيك من غير أي رفع إضافي
export const RECEIPT_DEFAULT_LOGO_URL = "https://innspotagency.com/images/logo.png";
