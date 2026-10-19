// ============================================================
// كلام صفحة "عن إنسبوت" (/about) بالعربي والإنجليزي
// الـ title والـ description بتوع جوجل في src/app/about/page.tsx
// ============================================================

export const aboutContent = {
  ar: {
    hero: {
      titleLead: "إحنا من هنا.",
      titleAccent: "وده بيفرق.",
      body: "إنسبوت شركة تسويق إلكتروني لحجز الفنادق وترتيب الرحلات داخل جمهورية مصر العربية. بدأنا من الفيوم، وبنرتّب لك التجربة كاملة، من مكان النوم لآخر تفصيلة في اليوم.",
      bookCta: "احجز على واتساب",
      bookMessage: "مرحبًا، عايز أحجز مع إنسبوت",
      tripsCta: "شوف رحلات الشركات",
    },
    story: {
      heading: "حكايتنا",
      paragraphs: [
        "بدأنا سنة 2022 باسم phiomin، وكانت فكرتنا منصة حجز زي Booking للفلل والفنادق في الفيوم. افتكرنا إن المشكلة إن الناس مش لاقية المكان.",
        "اتضح إن المشكلة كانت حاجة تانية: الثقة والتنظيم. الصور مش دايمًا زي الحقيقة، والحجز ممكن يضيع، والخدمة مرة حلوة ومرة لأ.",
        "فسيبنا فكرة الموقع واشتغلنا على الأرض. بقينا نعرف كل مكان ونتعامل معاه بنفسنا. في 2023 اتولدنا من جديد باسم إنسبوت، وبقينا \"صاحبك في السفر\".",
        "النهارده الفيوم هي بيتنا وأقوى معرفتنا، لكن اللي اتعلمناه هناك بنشتغل بيه في كل مصر.",
      ],
      timeline: [
        { year: "2022", name: "phiomin", text: "منصة حجز للفلل والفنادق في الفيوم" },
        { year: "2023", name: "إنسبوت", text: "صاحبك في السفر" },
      ],
    },
    services: {
      heading: "إحنا بنعمل إيه",
      items: [
        {
          number: "١",
          title: "حجز الإقامة",
          text: "فنادق وفلل ومخيمات بتتحجز مباشرة معانا. بنختار الأماكن بنفسنا ونقولك الحقيقة عنها قبل ما تحجز.",
          href: "/accommodation",
          linkLabel: "شوف الفلل والفنادق",
        },
        {
          number: "٢",
          title: "ترتيب الرحلات",
          text: "رحلات أفراد وعائلات، ورحلات شركات يوم أو مبيت بتتصمّم على مقاس شركتك، مش باكدج واحد للكل. من تكريم الموظفين لتيم بيلدينج لاحتفال الشركة.",
          href: "/corporate-trips",
          linkLabel: "شوف رحلات الشركات",
        },
      ],
    },
    stats: {
      heading: "بالأرقام",
      items: [
        { value: "+70", label: "شركة وثقت فينا" },
        { value: "+20", label: "رحلة اتنظمت" },
        { value: "+40", label: "فيلا بنقدر نضمن حجزها" },
        { value: "3", label: "سنين شغل" },
      ],
    },
    why: {
      heading: "ليه إنسبوت؟",
      items: [
        {
          title: "من هنا",
          text: "بنبدأ من الأرض مش من المكتب. بنعرف الأماكن اللي محدش بيوديك لها، وبنتعامل مع المصدر مباشرة من غير طبقات وسطاء بتزوّد السعر.",
        },
        {
          title: "مرتّبة من أولها لآخرها",
          text: "حجزك، ومواعيدك، وأكلك، ومواصلاتك، ومكان نومك، كله عند جهة واحدة تسألها. لو حصل أي حاجة، عارف مين تكلّم.",
        },
        {
          title: "بمعيار صاحب",
          text: "الأكل أحسن من اللي هتتوقعه، والتفاصيل متراجعة، والحاجة اللي مش هتعجبك هنقولك عليها قبل ما تدفع.",
        },
      ],
    },
    clients: {
      heading: "اللي اشتغلنا معاهم",
    },
    faq: {
      heading: "أسئلة بتتسأل كتير",
      items: [
        {
          q: "إنسبوت إيه بالظبط؟",
          a: "شركة تسويق إلكتروني لحجز الفنادق وترتيب الرحلات داخل جمهورية مصر العربية، بدأت من الفيوم.",
        },
        {
          q: "بتغطّوا أنهي أماكن؟",
          a: "أقوى خبرتنا في الفيوم: قرية تونس ووادي الريان والصحرا. وبنوسّع خدماتنا لباقي المحافظات.",
        },
        {
          q: "الرحلات بتتصمّم إزاي للشركات؟",
          a: "بنسمع هدف الرحلة وعدد الأفراد، وبعدها نرشّح لك برنامج. عندنا برامج Classic وAdvance وElite، وكلها ممكن تتعدّل.",
        },
        {
          q: "المستندات المطلوبة للحجز؟",
          a: "صورة البطاقة (وش وضهر) للمصريين، وصورة الجواز لغير المصريين، لكل شخص بالغ.",
        },
        {
          q: "سياسة الإلغاء؟",
          a: "الإلغاء قبل 7 أيام أو أكتر استرداد كامل. أقل من كده الديبوزت مبيترجعش.",
        },
      ],
    },
    cta: {
      heading: "مصر تستاهل تتقدّم أحسن من كده.",
      body: "قولنا هتروح فين وإمتى وكام فرد، ونرد عليك واتساب.",
      button: "كلّمنا على واتساب: 01061840111",
      message: "مرحبًا، عايز أرتّب رحلة:\nهروح فين: \nإمتى: \nكام فرد: ",
    },
  },
  en: {
    hero: {
      titleLead: "We're from here.",
      titleAccent: "And that makes the difference.",
      body: "Innspot is an online marketing company for hotel bookings and trips across Egypt. We started in Fayoum, and we arrange the whole experience for you, from where you sleep to the last detail of your day.",
      bookCta: "Book on WhatsApp",
      bookMessage: "Hello, I'd like to book with Innspot",
      tripsCta: "See corporate trips",
    },
    story: {
      heading: "Our story",
      paragraphs: [
        "We started in 2022 as phiomin, with the idea of a booking platform like Booking for villas and hotels in Fayoum. We thought the problem was that people couldn't find the places.",
        "It turned out the problem was something else: trust and organisation. The photos weren't always like the real thing, a booking could get lost, and the service was good one time and not the next.",
        "So we dropped the website idea and went to work on the ground. We got to know every place and dealt with each one ourselves. In 2023 we were reborn as Innspot, and became \"your travel buddy\".",
        "Today Fayoum is our home and what we know best, but what we learned there is how we work across all of Egypt.",
      ],
      timeline: [
        { year: "2022", name: "phiomin", text: "A booking platform for villas and hotels in Fayoum" },
        { year: "2023", name: "Innspot", text: "Your travel buddy" },
      ],
    },
    services: {
      heading: "What we do",
      items: [
        {
          number: "1",
          title: "Accommodation booking",
          text: "Hotels, villas and camps booked directly with us. We pick the places ourselves and tell you the truth about them before you book.",
          href: "/accommodation",
          linkLabel: "See villas and hotels",
        },
        {
          number: "2",
          title: "Trip planning",
          text: "Trips for individuals and families, and day or overnight corporate trips designed around your company, not one package for everyone. From employee recognition to team building to the company celebration.",
          href: "/corporate-trips",
          linkLabel: "See corporate trips",
        },
      ],
    },
    stats: {
      heading: "In numbers",
      items: [
        { value: "+70", label: "companies trusted us" },
        { value: "+20", label: "trips organised" },
        { value: "+40", label: "villas we can guarantee" },
        { value: "3", label: "years of work" },
      ],
    },
    why: {
      heading: "Why Innspot?",
      items: [
        {
          title: "From here",
          text: "We start from the ground, not from an office. We know the places nobody takes you to, and we deal with the source directly, without layers of middlemen pushing up the price.",
        },
        {
          title: "Arranged from start to finish",
          text: "Your booking, your schedule, your food, your transport and where you sleep, all with one team you can ask. If anything happens, you know who to call.",
        },
        {
          title: "A friend's standard",
          text: "The food is better than you'd expect, the details are double-checked, and anything you won't like, we'll tell you before you pay.",
        },
      ],
    },
    clients: {
      heading: "Who we've worked with",
    },
    faq: {
      heading: "Frequently asked questions",
      items: [
        {
          q: "What exactly is Innspot?",
          a: "An online marketing company for hotel bookings and trips across Egypt, which started in Fayoum.",
        },
        {
          q: "Which places do you cover?",
          a: "Our strongest experience is in Fayoum: Tunis Village, Wadi El Rayan and the desert. We're expanding our services to the other governorates.",
        },
        {
          q: "How are corporate trips designed?",
          a: "We listen to the trip's goal and the number of people, then recommend a programme. We have Classic, Advance and Elite programmes, and all of them can be adjusted.",
        },
        {
          q: "What documents do I need to book?",
          a: "A photo of the national ID (front and back) for Egyptians, and a passport photo for non-Egyptians, for every adult.",
        },
        {
          q: "What's the cancellation policy?",
          a: "Cancelling 7 days or more before gets a full refund. Less than that, the deposit isn't refunded.",
        },
      ],
    },
    cta: {
      heading: "Egypt deserves to be shown better than this.",
      body: "Tell us where you're going, when, and how many people, and we'll reply on WhatsApp.",
      button: "Message us on WhatsApp: 01061840111",
      message: "Hello, I'd like to plan a trip:\nWhere: \nWhen: \nHow many people: ",
    },
  },
} as const;
