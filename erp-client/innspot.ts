// ============================================================
// كلاينت الـ ERP لموقع InnSpot
// انسخ الملف ده في مشروع الـ ERP واستخدمه من السيرفر بس.
//
// ⚠️ ممنوع تستورد الملف ده في أي كومبوننت بيشتغل في المتصفح ("use client")،
// لأن INNSPOT_API_KEY لازم يفضل على السيرفر ولا يوصل للمتصفح أبدًا.
// في Next.js: استخدمه في Server Components أو Route Handlers أو Server Actions.
//
// متغيرات البيئة المطلوبة في الـ ERP:
//   INNSPOT_API_URL = https://innspotagency.com
//   INNSPOT_API_KEY = <المفتاح اللي في ERP_API_KEYS على الموقع>
// ============================================================

// ---------- الأنواع ----------

export type Villa = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  images: string[];
  rooms: number;
  beds: number;
  hasPool: boolean;
  hasGarden: boolean;
  capacity: number;
  amenities: string[];
  amenitiesEn: string[];
  priceWeekday: number;
  priceWeekend: number;
};

// غرفة في فندق — السعر لليلة بالجنيه (0 = مش بيظهر للزوار)
export type RoomType = {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  capacity: number;
  price: number;
};

export type Hotel = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  images: string[];
  roomTypes: RoomType[];
  hasPool: boolean;
  hasGarden: boolean;
  amenities: string[];
  amenitiesEn: string[];
};

export type Activity = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  image: string;
};

export type ItineraryStep = { title: string; titleEn: string; detail: string; detailEn: string };

export type Program = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  itinerary: ItineraryStep[];
  startTime: string;
  endTime: string;
  duration: string;
  durationEn: string;
  includes: string[];
  includesEn: string[];
  images: string[];
  isCustom: boolean;
};

export type TransportVehicle = {
  id: string;
  group: "safari" | "bus";
  name: string;
  nameEn: string;
  capacity: number;
  price: number;
  active: boolean;
};

export type OptionKind =
  | "hotel"
  | "breakfast_place"
  | "breakfast_item"
  | "lunch_place"
  | "lunch_item"
  | "safari_car"
  | "addon";

export type PriceUnit = "per_person" | "per_car" | "per_night" | "flat";

export type CustomTripOption = {
  id: string;
  kind: OptionKind;
  parentId: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  priceUnit: PriceUnit;
  capacity: number;
  tier: string;
  includesBreakfast: boolean;
  image: string;
  images: string[];
  rating: number;
  active: boolean;
  sortOrder: number;
};

export type TierKind = "breakfast" | "lunch" | "tickets";

// شريحة سعر لبند معيّن حسب عدد الأفراد — toPeople = 0 معناها "وما فوق"
// الشرائح بتيجي في مصفوفة واحدة لكل برنامج، وكل شريحة عليها نوعها (kind)
export type PriceTier = { kind: TierKind; fromPeople: number; toPeople: number; price: number };

// وضع الإضافة في برنامج: متاحة كإضافة / مشمولة في سعر البرنامج / مش متاحة
export type AddonMode = "available" | "included" | "hidden";

// إضافة من القايمة الموحدة (هي نفسها خيارات الكاستم بنوع addon)
export type AddonSummary = {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  priceUnit: PriceUnit;
  active: boolean;
};

// شريحة هامش ربح — toPeople = 0 معناها "وما فوق"
export type MarginTier = { fromPeople: number; toPeople: number; margin: number };

export type ProgramPricing = {
  breakfastPerPerson: number;
  lunchPerPerson: number;
  ticketsPerPerson: number;
  carPrice: number;
  transportGroup: "safari" | "bus";
  needsBus: boolean;
  needsSafari: boolean;
};

export type PricingSnapshot = {
  programs: { id: string; name: string; isCustom: boolean }[];
  programPricing: Record<string, ProgramPricing>;
  programTiers: Record<string, PriceTier[]>;
  addons: AddonSummary[];
  // اللي مش موجود هنا = متاحة كإضافة
  programAddons: Record<string, Record<string, "included" | "hidden">>;
  settings: { peoplePerCar: number; marginTiers: MarginTier[] };
};

// ---------- الأخطاء ----------

export class InnspotError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string
  ) {
    super(message);
    this.name = "InnspotError";
  }
}

// ---------- الكلاينت ----------

export type InnspotConfig = {
  /** رابط الموقع من غير / في الآخر، مثال: https://innspotagency.com */
  baseUrl?: string;
  apiKey?: string;
  /** مهلة الطلب بالملي ثانية (افتراضي 20 ثانية) */
  timeoutMs?: number;
};

export function createInnspotClient(config: InnspotConfig = {}) {
  const baseUrl = (config.baseUrl ?? process.env.INNSPOT_API_URL ?? "").replace(/\/+$/, "");
  const apiKey = config.apiKey ?? process.env.INNSPOT_API_KEY ?? "";
  const timeoutMs = config.timeoutMs ?? 20_000;

  if (!baseUrl) throw new Error("INNSPOT_API_URL غير موجود");
  if (!apiKey) throw new Error("INNSPOT_API_KEY غير موجود");

  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(baseUrl + path, {
        method,
        headers: {
          "X-API-Key": apiKey,
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        // مفيش كاش — الـ ERP لازم يشوف آخر حالة دايمًا
        cache: "no-store",
      });

      const text = await response.text();
      let payload: Record<string, unknown> = {};
      try {
        payload = text ? JSON.parse(text) : {};
      } catch {
        throw new InnspotError(`رد غير صالح من السيرفر: ${text.slice(0, 120)}`, response.status, path);
      }

      if (!response.ok || payload.ok === false) {
        const message = typeof payload.error === "string" ? payload.error : `فشل الطلب (${response.status})`;
        throw new InnspotError(message, response.status, path);
      }

      return payload as T;
    } catch (err) {
      if (err instanceof InnspotError) throw err;
      if (err instanceof Error && err.name === "AbortError") {
        throw new InnspotError(`انتهت مهلة الطلب بعد ${timeoutMs}ms`, 408, path);
      }
      throw new InnspotError(err instanceof Error ? err.message : "خطأ غير معروف", 0, path);
    } finally {
      clearTimeout(timer);
    }
  }

  // مولّد عمليات CRUD المتكررة — كل المجالات ليها نفس الشكل بالظبط.
  // ملاحظة: القراءة بترجّع الحقل بصيغة الجمع (villas) والإضافة/التعديل بالمفرد (villa)
  function resource<TItem, TCreate, TUpdate>(path: string, listField: string, itemField: string) {
    return {
      list: async (): Promise<TItem[]> =>
        (await request<Record<string, TItem[]>>("GET", path))[listField] ?? [],
      create: async (data: TCreate): Promise<TItem> =>
        (await request<Record<string, TItem>>("POST", path, data))[itemField],
      update: async (id: string, data: TUpdate): Promise<TItem> =>
        (await request<Record<string, TItem>>("PATCH", `${path}/${encodeURIComponent(id)}`, data))[
          itemField
        ],
      remove: async (id: string): Promise<void> => {
        await request("DELETE", `${path}/${encodeURIComponent(id)}`);
      },
    };
  }

  return {
    /** فحص إن المفتاح والاتصال شغالين */
    ping: () => request<{ ok: true; client: string; time: string }>("GET", "/api/admin/ping"),

    villas: resource<Villa, Omit<Villa, "id"> & { id?: string }, Partial<Omit<Villa, "id">>>(
      "/api/admin/villas",
      "villas",
      "villa"
    ),
    hotels: resource<Hotel, Omit<Hotel, "id"> & { id?: string }, Partial<Omit<Hotel, "id">>>(
      "/api/admin/hotels",
      "hotels",
      "hotel"
    ),
    activities: resource<Activity, Omit<Activity, "id"> & { id?: string }, Partial<Omit<Activity, "id">>>(
      "/api/admin/activities",
      "activities",
      "activity"
    ),
    programs: resource<Program, Omit<Program, "id"> & { id?: string }, Partial<Omit<Program, "id">>>(
      "/api/admin/programs",
      "programs",
      "program"
    ),
    transport: resource<
      TransportVehicle,
      Omit<TransportVehicle, "id"> & { id?: string },
      Partial<Omit<TransportVehicle, "id">>
    >("/api/admin/transport", "vehicles", "vehicle"),
    customTrip: resource<
      CustomTripOption,
      Omit<CustomTripOption, "id" | "sortOrder"> & { id?: string },
      Partial<Omit<CustomTripOption, "id" | "sortOrder">>
    >("/api/admin/custom-trip", "options", "option"),

    /** التسعير كله مرة واحدة: أسعار البرامج + الشرائح + الإضافات + الإعدادات العامة */
    pricing: {
      get: () => request<PricingSnapshot & { ok: true }>("GET", "/api/admin/pricing"),
      /** بيحدّث الأجزاء اللي تبعتها بس — أي حاجة تسيبها مش هتتغير */
      update: (patch: {
        programPricing?: Record<string, ProgramPricing>;
        // بيستبدل كل شرائح البرنامج باللي اتبعت
        programTiers?: Record<string, PriceTier[]>;
        // بيستبدل كل إعدادات الإضافات للبرنامج — ابعت كل الإضافات، واللي مش هتبعته يرجع "متاحة"
        // أسعار الإضافات نفسها بتتعدل من customTrip.update
        programAddons?: Record<string, Record<string, AddonMode>>;
        settings?: { peoplePerCar?: number; marginTiers?: MarginTier[] };
      }) => request<{ ok: true }>("PATCH", "/api/admin/pricing", patch),
    },

    /**
     * رفع صورة — بيرجّع الرابط اللي تحطه في images[].
     * الملف يقدر يبقى File أو Blob. الحد الأقصى 8 ميجا،
     * والأنواع المسموحة: jpeg / png / webp / avif / gif
     */
    async uploadImage(file: Blob, filename = "upload.jpg"): Promise<string> {
      const form = new FormData();
      form.append("file", file, filename);

      const response = await fetch(`${baseUrl}/api/admin/upload`, {
        method: "POST",
        headers: { "X-API-Key": apiKey },
        body: form,
      });

      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new InnspotError(payload.error ?? "فشل رفع الصورة", response.status, "/api/admin/upload");
      }
      return payload.url as string;
    },
  };
}

export type InnspotClient = ReturnType<typeof createInnspotClient>;
