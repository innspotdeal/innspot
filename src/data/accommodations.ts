// ============================================================
// ملاحظة مهمة: البيانات الحية للفيلات (المعروضة فعليًا على الموقع) بقت متخزنة
// في قاعدة البيانات (جدول villas)، ومتعدَّلة من لوحة الأدمن على /admin/villas
// — التعديل هنا في الملف ده مش هيغيّر حاجة في الموقع المنشور.
// الملف ده استخدامه الوحيد دلوقتي: البيانات الابتدائية (seed) اللي بيتم نقلها
// لقاعدة البيانات أول مرة عن طريق scripts/init-db.mjs (ولو الجدول فيه بيانات
// بالفعل، السكريبت مش بيلمسها). راجع src/lib/villas-repo.ts للوصول الفعلي للبيانات.
// ============================================================
//
// ملف بيانات الفيلات (صفحة "أفراد وإقامة") — تاريخيًا
// بيانات الفنادق منقولة لملف منفصل: src/data/hotels.ts (فيها هيكل مختلف: أنواع غرف)
// كل حقل عربي له مقابل إنجليزي بنفس الاسم + En (لدعم زر تغيير اللغة)
// صور الفيلات صور حقيقية موجودة في public/images/villas/<id>/01.jpg وهكذا بالتسلسل
// أول صورة في المصفوفة هي التي تظهر في الكارت، وكل الصور تظهر في معرض الصور بصفحة التفاصيل
// ============================================================

export type Accommodation = {
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

// يبني قائمة مسارات الصور الحقيقية لفيلا معينة: 01.jpg، 02.jpg... حتى count
function villaImages(id: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `/images/villas/${id}/${String(i + 1).padStart(2, "0")}.jpg`);
}

// ملاحظة: قيمة "capacity" (أقصى عدد أفراد) مقدَّرة تقريبيًا من عدد الأسرّة الفعلي لكل فيلا
// (باستثناء فيلا 09 اللي أكّد صاحب الموقع رقمها بالظبط). عدّل الرقم لو مختلف عن الواقع
// ملاحظة أهم: أسعار priceWeekday/priceWeekend كلها أرقام placeholder مؤقتة لحين تزويدنا بالأسعار الفعلية لكل فيلا
export const villas: Accommodation[] = [
  {
    id: "villa-qarun-royal",
    name: "فيلا 01",
    nameEn: "Villa 01",
    description: "استمتع بإقامة مميزة في فيلا تتكون من 8 غرف مستقلة، كل غرفة بحمامها الخاص، مع تراس وروف يشملان المساحات الخضراء المحيطة. مكان مثالي للتجمعات الكبيرة، بمرافق متكاملة تناسب كل الأذواق.",
    descriptionEn: "Enjoy a distinctive stay in a villa with 8 independent rooms, each with its own bathroom, plus a terrace and rooftop overlooking the surrounding green spaces. An ideal place for large gatherings, with complete facilities to suit every taste.",
    images: villaImages("villa-qarun-royal", 22),
    rooms: 8,
    beds: 8,
    hasPool: true,
    hasGarden: true,
    capacity: 16,
    amenities: ["10 حمامات", "مسبح مدرج (100-175 سم)", "حديقتان (جاردن)", "2 مطبخ مجهز", "تراس", "روف"],
    amenitiesEn: ["10 bathrooms", "Graduated-depth pool (100-175 cm)", "Two gardens", "2 equipped kitchens", "Terrace", "Rooftop"],
    priceWeekday: 8000,
    priceWeekend: 10000,
  },
  {
    id: "villa-tunis-green",
    name: "فيلا 02",
    nameEn: "Villa 02",
    description: "استمتع بإقامة راقية في فيلا تجمع بين الاتساع والفخامة، بمساحات مفتوحة مخصصة للاستقبال والاسترخاء. مكان مثالي للعائلات والتجمعات، بمرافق متكاملة تشمل مسبح وجاكوزي لتجربة استجمام كاملة.",
    descriptionEn: "Enjoy an upscale stay in a villa that combines spaciousness and luxury, with open areas designed for hosting and relaxation. An ideal place for families and gatherings, with complete facilities including a pool and jacuzzi for a full leisure experience.",
    images: villaImages("villa-tunis-green", 23),
    rooms: 4,
    beds: 4,
    hasPool: true,
    hasGarden: true,
    capacity: 8,
    amenities: ["5 حمامات", "2 ريسبشن", "مطبخ مجهز", "جاكوزي", "جراج خاص"],
    amenitiesEn: ["5 bathrooms", "2 reception areas", "Equipped kitchen", "Jacuzzi", "Private garage"],
    priceWeekday: 4000,
    priceWeekend: 5000,
  },
  {
    id: "villa-golden-dunes",
    name: "فيلا 03",
    nameEn: "Villa 03",
    description: "استمتع بإقامة مريحة في فيلا من طابقين، مصممة لتوفر لك مساحات واسعة للاستقبال والاسترخاء. مكان مثالي للعائلات، بمرافق متكاملة تشمل مسبح خاص وباركنج، مع أجواء مكيفة تمنحك الراحة طوال العام.",
    descriptionEn: "Enjoy a comfortable stay in a two-floor villa, designed to offer spacious areas for hosting and relaxation. An ideal place for families, with complete facilities including a private pool and parking, with air conditioning for year-round comfort.",
    images: villaImages("villa-golden-dunes", 44),
    rooms: 4,
    beds: 4,
    hasPool: true,
    hasGarden: false,
    capacity: 8,
    amenities: ["5 حمامات", "2 ريسبشن (على طابقين)", "مطبخ مجهز", "باركنج"],
    amenitiesEn: ["5 bathrooms", "2 reception areas (across two floors)", "Equipped kitchen", "Parking"],
    priceWeekday: 4000,
    priceWeekend: 5000,
  },
  {
    id: "villa-fayoum-palms",
    name: "فيلا 04",
    nameEn: "Villa 04",
    description: "استمتع بإقامة فاخرة في فيلا تضم 5 غرف ماستر واسعة، مصممة لتوفر لك أقصى درجات الراحة والخصوصية. مكان مثالي للعائلات الكبيرة والتجمعات، بمرافق متكاملة تشمل مسبح وحديقة ومطبخ مجهز وريسبشن وشوايه لأمسيات مميزة.",
    descriptionEn: "Enjoy a luxurious stay in a villa with 5 spacious master rooms, designed to offer maximum comfort and privacy. An ideal place for large families and gatherings, with complete facilities including a pool, garden, equipped kitchen, reception area, and a grill for special evenings.",
    images: villaImages("villa-fayoum-palms", 27),
    rooms: 5,
    beds: 5,
    hasPool: true,
    hasGarden: true,
    capacity: 10,
    amenities: ["ريسبشن", "مطبخ مجهز", "شواية"],
    amenitiesEn: ["Reception area", "Equipped kitchen", "Grill"],
    priceWeekday: 5000,
    priceWeekend: 6500,
  },
  {
    id: "villa-lotus",
    name: "فيلا 05",
    nameEn: "Villa 05",
    description: "استمتع بإقامة استثنائية في فيلا واسعة تضم 7 غرف دبل ماستر مكيفة، مصممة لتلبية احتياجات العائلات الكبيرة والتجمعات. مكان يجمع بين الفخامة والعملية، بمرافق متكاملة على مستوى راقٍ تشمل مسبحين وروف مميز.",
    descriptionEn: "Enjoy an exceptional stay in a spacious villa with 7 air-conditioned double-master rooms, designed to meet the needs of large families and gatherings. A place that combines luxury and practicality, with upscale facilities including two pools and a distinctive rooftop.",
    images: villaImages("villa-lotus", 22),
    rooms: 7,
    beds: 7,
    hasPool: true,
    hasGarden: false,
    capacity: 14,
    amenities: ["8 حمامات", "2 ريسبشن", "2 مطبخ مجهز بالكامل", "2 حمام سباحة (كبار وأطفال)", "روف"],
    amenitiesEn: ["8 bathrooms", "2 reception areas", "2 fully equipped kitchens", "2 pools (adults and kids)", "Rooftop"],
    priceWeekday: 7000,
    priceWeekend: 9000,
  },
  {
    id: "villa-oasis",
    name: "فيلا 06",
    nameEn: "Villa 06",
    description: "استمتع بإقامة فاخرة في فيلا دوبلكس مصممة بعناية، تجمع بين الراحة العصرية والرفاهية. مكان مثالي لقضاء أوقات مميزة، بمرافق متكاملة تشمل مسبحين (كبير وللأطفال) وريسبشن مكيف مجهز بأحدث وسائل الترفيه.",
    descriptionEn: "Enjoy a luxurious stay in a carefully designed duplex villa that combines modern comfort and elegance. An ideal place for memorable times, with complete facilities including two pools (large and kids') and an air-conditioned reception equipped with the latest entertainment.",
    images: villaImages("villa-oasis", 11),
    rooms: 5,
    beds: 5,
    hasPool: true,
    hasGarden: false,
    capacity: 10,
    amenities: ["4 حمامات", "2 ريسبشن مكيف بشاشات عرض", "شيزلونج", "مطبخ مجهز بالكامل", "شواية", "باركنج"],
    amenitiesEn: ["4 bathrooms", "2 air-conditioned reception areas with screens", "Chaise lounge", "Fully equipped kitchen", "Grill", "Parking"],
    priceWeekday: 5000,
    priceWeekend: 6500,
  },
  {
    id: "villa-seven",
    name: "فيلا 07",
    nameEn: "Villa 07",
    description: "استمتع بإقامة مميزة في فيلا من دورين، مصممة بعناية لتوفر لك مساحات مستقلة ومريحة في كل طابق. مكان مثالي للعائلات، بريسبشن مجهز بشاشة عرض في كل دور، وحديقة خلفية بها مسبح وشوايه لأمسيات مميزة.",
    descriptionEn: "Enjoy a distinctive stay in a two-floor villa, carefully designed to offer independent and comfortable spaces on each floor. An ideal place for families, with a reception equipped with a screen on each floor, and a backyard garden with a pool and grill for special evenings.",
    images: villaImages("villa-seven", 25),
    rooms: 4,
    beds: 5,
    hasPool: true,
    hasGarden: true,
    capacity: 10,
    amenities: ["2 حمام (حمام لكل دور)", "2 ريسبشن بشاشة عرض", "مطبخ مجهز بالكامل", "شواية في الحديقة الخلفية"],
    amenitiesEn: ["2 bathrooms (one per floor)", "2 reception areas with screens", "Fully equipped kitchen", "Grill in the backyard garden"],
    priceWeekday: 5000,
    priceWeekend: 6500,
  },
  {
    id: "villa-eight",
    name: "فيلا 08",
    nameEn: "Villa 08",
    description: "فيلا واسعة تضم 4 غرف نوم مكيفة (غرفتان تربل وغرفة تربيل وغرفة ماستر)، توفر أجواء ترفيهية مميزة بمسبح وجاكوزي وجاردن به شلالات وقعدة بدوية وألعاب متنوعة، مثالية للتجمعات العائلية الكبيرة.",
    descriptionEn: "A spacious villa with 4 air-conditioned bedrooms (two triple rooms, one triple-bed room, and one master room), offering a distinctive entertainment atmosphere with a pool, jacuzzi, and a garden with waterfalls, a bedouin seating area, and various games — ideal for large family gatherings.",
    images: villaImages("villa-eight", 13),
    rooms: 4,
    beds: 9,
    hasPool: true,
    hasGarden: true,
    capacity: 18,
    amenities: ["3 حمامات", "2 ريسبشن", "مطبخ مجهز على أعلى مستوى", "جاكوزي", "شلالات", "قعدة بدوية", "تنس طاولة وألعاب أخرى", "2 شواية"],
    amenitiesEn: ["3 bathrooms", "2 reception areas", "Top-quality equipped kitchen", "Jacuzzi", "Waterfalls", "Bedouin seating area", "Table tennis and other games", "2 grills"],
    priceWeekday: 9000,
    priceWeekend: 11500,
  },
  {
    id: "villa-09",
    name: "فيلا 09",
    nameEn: "Villa 09",
    description: "استمتع بإقامة استثنائية في شاليه يطل مباشرة على بحيرة قارون الساحرة، حيث تجتمع الخصوصية التامة مع جمال المنظر الطبيعي. شاليه مصمم ليمنحك تجربة راحة واسترخاء كاملة بعيدًا عن صخب المدينة، مثالي لقضاء إجازة هادئة أو تجمع عائلي مميز بإطلالة لا تُنسى على مياه البحيرة.",
    descriptionEn: "Enjoy an exceptional stay in a chalet with a direct view of the enchanting Lake Qarun, where complete privacy meets the beauty of the natural scenery. Designed for full comfort and relaxation away from the city's noise, it's ideal for a quiet getaway or a special family gathering with an unforgettable view of the lake's waters.",
    images: villaImages("villa-09", 9),
    rooms: 2,
    beds: 2,
    hasPool: true,
    hasGarden: true,
    capacity: 5,
    amenities: ["2 غرفة نوم ماستر مكيفة", "3 حمامات", "مطبخ مجهز بالكامل", "حديقتان خاصتان", "موقف سيارات خاص"],
    amenitiesEn: ["2 air-conditioned master bedrooms", "3 bathrooms", "Fully equipped kitchen", "Two private gardens", "Private parking"],
    priceWeekday: 2500,
    priceWeekend: 3000,
  },
  {
    id: "villa-10",
    name: "فيلا 10",
    nameEn: "Villa 10",
    description: "استمتع بإقامة راقية في فيلا بتصميم ريفي أنيق، تطل مباشرة على بحيرة قارون بمنظر خلاب. فيلا واسعة تجمع بين الفخامة والخصوصية التامة، مثالية للعائلات الكبيرة أو التجمعات، بمساحات مفتوحة وحدائق تمنحك أجواء استرخاء لا مثيل لها.",
    descriptionEn: "Enjoy an upscale stay in a villa with an elegant rustic design, overlooking Lake Qarun with a breathtaking view. A spacious villa combining luxury and complete privacy, ideal for large families or gatherings, with open spaces and gardens giving you an unmatched relaxing atmosphere.",
    images: villaImages("villa-10", 16),
    rooms: 4,
    beds: 7,
    hasPool: false,
    hasGarden: true,
    capacity: 14,
    amenities: ["6 حمامات", "ريسبشن", "مطبخ مجهز", "باركنج خاص", "شواية", "خصوصية تامة"],
    amenitiesEn: ["6 bathrooms", "Reception area", "Equipped kitchen", "Private parking", "Grill", "Complete privacy"],
    priceWeekday: 7000,
    priceWeekend: 9000,
  },
  {
    id: "villa-11",
    name: "فيلا 11",
    nameEn: "Villa 11",
    description: "استمتع بإقامة راقية في فيلا واسعة تطل بمنظر رائع على بحيرة قارون، مصممة لتلبية احتياجات العائلات الكبيرة والتجمعات. مكان يجمع بين الفخامة والعملية، بمرافق متكاملة تشمل ريسبشنين ومطبخين كبيرين مجهزين.",
    descriptionEn: "Enjoy an upscale stay in a spacious villa with a wonderful view of Lake Qarun, designed to meet the needs of large families and gatherings. A place that combines luxury and practicality, with complete facilities including two reception areas and two large equipped kitchens.",
    images: villaImages("villa-11", 33),
    rooms: 6,
    beds: 6,
    hasPool: true,
    hasGarden: false,
    capacity: 12,
    amenities: ["7 حمامات", "2 ريسبشن", "2 مطبخ كبير مجهز", "باركنج للسيارات", "إطلالة على بحيرة قارون"],
    amenitiesEn: ["7 bathrooms", "2 reception areas", "2 large equipped kitchens", "Car parking", "View of Lake Qarun"],
    priceWeekday: 6000,
    priceWeekend: 7500,
  },
];
