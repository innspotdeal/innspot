// ============================================================
// ملف بيانات الأنشطة (تبويب "أنشطة" في صفحة "أفراد وإقامة")
// عدّل هنا: الاسم، الوصف، والصورة لكل نشاط
// البيانات الحالية مبدئية (placeholder) — عدّلها لاحقًا بالأنشطة والصور الفعلية
// ============================================================

export type Activity = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  image: string;
};

export const activities: Activity[] = [
  {
    id: "activity-safari",
    name: "رحلة سفاري بالدفع الرباعي",
    nameEn: "4x4 Safari Trip",
    description: "جولة سفاري مثيرة بين كثبان الصحراء الرملية، مناسبة للأفراد والعائلات.",
    descriptionEn: "An exciting safari tour among the desert's sand dunes, suitable for individuals and families.",
    image: "/images/safari-dunes.jpg",
  },
  {
    id: "activity-boat-ride",
    name: "ركوب القوارب في بحيرة قارون",
    nameEn: "Boat Ride on Lake Qarun",
    description: "جولة هادئة بالقارب على بحيرة قارون، فرصة رائعة لمشاهدة الغروب.",
    descriptionEn: "A relaxing boat ride on Lake Qarun, a great chance to watch the sunset.",
    image: "/images/lake-boats.jpg",
  },
  {
    id: "activity-desert-camp",
    name: "معسكر صحراوي ليلي",
    nameEn: "Desert Night Camp",
    description: "أمسية تخييم صحراوي أصيلة تحت النجوم مع فقرات ترفيهية.",
    descriptionEn: "An authentic desert camping evening under the stars with entertainment.",
    image: "/images/hero.jpg",
  },
];
