# ربط الـ ERP بموقع InnSpot

الموقع بيفتح API محمي بمفتاح، والـ ERP بيستخدمه كلوحة تحكم كاملة.
كل حاجة كانت بتتعمل من `/admin` تقدر تتعمل من الـ ERP.

قاعدة البيانات بتفضل ملك الموقع، والـ ERP بيتحكم فيها من برّه — يعني أي تغيير
في الـ ERP مش هيكسر الموقع، والعكس.

---

## 1. المصادقة

كل طلب لازم يبعت المفتاح في هيدر `X-API-Key`:

```
X-API-Key: <المفتاح>
```

- المفتاح صح → الطلب بيعدي بصلاحية أدمن كاملة.
- المفتاح ناقص أو غلط → `401 {"ok": false, "error": "غير مصرح"}`.

### ⚠️ قواعد أمان لازمة

1. **المفتاح على سيرفر الـ ERP بس.** ممنوع يوصل للمتصفح مهما كانت الظروف.
   في Next.js: استخدمه في Server Components أو Route Handlers أو Server Actions فقط —
   مش في أي ملف فيه `"use client"`.
2. **مفيش CORS على الراوتس دي عن قصد**، عشان المفتاح ما يتسربش من كود متصفح.
   الطلبات لازم تكون من سيرفر لسيرفر.
3. **المفتاح في متغيرات البيئة بس** — لا في الكود ولا في git.
4. الحد الأدنى لطول المفتاح 32 حرف؛ أي مفتاح أقصر بيتجاهل تمامًا.

### توليد مفتاح

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### تفعيله على الموقع

متغير البيئة `ERP_API_KEYS` على Vercel، بصيغة `اسم:مفتاح` مفصولين بفاصلة:

```
ERP_API_KEYS="erp-prod:xxxxxxxx,erp-staging:yyyyyyyy"
```

الاسم للّوجز بس. تعدد المفاتيح بيخلّيك تبدّل مفتاح من غير ما توقّف التاني
(ضيف الجديد → غيّر الـ ERP → شيل القديم).

### فحص الاتصال

```
GET /api/admin/ping
→ 200 {"ok": true, "client": "erp-prod", "time": "..."}
```

---

## 2. الـ Endpoints

الرابط الأساسي: `https://innspotagency.com`

| المجال | قراءة | إضافة | تعديل | حذف |
|---|---|---|---|---|
| الفلل | `GET /api/admin/villas` | `POST` | `PATCH /api/admin/villas/{id}` | `DELETE` |
| الفنادق | `GET /api/admin/hotels` | `POST` | `PATCH /api/admin/hotels/{id}` | `DELETE` |
| الأنشطة | `GET /api/admin/activities` | `POST` | `PATCH /api/admin/activities/{id}` | `DELETE` |
| برامج الشركات | `GET /api/admin/programs` | `POST` | `PATCH /api/admin/programs/{id}` | `DELETE` |
| الانتقالات | `GET /api/admin/transport` | `POST` | `PATCH /api/admin/transport/{id}` | `DELETE` |
| خيارات الكاستم | `GET /api/admin/custom-trip` | `POST` | `PATCH /api/admin/custom-trip/{id}` | `DELETE` |
| التسعير | `GET /api/admin/pricing` | — | `PATCH /api/admin/pricing` | — |
| رفع صورة | — | `POST /api/admin/upload` | — | — |

### شكل الردود

- **القراءة** بترجّع الحقل بصيغة **الجمع**: `{"ok": true, "villas": [...]}`
- **الإضافة والتعديل** بيرجّعوا الحقل بصيغة **المفرد**: `{"ok": true, "villa": {...}}`
- **الحذف** بيرجّع `{"ok": true}`
- **الخطأ** بيرجّع `{"ok": false, "error": "الرسالة بالعربي"}`

| الكود | المعنى |
|---|---|
| `200` / `201` | تمام |
| `400` | بيانات ناقصة أو غلط (الرسالة بتقول إيه) |
| `401` | المفتاح ناقص أو غلط |
| `404` | العنصر مش موجود |

### ملاحظات مهمة

- **المعرّف (`id`) اختياري وقت الإضافة** — لو سبته، بيتولّد من الاسم الإنجليزي.
  لو بعته وكان موجود قبل كده بترجع `400`.
- **الـ `PATCH` جزئي**: الحقول اللي تبعتها بس هي اللي بتتغير.
- **ترتيب الصور مهم**: أول صورة في `images[]` هي صورة الغلاف.
- **`PATCH /api/admin/pricing`** بياخد أي مجموعة من `programPricing` /
  `programTiers` / `addonPrices` / `settings`، وبيحدّث اللي بعته بس.
- **رفع الصور** `multipart/form-data` بحقل اسمه `file`. الحد 8 ميجا،
  والأنواع: jpeg / png / webp / avif / gif. بيرجّع `{"ok": true, "url": "..."}`
  والرابط ده هو اللي بتحطه في `images[]`.

### شرائح الأسعار

`toPeople: 0` معناها **"وما فوق"** (شريحة مفتوحة).

```json
{
  "programTiers": {
    "innspot-classic": {
      "breakfast": [
        { "fromPeople": 10, "toPeople": 19, "price": 90 },
        { "fromPeople": 20, "toPeople": 0,  "price": 75 }
      ]
    }
  }
}
```

نفس القاعدة في `settings.marginTiers` بس بـ `margin` بدل `price`.

### الانتقالات

`needsBus` و `needsSafari` **منفصلين تمامًا ومش مرتبطين** — رحلة السفاري ممكن
تحتاج الاتنين. الباصات بتتحدد أوتوماتيك حسب العدد من `transport_vehicles`،
والسفاري سعره ثابت للعربية مهما كان اللي فيها.

---

## 3. الكلاينت الجاهز

في [`erp-client/innspot.ts`](../erp-client/innspot.ts) — انسخه في مشروع الـ ERP.

```ts
import { createInnspotClient } from "@/lib/innspot";

const erp = createInnspotClient(); // بيقرا INNSPOT_API_URL و INNSPOT_API_KEY

const villas = await erp.villas.list();

const villa = await erp.villas.create({
  name: "فيلا الورد", nameEn: "Rose Villa",
  description: "...", descriptionEn: "...",
  images: [], rooms: 4, beds: 8, hasPool: true, hasGarden: true,
  capacity: 12, amenities: [], amenitiesEn: [],
  priceWeekday: 5000, priceWeekend: 7000,
});

await erp.villas.update(villa.id, { priceWeekend: 7500 });
await erp.villas.remove(villa.id);

const url = await erp.uploadImage(file, "villa.jpg");
await erp.villas.update(villa.id, { images: [url, ...villa.images] });

const pricing = await erp.pricing.get();
await erp.pricing.update({ addonPrices: { fireShow: 3500 } });
```

الأخطاء بترجع كـ `InnspotError` فيها `status` و `message` و `path`.

في الـ ERP، `.env.local`:

```
INNSPOT_API_URL="https://innspotagency.com"
INNSPOT_API_KEY="نفس المفتاح اللي في ERP_API_KEYS"
```

---

## 4. لوحة الأدمن القديمة

`/admin` على الموقع **لسه شغالة بالجلسة العادية** (اسم مستخدم + باسورد) وبتفضل
احتياطي لو الـ ERP وقع. الاتنين بيكتبوا في نفس قاعدة البيانات، فأي تعديل من أي
واحد فيهم بيظهر في التاني على طول.

مفتاح الـ API **بيفتح الـ API بس، مش صفحات `/admin`** — لو حد جرب يفتح صفحة
بالمفتاح هيترمي على صفحة تسجيل الدخول.
