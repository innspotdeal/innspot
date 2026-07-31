// ============================================================
// ملف بيانات الفنادق (تبويب "فنادق" في صفحة "أفراد وإقامة")
// عدّل هنا: الاسم، الوصف، الصور، أنواع الغرف/السويتات، والمرافق
// كل فندق عنده "roomTypes": قائمة أنواع الغرف المتاحة به (مفردة/مزدوجة/ثلاثية أو سويت فقط)
// البيانات الحالية (الوصف، الصور، المرافق) مبدئية (placeholder) لحين تعبئة
// ملف "نبذة عن الفندق.txt" الموجود في مجلد كل فندق داخل hotel/
// ============================================================

export type RoomType = {
  name: string;
  nameEn: string;
  capacity: number;
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

const SINGLE_DOUBLE_TRIPLE: RoomType[] = [
  { name: "غرفة مفردة", nameEn: "Single Room", capacity: 1 },
  { name: "غرفة مزدوجة", nameEn: "Double Room", capacity: 2 },
  { name: "غرفة ثلاثية", nameEn: "Triple Room", capacity: 3 },
];

const SUITE_ONLY: RoomType[] = [{ name: "سويت", nameEn: "Suite", capacity: 2 }];

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
