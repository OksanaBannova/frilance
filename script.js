const { useState, useEffect } = React;


/* =========================================================
   SUPABASE — ПУБЛИЧНЫЙ САЙТ
   ========================================================= */

const PUBLIC_SUPABASE_URL =
  "https://vmiehkctmtpmpmizhkzt.supabase.co";

const PUBLIC_SUPABASE_KEY =
  "sb_publishable_XeGc3k4Wl67a0MSXzSufYA_L0Zl-sRS";

const frilancePublicSupabase =
  window.supabase.createClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_KEY
  );


/* =========================================================
   НАСТРОЙКИ ПО УМОЛЧАНИЮ
   ========================================================= */

const CONFIG = {
  email: "oksanchik2170@yandex.ru",
  site: "https://oksanabannova.github.io/frilance/"
};


/* =========================================================
   ДАННЫЕ ПО УМОЛЧАНИЮ
   Используются, если Supabase ещё не заполнен.
   ========================================================= */

const DEFAULT_SERVICES = [
  {
    id: "website",
    number: "01",
    icon: "◈",
    title: "Сайты",
    short:
      "Современные сайты для мастеров, экспертов и бизнеса.",
    description:
      "Создам сайт, который понятно рассказывает о вашем предложении, вызывает доверие и помогает получать заявки.",
    price: "от 15 000 ₽",
    details: [
      "Современный дизайн",
      "Адаптация под телефон",
      "Структура и тексты",
      "Форма заявки",
      "Подключение домена",
      "Размещение сайта"
    ]
  },
  {
    id: "neuro",
    number: "02",
    icon: "✦",
    title: "Нейрофото",
    short:
      "Профессиональные фотографии без студии и фотографа.",
    description:
      "Создам серию реалистичных AI-фотографий под личный бренд, соцсети, рекламу или просто для себя.",
    price: "от 700 ₽",
    details: [
      "Портреты",
      "Имиджевая фотосессия",
      "Beauty-съёмка",
      "Семейные фотографии",
      "Фото для соцсетей",
      "Изменение образа и окружения"
    ]
  },
  {
    id: "marketplace",
    number: "03",
    icon: "▦",
    title: "Карточки товаров",
    short:
      "Визуал, который помогает товару выделиться среди конкурентов.",
    description:
      "Создам современную карточку товара для Wildberries, Ozon и других площадок.",
    price: "от 1 500 ₽",
    details: [
      "Главное фото",
      "Инфографика",
      "Преимущества товара",
      "Характеристики",
      "Продающая композиция",
      "Подготовка изображений"
    ]
  }
];


const DEFAULT_BUSINESS_TYPES = [
  {
    icon: "✂",
    title: "Мастерам",
    text:
      "Сайт, портфолио, нейрофото и визуал для продвижения услуг."
  },
  {
    icon: "◉",
    title: "Экспертам",
    text:
      "Упаковка личного бренда и современная презентация услуг."
  },
  {
    icon: "▣",
    title: "Малому бизнесу",
    text:
      "Сайт и визуал, которые помогают выглядеть профессионально."
  },
  {
    icon: "◆",
    title: "Магазинам",
    text:
      "Карточки товаров и визуальная упаковка для маркетплейсов."
  }
];


const DEFAULT_PRICES = [
  {
    category: "САЙТ",
    title: "Старт",
    description:
      "Компактный сайт для специалиста или небольшой услуги.",
    value: "от 15 000 ₽",
    items: [
      "Одностраничный сайт",
      "Современный дизайн",
      "Мобильная версия",
      "Форма заявки",
      "Размещение"
    ]
  },
  {
    category: "САЙТ",
    title: "Бизнес",
    description:
      "Полноценная упаковка услуги или небольшого бизнеса.",
    value: "от 25 000 ₽",
    featured: true,
    items: [
      "Продуманная структура",
      "До 5 смысловых блоков",
      "Адаптивный дизайн",
      "Форма заявки",
      "Базовое SEO",
      "Размещение сайта"
    ]
  },
  {
    category: "МАРКЕТПЛЕЙС",
    title: "Карточка",
    description:
      "Продающий визуал товара для маркетплейса.",
    value: "от 1 500 ₽",
    items: [
      "Главное изображение",
      "Инфографика",
      "До 5 слайдов",
      "Подготовка под площадку",
      "Правки"
    ]
  }
];


const DEFAULT_NEURO_PRICES = [
  ["Индивидуальная нейрофотосессия", "от 1 500 ₽"],
  ["Портрет / деловой образ", "от 1 000 ₽"],
  ["Beauty-съёмка", "от 1 500 ₽"],
  ["Семейная фотосессия", "от 2 000 ₽"],
  ["Парная фотосессия", "от 1 800 ₽"],
  ["Фото по вашему запросу", "от 700 ₽"]
];


const DEFAULT_TEXTS = {
  hero_title:
    "Цифровая упаковка, которая помогает продавать",

  hero_subtitle:
    "Помогаю мастерам, экспертам и небольшому бизнесу выглядеть профессионально в интернете — от сайта и фотографий до визуала товаров.",

  hero_primary_button:
    "Обсудить проект",

  hero_secondary_button:
    "Смотреть работы",

  services_title:
    "Всё, что нужно, чтобы выглядеть профессионально.",

  portfolio_title:
    "Работы, которые решают задачу.",

  process_title:
    "От идеи до готового результата",

  faq_title:
    "Остались вопросы?",

  final_title:
    "Давайте создадим что-то сильное",

  final_button:
    "Обсудить проект",

  about:
    "Создаю сайты, нейрофото и карточки товаров, которые помогают специалистам и небольшому бизнесу выглядеть профессионально в интернете."
};


const DEFAULT_FAQ = [
  {
    question: "Сколько времени занимает создание сайта?",
    answer:
      "Срок зависит от объёма проекта. Небольшой сайт обычно можно подготовить за несколько дней после согласования структуры, содержания и дизайна."
  },
  {
    question: "Можно ли заказать только нейрофото?",
    answer:
      "Да. Можно заказать как одну фотографию по вашему запросу, так и полноценную серию: портрет, beauty-съёмку, семейные или парные фотографии."
  },
  {
    question: "Можно ли сделать сайт без готового дизайна?",
    answer:
      "Да. Вам не обязательно заранее знать, каким должен быть сайт. Я помогу определить структуру, визуальный стиль и основные блоки."
  },
  {
    question: "Вы работаете с клиентами из других городов?",
    answer:
      "Да. Большую часть работы можно выполнить полностью дистанционно. Общаемся онлайн, материалы передаются в электронном виде."
  },
  {
    question: "Можно ли заказать несколько услуг сразу?",
    answer:
      "Да. Например, можно одновременно сделать сайт, нейрофото и визуальные материалы для соцсетей. В таком случае всё можно выдержать в едином стиле."
  },
  {
    question: "Как происходит оплата?",
    answer:
      "Условия оплаты обсуждаем до начала работы в зависимости от выбранной услуги и объёма проекта."
  }
];


/* =========================================================
   ДАННЫЕ ПОРТФОЛИО ПО УМОЛЧАНИЮ
   ========================================================= */

const DEFAULT_PORTFOLIO = [
  {
    id: "default-1",
    number: "01",
    category: "САЙТЫ",
    title: "Сайт для мастера",
    description:
      "Современный сайт для специалиста, который собирает услуги, цены, работы и запись клиента в одном месте.",
    task:
      "Показать мастера профессионально, сформировать доверие и сделать путь клиента до заявки максимально простым.",
    result:
      "Получается готовая онлайн-презентация специалиста, которую можно использовать в соцсетях, рекламе и переписке с клиентами.",
    price: "от 15 000 ₽",
    tags: [
      "Дизайн",
      "Структура",
      "Мобильная версия"
    ],
    image: "images/portfolio-site.jpg",
    imageTitle: "Сайт мастера",
    imageText: "Современный сайт под услуги"
  },
  {
    id: "default-2",
    number: "02",
    category: "НЕЙРОФОТО",
    title: "Beauty-съёмка",
    description:
      "Профессиональный визуал для мастера красоты без студии, фотографа и сложной организации съёмки.",
    task:
      "Создать визуал, который выглядит профессионально и помогает мастеру красиво представить себя и свои услуги.",
    result:
      "Серия изображений в едином стиле для соцсетей, рекламы, сторис и личного бренда.",
    price: "от 700 ₽",
    tags: [
      "Beauty",
      "Личный бренд",
      "Соцсети"
    ],
    image: "images/portfolio-neuro.jpg",
    imageTitle: "Beauty-съёмка",
    imageText: "Нейрофото для личного бренда"
  },
  {
    id: "default-3",
    number: "03",
    category: "МАРКЕТПЛЕЙСЫ",
    title: "Карточка товара",
    description:
      "Визуальная упаковка товара с понятной подачей преимуществ, характеристик и основных выгод для покупателя.",
    task:
      "Сделать товар заметнее среди конкурентов и за несколько секунд показать покупателю его основные преимущества.",
    result:
      "Понятная инфографика и единый визуальный стиль карточки, ориентированные на восприятие покупателя.",
    price: "от 1 500 ₽",
    tags: [
      "Инфографика",
      "Wildberries",
      "Ozon"
    ],
    image: "images/portfolio-marketplace.jpg",
    imageTitle: "Карточка товара",
    imageText: "Визуальная упаковка товара"
  }
];


/* =========================================================
   ЗАГРУЗКА ДАННЫХ САЙТА ИЗ SUPABASE
   ========================================================= */

async function loadSiteData() {

  const result = {
    services: DEFAULT_SERVICES,
    prices: DEFAULT_PRICES,
    neuroPrices: DEFAULT_NEURO_PRICES,
    texts: DEFAULT_TEXTS,
    contacts: {
      ...CONFIG
    },
    portfolio: DEFAULT_PORTFOLIO
  };


  /* ---------------------------------------------------------
     SERVICES
     --------------------------------------------------------- */

  try {

    const servicesResult =
      await frilancePublicSupabase
        .from("services")
        .select("*")
        .order("created_at", {
          ascending: false
        })
        .limit(1)
        .maybeSingle();


    if (
      !servicesResult.error &&
      servicesResult.data
    ) {

      const dbServices =
        servicesResult.data;


      result.services =
        DEFAULT_SERVICES.map((service) => {

          if (service.id === "website") {

            return {
              ...service,
              price:
                dbServices.website_price ||
                service.price
            };

          }


          if (service.id === "neuro") {

            return {
              ...service,
              price:
                dbServices.neuro_price ||
                service.price
            };

          }


          if (service.id === "marketplace") {

            return {
              ...service,
              price:
                dbServices.marketplace_price ||
                service.price
            };

          }


          return service;

        });


      result.prices =
        DEFAULT_PRICES.map((price) => {

          if (
            price.title === "Старт"
          ) {

            return {
              ...price,
              value:
                dbServices.start_price ||
                price.value
            };

          }


          if (
            price.title === "Бизнес"
          ) {

            return {
              ...price,
              value:
                dbServices.business_price ||
                price.value
            };

          }


          if (
            price.title === "Карточка"
          ) {

            return {
              ...price,
              value:
                dbServices.marketplace_price ||
                price.value
            };

          }


          return price;

        });


      result.neuroPrices =
        DEFAULT_NEURO_PRICES.map(
          ([name, price], index) => {

            if (
              index ===
              DEFAULT_NEURO_PRICES.length - 1
            ) {

              return [
                name,
                dbServices.neuro_price ||
                price
              ];

            }

            return [
              name,
              price
            ];

          }
        );

    }

  } catch (error) {

    console.error(
      "FRILANCE: ошибка загрузки services:",
      error
    );

  }


  /* ---------------------------------------------------------
     TEXTS
     --------------------------------------------------------- */

  try {

    const textsResult =
      await frilancePublicSupabase
        .from("texts")
        .select("*")
        .order("created_at", {
          ascending: false
        })
        .limit(1)
        .maybeSingle();


    if (
      !textsResult.error &&
      textsResult.data
    ) {

      result.texts = {
        ...DEFAULT_TEXTS,
        ...textsResult.data
      };

    }

  } catch (error) {

    console.error(
      "FRILANCE: ошибка загрузки texts:",
      error
    );

  }


  /* ---------------------------------------------------------
     CONTACTS
     --------------------------------------------------------- */

  try {

    const contactsResult =
      await frilancePublicSupabase
        .from("contacts")
        .select("*")
        .order("created_at", {
          ascending: false
        })
        .limit(1)
        .maybeSingle();


    if (
      !contactsResult.error &&
      contactsResult.data
    ) {

      result.contacts = {
        ...CONFIG,
        email:
          contactsResult.data.email ||
          CONFIG.email,
        site:
          contactsResult.data.site ||
          CONFIG.site
      };

    }

  } catch (error) {

    console.error(
      "FRILANCE: ошибка загрузки contacts:",
      error
    );

  }


  /* ---------------------------------------------------------
     PORTFOLIO
     --------------------------------------------------------- */

  try {

    const portfolioResult =
      await frilancePublicSupabase
        .from("portfolio")
        .select("*")
        .order("sort_order", {
          ascending: true
        })
        .order("created_at", {
          ascending: true
        });


    if (
      !portfolioResult.error &&
      Array.isArray(portfolioResult.data) &&
      portfolioResult.data.length > 0
    ) {

      const portfolioRows =
        portfolioResult.data;


      /* -----------------------------------------------------
         Загружаем дополнительные изображения
         ----------------------------------------------------- */

      let imageRows = [];


      try {

        const imagesResult =
          await frilancePublicSupabase
            .from("portfolio_images")
            .select("*")
            .order("sort_order", {
              ascending: true
            })
            .order("created_at", {
              ascending: true
            });


        if (
          !imagesResult.error &&
          Array.isArray(imagesResult.data)
        ) {

          imageRows =
            imagesResult.data;

        }

      } catch (imageError) {

        console.error(
          "FRILANCE: ошибка загрузки portfolio_images:",
          imageError
        );

      }


      result.portfolio =
        portfolioRows.map(
          (row, index) => {

            const relatedImages =
              imageRows.filter(
                (image) =>
                  image.portfolio_id ===
                  row.id
              );


            const firstRelatedImage =
              relatedImages[0];


            let category =
              String(
                row.category ||
                ""
              ).trim();


            if (!category) {

              category =
                "ПОРТФОЛИО";

            }


            let image =
              row.image_url ||
              firstRelatedImage?.image_url ||
              "";


            let title =
              row.title ||
              "Работа";


            let description =
              row.description ||
              "";


            let price =
              row.price ||
              "";


            const categoryUpper =
              category.toUpperCase();


            let defaultTags = [
              "Дизайн",
              "Структура",
              "Визуал"
            ];


            if (
              categoryUpper.includes(
                "НЕЙРО"
              )
            ) {

              defaultTags = [
                "Beauty",
                "Личный бренд",
                "Соцсети"
              ];

            } else if (
              categoryUpper.includes(
                "МАРКЕТ"
              )
            ) {

              defaultTags = [
                "Инфографика",
                "Wildberries",
                "Ozon"
              ];

            } else if (
              categoryUpper.includes(
                "САЙТ"
              )
            ) {

              defaultTags = [
                "Дизайн",
                "Структура",
                "Мобильная версия"
              ];

            }


            return {

              id:
                row.id,

              number:
                String(index + 1)
                  .padStart(2, "0"),

              category:
                categoryUpper,

              title,

              description,

              task:
                description ||
                "Создать современное решение под задачу клиента.",

              result:
                "Готовое визуальное решение, которое можно использовать для продвижения и работы с клиентами.",

              price,

              tags:
                defaultTags,

              image,

              imageTitle:
                title,

              imageText:
                description ||
                title

            };

          }
        );

    }

  } catch (error) {

    console.error(
      "FRILANCE: ошибка загрузки portfolio:",
      error
    );

  }


  console.log(
    "FRILANCE: данные сайта загружены из Supabase.",
    result
  );


  return result;
}


/* =========================================================
   HEADER
   ========================================================= */

function Header({ onOrder, texts }) {

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [scrolled, setScrolled] =
    useState(false);


  useEffect(() => {

    const handleScroll = () => {

      setScrolled(
        window.scrollY > 30
      );

    };


    window.addEventListener(
      "scroll",
      handleScroll
    );


    return () => {

      window.removeEventListener(
        "scroll",
        handleScroll
      );

    };

  }, []);


  const goTo = (id) => {

    setMenuOpen(false);


    setTimeout(() => {

      const element =
        document.getElementById(id);


      if (element) {

        element.scrollIntoView({
          behavior: "smooth"
        });

      }

    }, 50);

  };


  return (
    <header
      className={`site-header ${
        scrolled ? "scrolled" : ""
      }`}
    >

      <div className="container header-inner">

        <a
          href="#top"
          className="logo"
          onClick={(e) => {

            e.preventDefault();

            goTo("top");

          }}
        >

          <span className="logo-mark">
            ✦
          </span>

          <span>
            Оксана Баннова
          </span>

        </a>


        <nav
          className={`nav ${
            menuOpen ? "open" : ""
          }`}
        >

          <a
            href="#services"
            onClick={(e) => {

              e.preventDefault();

              goTo("services");

            }}
          >
            Услуги
          </a>


          <a
            href="#portfolio"
            onClick={(e) => {

              e.preventDefault();

              goTo("portfolio");

            }}
          >
            Портфолио
          </a>


          <a
            href="#prices"
            onClick={(e) => {

              e.preventDefault();

              goTo("prices");

            }}
          >
            Цены
          </a>


          <a
            href="#process"
            onClick={(e) => {

              e.preventDefault();

              goTo("process");

            }}
          >
            Как работаю
          </a>

        </nav>


        <button
          className="header-button"
          onClick={onOrder}
        >
          {texts?.hero_primary_button ||
            "Обсудить проект"}
        </button>


        <button
          className="menu-button"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
          aria-label="Открыть меню"
        >
          {menuOpen ? "×" : "☰"}
        </button>

      </div>

    </header>
  );
}


/* =========================================================
   HERO
   ========================================================= */

function Hero({
  onOrder,
  texts
}) {

  const heroTitle =
    texts?.hero_title ||
    DEFAULT_TEXTS.hero_title;


  const heroSubtitle =
    texts?.hero_subtitle ||
    DEFAULT_TEXTS.hero_subtitle;


  return (
    <section
      className="hero"
      id="home"
    >

      <div className="hero-bg-glow"></div>


      <div className="container hero-grid">

        <div className="hero-content">

          <div className="hero-badge">

            <span className="hero-badge-dot"></span>

            Сайты • Нейрофото • Карточки товаров

          </div>


          <h1>

            {heroTitle.includes(",") ? (

              <>
                {heroTitle.split(",")[0]},
                <span>
                  {heroTitle.substring(
                    heroTitle.indexOf(",") + 1
                  )}
                </span>
              </>

            ) : (

              <span>
                {heroTitle}
              </span>

            )}

          </h1>


          <p className="hero-description">
            {heroSubtitle}
          </p>


          <div className="hero-buttons">

            <button
              className="btn btn-primary"
              onClick={onOrder}
            >
              {texts?.hero_primary_button ||
                "Обсудить проект"}

              <span>
                →
              </span>
            </button>


            <a
              href="#portfolio"
              className="btn btn-secondary"
            >
              {texts?.hero_secondary_button ||
                "Смотреть работы"}
            </a>

          </div>


          <div className="hero-stats">

            <div className="hero-stat">
              <strong>
                3
              </strong>

              <span>
                направления
              </span>
            </div>


            <div className="hero-stat-line"></div>


            <div className="hero-stat">
              <strong>
                от 700 ₽
              </strong>

              <span>
                нейрофото
              </span>
            </div>


            <div className="hero-stat-line"></div>


            <div className="hero-stat">
              <strong>
                от 15 000 ₽
              </strong>

              <span>
                сайт
              </span>
            </div>

          </div>

        </div>


        <div className="hero-visual">

          <div className="hero-orbit hero-orbit-1"></div>

          <div className="hero-orbit hero-orbit-2"></div>

          <div className="hero-main-glow"></div>


          <div className="hero-card hero-card-site">

            <div className="hero-card-top">

              <div className="mini-dots">

                <i></i>
                <i></i>
                <i></i>

              </div>

              <span>
                WEBSITE
              </span>

            </div>


            <div className="website-preview">

              <div className="website-preview-header">

                <div className="preview-logo"></div>

                <div className="preview-menu">

                  <i></i>
                  <i></i>
                  <i></i>

                </div>

              </div>


              <div className="website-preview-content">

                <div className="preview-line big"></div>

                <div className="preview-line"></div>

                <div className="preview-line short"></div>

                <div className="preview-button"></div>

              </div>

            </div>


            <div className="hero-card-label">

              <span className="label-icon">
                ⌘
              </span>

              Сайт под ключ

            </div>

          </div>


          <div className="hero-card hero-card-photo">

            <div className="photo-placeholder">

              <div className="photo-silhouette">

                <div className="silhouette-head"></div>

                <div className="silhouette-body"></div>

              </div>


              <div className="photo-spark spark-1">
                ✦
              </div>

              <div className="photo-spark spark-2">
                ✧
              </div>

              <div className="photo-spark spark-3">
                ✦
              </div>

            </div>


            <div className="photo-label">

              <span>
                ✦
              </span>

              NEUROPHOTO

            </div>

          </div>


          <div className="hero-card hero-card-product">

            <div className="product-preview">

              <div className="product-image">

                <div className="product-bottle"></div>

              </div>


              <div className="product-info">

                <div className="product-line"></div>

                <div className="product-line small"></div>

                <div className="product-price">
                  1 500 ₽
                </div>

              </div>

            </div>


            <div className="product-label">

              <span>
                ◈
              </span>

              Карточка товара

            </div>

          </div>


          <div className="hero-floating-tag tag-1">

            <span>
              ✦
            </span>

            AI VISUAL

          </div>


          <div className="hero-floating-tag tag-2">

            <span>
              ✓
            </span>

            Под ключ

          </div>

        </div>

      </div>


      <div className="hero-scroll">

        <span>
          SCROLL
        </span>

        <div className="scroll-line"></div>

      </div>

    </section>
  );
}


/* =========================================================
   SERVICES
   ========================================================= */

function Services({
  onService,
  services,
  texts
}) {

  return (
    <section
      className="services"
      id="services"
    >

      <div className="container">

        <div className="section-label">
          Услуги
        </div>


        <h2 className="section-title">

          {texts?.services_title
            ? texts.services_title
            : (
              <>
                Всё, что нужно,
                <br />
                чтобы
                <span className="gradient-text">
                  выглядеть профессионально.
                </span>
              </>
            )}

        </h2>


        <p className="section-description">

          Не просто создаю красивые картинки и сайты.
          Подбираю решение под вашу задачу —
          чтобы вас заметили, вам доверяли и к вам обращались.

        </p>


        <div className="services-grid">

          {services.map((service) => (

            <article
              className="service-card"
              key={service.id}
              onClick={() =>
                onService(service)
              }
              style={{
                cursor: "pointer"
              }}
            >

              <div className="service-number">
                {service.number}
              </div>


              <div className="service-icon">
                {service.icon}
              </div>


              <h3 className="service-title">
                {service.title}
              </h3>


              <p className="service-description">
                {service.short}
              </p>


              <div className="service-bottom">

                <div className="service-price">
                  {service.price}
                </div>


                <div className="service-link">
                  Подробнее →
                </div>

              </div>

            </article>

          ))}

        </div>


        <div className="services-note">

          <span className="services-note-icon">
            ✦
          </span>


          <div>

            <strong>
              Не знаете, что выбрать?
            </strong>


            <p>
              Расскажите, чем занимаетесь и какая у вас задача.
              Я предложу подходящий вариант.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}


/* =========================================================
   SERVICE MODAL
   ========================================================= */

function ServiceModal({
  service,
  onClose,
  onOrder
}) {

  if (!service) {
    return null;
  }


  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {

        if (
          e.target === e.currentTarget
        ) {

          onClose();

        }

      }}
    >

      <div className="modal">

        <button
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>


        <div className="service-icon">
          {service.icon}
        </div>


        <h2 className="modal-title">
          {service.title}
        </h2>


        <p className="modal-description">
          {service.description}
        </p>


        <div className="price-modal-list">

          {service.details.map(
            (item, index) => (

              <div
                className="price-modal-item"
                key={index}
              >

                <span>
                  ✓ {item}
                </span>

              </div>

            )
          )}

        </div>


        <div
          style={{
            marginTop: "25px",
            marginBottom: "20px",
            fontSize: "22px",
            fontWeight: "800"
          }}
        >
          {service.price}
        </div>


        <button
          className="primary-button"
          style={{
            width: "100%"
          }}
          onClick={() => {

            onClose();

            onOrder(
              service.title
            );

          }}
        >
          Обсудить проект →
        </button>

      </div>

    </div>
  );
}


/* =========================================================
   PORTFOLIO
   ========================================================= */

function Portfolio({
  onOrder,
  portfolio,
  texts
}) {

  const [active, setActive] =
    React.useState(0);


  const portfolioItems =
    portfolio &&
    portfolio.length
      ? portfolio
      : DEFAULT_PORTFOLIO;


  useEffect(() => {

    if (
      active >=
      portfolioItems.length
    ) {

      setActive(0);

    }

  }, [
    portfolioItems.length,
    active
  ]);


  const item =
    portfolioItems[active] ||
    portfolioItems[0];


  if (!item) {
    return null;
  }


  return (
    <section
      className="portfolio-section"
      id="portfolio"
    >

      <div className="container">

        <div className="section-heading portfolio-heading">

          <div>

            <span className="section-kicker">
              ПОРТФОЛИО
            </span>


            <h2>

              {texts?.portfolio_title ||
                "Работы, которые решают задачу."}

            </h2>

          </div>


          <p>
            Смотрим не только на внешний вид,
            но и на то, зачем создавался каждый проект.
          </p>

        </div>


        <div className="portfolio-tabs">

          {portfolioItems.map(
            (portfolioItem, index) => (

              <button
                key={
                  portfolioItem.id ||
                  portfolioItem.number ||
                  index
                }
                className={`portfolio-tab ${
                  active === index
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActive(index)
                }
              >

                <span className="portfolio-tab-number">
                  {String(index + 1).padStart(2, "0")}
                </span>


                <span>
                  {portfolioItem.category}
                </span>

              </button>

            )
          )}

        </div>


        <div
          className="portfolio-main-card"
          key={
            item.id ||
            item.number
          }
        >

          <div className="portfolio-visual">

            <div className="portfolio-image-glow"></div>


            <div className="portfolio-image-frame">

              <div className="portfolio-browser-bar">

                <div className="portfolio-browser-dots">

                  <span></span>
                  <span></span>
                  <span></span>

                </div>


                <div className="portfolio-browser-url">
                  oksanabannova.github.io
                </div>

              </div>


              <div className="portfolio-image">

                {item.image ? (

                  <img
                    src={item.image}
                    alt={item.title}
                    onError={(e) => {

                      e.currentTarget.style.display =
                        "none";

                      e.currentTarget.parentElement.classList.add(
                        "portfolio-image-empty"
                      );

                    }}
                  />

                ) : null}


                <div className="portfolio-image-placeholder">

                  <span className="portfolio-placeholder-number">
                    {String(active + 1).padStart(2, "0")}
                  </span>


                  <span className="portfolio-placeholder-category">
                    {item.category}
                  </span>


                  <strong>
                    {item.imageTitle ||
                      item.title}
                  </strong>


                  <small>
                    {item.imageText ||
                      item.description}
                  </small>

                </div>

              </div>

            </div>


            <div className="portfolio-floating-label">

              <span className="portfolio-floating-dot"></span>


              <span>
                {item.category}
              </span>

            </div>

          </div>


          <div className="portfolio-info">

            <div className="portfolio-info-top">

              <span className="portfolio-category">
                {item.category}
              </span>


              <span className="portfolio-price">
                {item.price}
              </span>

            </div>


            <h3>
              {item.title}
            </h3>


            <p className="portfolio-description">
              {item.description}
            </p>


            <div className="portfolio-case">

              <div className="portfolio-case-item">

                <span>
                  ЗАДАЧА
                </span>


                <p>
                  {item.task}
                </p>

              </div>


              <div className="portfolio-case-item">

                <span>
                  ЧТО СДЕЛАНО
                </span>


                <div className="portfolio-tags">

                  {(item.tags || []).map(
                    (tag, index) => (

                      <span
                        key={
                          `${tag}-${index}`
                        }
                      >
                        {tag}
                      </span>

                    )
                  )}

                </div>

              </div>


              <div className="portfolio-case-item">

                <span>
                  РЕЗУЛЬТАТ
                </span>


                <p>
                  {item.result}
                </p>

              </div>

            </div>


            <button
              className="primary-button portfolio-order-button"
              onClick={() =>
                onOrder(item.title)
              }
            >
              Хочу такое решение

              <span>
                →
              </span>

            </button>

          </div>

        </div>


        <div className="portfolio-bottom">

          <div className="portfolio-bottom-text">

            <span>
              {String(active + 1).padStart(2, "0")}
              {" / "}
              {String(
                portfolioItems.length
              ).padStart(2, "0")}
            </span>


            <p>
              Не нашли подходящий пример?
              Сделаем решение именно под вашу задачу.
            </p>

          </div>


          <button
            className="secondary-button"
            onClick={() =>
              onOrder(
                "Индивидуальный проект"
              )
            }
          >
            Обсудить мой проект

            <span>
              →
            </span>

          </button>

        </div>

      </div>

    </section>
  );
}


/* =========================================================
   BUSINESS
   ========================================================= */

function Business({ onOrder }) {

  const targets = [
    {
      number: "01",
      icon: "✦",
      title: "Мастера красоты",
      text:
        "Парикмахеры, визажисты, мастера ногтей, ресниц, бровей, косметологи и другие специалисты.",
      result:
        "Сайт и визуал для профессиональной подачи."
    },
    {
      number: "02",
      icon: "◈",
      title: "Эксперты и специалисты",
      text:
        "Для тех, кто продаёт свои знания, услуги и личный бренд и хочет выглядеть современно.",
      result:
        "Упаковка, которая вызывает доверие."
    },
    {
      number: "03",
      icon: "⌂",
      title: "Малый бизнес",
      text:
        "Студии, магазины, небольшие компании и предприниматели, которым нужна современная цифровая подача.",
      result:
        "Понятный сайт и презентация бизнеса."
    },
    {
      number: "04",
      icon: "▦",
      title: "Продавцы маркетплейсов",
      text:
        "Создаю карточки товаров с понятной структурой, визуалом и акцентом на преимущества продукта.",
      result:
        "Карточка, которая выгодно показывает товар."
    }
  ];


  return (
    <section
      className="business section"
      id="business"
    >

      <div className="container">

        <div className="business-heading">

          <div>

            <span className="section-kicker">
              ДЛЯ КОГО
            </span>


            <h2>
              Если вам нужно выглядеть
              <span>
                {" "}
                профессионально
              </span>
            </h2>

          </div>


          <p>
            Помогаю специалистам и небольшому бизнесу
            создать современную цифровую упаковку —
            без сложностей и огромных бюджетов.
          </p>

        </div>


        <div className="business-grid">

          {targets.map((item) => (

            <article
              className="business-card"
              key={item.number}
            >

              <div className="business-card-top">

                <span className="business-number">
                  {item.number}
                </span>


                <div className="business-icon">
                  {item.icon}
                </div>

              </div>


              <h3>
                {item.title}
              </h3>


              <p className="business-card-text">
                {item.text}
              </p>


              <div className="business-result">

                <span className="business-result-icon">
                  ✓
                </span>


                <span>
                  {item.result}
                </span>

              </div>


              <div className="business-card-line"></div>

            </article>

          ))}

        </div>


        <div className="business-bottom">

          <div className="business-bottom-text">

            <span className="business-bottom-label">
              НЕ ЗНАЕТЕ, ЧТО ИМЕННО ВАМ НУЖНО?
            </span>


            <strong>
              Расскажите о задаче — я помогу подобрать
              подходящий вариант.
            </strong>

          </div>


          <button
            className="btn btn-primary business-button"
            onClick={() =>
              onOrder("Консультация")
            }
          >
            Обсудить задачу

            <span>
              →
            </span>

          </button>

        </div>

      </div>

    </section>
  );
}


/* =========================================================
   PROCESS
   ========================================================= */

function Process({
  onOrder,
  texts
}) {

  const steps = [
    {
      number: "01",
      title: "Обсуждаем задачу",
      text:
        "Вы рассказываете, что нужно сделать, для кого и какой результат хотите получить.",
      label: "ЗАПРОС"
    },
    {
      number: "02",
      title: "Предлагаю решение",
      text:
        "Подбираю подходящий формат, структуру, стиль и объём работы под вашу задачу.",
      label: "ПЛАН"
    },
    {
      number: "03",
      title: "Создаю проект",
      text:
        "Разрабатываю сайт, создаю нейрофото или оформляю карточки товара.",
      label: "РАБОТА"
    },
    {
      number: "04",
      title: "Передаю готовый результат",
      text:
        "Вы получаете готовый материал, который можно сразу использовать в работе и продвижении.",
      label: "РЕЗУЛЬТАТ"
    }
  ];


  return (
    <section
      className="process section"
      id="process"
    >

      <div className="container">

        <div className="process-heading">

          <div>

            <span className="section-kicker">
              КАК ЭТО РАБОТАЕТ
            </span>


            <h2>

              {texts?.process_title ||
                "От идеи до готового результата"}

            </h2>

          </div>


          <p>
            Без сложных технических заданий и бесконечных согласований.
            Вы рассказываете о задаче — я беру на себя её реализацию.
          </p>

        </div>


        <div className="process-steps">

          {steps.map(
            (step, index) => (

              <React.Fragment
                key={step.number}
              >

                <article className="process-step">

                  <div className="process-step-top">

                    <span className="process-number">
                      {step.number}
                    </span>


                    <span className="process-label">
                      {step.label}
                    </span>

                  </div>


                  <div className="process-step-icon">

                    {index === 0 && "✦"}
                    {index === 1 && "◈"}
                    {index === 2 && "✧"}
                    {index === 3 && "✓"}

                  </div>


                  <h3>
                    {step.title}
                  </h3>


                  <p>
                    {step.text}
                  </p>


                  <div className="process-step-line"></div>

                </article>


                {index <
                  steps.length - 1 && (

                  <div className="process-arrow">
                    →
                  </div>

                )}

              </React.Fragment>

            )
          )}

        </div>


        <div className="process-bottom">

          <div className="process-bottom-text">

            <span>
              ГОТОВЫ НАЧАТЬ?
            </span>


            <strong>
              Расскажите, что хотите создать —
              обсудим идею и варианты реализации.
            </strong>

          </div>


          <button
            className="btn btn-primary process-button"
            onClick={() =>
              onOrder("Новый проект")
            }
          >
            Обсудить проект

            <span>
              →
            </span>

          </button>

        </div>

      </div>

    </section>
  );
}


/* =========================================================
   PRICES
   ========================================================= */

function Prices({
  onOrder,
  onNeuroPrices,
  prices,
  neuroPrices
}) {

  const tariffs =
    prices.map(
      (price, index) => {

        if (index === 0) {

          return {
            title: "Сайт START",
            price: price.value,
            description:
              "Для специалиста, мастера или небольшого проекта.",
            features: [
              "Современный дизайн",
              "Адаптация под телефон",
              "Блоки услуг и цен",
              "Портфолио",
              "Форма заявки",
              "Размещение сайта"
            ],
            button: "Заказать сайт",
            type: "Сайт START"
          };

        }


        if (index === 1) {

          return {
            title: "Сайт BUSINESS",
            price: price.value,
            description:
              "Для бизнеса, которому нужен полноценный продающий сайт.",
            features: [
              "Индивидуальный дизайн",
              "Продающая структура",
              "Каталог / услуги",
              "Портфолио",
              "Формы заявок",
              "Анимации и интерактив",
              "Адаптация под телефон",
              "Подключение аналитики"
            ],
            button: "Обсудить сайт",
            type: "Сайт BUSINESS",
            popular: true
          };

        }


        return {
          title: "Карточка товара",
          price: price.value,
          description:
            "Визуальная упаковка товара для маркетплейсов.",
          features: [
            "Главное изображение",
            "Красивый фон",
            "Работа с композицией",
            "Инфографика",
            "Акценты на преимуществах",
            "Подготовка под маркетплейс"
          ],
          button: "Заказать карточку",
          type: "Карточка товара"
        };

      }
    );


  return (
    <section
      className="prices section"
      id="prices"
    >

      <div className="container">

        <div className="section-heading prices-heading">

          <div className="section-kicker">
            СТОИМОСТЬ
          </div>


          <h2>
            Понятные цены
            <span>
              {" "}
              без скрытых платежей
            </span>
          </h2>


          <p>
            Стоимость зависит от объёма и сложности задачи.
            Перед началом работы я согласовываю итоговую цену.
          </p>

        </div>


        <div className="tariffs-grid">

          {tariffs.map(
            (tariff, index) => (

              <article
                className={`tariff-card ${
                  tariff.popular
                    ? "tariff-popular"
                    : ""
                }`}
                key={index}
              >

                {tariff.popular && (

                  <div className="tariff-badge">
                    ПОПУЛЯРНЫЙ
                  </div>

                )}


                <div className="tariff-top">

                  <h3>
                    {tariff.title}
                  </h3>


                  <div className="tariff-price">
                    {tariff.price}
                  </div>


                  <p>
                    {tariff.description}
                  </p>

                </div>


                <div className="tariff-features">

                  {tariff.features.map(
                    (feature, featureIndex) => (

                      <div
                        className="tariff-feature"
                        key={featureIndex}
                      >

                        <span>
                          ✓
                        </span>

                        {feature}

                      </div>

                    )
                  )}

                </div>


                <button
                  className="btn btn-primary tariff-button"
                  onClick={() =>
                    onOrder(tariff.type)
                  }
                >
                  {tariff.button}
                </button>

              </article>

            )
          )}

        </div>


        <div className="neuro-price-block">

          <div className="neuro-price-content">

            <div className="neuro-price-kicker">
              НЕЙРОФОТО
            </div>


            <h3>
              Фотографии, которые
              <span>
                {" "}
                выглядят как настоящая съёмка
              </span>
            </h3>


            <p>
              Создам нужный образ, стиль и атмосферу
              на основе вашей фотографии.
            </p>

          </div>


          <div className="neuro-price-value">

            <span>
              от
            </span>

            <strong>
              {prices?.[0]?.neuro_price ||
                "700 ₽"}
            </strong>

          </div>


          <button
            className="btn btn-primary"
            onClick={onNeuroPrices}
          >
            Смотреть прайс
          </button>

        </div>


        <div className="prices-note">

          <span>
            ✦
          </span>

          Если вашей задачи нет в списке — напишите мне.
          Рассчитаю стоимость индивидуально.

        </div>

      </div>

    </section>
  );
}


/* =========================================================
   ADVANTAGES
   ========================================================= */

function Advantages() {

  const advantages = [
    {
      number: "01",
      title: "Под задачу",
      text:
        "Не использую одно решение для всех. Подбираю визуал, структуру и формат под конкретный бизнес и цель."
    },
    {
      number: "02",
      title: "Современно",
      text:
        "Слежу за актуальной подачей, чтобы сайт, фотографии и карточки выглядели современно и профессионально."
    },
    {
      number: "03",
      title: "Понятно",
      text:
        "Без сложных терминов. Вы понимаете, что мы делаем, зачем это нужно и какой результат получите."
    },
    {
      number: "04",
      title: "Всё в одном стиле",
      text:
        "Можно собрать несколько инструментов в единую визуальную систему: сайт, фото и материалы для продвижения."
    }
  ];


  return (
    <section
      className="advantages section"
      id="advantages"
    >

      <div className="container">

        <div className="advantages-heading">

          <div>

            <span className="section-kicker">
              МОЙ ПОДХОД
            </span>


            <h2>
              Не просто красиво —
              <span>
                {" "}
                с пользой для бизнеса
              </span>
            </h2>

          </div>


          <p>
            Хорошая упаковка должна не только привлекать внимание,
            но и помогать человеку быстрее понять, кто вы,
            что предлагаете и почему стоит обратиться именно к вам.
          </p>

        </div>


        <div className="advantages-grid">

          {advantages.map((item) => (

            <article
              className="advantage-card"
              key={item.number}
            >

              <div className="advantage-top">

                <span className="advantage-number">
                  {item.number}
                </span>


                <span className="advantage-mark">
                  ✦
                </span>

              </div>


              <h3>
                {item.title}
              </h3>


              <p>
                {item.text}
              </p>


              <div className="advantage-line"></div>

            </article>

          ))}

        </div>

      </div>

    </section>
  );
}


/* =========================================================
   FAQ
   ========================================================= */

function FAQ({
  texts
}) {

  const [openIndex, setOpenIndex] =
    React.useState(null);


  const toggleQuestion = (index) => {

    setOpenIndex((current) =>
      current === index
        ? null
        : index
    );

  };


  return (
    <section
      className="faq section"
      id="faq"
    >

      <div className="container">

        <div className="faq-heading">

          <div>

            <span className="section-kicker">
              ВОПРОСЫ
            </span>


            <h2>

              {texts?.faq_title ||
                "Остались вопросы?"}

            </h2>

          </div>


          <p>
            Собрала ответы на самые частые вопросы.
            Если вашего вопроса здесь нет — просто напишите мне.
          </p>

        </div>


        <div className="faq-list">

          {DEFAULT_FAQ.map(
            (item, index) => {

              const isOpen =
                openIndex === index;


              return (
                <div
                  className={`faq-item ${
                    isOpen
                      ? "is-open"
                      : ""
                  }`}
                  key={index}
                >

                  <button
                    type="button"
                    className="faq-question"
                    onClick={() =>
                      toggleQuestion(index)
                    }
                    aria-expanded={isOpen}
                  >

                    <span className="faq-question-number">
                      0{index + 1}
                    </span>


                    <span className="faq-question-text">
                      {item.question}
                    </span>


                    <span className="faq-plus">
                      {isOpen
                        ? "−"
                        : "+"}
                    </span>

                  </button>


                  {isOpen && (

                    <div className="faq-answer-visible">
                      {item.answer}
                    </div>

                  )}

                </div>
              );

            }
          )}

        </div>

      </div>

    </section>
  );
}


/* =========================================================
   CTA
   ========================================================= */

function FinalCTA({
  onOrder,
  texts,
  email
}) {

  return (
    <section
      className="final-cta section"
      id="contact"
    >

      <div className="container">

        <div className="final-cta-card">

          <div className="final-cta-glow final-cta-glow-one"></div>

          <div className="final-cta-glow final-cta-glow-two"></div>


          <div className="final-cta-content">

            <span className="section-kicker">
              ГОТОВЫ НАЧАТЬ?
            </span>


            <h2>

              {texts?.final_title ||
                "Давайте создадим что-то сильное"}

            </h2>


            <p>
              Расскажите о своей задаче — я помогу подобрать
              подходящий формат и предложу оптимальный вариант
              под ваш бюджет.
            </p>


            <div className="final-cta-actions">

              <button
                className="btn btn-primary"
                onClick={() =>
                  onOrder("Новый проект")
                }
              >

                {texts?.final_button ||
                  "Обсудить проект"}

                <span>
                  →
                </span>

              </button>


              <a
                className="final-cta-email"
                href={`mailto:${email}`}
              >

                <span className="final-cta-email-label">
                  ИЛИ НАПИШИТЕ НА ПОЧТУ
                </span>


                <span className="final-cta-email-address">
                  {email}
                </span>

              </a>

            </div>

          </div>


          <div className="final-cta-side">

            <div className="final-cta-side-number">
              01
            </div>


            <div className="final-cta-side-text">

              <span>
                САЙТЫ
              </span>

              <span>
                НЕЙРОФОТО
              </span>

              <span>
                КАРТОЧКИ ТОВАРОВ
              </span>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}


/* =========================================================
   ORDER MODAL
   ========================================================= */

function OrderModal({
  onClose,
  initialService = "",
  email
}) {

  const [form, setForm] =
    useState({
      name: "",
      contact: "",
      service: initialService,
      message: ""
    });


  const [sent, setSent] =
    useState(false);


  useEffect(() => {

    setForm((prev) => ({
      ...prev,
      service:
        initialService ||
        prev.service
    }));

  }, [initialService]);


  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

  };


  const handleSubmit = async (e) => {

    e.preventDefault();


    if (
      !form.name.trim() ||
      !form.contact.trim()
    ) {

      alert(
        "Пожалуйста, укажите имя и контакт для связи."
      );

      return;

    }


    try {

      const {
        error
      } =
        await frilancePublicSupabase
          .from("leads")
          .insert({
            name:
              form.name.trim(),

            contact:
              form.contact.trim(),

            service:
              form.service || "",

            message:
              form.message.trim() || ""
          });


      if (error) {
        throw error;
      }


      console.log(
        "Заявка успешно сохранена в Supabase."
      );

    } catch (error) {

      console.error(
        "Ошибка сохранения заявки в Supabase:",
        error
      );


      alert(
        "Не удалось сохранить заявку. Попробуйте ещё раз."
      );


      return;

    }


    const subject =
      `Заявка с сайта — ${
        form.service ||
        "новый проект"
      }`;


    const body =
      `Здравствуйте, Оксана!

Имя: ${form.name}
Контакт: ${form.contact}
Услуга: ${
        form.service ||
        "не выбрана"
      }

Задача:
${
        form.message ||
        "не указана"
      }`;


    const mailto =
      `mailto:${email}` +
      `?subject=${encodeURIComponent(
        subject
      )}` +
      `&body=${encodeURIComponent(
        body
      )}`;


    setSent(true);


    window.location.href =
      mailto;

  };


  if (sent) {

    return (
      <div className="modal-overlay">

        <div className="modal">

          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>


          <div
            style={{
              fontSize: "45px",
              marginBottom: "20px"
            }}
          >
            ✓
          </div>


          <h2 className="modal-title">
            Заявка подготовлена
          </h2>


          <p className="modal-description">
            Открылось ваше почтовое приложение.
            Осталось нажать «Отправить».
          </p>


          <button
            className="primary-button"
            style={{
              width: "100%"
            }}
            onClick={onClose}
          >
            Закрыть
          </button>

        </div>

      </div>
    );

  }


  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {

        if (
          e.target === e.currentTarget
        ) {

          onClose();

        }

      }}
    >

      <div className="modal">

        <button
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>


        <h2 className="modal-title">
          Обсудим ваш проект?
        </h2>


        <p className="modal-description">
          Заполните форму. Заявка сформируется
          автоматически и откроется в вашей почте.
        </p>


        <form
          className="form"
          onSubmit={handleSubmit}
        >

          <div className="form-field">

            <label>
              Ваше имя *
            </label>


            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Как к вам обращаться?"
              required
            />

          </div>


          <div className="form-field">

            <label>
              Телефон / VK / Email *
            </label>


            <input
              type="text"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="Как с вами связаться?"
              required
            />

          </div>


          <div className="form-field">

            <label>
              Что вас интересует?
            </label>


            <select
              name="service"
              value={form.service}
              onChange={handleChange}
            >

              <option value="">
                Выберите услугу
              </option>


              <option value="Сайт">
                Сайт
              </option>


              <option value="Нейрофото">
                Нейрофото
              </option>


              <option value="Карточка товара">
                Карточка товара
              </option>


              <option value="Другое">
                Другое
              </option>

            </select>

          </div>


          <div className="form-field">

            <label>
              Расскажите о задаче
            </label>


            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Что хотите получить?"
            />

          </div>


          <button
            type="submit"
            className="form-submit"
          >
            Отправить заявку →
          </button>


          <div className="form-note">
            Нажимая кнопку, вы открываете почтовое приложение
            для отправки сообщения.
          </div>

        </form>

      </div>

    </div>
  );
}


/* =========================================================
   NEURO PRICE MODAL
   ========================================================= */

function NeuroPricesModal({
  onClose,
  onOrder,
  neuroPrices
}) {

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {

        if (
          e.target === e.currentTarget
        ) {

          onClose();

        }

      }}
    >

      <div className="modal">

        <button
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>


        <div className="section-label">
          Нейрофото
        </div>


        <h2 className="modal-title">
          Цены на нейрофото
        </h2>


        <p className="modal-description">
          Стоимость зависит от количества фотографий
          и сложности образов.
        </p>


        <div className="price-modal-list">

          {neuroPrices.map(
            ([name, price], index) => (

              <div
                className="price-modal-item"
                key={index}
              >

                <span>
                  {name}
                </span>


                <span>
                  {price}
                </span>

              </div>

            )
          )}

        </div>


        <button
          className="primary-button"
          style={{
            width: "100%",
            marginTop: "25px"
          }}
          onClick={() => {

            onClose();

            onOrder("Нейрофото");

          }}
        >
          Заказать нейрофото →
        </button>

      </div>

    </div>
  );
}


/* =========================================================
   FOOTER
   ========================================================= */

function Footer({
  email
}) {

  const scrollToSection = (id) => {

    const element =
      document.getElementById(id);


    if (element) {

      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }

  };


  return (
    <footer className="footer">

      <div className="container">

        <div className="footer-main">

          <div className="footer-brand">

            <button
              className="footer-logo"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth"
                })
              }
            >
              Оксана Баннова
            </button>


            <p>
              Сайты, нейрофото и визуальная упаковка
              для специалистов и небольшого бизнеса.
            </p>

          </div>


          <div className="footer-column">

            <span className="footer-title">
              НАВИГАЦИЯ
            </span>


            <button
              onClick={() =>
                scrollToSection("services")
              }
            >
              Услуги
            </button>


            <button
              onClick={() =>
                scrollToSection("portfolio")
              }
            >
              Портфолио
            </button>


            <button
              onClick={() =>
                scrollToSection("prices")
              }
            >
              Цены
            </button>


            <button
              onClick={() =>
                scrollToSection("process")
              }
            >
              Как работаем
            </button>


            <button
              onClick={() =>
                scrollToSection("faq")
              }
            >
              FAQ
            </button>

          </div>


          <div className="footer-column">

            <span className="footer-title">
              УСЛУГИ
            </span>


            <button
              onClick={() =>
                scrollToSection("services")
              }
            >
              Сайты
            </button>


            <button
              onClick={() =>
                scrollToSection("services")
              }
            >
              Нейрофото
            </button>


            <button
              onClick={() =>
                scrollToSection("services")
              }
            >
              Карточки товаров
            </button>

          </div>


          <div className="footer-column footer-contact">

            <span className="footer-title">
              СВЯЗАТЬСЯ
            </span>


            <a
              href={`mailto:${email}`}
            >
              {email}
            </a>


            <button
              className="footer-contact-button"
              onClick={() =>
                scrollToSection("contact")
              }
            >
              Обсудить проект

              <span>
                →
              </span>

            </button>

          </div>

        </div>


        <div className="footer-bottom">

          <span>
            © {new Date().getFullYear()} Оксана Баннова
          </span>


          <span>
            Сайты • Нейрофото • Карточки товаров
          </span>


          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth"
              })
            }
            className="footer-up"
            aria-label="Наверх"
          >
            ↑
          </button>

        </div>

      </div>

    </footer>
  );
}


/* =========================================================
   FLOATING CTA
   ========================================================= */

function FloatingCTA({
  onClick
}) {

  return (
    <button
      className="floating-cta"
      onClick={onClick}
    >
      Обсудить проект →
    </button>
  );
}


/* =========================================================
   APP
   ========================================================= */

function App() {

  const [orderOpen, setOrderOpen] =
    useState(false);


  const [selectedService, setSelectedService] =
    useState("");


  const [serviceModal, setServiceModal] =
    useState(null);


  const [neuroModal, setNeuroModal] =
    useState(false);


  const [siteData, setSiteData] =
    useState({
      services: DEFAULT_SERVICES,
      prices: DEFAULT_PRICES,
      neuroPrices: DEFAULT_NEURO_PRICES,
      texts: DEFAULT_TEXTS,
      contacts: {
        ...CONFIG
      },
      portfolio: DEFAULT_PORTFOLIO
    });


  const [dataLoading, setDataLoading] =
    useState(true);


  /* ---------------------------------------------------------
     Загрузка данных из Supabase
     --------------------------------------------------------- */

  useEffect(() => {

    let mounted = true;


    const initSiteData = async () => {

      try {

        const data =
          await loadSiteData();


        if (mounted) {

          setSiteData(data);

        }

      } catch (error) {

        console.error(
          "FRILANCE: ошибка инициализации сайта:",
          error
        );

      } finally {

        if (mounted) {

          setDataLoading(false);

        }

      }

    };


    initSiteData();


    return () => {

      mounted = false;

    };

  }, []);


  /* ---------------------------------------------------------
     Модальные окна
     --------------------------------------------------------- */

  const openOrder = (
    service = ""
  ) => {

    setSelectedService(service);

    setOrderOpen(true);

    document.body.style.overflow =
      "hidden";

  };


  const closeOrder = () => {

    setOrderOpen(false);

    setSelectedService("");

    document.body.style.overflow =
      "";

  };


  const openService = (
    service
  ) => {

    setServiceModal(service);

    document.body.style.overflow =
      "hidden";

  };


  const closeService = () => {

    setServiceModal(null);

    document.body.style.overflow =
      "";

  };


  const openNeuro = () => {

    setNeuroModal(true);

    document.body.style.overflow =
      "hidden";

  };


  const closeNeuro = () => {

    setNeuroModal(false);

    document.body.style.overflow =
      "";

  };


  /* ---------------------------------------------------------
     ESC
     --------------------------------------------------------- */

  useEffect(() => {

    const handleKeyDown = (e) => {

      if (
        e.key === "Escape"
      ) {

        closeOrder();

        closeService();

        closeNeuro();

      }

    };


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );


      document.body.style.overflow =
        "";

    };

  }, []);


  return (
    <>

      <Header
        onOrder={() =>
          openOrder()
        }
        texts={
          siteData.texts
        }
      />


      <main>

        <Hero
          onOrder={() =>
            openOrder()
          }
          texts={
            siteData.texts
          }
        />


        <Services
          onService={
            openService
          }
          services={
            siteData.services
          }
          texts={
            siteData.texts
          }
        />


        <Portfolio
          onOrder={
            openOrder
          }
          portfolio={
            siteData.portfolio
          }
          texts={
            siteData.texts
          }
        />


        <Business
          onOrder={
            openOrder
          }
        />


        <Process
          onOrder={
            openOrder
          }
          texts={
            siteData.texts
          }
        />


        <Prices
          onOrder={
            openOrder
          }
          onNeuroPrices={
            openNeuro
          }
          prices={
            siteData.prices
          }
          neuroPrices={
            siteData.neuroPrices
          }
        />


        <Advantages />


        <FAQ
          texts={
            siteData.texts
          }
        />


        <FinalCTA
          onOrder={
            openOrder
          }
          texts={
            siteData.texts
          }
          email={
            siteData.contacts.email
          }
        />

      </main>


      <Footer
        email={
          siteData.contacts.email
        }
      />


      <FloatingCTA
        onClick={() =>
          openOrder()
        }
      />


      {serviceModal && (

        <ServiceModal
          service={
            serviceModal
          }
          onClose={
            closeService
          }
          onOrder={
            openOrder
          }
        />

      )}


      {neuroModal && (

        <NeuroPricesModal
          onClose={
            closeNeuro
          }
          onOrder={
            openOrder
          }
          neuroPrices={
            siteData.neuroPrices
          }
        />

      )}


      {orderOpen && (

        <OrderModal
          onClose={
            closeOrder
          }
          initialService={
            selectedService
          }
          email={
            siteData.contacts.email
          }
        />

      )}

    </>
  );
}


/* =========================================================
   START
   ========================================================= */

const rootElement =
  document.getElementById("root");


const root =
  ReactDOM.createRoot(
    rootElement
  );


root.render(
  <App />
);