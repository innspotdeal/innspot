// ============================================================
// كلام صفحة "رحلات شركات" — لاندنج بيدج بسيطة، والمطلوب من العميل إنه يكلمنا بس:
// مبنية على اللي بيقلق المسؤول عن رحلة الشركة، وبتركّز على الجودة مش السعر.
// البرامج في السوق مكتوبة بنفس الكلام (فطار، سفاري، غدا)، والفرق الحقيقي
// مش مكتوب — الصفحة بتعرّف العميل بيه عشان مايقارنش بالسعر بس
// ============================================================

type Point = { label: string; text: string };

type Stage = {
  number: string;
  title: string;
  text?: string;
  points?: Point[];
  // برنامج اليوم بس: مقارنة نوعين السفاري، وبعدها كلام السواق
  safari?: boolean;
  after?: Point;
};

// مشكلة بتقلق المسؤول عن الرحلة، وإحنا بنتعامل معاها إزاي
type Pain = { title: string; answer: string };

type TripsGuide = {
  // زرار الجزء الأزرق اللي فوق: يكلمنا على واتساب
  hero: { cta: string; ctaMessage: string };
  paper: {
    heading: string;
    text: string;
    writtenLabel: string;
    written: string[];
    unwrittenLabel: string;
    unwritten: string[];
    closing: string;
  };
  pains: { heading: string; intro: string; items: Pain[] };
  details: { heading: string; intro: string; stages: Stage[] };
  // columnNotes: تحت اسم كل عمود — الجولة مش بنعملها، والسفاري الكاملة هي اللي بنعملها
  safari: {
    columns: [string, string];
    columnNotes: [string, string];
    rows: { label: string; tour: string; full: string }[];
  };
  beyond: { heading: string; text: string };
  programs: { heading: string; text: string };
  // button: زرار الواتساب بيقول إننا شايلين المسؤولية مع صاحب القرار
  start: { heading: string; text: string; button: string; message: string };
};

const AR_MESSAGE = "مرحبًا، عايز أرتّب رحلة لشركتنا:\nعدد الفريق: \nنوع الرحلة (يوم / داي يوز / مبيت): \nالتاريخ المتوقع: ";
const EN_MESSAGE = "Hello, I'd like to plan a trip for our company:\nTeam size: \nTrip type (day / day use / overnight): \nExpected date: ";

export const tripsGuide: Record<"ar" | "en", TripsGuide> = {
  ar: {
    hero: { cta: "كلّمنا، والمسؤولية كلها علينا", ctaMessage: AR_MESSAGE },
    paper: {
      heading: "على الورق، كل البرامج شبه بعض",
      text: "فطار، سفاري، غدا. ده اللي مكتوب في أي برنامج في السوق، فالطبيعي إنك تقارن بالسعر. بس اللي بيحدد يوم الرحلة فعلًا مش مكتوب في الورق.",
      writtenLabel: "اللي مكتوب في البرنامج",
      written: ["فطار", "سفاري", "غدا"],
      unwrittenLabel: "اللي مش مكتوب، وهو اللي بيفرق",
      unwritten: [
        "المكان نضيف ولا لأ، وزحمته الحقيقية يوم الرحلة",
        "الأكل جودته إيه، ومتنوع ولا لأ",
        "السفاري: عربية معاكم طول اليوم، ولا جولة صغيرة وترجع",
        "السواق خبرته إيه في الصحرا",
        "مين المسؤول لو حصل أي حاجة",
      ],
      closing: "إحنا من الفيوم، فبنشوف الفرق ده بعينينا مش من الإعلانات، وبنقولهولك قبل ما تختار.",
    },
    pains: {
      heading: "اللي بيقلق أي حد مسؤول عن رحلة شركة",
      intro: "إنت اللي هتتسأل لو أي حاجة باظت، بس مش لوحدك: المسؤولية علينا إحنا كمان. عشان كده بنشتغل على النقط دي قبل أي حاجة تانية:",
      items: [
        { title: "المكان مش زي الصور", answer: "بنزور كل مكان بنفسنا، ونقولك حقيقته قبل ما تحجز." },
        {
          title: "الزحمة والانتظار",
          answer: "بنختار أماكن طاقتها الحقيقية تستوعب فريقك، مش مكان طاقته 200 فرد وبيستقبل 1000.",
        },
        { title: "الأكل", answer: "أكل نضيف ومتنوع من أماكن جربناها بنفسنا، وتفاصيله متراجعة قبل اليوم." },
        {
          title: "الأمان في الصحرا",
          answer: "سواقين عارفينهم بالاسم والخبرة، وعربيات بحالة كويسة. في الـ off-road الخبرة هي الأمان.",
        },
        {
          title: "الفريق يتفرّق",
          answer: "في السفاري الكاملة كل 5 أو 6 أفراد في عربية معاهم طول اليوم، فالفريق يفضل مع بعض.",
        },
        {
          title: "لو حصل أي حاجة",
          answer: "إحنا المسؤولين قدامك عن الحجز والمواعيد والأكل والمواصلات، ورقم واحد تكلمه طول اليوم. أي مشكلة بتبقى مشكلتنا إحنا.",
        },
      ],
    },
    details: {
      heading: "التفاصيل اللي بنختارها بنفسنا",
      intro: "كل رحلة عندنا فيها 3 مراحل وإضافات اختيارية، وفي كل مرحلة بنختار على أساس الجودة:",
      stages: [
        {
          number: "١",
          title: "الفطار",
          points: [
            {
              label: "المكان",
              text: "بنقيّمه بالنضافة وجودة الخدمة، وكمان طاقته الاستيعابية الحقيقية. فيه مكان شكله حلو، لكن طاقته 200 فرد وبيستقبل 1000، وده بيبوّظ التجربة.",
            },
            { label: "الأصناف", text: "تنوّع الفطار وجودته." },
          ],
        },
        {
          number: "٢",
          title: "برنامج اليوم",
          points: [
            { label: "رحلة بالباص", text: "تجربة أبسط، ومش بتروح نفس أماكن السفاري." },
            { label: "رحلة بالسفاري", text: "تجربة الصحرا الحقيقية، والفرق كله في نوع السفاري:" },
          ],
          safari: true,
          after: {
            label: "السواق",
            text: "إحنا عارفين السواقين بالاسم وبالخبرة. في الـ off-road بعد ستر ربنا، الخبرة هي الأمان، والسواق الكويس بيتحوّل لشخص بيتفاعل مع الفريق ويضيف طابع مميز للرحلة.",
          },
        },
        {
          number: "٣",
          title: "الغداء",
          text: "زي الفطار: المكان (نضافته وطاقته)، والأصناف (جودتها وتنوعها).",
        },
        {
          number: "٤",
          title: "الإضافات (اختياري)",
          text: "فقرة موسيقى بدوية، أو عرض نار، أو استقبال بالمزمار البلدي.",
        },
      ],
    },
    safari: {
      columns: ["سفاري جولة", "سفاري كاملة"],
      columnNotes: ["مش بنعملها", "اللي بنعمله"],
      rows: [
        { label: "العربية", tour: "عربية واحدة بتقف في مكان محدد في المحمية", full: "العربية معاك طول الرحلة" },
        { label: "الأسلوب", tour: "بتاخد مجموعة، تعمل جولة صغيرة، ترجع وتاخد مجموعة تانية", full: "كل 5 أو 6 أفراد في عربية مخصّصة" },
        { label: "التجربة", tour: "مكان شبه الرحلة الحقيقية، لكن بدون تجربة الكثبان الحقيقية", full: "كثبان رملية وتجربة كاملة" },
        { label: "المجموعة", tour: "بتتفرّق عن بعضها", full: "بتفضل مع بعضها" },
        { label: "الاستخدام", tour: "السفاري وسيلة نقل", full: "السفاري جزء من الرحلة نفسها" },
      ],
    },
    beyond: {
      heading: "ونفس الاهتمام في الداي يوز والمبيت",
      text: "بنرتّب الداي يوز والمبيت بنفس الطريقة: بنختار المكان بنفسنا ونقولك حقيقته. وأي متطلبات تانية لفريقك، قولنا عليها ونرتّبها بالشكل اللي يناسبكم.",
    },
    programs: {
      heading: "برامجنا الجاهزة",
      text: "برامج يوم كامل بجودة إحنا ضامنينها، وتقدر تطوّر أي نقطة فيها على حسب فريقك.",
    },
    start: {
      heading: "سيب التفاصيل علينا",
      text: "قولنا عدد الفريق ونوع الرحلة (يوم، داي يوز، مبيت)، ونرد عليك على واتساب. من أول الحجز لحد ما فريقك يرجع، إحنا شايلينها معاك.",
      button: "كلّمنا، والمسؤولية كلها علينا",
      message: AR_MESSAGE,
    },
  },
  en: {
    hero: { cta: "Message us, the responsibility is all ours", ctaMessage: EN_MESSAGE },
    paper: {
      heading: "On paper, every programme looks the same",
      text: "Breakfast, safari, lunch. That's what every programme on the market says, so it's natural to compare on price. But what really decides the day isn't written on the paper.",
      writtenLabel: "What the programme says",
      written: ["Breakfast", "Safari", "Lunch"],
      unwrittenLabel: "What it doesn't say, and what makes the difference",
      unwritten: [
        "Whether the venue is clean, and how crowded it really is on the day",
        "How good the food is, and how varied",
        "The safari: a car with you all day, or a short ride and back",
        "How experienced the driver is in the desert",
        "Who is responsible if anything goes wrong",
      ],
      closing: "We're from Faiyum, so we see that difference with our own eyes, not from ads, and we tell you before you choose.",
    },
    pains: {
      heading: "What worries anyone running a company trip",
      intro: "You're the one who gets asked if anything goes wrong, but you're not alone: the responsibility is ours too. That's why we work on these before anything else:",
      items: [
        { title: "The place isn't like the photos", answer: "We visit every place ourselves and tell you the truth about it before you book." },
        {
          title: "Crowds and waiting",
          answer: "We pick places whose real capacity fits your team, not a place built for 200 that takes 1,000.",
        },
        { title: "The food", answer: "Clean, varied food from places we've tried ourselves, with the details checked before the day." },
        {
          title: "Safety in the desert",
          answer: "Drivers we know by name and experience, and cars in good shape. Off-road, experience is safety.",
        },
        {
          title: "The team gets split up",
          answer: "On a full safari every 5 or 6 people have a car with them all day, so the team stays together.",
        },
        {
          title: "If anything happens",
          answer: "We answer to you for the booking, the schedule, the food and the transport, with one number to call all day. Any problem is our problem.",
        },
      ],
    },
    details: {
      heading: "The details we choose ourselves",
      intro: "Every trip has three stages plus optional add-ons, and at each stage we choose on quality:",
      stages: [
        {
          number: "1",
          title: "Breakfast",
          points: [
            {
              label: "The venue",
              text: "We rate it on cleanliness, service, and its real capacity. Some places look great, but are built for 200 people and take 1,000. That ruins the experience.",
            },
            { label: "The menu", text: "The variety and quality of the food." },
          ],
        },
        {
          number: "2",
          title: "The day's program",
          points: [
            { label: "By bus", text: "A simpler experience, and it doesn't go to the same places as the safari." },
            { label: "By safari", text: "The real desert experience, and the difference is all in the type of safari:" },
          ],
          safari: true,
          after: {
            label: "The driver",
            text: "We know our drivers by name and by experience. Off-road, experience is safety, and a great driver becomes part of the team and adds real character to the trip.",
          },
        },
        {
          number: "3",
          title: "Lunch",
          text: "Same as breakfast: the venue (cleanliness and capacity) and the menu (quality and variety).",
        },
        {
          number: "4",
          title: "Add-ons (optional)",
          text: "A Bedouin band, a fire show, or a traditional mizmar welcome.",
        },
      ],
    },
    safari: {
      columns: ["Safari Tour", "Full Safari"],
      columnNotes: ["Not what we do", "What we do"],
      rows: [
        { label: "The car", tour: "One car waits at a set spot in the reserve", full: "The car stays with you all trip" },
        { label: "How it works", tour: "Takes a group on a short ride, returns, takes the next group", full: "One dedicated car per 5–6 people" },
        { label: "Experience", tour: "Similar scenery, without the real dune experience", full: "Real dunes, the full experience" },
        { label: "The group", tour: "Gets split up", full: "Stays together" },
        { label: "Role of the safari", tour: "Just transportation", full: "Part of the trip itself" },
      ],
    },
    beyond: {
      heading: "The same care for day use and overnight stays",
      text: "We arrange day use and overnight stays the same way: we pick the place ourselves and tell you the truth about it. Any other requirements your team has, tell us and we'll arrange them to suit you.",
    },
    programs: {
      heading: "Our ready programmes",
      text: "Full-day programmes at a quality we stand behind, and you can upgrade any point in them to suit your team.",
    },
    start: {
      heading: "Leave the details to us",
      text: "Tell us your team size and the type of trip (day, day use, overnight), and we'll get back to you on WhatsApp. From the booking until your team is home, we carry it with you.",
      button: "Message us, the responsibility is all ours",
      message: EN_MESSAGE,
    },
  },
};
