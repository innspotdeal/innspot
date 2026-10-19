// ============================================================
// كلام صفحة "رحلات شركات" قبل البرامج: إزاي بنحسب سعر الرحلة،
// وبعدها الاختيار بين البرنامج الثابت والكاستم — بالعربي والإنجليزي
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

type Choice = { tag: string; title: string; paragraphs: string[] };

type TripsGuide = {
  // leadIn: الجملة اللي قبل المراحل على طول — إن النقط دي هي اللي بتفرّق في السعر
  intro: { heading: string; paragraphs: string[]; leadIn: string };
  stages: Stage[];
  safari: { columns: [string, string]; rows: { label: string; tour: string; full: string }[] };
  paperGap: { heading: string; text: string };
  choose: { heading: string; fixed: Choice; custom: Choice };
  beyond: { heading: string; text: string };
  easy: { heading: string; points: string[] };
  start: { heading: string; text: string; button: string; message: string };
};

export const tripsGuide: Record<"ar" | "en", TripsGuide> = {
  ar: {
    intro: {
      heading: "قبل ما تشوف البرامج: إزاي بنحسب سعر الرحلة؟",
      paragraphs: [
        "إحنا من الفيوم، وعارفين كل مكان فيها وكل تفصيلة. عشان كده نقدر نقولك بالظبط إنت بتدفع في إيه، وليه، من غير ما نخبّي حاجة.",
        "أي رحلة عندنا بتتكوّن من ثلاث مراحل، وفي إضافات اختيارية. كل مرحلة ليها سعر حسب اللي بنختاره فيها.",
      ],
      leadIn: "النقط الجاية هي اللي بتفرّق في سعر الرحلة:",
    },
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
          { label: "رحلة بالباص", text: "الأقل في التكلفة، بس مش بتروح نفس أماكن السفاري، وجودة التجربة أقل." },
          { label: "رحلة بالسفاري", text: "تكلفتها بتتحدد من عدد الأفراد في العربية الواحدة." },
        ],
        safari: true,
        after: {
          label: "السواق",
          text: "إحنا عارفين السواقين بالاسم وبالخبرة. السواق الأحدث والأكتر خبرة وعربيته أحسن بيكلّف أكتر. في الـ off-road بعد ستر ربنا، الخبرة هي الأمان، وكمان بيتحوّل من سواق لشخص بيتفاعل مع الفريق ويضيف طابع مميز للرحلة.",
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
    safari: {
      columns: ["سفاري جولة", "سفاري كاملة"],
      rows: [
        { label: "العربية", tour: "عربية واحدة بتقف في مكان محدد في المحمية", full: "العربية معاك طول الرحلة" },
        { label: "الأسلوب", tour: "بتاخد مجموعة، تعمل جولة صغيرة، ترجع وتاخد مجموعة تانية", full: "كل 5 أو 6 أفراد في عربية مخصّصة" },
        { label: "التجربة", tour: "مكان شبه الرحلة الحقيقية، لكن بدون تجربة الكثبان الحقيقية", full: "كثبان رملية وتجربة كاملة" },
        { label: "المجموعة", tour: "بتتفرّق عن بعضها", full: "بتفضل مع بعضها" },
        { label: "الاستخدام", tour: "السفاري وسيلة نقل", full: "السفاري جزء من الرحلة نفسها" },
      ],
    },
    paperGap: {
      heading: "ليه برنامجين شكلهم واحد على الورق وسعرهم مختلف؟",
      text: "لأن الورق بيكتب \"فطار، سفاري، غداء\" للاتنين. الفرق في اللي مش مكتوب: نضافة المكان، وعدد الناس فيه، وجودة الأكل، ونوع السفاري، وخبرة السواق. وإحنا من الفيوم، فبنشوف الفرق ده بعينينا مش من الإعلانات.",
    },
    choose: {
      heading: "اختار الطريقة اللي تناسبك",
      fixed: {
        tag: "نقطة البداية",
        title: "البرنامج الثابت",
        paragraphs: [
          "برنامج جاهز، ثابت، بجودة مقبولة وبأقل تكلفة ممكنة. تقدر تشوف كل تفاصيله قدامك وتعرف بالظبط هتاخد إيه.",
          "ولو حبّيت ترفع مستوى أي نقطة، بنطوّر النقطة دي بس: مكان الفطار، أو نوع السفاري، أو الغداء، أو تضيف فقرة. تدفع فرق النقطة اللي اخترتها بس.",
        ],
      },
      custom: {
        tag: "رحلتك بمقاسك",
        title: "البرنامج الكاستم",
        paragraphs: [
          "لو عايز رحلة بشكل مختلف، إنت اللي بتظبط الرحلة: تختار مكان الفطار، ومكان الغداء، والأنشطة، ونوع السفاري، والإضافات. وإحنا بنقولك رأينا الصريح في كل مكان تختاره، ونحسب لك السعر على اللي اخترته.",
        ],
      },
    },
    beyond: {
      heading: "ونفس الكلام في الداي يوز والمبيت",
      text: "مش بس رحلات اليوم الواحد. بنرتّب الداي يوز والمبيت بنفس الطريقة: بنختار المكان بنفسنا، ونقولك بتدفع في إيه بالظبط. وأي متطلبات تانية لفريقك، قولنا عليها ونرتّبها بالشكل اللي يناسبكم.",
    },
    easy: {
      heading: "ليه ده سهل علينا؟",
      points: [
        "مش محتاجين وسيط يعرّفنا الأماكن، إحنا عارفينها.",
        "بنتعامل مع المصدر مباشرة، فبنقدّم لك نفس الجودة بدون طبقات بتزوّد السعر.",
        "لو في مكان مش هيناسب فريقك، هنقولك قبل ما تحجز، حتى لو ده مش في مصلحتنا.",
      ],
    },
    start: {
      heading: "إزاي نبدأ؟",
      text: "قولنا عدد الفريق وميزانيتك التقريبية، ونرشّح لك أنسب برنامج، ثابت أو كاستم.",
      button: "كلّمنا على واتساب",
      message: "مرحبًا، عايز أرتّب رحلة لفريقنا:\nعدد الفريق: \nالميزانية التقريبية: ",
    },
  },
  en: {
    intro: {
      heading: "Before you see the programs: how do we price a trip?",
      paragraphs: [
        "We're from Faiyum, and we know every place and every detail. That's why we can tell you exactly what you're paying for, and why, with nothing hidden.",
        "Every trip has three stages plus optional add-ons. Each stage is priced by what we choose in it.",
      ],
      leadIn: "These are the points that make the difference in a trip's price:",
    },
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
          { label: "By bus", text: "The lowest cost, but it doesn't go to the same places as the safari, and a simpler experience." },
          { label: "By safari", text: "The price depends on how many people ride in each car." },
        ],
        safari: true,
        after: {
          label: "The driver",
          text: "We know our drivers by name and by experience. A newer car and a more experienced driver cost more. Off-road, experience is safety, and a great driver becomes part of the team and adds real character to the trip.",
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
    safari: {
      columns: ["Safari Tour", "Full Safari"],
      rows: [
        { label: "The car", tour: "One car waits at a set spot in the reserve", full: "The car stays with you all trip" },
        { label: "How it works", tour: "Takes a group on a short ride, returns, takes the next group", full: "One dedicated car per 5–6 people" },
        { label: "Experience", tour: "Similar scenery, without the real dune experience", full: "Real dunes, the full experience" },
        { label: "The group", tour: "Gets split up", full: "Stays together" },
        { label: "Role of the safari", tour: "Just transportation", full: "Part of the trip itself" },
      ],
    },
    paperGap: {
      heading: "Why do two programs look identical on paper but cost differently?",
      text: "Because on paper both say \"breakfast, safari, lunch.\" The difference is in what isn't written: how clean the venue is, how crowded it gets, the food quality, the type of safari, and the driver's experience. We're from Faiyum, so we see that difference with our own eyes, not from ads.",
    },
    choose: {
      heading: "Choose the way that suits you",
      fixed: {
        tag: "Your starting point",
        title: "The Fixed Program",
        paragraphs: [
          "A ready-made program that's fixed, acceptable in quality, and the lowest cost possible. You can see every detail up front and know exactly what you're getting.",
          "If you want to upgrade any point, we upgrade that point only: the breakfast venue, the safari type, lunch, or an added show. You pay only the difference for what you chose.",
        ],
      },
      custom: {
        tag: "A trip built to your size",
        title: "The Custom Program",
        paragraphs: [
          "If you want something different, you shape the trip: pick the breakfast spot, the lunch spot, the activities, the safari type, and the add-ons. We give you our honest opinion on each place you choose, and price the trip on your selections.",
        ],
      },
    },
    beyond: {
      heading: "The same goes for day use and overnight stays",
      text: "It's not only day trips. We arrange day use and overnight stays the same way: we pick the place ourselves and tell you exactly what you're paying for. Any other requirements your team has, tell us and we'll arrange them to suit you.",
    },
    easy: {
      heading: "Why is this easy for us?",
      points: [
        "We don't need a middleman to introduce us to places. We know them.",
        "We deal with the source directly, so you get the same quality without layers that inflate the price.",
        "If a place won't suit your team, we'll tell you before you book, even when it's not in our interest.",
      ],
    },
    start: {
      heading: "How do we start?",
      text: "Tell us your team size and rough budget, and we'll recommend the best fit, fixed or custom.",
      button: "Message us on WhatsApp",
      message: "Hello, I'd like to plan a trip for our team:\nTeam size: \nRough budget: ",
    },
  },
};
