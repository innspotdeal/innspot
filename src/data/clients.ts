// ============================================================
// شعارات الشركات اللي نفّذنا لها رحلات (تظهر في صفحة "رحلات شركات")
// الصور موجودة في public/images/clients/
// لإضافة شركة جديدة: حط صورتها في نفس الفولدر وضيف سطر هنا
// ============================================================

export type Client = {
  name: string;
  logo: string;
};

export const clients: Client[] = [
  { name: "Siemens Healthineers", logo: "/images/clients/01.png" },
  { name: "Source", logo: "/images/clients/02.png" },
  { name: "Bokra", logo: "/images/clients/03.png" },
  { name: "E3mel Business Academy", logo: "/images/clients/04.png" },
  { name: "Professional Services (Proserv)", logo: "/images/clients/05.png" },
  { name: "Branding Gate", logo: "/images/clients/06.png" },
];
