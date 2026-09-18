// ============================================================
// ملاحظة مهمة: البيانات الحية لبرامج الشركات متخزنة في قاعدة البيانات
// (جدول corporate_programs) ومتعدَّلة من لوحة الأدمن على /admin/programs
// الملف ده هو المصدر الأصلي للمحتوى وقت التهيئة أو الترحيل:
//   - scripts/init-db.mjs (قاعدة بيانات جديدة)
//   - scripts/programs-itinerary-migration.mjs (تحديث قاعدة موجودة)
// راجع src/lib/programs-repo.ts للوصول الفعلي للبيانات،
// و src/lib/pricing.ts للتسعير (متخزن في قاعدة البيانات ومتعدَّل من /admin/pricing)
// ============================================================

// خطوة واحدة في مخطط الرحلة: عنوان + تفصيل اختياري تحته (زي مكونات الوجبة)
export type ItineraryStep = {
  title: string;
  titleEn: string;
  detail: string;
  detailEn: string;
};

export type CorporateProgram = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  // مخطط الرحلة بالترتيب — ده اللي بيتعرض في صفحة البرنامج كتايم لاين
  itinerary: ItineraryStep[];
  // أوقات التحرك والعودة بصيغة 24 ساعة ("07:00") — بتتنسق حسب اللغة وقت العرض
  // فاضية = مش هيظهر شريط الأوقات في الصفحة
  startTime: string;
  endTime: string;
  duration: string;
  durationEn: string;
  // اللي بيشمله السعر — لازم يبقى مختلف عن خطوات المخطط، مش تكرار ليها
  includes: string[];
  includesEn: string[];
  images: string[];
  // true للبرامج المخصصة بالكامل حسب الطلب (زي برنامج إليت): بيتم إخفاء حاسبة السعر
  // من صفحته وقائمة اختيار البرنامج في حاسبة السعر، لأن مفيش سعر ثابت للفرد
  isCustom: boolean;
  // true للبرنامج اللي صفحته عبارة عن مكوّن رحلة تفاعلي (Custom Program)
  // بدل مخطط الرحلة العادي
  isBuilder: boolean;
};

const step = (title: string, titleEn: string, detail = "", detailEn = ""): ItineraryStep => ({
  title,
  titleEn,
  detail,
  detailEn,
});

export const corporatePrograms: CorporateProgram[] = [
  {
    id: "innspot-classic",
    name: "برنامج رحلة الباص",
    nameEn: "Bus Trip",
    description:
      "رحلة يوم كامل بالباص تجمع بين شلالات وادي الريان وجبل المدورة وكامب الماجيك ليك، مع ركوب المركب والساند بورد والغداء في الكامب وجلسة كامب فاير.",
    descriptionEn:
      "A full-day bus trip combining the Wadi El Rayan waterfalls, Al-Madawra Mountain, and Magic Lake Camp, with a boat ride, sandboarding, lunch at the camp, and a campfire session.",
    itinerary: [
      step(
        "الإفطار في واحة الزواوي",
        "Breakfast at Zawya Oasis",
        "فطير مشلتت + عسل + جبنة + مش فلاحي",
        "Feteer meshaltet + honey + cheese + farm mish"
      ),
      step(
        "زيارة شلالات وادي الريان",
        "Visiting the Wadi El Rayan waterfalls",
        "الاستمتاع بالمياه والمناظر الطبيعية الخلابة",
        "Enjoying the water and the stunning scenery"
      ),
      step(
        "جبل المدورة",
        "Al-Madawra Mountain",
        "الصعود إلى الجبل والاستمتاع بالإطلالة البانورامية",
        "Climbing the mountain and enjoying the panoramic view"
      ),
      step("التوجه إلى كامب الماجيك", "Heading to Magic Camp"),
      step("ركوب المركب في بحيرة الماجيك ليك", "A boat ride on the Magic Lake"),
      step(
        "الساند بورد",
        "Sandboarding",
        "تجربة التزلج على الرمال وسط الكثبان",
        "Sliding down the dunes on a board"
      ),
      step(
        "الغداء في كامب الماجيك",
        "Lunch at Magic Camp",
        "ربع فرخة + أرز + بطاطس + سلطة عربي + طحينة + عيش",
        "Quarter chicken + rice + potatoes + arabic salad + tahini + bread"
      ),
      step(
        "الكامب فاير",
        "Campfire",
        "سهرة مميزة حول النار — شاي + مارشميلو",
        "A special evening around the fire — tea + marshmallows"
      ),
    ],
    startTime: "",
    endTime: "",
    duration: "يوم كامل",
    durationEn: "A full day",
    includes: ["الانتقالات بالباص", "تذاكر دخول المحمية", "مشرف الرحلة"],
    includesEn: ["Bus transfers", "Reserve entry tickets", "A trip supervisor"],
    images: ["/images/safari-waterfall.jpg", "/images/lake-boats.jpg", "/images/safari-dunes.jpg"],
    isCustom: false,
    isBuilder: false,
  },
  {
    id: "classic-safari",
    name: "برنامج رحلة السفاري",
    nameEn: "Safari Trip",
    description:
      "رحلة يوم كامل بسيارات السفاري وسط محمية وادي الريان، تجمع بين مغامرة الكثبان الرملية والشلالات والبحيرة السحرية، وتنتهي بغداء في واحة الزاواي وجلسة كامب فاير.",
    descriptionEn:
      "A full-day trip by safari vehicles through the Wadi El Rayan reserve, combining a sand-dune adventure, the waterfalls, and the Magic Lake, ending with lunch at Zawya Oasis and a campfire session.",
    itinerary: [
      step(
        "الإفطار في واحة الزاواي",
        "Breakfast at Zawya Oasis",
        "فطير مشلتت + عسل + جبنة + مش",
        "Feteer meshaltet + honey + cheese + mish"
      ),
      step(
        "التحرك إلى محمية وادي الريان بسيارات السفاري",
        "Heading to the Wadi El Rayan reserve by safari vehicles"
      ),
      step("مغامرة بسيارات الدفع الرباعي وسط الكثبان الرملية", "A 4x4 adventure among the sand dunes"),
      step("التزلج على الرمال (Sandboarding)", "Sandboarding"),
      step("زيارة شلالات وادي الريان", "Visiting the Wadi El Rayan waterfalls"),
      step(
        "التوقف عند نقطة الـ View",
        "Stopping at the view point",
        "إطلالة بانورامية على المحمية",
        "A panoramic view over the reserve"
      ),
      step("زيارة البحيرة السحرية (Magic Lake)", "Visiting the Magic Lake"),
      step("تجربة الشاي البدوي بجوار البحيرة", "A bedouin tea experience by the lake"),
      step(
        "العودة إلى واحة الزاواي لتناول الغداء",
        "Returning to Zawya Oasis for lunch",
        "ربع فرخة + أرز + سلطة + عيش + طحينة",
        "Quarter chicken + rice + salad + bread + tahini"
      ),
      step("جلسة كامب فاير", "Campfire session", "أجواء بدوية مميزة", "A distinctive bedouin atmosphere"),
    ],
    startTime: "",
    endTime: "",
    duration: "يوم كامل",
    durationEn: "A full day",
    includes: ["سيارات السفاري", "تذاكر دخول المحمية", "مشرف الرحلة"],
    includesEn: ["Safari vehicles", "Reserve entry tickets", "A trip supervisor"],
    images: ["/images/safari-dunes.jpg", "/images/safari-waterfall.jpg", "/images/lake-dramatic.jpg"],
    isCustom: false,
    isBuilder: false,
  },
  {
    id: "advance-safari",
    name: "برنامج رحلة السفاري — غداء الكامب",
    nameEn: "Safari Trip — Camp Lunch",
    description:
      "نفس مكونات رحلة السفاري، لكن الغداء بيتقدم في كامب الماجيك ليك وسط أجواء الطبيعة بدل الرجوع لواحة الزاواي.",
    descriptionEn:
      "The same components as the Safari Trip, but lunch is served at Magic Lake Camp amid nature instead of returning to Zawya Oasis.",
    itinerary: [
      step(
        "الإفطار في واحة الزاواي",
        "Breakfast at Zawya Oasis",
        "فطير مشلتت + عسل + جبنة + مش فلاحي",
        "Feteer meshaltet + honey + cheese + farm mish"
      ),
      step(
        "التحرك إلى محمية وادي الريان بسيارات السفاري",
        "Heading to the Wadi El Rayan reserve by safari vehicles"
      ),
      step("مغامرة بسيارات الدفع الرباعي وسط الكثبان الرملية", "A 4x4 adventure among the sand dunes"),
      step("التزلج على الرمال (Sandboarding)", "Sandboarding"),
      step("زيارة شلالات وادي الريان", "Visiting the Wadi El Rayan waterfalls"),
      step(
        "التوقف عند نقطة الـ View",
        "Stopping at the view point",
        "إطلالة بانورامية رائعة",
        "A wonderful panoramic view"
      ),
      step("زيارة البحيرة السحرية (Magic Lake)", "Visiting the Magic Lake"),
      step("تجربة الشاي البدوي بجوار البحيرة", "A bedouin tea experience by the lake"),
      step(
        "الغداء في كامب الماجيك ليك",
        "Lunch at Magic Lake Camp",
        "ربع فرخة + أرز + بطاطس + سلطة عربي + طحينة + عيش",
        "Quarter chicken + rice + potatoes + arabic salad + tahini + bread"
      ),
      step("جلسة كامب فاير", "Campfire session", "أجواء بدوية مميزة", "A distinctive bedouin atmosphere"),
    ],
    startTime: "",
    endTime: "",
    duration: "يوم كامل",
    durationEn: "A full day",
    includes: ["سيارات السفاري", "تذاكر دخول المحمية", "مشرف الرحلة"],
    includesEn: ["Safari vehicles", "Reserve entry tickets", "A trip supervisor"],
    images: ["/images/safari-waterfall.jpg", "/images/lake-boats.jpg", "/images/safari-dunes.jpg"],
    isCustom: false,
    isBuilder: false,
  },
  {
    id: "magic-lake-camp",
    name: "برنامج رحلة كامب الماجيك ليك",
    nameEn: "Magic Lake Camp Trip",
    description:
      "رحلة يومين بمبيت في كامب الماجيك ليك: اليوم الأول ركوب مركب وساند بورد وعشاء وكامب فاير وسط الصحراء، واليوم التاني شروق وإفطار ريفي وجبل المدورة والشلالات وجولة في قرية تونس وورش الفخار.",
    descriptionEn:
      "A two-day trip with an overnight stay at Magic Lake Camp: day one brings a boat ride, sandboarding, dinner, and a campfire in the desert; day two brings the sunrise, a rustic breakfast, Al-Madawra Mountain, the waterfalls, and a tour of Tunis Village and its pottery workshops.",
    itinerary: [
      step("اليوم الأول — الوصول إلى كامب الماجيك ليك", "Day one — arriving at Magic Lake Camp"),
      step("استلام الخيام الخاصة بالجروب", "Receiving the group's tents"),
      step("المشاركة في تجهيز الكامب والاستراحة", "Helping set up the camp, then resting"),
      step("ركوب المركب", "A boat ride"),
      step("ساند بورد", "Sandboarding"),
      step("العشاء", "Dinner", "فراخ + بطاطس + أرز + طحينة + سلطة", "Chicken + potatoes + rice + tahini + salad"),
      step(
        "كامب فاير وقعدة سمر",
        "Campfire and an evening gathering",
        "شوي مارشميلو + شاي بدوي",
        "Grilled marshmallows + bedouin tea"
      ),
      step("اليوم التاني — مشاهدة الشروق داخل الكامب", "Day two — watching the sunrise from the camp"),
      step(
        "الإفطار الريفي داخل الكامب",
        "A rustic breakfast at the camp",
        "فطير مشلتت + عسل + جبنة بخضار",
        "Feteer meshaltet + honey + cheese with vegetables"
      ),
      step("جبل المدورة", "Al-Madawra Mountain", "الصعود إلى أعلى الجبل", "Climbing to the top of the mountain"),
      step("زيارة الشلالات", "Visiting the waterfalls"),
      step(
        "قرية تونس",
        "Tunis Village",
        "جولة حرة داخل القرية وزيارة ورش ومدارس الفخار — وإمكانية تجربة عمل قطع فخار بتكلفة إضافية",
        "Free time in the village and a visit to the pottery workshops and schools — a hands-on pottery session is available at extra cost"
      ),
    ],
    startTime: "",
    endTime: "",
    duration: "يومين — مبيت ليلة في الكامب",
    durationEn: "Two days — one night at the camp",
    includes: [
      "الخيام والمبيت في الكامب",
      "العشاء وإفطار اليوم التاني",
      "ركوب المركب والساند بورد",
      "كامب فاير وشاي بدوي",
    ],
    includesEn: [
      "Tents and the overnight stay",
      "Dinner and day-two breakfast",
      "Boat ride and sandboarding",
      "Campfire and bedouin tea",
    ],
    images: ["/images/safari-dunes.jpg", "/images/lake-dramatic.jpg", "/images/safari-waterfall.jpg"],
    isCustom: true,
    isBuilder: false,
  },
  {
    id: "elite-program",
    name: "برنامج إليت (كستميز)",
    nameEn: "Elite Program (Customize)",
    description:
      "برنامج إليت (كستميز) مصمم خصيصًا حسب رغبتكم، بمرونة كاملة تشمل إمكانية تغيير أماكن الإفطار والغداء حسب الاختيار. برنامج مثالي لفعاليات الريتريت الجماعية، ويمكن أيضًا تصميمه لمن يرغبون في المبيت أو التخييم الليلي.",
    descriptionEn:
      "The Elite Program (Customize) is designed especially according to your preferences, with full flexibility including the ability to change the breakfast and lunch locations of your choice. An ideal program for group retreat events, and can also be designed for those who wish to stay overnight or camp.",
    itinerary: [],
    startTime: "",
    endTime: "",
    duration: "مرن حسب تصميم البرنامج",
    durationEn: "Flexible, based on the custom program design",
    includes: [],
    includesEn: [],
    images: ["/images/hero.jpg", "/images/lake-dramatic.jpg"],
    isCustom: true,
    isBuilder: false,
  },
];
