// ============================================================
// ملاحظة مهمة: البيانات الحية للفنادق متخزنة في قاعدة البيانات (جدول hotels)
// ومتعدَّلة من لوحة الأدمن على /admin/hotels — التعديل هنا مش هيغيّر حاجة
// في الموقع المنشور. الملف ده استخدامه الوحيد: seed أولي عبر scripts/init-db.mjs
// راجع src/lib/hotels-repo.ts للوصول الفعلي للبيانات.
// ============================================================
//
// ملف بيانات الفنادق (تبويب "فنادق" في صفحة "أفراد وإقامة") — تاريخيًا
// كل فندق عنده "roomTypes": قائمة أنواع الغرف المتاحة به (مفردة/مزدوجة/ثلاثية أو سويت فقط)
// ============================================================

export type RoomType = {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  // عدد الأفراد في الغرفة
  capacity: number;
  // سعر الليلة للغرفة بالجنيه — 0 = مش هيظهر سعر
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

const room = (name: string, nameEn: string, capacity: number): RoomType => ({
  name,
  nameEn,
  description: "",
  descriptionEn: "",
  capacity,
  price: 0,
});

const SINGLE_DOUBLE_TRIPLE: RoomType[] = [
  room("غرفة مفردة", "Single Room", 1),
  room("غرفة مزدوجة", "Double Room", 2),
  room("غرفة ثلاثية", "Triple Room", 3),
];

const SUITE_ONLY: RoomType[] = [room("سويت", "Suite", 2)];

export const hotels: Hotel[] = [
  {
    id: "hotel-tunis-pyramids",
    name: "فندق تونس بيراميدز",
    nameEn: "Tunis Pyramids Hotel",
    description: "فندق مميز في الفيوم — عدّل هذا الوصف ببيانات الفندق الفعلية.",
    descriptionEn: "A distinctive hotel in Fayoum — replace this description with the hotel's actual details.",
    images: ["/images/village-wall.jpg", "/images/lake-beach.jpg"],
    roomTypes: SINGLE_DOUBLE_TRIPLE,
    hasPool: true,
    hasGarden: true,
    amenities: [],
    amenitiesEn: [],
  },
  {
    id: "hotel-venecai",
    name: "فندق فينيسيا",
    nameEn: "Venecai Hotel",
    description: "فندق مميز في الفيوم — عدّل هذا الوصف ببيانات الفندق الفعلية.",
    descriptionEn: "A distinctive hotel in Fayoum — replace this description with the hotel's actual details.",
    images: ["/images/lake-dramatic.jpg", "/images/lake-boats.jpg"],
    roomTypes: SUITE_ONLY,
    hasPool: true,
    hasGarden: false,
    amenities: [],
    amenitiesEn: [],
  },
  {
    id: "hotel-lazib-inn",
    name: "لازيب إن",
    nameEn: "Lazib Inn",
    description: "فندق مميز في الفيوم — عدّل هذا الوصف ببيانات الفندق الفعلية.",
    descriptionEn: "A distinctive hotel in Fayoum — replace this description with the hotel's actual details.",
    images: ["/images/hero.jpg", "/images/safari-dunes.jpg"],
    roomTypes: SUITE_ONLY,
    hasPool: false,
    hasGarden: false,
    amenities: [],
    amenitiesEn: [],
  },
  {
    id: "hotel-palm-shadows",
    name: "فندق ظلال النخيل",
    nameEn: "Palm Shadows Hotel",
    description: "فندق مميز في الفيوم — عدّل هذا الوصف ببيانات الفندق الفعلية.",
    descriptionEn: "A distinctive hotel in Fayoum — replace this description with the hotel's actual details.",
    images: ["/images/village-wall.jpg", "/images/hero.jpg"],
    roomTypes: SINGLE_DOUBLE_TRIPLE,
    hasPool: true,
    hasGarden: true,
    amenities: [],
    amenitiesEn: [],
  },
];
