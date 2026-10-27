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

  // رقم واتساب رحلات الشركات: كل زراير الواتساب في /corporate-trips وصفحات البرامج بتروحله
  corporateWhatsappNumber: "201035751956",

  // رقم واتساب أفراد وإقامة: كل زراير الواتساب في /accommodation (الفلل والفنادق والأنشطة) بتروحله
  accommodationWhatsappNumber: "201035751156",

  // رقم بكسل ميتا (Dataset ID من Events Manager). فاضي = البكسل مش شغال
  metaPixelId: "1802977127420364",

  // بيانات التواصل التي تظهر في الفوتر
  contact: {
    phone: "+20 106 184 0111",
    email: "reservations@innspotagency.com",
    address: "الفيوم، جمهورية مصر العربية",
  },

  // روابط التواصل الاجتماعي — أي لينك فاضي مش بيظهر في الفوتر
  // تيك توك: لسه مفيش حساب حقيقي، حط اللينك هنا لما يبقى فيه
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61564624791730",
    instagram: "https://www.instagram.com/innspot_agency",
    linkedin: "https://www.linkedin.com/company/phiomin",
    tiktok: "",
  },
} as const;

// روابط التنقل الأساسية في الموقع
// key هنا يطابق مفتاح الترجمة في data/translations.ts (translations[lang].nav)
export const navLinks = [
  { href: "/", key: "home" },
  { href: "/accommodation", key: "accommodation" },
  { href: "/corporate-trips", key: "corporateTrips" },
  { href: "/about", key: "about" },
] as const;
