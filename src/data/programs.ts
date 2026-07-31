// ============================================================
// ملف بيانات برامج الرحلات (صفحة "رحلات شركات")
// عدّل هنا: اسم البرنامج، الوصف، تفاصيل البرنامج، المدة، وما يشمله السعر
// كل حقل عربي له مقابل إنجليزي بنفس الاسم + En (لدعم زر تغيير اللغة)
// ملاحظة مهمة: الأسعار لا يتم تخزينها هنا إطلاقًا
// كل الأسعار موجودة فقط في ملف lib/pricing.ts (سيرفر فقط)
// معرّف "id" هنا يجب أن يطابق نفس المعرّف الموجود في lib/pricing.ts
// ============================================================

export type CorporateProgram = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  highlights: string[];
  highlightsEn: string[];
  duration: string;
  durationEn: string;
  includes: string[];
  includesEn: string[];
  images: string[];
  // true للبرامج المخصصة بالكامل حسب الطلب (زي برنامج إليت): بيتم إخفاء حاسبة السعر
  // من صفحته وقائمة اختيار البرنامج في حاسبة السعر، لأن مفيش سعر ثابت للفرد
  isCustom: boolean;
};

export const corporatePrograms: CorporateProgram[] = [
  {
    id: "innspot-classic",
    name: "برنامج إنسبوت كلاسيك",
    nameEn: "Innspot Classic",
    description:
      "رحلة يوم كامل في واحة الزاواي ومحيطها، تجمع بين الطبيعة والهدوء والأنشطة الترفيهية البسيطة، مناسبة لفرق عايزة تجربة استرخاء وترابط بعيد عن أجواء الشركة.",
    descriptionEn:
      "A full-day trip in Zawya Oasis and its surroundings, combining nature, calm, and simple recreational activities — suited for teams looking for a relaxing bonding experience away from the corporate atmosphere.",
    highlights: [
      "الإفطار في واحة الزاواي",
      "زيارة الشلالات",
      "جبل المدورة (الصعود أو الاستمتاع بالإطلالة)",
      "الساند بورد",
      "ركوب المركب في البحيرة",
      "الغداء في كامب الزاواي",
      "الكامب فاير (شاي ومارشميلو)",
    ],
    highlightsEn: [
      "Breakfast at Zawya Oasis",
      "Visiting the waterfalls",
      "Al-Madawra Mountain (climb it or enjoy the view)",
      "Sandboarding",
      "Boat ride on the lake",
      "Lunch at Zawya Camp",
      "Campfire (tea and marshmallows)",
    ],
    duration: "يوم كامل حتى المساء (من الصباح حتى المساء تقريبًا)",
    durationEn: "Full day into the evening (from morning until evening, approx.)",
    includes: ["إفطار في واحة الزاواي", "غداء في كامب الزاواي", "معدات الساند بورد", "جولة بالمركب", "جلسة كامب فاير"],
    includesEn: ["Breakfast at Zawya Oasis", "Lunch at Zawya Camp", "Sandboarding equipment", "Boat ride", "Campfire session"],
    images: ["/images/safari-waterfall.jpg", "/images/safari-dunes.jpg", "/images/lake-boats.jpg"],
    isCustom: false,
  },
  {
    id: "advance-program",
    name: "برنامج أدفانس",
    nameEn: "Advance",
    description:
      "نفس مكونات برنامج Classic، بترتيب مختلف والغداء بيتقدم في كامب الماجيك ليك بدل الرجوع لواحة الزاواي.",
    descriptionEn:
      "The same components as the Classic program, in a different order, with lunch served at Magic Lake Camp instead of returning to Zawya Oasis.",
    highlights: [
      "الإفطار في واحة الزاواي",
      "زيارة الشلالات",
      "جبل المدورة (الصعود أو الاستمتاع بالإطلالة)",
      "التوجه إلى كامب الماجيك",
      "الساند بورد",
      "الغداء في كامب الماجيك",
      "ركوب المركب في البحيرة",
      "الكامب فاير (شاي ومارشميلو)",
    ],
    highlightsEn: [
      "Breakfast at Zawya Oasis",
      "Visiting the waterfalls",
      "Al-Madawra Mountain (climb it or enjoy the view)",
      "Heading to Magic Camp",
      "Sandboarding",
      "Lunch at Magic Camp",
      "Boat ride on the lake",
      "Campfire (tea and marshmallows)",
    ],
    duration: "يوم كامل حتى المساء (من الصباح حتى المساء تقريبًا)",
    durationEn: "Full day into the evening (from morning until evening, approx.)",
    includes: ["إفطار في واحة الزاواي", "غداء في كامب الماجيك", "معدات الساند بورد", "جولة بالمركب", "جلسة كامب فاير"],
    includesEn: ["Breakfast at Zawya Oasis", "Lunch at Magic Camp", "Sandboarding equipment", "Boat ride", "Campfire session"],
    images: ["/images/safari-dunes.jpg", "/images/lake-boats.jpg", "/images/safari-waterfall.jpg"],
    isCustom: false,
  },
  {
    id: "classic-safari",
    name: "برنامج كلاسيك سفاري",
    nameEn: "Classic Safari",
    description:
      "رحلة يوم كامل تعتمد على سيارات السفاري والتنقل بالدفع الرباعي وسط محمية وادي الريان، مناسبة لفرق عايزة عنصر مغامرة وأدرينالين مع الطبيعة.",
    descriptionEn:
      "A full-day trip based on safari vehicles and 4x4 travel through the Wadi El Rayan reserve, suited for teams looking for a touch of adventure and adrenaline with nature.",
    highlights: [
      "الإفطار في واحة الزاواي",
      "التحرك إلى محمية وادي الريان بسيارات السفاري",
      "مغامرة بسيارات الدفع الرباعي وسط الكثبان الرملية",
      "التزلج على الرمال (Sandboarding)",
      "زيارة شلالات وادي الريان",
      "التوقف عند نقطة الـ View",
      "زيارة البحيرة السحرية (Magic Lake)",
      "تجربة الشاي البدوي بجوار البحيرة",
      "العودة إلى واحة الزاواي لتناول الغداء",
      "جلسة كامب فاير بأجواء بدوية",
    ],
    highlightsEn: [
      "Breakfast at Zawya Oasis",
      "Traveling to the Wadi El Rayan reserve by safari vehicles",
      "4x4 adventure among the sand dunes",
      "Sandboarding",
      "Visiting the Wadi El Rayan waterfalls",
      "Stopping at the view point",
      "Visiting the Magic Lake",
      "Bedouin tea experience by the lake",
      "Returning to Zawya Oasis for lunch",
      "Campfire session with a bedouin atmosphere",
    ],
    duration: "يوم كامل حتى المساء (من الصباح حتى المساء تقريبًا)",
    durationEn: "Full day into the evening (from morning until evening, approx.)",
    includes: ["سيارات السفاري", "إفطار في واحة الزاواي", "غداء في واحة الزاواي", "شاي بدوي", "جلسة كامب فاير"],
    includesEn: ["Safari vehicles", "Breakfast at Zawya Oasis", "Lunch at Zawya Oasis", "Bedouin tea", "Campfire session"],
    images: ["/images/safari-dunes.jpg", "/images/safari-waterfall.jpg", "/images/lake-dramatic.jpg"],
    isCustom: false,
  },
  {
    id: "advance-safari",
    name: "برنامج أدفانس سفاري",
    nameEn: "Advance Safari",
    description:
      "نفس مكونات برنامج Classic Safari، مع تقديم الغداء في كامب الماجيك ليك بدل الرجوع لواحة الزاواي.",
    descriptionEn:
      "The same components as the Classic Safari program, with lunch served at Magic Lake Camp instead of returning to Zawya Oasis.",
    highlights: [
      "الإفطار في واحة الزاواي",
      "التحرك إلى محمية وادي الريان بسيارات السفاري",
      "مغامرة بسيارات الدفع الرباعي وسط الكثبان الرملية",
      "التزلج على الرمال (Sandboarding)",
      "زيارة شلالات وادي الريان",
      "التوقف عند نقطة الـ View",
      "زيارة البحيرة السحرية (Magic Lake)",
      "تجربة الشاي البدوي بجوار البحيرة",
      "الغداء في كامب الماجيك ليك",
      "جلسة كامب فاير بأجواء بدوية",
    ],
    highlightsEn: [
      "Breakfast at Zawya Oasis",
      "Traveling to the Wadi El Rayan reserve by safari vehicles",
      "4x4 adventure among the sand dunes",
      "Sandboarding",
      "Visiting the Wadi El Rayan waterfalls",
      "Stopping at the view point",
      "Visiting the Magic Lake",
      "Bedouin tea experience by the lake",
      "Lunch at Magic Lake Camp",
      "Campfire session with a bedouin atmosphere",
    ],
    duration: "يوم كامل حتى المساء (من الصباح حتى المساء تقريبًا)",
    durationEn: "Full day into the evening (from morning until evening, approx.)",
    includes: ["سيارات السفاري", "إفطار في واحة الزاواي", "غداء في كامب الماجيك ليك", "شاي بدوي", "جلسة كامب فاير"],
    includesEn: ["Safari vehicles", "Breakfast at Zawya Oasis", "Lunch at Magic Lake Camp", "Bedouin tea", "Campfire session"],
    images: ["/images/safari-waterfall.jpg", "/images/lake-boats.jpg", "/images/safari-dunes.jpg"],
    isCustom: false,
  },
  {
    id: "elite-program",
    name: "برنامج إليت (كستميز)",
    nameEn: "Elite Program (Customize)",
    description:
      "برنامج إليت (كستميز) مصمم خصيصًا حسب رغبتكم، بمرونة كاملة تشمل إمكانية تغيير أماكن الإفطار والغداء حسب الاختيار. برنامج مثالي لفعاليات الريتريت الجماعية، ويمكن أيضًا تصميمه لمن يرغبون في المبيت أو التخييم الليلي.",
    descriptionEn:
      "The Elite Program (Customize) is designed especially according to your preferences, with full flexibility including the ability to change the breakfast and lunch locations of your choice. An ideal program for group retreat events, and can also be designed for those who wish to stay overnight or camp.",
    highlights: [],
    highlightsEn: [],
    duration: "مرن حسب تصميم البرنامج",
    durationEn: "Flexible, based on the custom program design",
    includes: [],
    includesEn: [],
    images: ["/images/hero.jpg", "/images/lake-dramatic.jpg"],
    isCustom: true,
  },
];
