// ============================================================
// ملف إعدادات الموقع العامة
// عدّل هنا: اسم الشركة، الشعار النصي، رقم الواتساب، وروابط التواصل الاجتماعي
// ============================================================

export const siteConfig = {
  // اسم البراند كما يظهر في الشريط العلوي وأماكن أخرى
  name: "إنسبوت",
  nameEn: "Innspot",

  // الجملة التي تظهر أسفل الشعار في الصفحة الرئيسية
  tagline: "اكتشف سحر الفيوم.. صحراء، بحيرات، ومغامرات لا تُنسى",
  taglineEn: "Discover the magic of Fayoum.. desert, lakes, and unforgettable adventures",

  // رقم الواتساب الأساسي لاستقبال طلبات الحجز والتواصل
  // مهم: اكتب الرقم بصيغة دولية بدون + أو مسافات أو أصفار في البداية (مثال لمصر: 20xxxxxxxxxx)
  whatsappNumber: "201061840111",

  // بيانات التواصل التي تظهر في الفوتر
  contact: {
    phone: "+20 106 184 0111",
    email: "info@innspot-fayoum.com",
    address: "الفيوم، جمهورية مصر العربية",
  },

  // روابط التواصل الاجتماعي
  // ملاحظة: لسه معندناش رابط تيك توك حقيقي، ده لسه placeholder لحين توفيره
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61564624791730",
    instagram: "https://www.instagram.com/innspot_agency",
    linkedin: "https://www.linkedin.com/company/phiomin",
    tiktok: "https://tiktok.com/@innspot",
  },
} as const;

// روابط التنقل الأساسية في الموقع
// key هنا يطابق مفتاح الترجمة في data/translations.ts (translations[lang].nav)
export const navLinks = [
  { href: "/", key: "home" },
  { href: "/accommodation", key: "accommodation" },
  { href: "/corporate-trips", key: "corporateTrips" },
] as const;
