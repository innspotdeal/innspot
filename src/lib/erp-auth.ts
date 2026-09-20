import crypto from "crypto";
import "server-only";

// مصادقة الـ ERP: بدل كوكي الجلسة (اللي بتتعمل من متصفح بني آدم)، الـ ERP
// بيبعت مفتاح ثابت في هيدر X-API-Key مع كل طلب.
//
// ⚠️ المفتاح ده لازم يفضل على سيرفر الـ ERP بس، ولا يوصل للمتصفح أبدًا مهما كانت
// الظروف — أي كود بيتنفذ في المتصفح ممنوع يشوفه. عشان كده مفيش CORS مفتوح على
// الراوتس دي: الطلبات لازم تيجي من سيرفر لسيرفر.
export const ERP_API_KEY_HEADER = "x-api-key";

// الهيدر اللي بنمرّر بيه اسم العميل من proxy.ts للراوت نفسه.
// proxy.ts بيمسحه من أي طلب داخل قبل ما يحطه، فوجوده معناه إن المفتاح اتحقق منه
export const ERP_CLIENT_HEADER = "x-erp-client";

// الحد الأدنى لطول المفتاح — أي حاجة أقصر من كده سهل تتخمّن
const MIN_KEY_LENGTH = 32;

export type ErpClient = { name: string };

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  return aBuf.length === bBuf.length && crypto.timingSafeEqual(aBuf, bBuf);
}

// بيدعم أكتر من مفتاح مع بعض عن طريق متغير البيئة ERP_API_KEYS
// الصيغة: "erp-prod:المفتاح_الطويل,erp-staging:مفتاح_تاني"
// الاسم اللي قبل النقطتين بيظهر في اللوجز بس — مش بيتحقق منه
function getClients(): { name: string; key: string }[] {
  const raw = process.env.ERP_API_KEYS;
  if (!raw) return [];

  return raw
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const separator = pair.indexOf(":");
      if (separator === -1) return null;
      const name = pair.slice(0, separator).trim();
      const key = pair.slice(separator + 1).trim();
      if (!name || key.length < MIN_KEY_LENGTH) return null;
      return { name, key };
    })
    .filter((c): c is { name: string; key: string } => c !== null);
}

// بيرجّع بيانات العميل لو المفتاح صح، وnull لو غلط أو مش موجود.
// بيعدّي على كل المفاتيح مهما حصل عشان وقت الرد ما يفرقش بين
// "مفتاح غلط" و"مفتاح قريب من الصح"
export function verifyErpKey(key: string | null | undefined): ErpClient | null {
  if (!key) return null;

  let matched: ErpClient | null = null;
  for (const client of getClients()) {
    if (safeEqual(key, client.key)) matched = { name: client.name };
  }

  return matched;
}

export function isErpConfigured(): boolean {
  return getClients().length > 0;
}
