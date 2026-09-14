const { useState, useEffect } = React;


/* =========================================================
   НАСТРОЙКИ
   ========================================================= */

const CONFIG = {
  email: "oksanchik2170@yandex.ru",
  site: "https://oksanabannova.github.io/frilance/"
};


/* =========================================================
   ДАННЫЕ
   ========================================================= */

const services = [
  {
    id: "website",
    number: "01",
    icon: "◈",
    title: "Сайты",
    short: "Современные сайты для мастеров, экспертов и бизнеса.",
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
    short: "Профессиональные фотографии без студии и фотографа.",
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
    short: "Визуал, который помогает товару выделиться среди конкурентов.",
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


const businessTypes = [
  {
    icon: "✂",
    title: "Мастерам",
    text: "Сайт, портфолио, нейрофото и визуал для продвижения услуг."
  },
  {
    icon: "◉",
    title: "Экспертам",
    text: "Упаковка личного бренда и современная презентация услуг."
  },
  {
    icon: "▣",
    title: "Малому бизнесу",
    text: "Сайт и визуал, которые помогают выглядеть профессионально."
  },
  {
    icon: "◆",
    title: "Магазинам",
    text: "Карточки товаров и визуальная упаковка для маркетплейсов."
  }
];


const prices = [
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


const neuroPrices = [
  ["Индивидуальная нейрофотосессия", "от 1 500 ₽"],
  ["Портрет / деловой образ", "от 1 000 ₽"],
  ["Beauty-съёмка", "от 1 500 ₽"],
  ["Семейная фотосессия", "от 2 000 ₽"],
  ["Парная фотосессия", "от 1 800 ₽"],
  ["Фото по вашему запросу", "от 700 ₽"]
];


const faq = [
  {
    q: "Сколько времени занимает создание сайта?",
    a:
      "Обычно небольшой сайт можно подготовить за 5–10 рабочих дней. Точный срок зависит от количества блоков, материалов и объёма задач."
  },
  {
    q: "Нужно ли мне самостоятельно писать тексты?",
    a:
      "Нет. Я помогу со структурой и формулировками. От вас понадобятся только основные сведения о бизнесе, услуге или товаре."
  },
  {
    q: "Можно ли заказать сайт, если у меня пока нет фотографий?",
    a:
      "Да. Можно использовать нейрофото, подготовить визуал под стиль бренда или временно использовать качественные изображения."
  },
  {
    q: "Можно ли потом самостоятельно менять информацию на сайте?",
    a:
      "Да. Я объясню принцип работы с проектом. При необходимости можно также договориться о дальнейшем сопровождении."
  },
  {
    q: "Работаете ли вы с клиентами из других городов?",
    a:
      "Да. Работа проходит онлайн, поэтому город не имеет значения."
  }
];


/* =========================================================
   HEADER
   ========================================================= */

function Header({ onOrder }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const goTo = (id) => {
    setMenuOpen(false);

    setTimeout(() => {
      const element = document.getElementById(id);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth"
        });
      }
    }, 50);
  };

  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
      <div className="container header-inner">

        <a
          href="#top"
          className="logo"
          onClick={(e) => {
            e.preventDefault();
            goTo("top");
          }}
        >
          <span className="logo-mark">✦</span>

          <span>
            Оксана Баннова
          </span>
        </a>


        <nav className={`nav ${menuOpen ? "open" : ""}`}>

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
          Обсудить проект
        </button>


        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
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

function Hero({ onOrder }) {
return ( <section className="hero" id="home"> <div className="hero-bg-glow"></div>

```
  <div className="container hero-grid">
    <div className="hero-content">
      <div className="hero-badge">
        <span className="hero-badge-dot"></span>
        Сайты • Нейрофото • Карточки товаров
      </div>

      <h1>
        Цифровая упаковка,
        <span> которая помогает продавать</span>
      </h1>

      <p className="hero-description">
        Создаю современные сайты, продающие визуалы с помощью нейросетей
        и карточки товаров, которые помогают бизнесу выглядеть
        профессионально.
      </p>

      <div className="hero-buttons">
        <button className="btn btn-primary" onClick={onOrder}>
          Обсудить проект
          <span>→</span>
        </button>

        <a href="#portfolio" className="btn btn-secondary">
          Смотреть работы
        </a>
      </div>

      <div className="hero-stats">
        <div className="hero-stat">
          <strong>3</strong>
          <span>направления</span>
        </div>

        <div className="hero-stat-line"></div>

        <div className="hero-stat">
          <strong>от 700 ₽</strong>
          <span>нейрофото</span>
        </div>

        <div className="hero-stat-line"></div>

        <div className="hero-stat">
          <strong>от 15 000 ₽</strong>
          <span>сайт</span>
        </div>
      </div>
    </div>

    <div className="hero-visual">

      <div className="hero-orbit hero-orbit-1"></div>
      <div className="hero-orbit hero-orbit-2"></div>

      <div className="hero-main-glow"></div>

      {/* Карточка сайта */}
      <div className="hero-card hero-card-site">
        <div className="hero-card-top">
          <div className="mini-dots">
            <i></i>
            <i></i>
            <i></i>
          </div>
          <span>WEBSITE</span>
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
          <span className="label-icon">⌘</span>
          Сайт под ключ
        </div>
      </div>

      {/* Карточка нейрофото */}
      <div className="hero-card hero-card-photo">
        <div className="photo-placeholder">
          <div className="photo-silhouette">
            <div className="silhouette-head"></div>
            <div className="silhouette-body"></div>
          </div>

          <div className="photo-spark spark-1">✦</div>
          <div className="photo-spark spark-2">✧</div>
          <div className="photo-spark spark-3">✦</div>
        </div>

        <div className="photo-label">
          <span>✦</span>
          NEUROPHOTO
        </div>
      </div>

      {/* Карточка товара */}
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
          <span>◈</span>
          Карточка товара
        </div>
      </div>

      <div className="hero-floating-tag tag-1">
        <span>✦</span>
        AI VISUAL
      </div>

      <div className="hero-floating-tag tag-2">
        <span>✓</span>
        Под ключ
      </div>

    </div>
  </div>

  <div className="hero-scroll">
    <span>SCROLL</span>
    <div className="scroll-line"></div>
  </div>
</section>

);
}



/* =========================================================
   SERVICES
   ========================================================= */

function Services({ onService }) {
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
          Не просто красиво.
          <br />
          <span className="gradient-text">
            Под задачу бизнеса.
          </span>
        </h2>

        <p className="section-description">
          Выбираем инструмент под вашу задачу:
          привлечь клиента, показать себя,
          красиво представить товар или запустить новый проект.
        </p>


        <div className="services-grid">

          {services.map((service) => (

            <article
              className="service-card"
              key={service.id}
              onClick={() => onService(service)}
              style={{ cursor: "pointer" }}
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
        if (e.target === e.currentTarget) {
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

          {service.details.map((item, index) => (

            <div
              className="price-modal-item"
              key={index}
            >
              <span>
                ✓ {item}
              </span>
            </div>

          ))}

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
          style={{ width: "100%" }}
          onClick={() => {
            onClose();
            onOrder(service.title);
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

function Portfolio({ onOrder }) {
const cases = [
{
type: "01",
category: "Сайт",
title: "Современный сайт\nдля мастера",
text: "Структура, дизайн и адаптация под телефон с акцентом на запись клиентов.",
tags: ["Дизайн", "JS", "Адаптив"],
visual: "site"
},
{
type: "02",
category: "Нейрофото",
title: "Визуал, который\nвыделяет",
text: "Создание профессиональных образов и фотосессий с помощью нейросетей.",
tags: ["AI", "Фото", "Контент"],
visual: "photo"
},
{
type: "03",
category: "Marketplace",
title: "Карточка товара,\nкоторая продаёт",
text: "Визуальная упаковка товара для Wildberries и Ozon.",
tags: ["WB", "Ozon", "Дизайн"],
visual: "product"
}
];

return ( <section className="portfolio section" id="portfolio"> <div className="container">

```
    <div className="section-heading portfolio-heading">
      <div>
        <span className="section-label">ПОРТФОЛИО</span>
        <h2>
          Работаю не ради<br />
          <span>«красиво»</span>
        </h2>
      </div>

      <p>
        Каждый проект создаётся под конкретную задачу:
        привлечь внимание, вызвать доверие и привести клиента
        к действию.
      </p>
    </div>

    <div className="portfolio-grid">

      {cases.map((item, index) => (
        <article
          className={`portfolio-case portfolio-case-${item.visual}`}
          key={item.type}
        >

          <div className="portfolio-info">

            <div className="portfolio-number">
              {item.type}
            </div>

            <div className="portfolio-category">
              {item.category}
            </div>

            <h3>
              {item.title.split("\n").map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < item.title.split("\n").length - 1 && <br />}
                </React.Fragment>
              ))}
            </h3>

            <p>{item.text}</p>

            <div className="portfolio-tags">
              {item.tags.map(tag => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <button
              className="portfolio-link"
              onClick={onOrder}
            >
              Обсудить похожий проект
              <span>↗</span>
            </button>

          </div>

          <div className="portfolio-visual">

            {item.visual === "site" && (
              <div className="case-site">
                <div className="case-browser">
                  <div className="case-browser-top">
                    <span></span>
                    <span></span>
                    <span></span>
                    <b>your-site.ru</b>
                  </div>

                  <div className="case-site-screen">
                    <div className="case-site-nav">
                      <i></i>
                      <div>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>

                    <div className="case-site-hero">
                      <small>YOUR BRAND</small>
                      <strong>
                        Сайт, который<br />
                        работает на вас
                      </strong>
                      <div className="case-site-button"></div>
                    </div>

                    <div className="case-site-cards">
                      <i></i>
                      <i></i>
                      <i></i>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {item.visual === "photo" && (
              <div className="case-photo">
                <div className="case-photo-glow"></div>

                <div className="case-person">
                  <div className="case-person-head"></div>
                  <div className="case-person-body"></div>
                </div>

                <div className="case-photo-text">
                  <span>AI</span>
                  <strong>VISUAL</strong>
                </div>

                <div className="case-photo-star star-a">✦</div>
                <div className="case-photo-star star-b">✧</div>
                <div className="case-photo-star star-c">✦</div>
              </div>
            )}

            {item.visual === "product" && (
              <div className="case-product">
                <div className="case-product-bg"></div>

                <div className="case-product-card">
                  <div className="case-product-image">
                    <div className="case-product-bottle"></div>
                  </div>

                  <div className="case-product-info">
                    <small>НОВИНКА</small>
                    <strong>Уход<br />за волосами</strong>
                    <span>1 500 ₽</span>
                  </div>
                </div>

                <div className="case-product-badge">
                  MARKETPLACE
                </div>
              </div>
            )}

          </div>

        </article>
      ))}

    </div>

    <div className="portfolio-bottom">
      <span>Есть задача, которой нет в списке?</span>
      <button onClick={onOrder}>
        Расскажите мне о ней →
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
      icon: "💇‍♀️",
      title: "Мастера и специалисты",
      text: "Парикмахеры, визажисты, мастера ногтей, ресниц, бровей, косметологи и другие специалисты.",
      result: "Сайт + нейрофото + визуал"
    },
    {
      icon: "✨",
      title: "Эксперты и услуги",
      text: "Помогаю красиво упаковать личный бренд, услуги и экспертность в современном формате.",
      result: "Упаковка, которая вызывает доверие"
    },
    {
      icon: "🏪",
      title: "Малый бизнес",
      text: "Для небольших компаний, студий, магазинов и предпринимателей, которым нужна современная подача.",
      result: "Понятный сайт и презентация бизнеса"
    },
    {
      icon: "📦",
      title: "Продавцы маркетплейсов",
      text: "Создаю визуально сильные карточки товаров для Wildberries, Ozon и других площадок.",
      result: "Товар выглядит дороже и заметнее"
    }
  ];

  return (
    <section className="business section" id="business">
      <div className="container">

        <div className="section-heading">
          <div className="section-kicker">ДЛЯ КОГО</div>

          <h2>
            Если вам нужно выглядеть
            <span> профессионально — вам сюда</span>
          </h2>

          <p>
            Я помогаю специалистам и небольшому бизнесу создавать
            современную цифровую упаковку без огромных бюджетов.
          </p>
        </div>

        <div className="business-grid">
          {targets.map((item, index) => (
            <article className="business-card" key={index}>

              <div className="business-icon">
                {item.icon}
              </div>

              <h3>{item.title}</h3>

              <p>{item.text}</p>

              <div className="business-result">
                <span>✓</span>
                {item.result}
              </div>

            </article>
          ))}
        </div>

        <div className="business-bottom">

          <div className="business-bottom-text">
            <span className="business-bottom-label">
              НЕ ЗНАЕТЕ, ЧТО ИМЕННО ВАМ НУЖНО?
            </span>

            <strong>
              Расскажите о задаче — я предложу подходящий вариант.
            </strong>
          </div>

          <button
  className="btn btn-primary"
  onClick={() => onOrder("Консультация")}
>
  Обсудить задачу
</button>

        </div>

      </div>
    </section>
  );
}


/* =========================================================
   PROCESS
   ========================================================= */

function Process({ onOrder }) {
  const steps = [
    {
      number: "01",
      title: "Заявка",
      text: "Вы рассказываете, что хотите сделать, присылаете материалы и пожелания."
    },
    {
      number: "02",
      title: "Обсуждение",
      text: "Я уточняю задачу, предлагаю решение и согласовываю стоимость."
    },
    {
      number: "03",
      title: "Создание",
      text: "Разрабатываю сайт, создаю визуал или оформляю карточки товара."
    },
    {
      number: "04",
      title: "Готовый результат",
      text: "Вы получаете готовый материал, который можно сразу использовать в работе."
    }
  ];

  return (
    <section className="process section" id="process">
      <div className="container">

        <div className="section-heading process-heading">
          <div className="section-kicker">КАК ЭТО РАБОТАЕТ</div>

          <h2>
            От идеи до готового
            <span> результата</span>
          </h2>

          <p>
            Без сложных технических терминов и бесконечных согласований.
            Вы ставите задачу — я занимаюсь реализацией.
          </p>
        </div>

        <div className="process-list">

          {steps.map((step, index) => (
            <div className="process-item" key={step.number}>

              <div className="process-number">
                {step.number}
              </div>

              <div className="process-content">
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>

              {index !== steps.length - 1 && (
                <div className="process-line"></div>
              )}

            </div>
          ))}

        </div>

        <div className="process-cta">

          <div>
            <span>ГОТОВЫ НАЧАТЬ?</span>
            <strong>
              Давайте обсудим вашу задачу
            </strong>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => onOrder("Новый проект")}
          >
            Оставить заявку
          </button>

        </div>

      </div>
    </section>
  )
}

/* =========================================================
   PRICES
   ========================================================= */

function Prices({ onOrder, onNeuroPrices }) {
  const tariffs = [
    {
      title: "Сайт START",
      price: "от 15 000 ₽",
      description: "Для специалиста, мастера или небольшого проекта.",
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
    },
    {
      title: "Сайт BUSINESS",
      price: "от 25 000 ₽",
      description: "Для бизнеса, которому нужен полноценный продающий сайт.",
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
    },
    {
      title: "Карточка товара",
      price: "от 1 500 ₽",
      description: "Визуальная упаковка товара для маркетплейсов.",
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
    }
  ];

  return (
    <section className="prices section" id="prices">
      <div className="container">

        <div className="section-heading prices-heading">

          <div className="section-kicker">
            СТОИМОСТЬ
          </div>

          <h2>
            Понятные цены
            <span> без скрытых платежей</span>
          </h2>

          <p>
            Стоимость зависит от объёма и сложности задачи.
            Перед началом работы я согласовываю итоговую цену.
          </p>

        </div>

        <div className="tariffs-grid">

          {tariffs.map((tariff, index) => (

            <article
              className={`tariff-card ${tariff.popular ? "tariff-popular" : ""}`}
              key={index}
            >

              {tariff.popular && (
                <div className="tariff-badge">
                  ПОПУЛЯРНЫЙ
                </div>
              )}

              <div className="tariff-top">

                <h3>{tariff.title}</h3>

                <div className="tariff-price">
                  {tariff.price}
                </div>

                <p>
                  {tariff.description}
                </p>

              </div>

              <div className="tariff-features">

                {tariff.features.map((feature, featureIndex) => (
                  <div
                    className="tariff-feature"
                    key={featureIndex}
                  >
                    <span>✓</span>
                    {feature}
                  </div>
                ))}

              </div>

              <button
  className="btn btn-primary tariff-button"
  onClick={() => onOrder(tariff.type)}
>
  {tariff.button}
</button>

            </article>

          ))}

        </div>

        <div className="neuro-price-block">

          <div className="neuro-price-content">

            <div className="neuro-price-kicker">
              НЕЙРОФОТО
            </div>

            <h3>
              Фотографии, которые
              <span> выглядят как настоящая съёмка</span>
            </h3>

            <p>
              Создам нужный образ, стиль и атмосферу
              на основе вашей фотографии.
            </p>

          </div>

          <div className="neuro-price-value">
            <span>от</span>
            <strong>700 ₽</strong>
          </div>

          <button
  className="btn btn-primary"
  onClick={onNeuroPrices}
>
  Смотреть прайс
</button>

        </div>

        <div className="prices-note">
          <span>✦</span>
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
      icon: "✦",
      title: "Современный подход",
      text: "Использую современные инструменты дизайна, разработки и AI."
    },
    {
      icon: "◎",
      title: "Под вашу задачу",
      text: "Не предлагаю ненужные функции. Сначала определяем цель."
    },
    {
      icon: "↗",
      title: "Понятный результат",
      text: "Вы заранее понимаете, что входит в работу и что получите."
    },
    {
      icon: "⌁",
      title: "Работа онлайн",
      text: "Можно работать со мной независимо от вашего города."
    },
    {
      icon: "✓",
      title: "Связь напрямую",
      text: "Вы общаетесь непосредственно со специалистом, который делает проект."
    },
    {
      icon: "∞",
      title: "Можно развивать",
      text: "Сайт или визуал можно постепенно дополнять по мере роста бизнеса."
    }
  ];

  return (
    <section
      className="advantages"
      id="advantages"
    >
      <div className="container">

        <div className="section-label">
          Почему я
        </div>

        <h2 className="section-title">
          Работаю так,
          <br />
          чтобы вам было
          <span className="gradient-text">
            спокойно.
          </span>
        </h2>


        <div className="advantages-grid">

          {advantages.map((item, index) => (

            <div
              className="advantage-card"
              key={index}
            >

              <div className="advantage-icon">
                {item.icon}
              </div>

              <h3>
                {item.title}
              </h3>

              <p>
                {item.text}
              </p>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}


/* =========================================================
   FAQ
   ========================================================= */

function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section
      className="faq"
      id="faq"
    >
      <div className="container">

        <div className="section-label">
          FAQ
        </div>

        <h2 className="section-title">
          Частые вопросы
        </h2>


        <div className="faq-list">

          {faq.map((item, index) => {

            const isOpen = open === index;

            return (
              <div
                className={`faq-item ${
                  isOpen ? "open" : ""
                }`}
                key={index}
              >

                <button
                  className="faq-question"
                  onClick={() => {
                    setOpen(
                      isOpen ? null : index
                    );
                  }}
                >

                  <span>
                    {item.q}
                  </span>

                  <span className="faq-plus">
                    +
                  </span>

                </button>


                <div className="faq-answer">

                  <div className="faq-answer-inner">
                    {item.a}
                  </div>

                </div>

              </div>
            );

          })}

        </div>

      </div>
    </section>
  );
}


/* =========================================================
   CTA
   ========================================================= */

function FinalCTA({ onOrder }) {
  return (
    <section className="final-cta">

      <div className="container">

        <div className="cta-box">

          <div className="cta-content">

            <div className="section-label">
              Начнём?
            </div>

            <h2 className="cta-title">
              Расскажите,
              <br />
              <span className="gradient-text">
                что хотите создать.
              </span>
            </h2>

            <p className="cta-description">
              Напишите пару слов о вашей задаче.
              Я посмотрю запрос и предложу оптимальный
              вариант решения.
            </p>


            <button
              className="primary-button"
              onClick={onOrder}
            >
              Оставить заявку →
            </button>

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
  initialService = ""
}) {

  const [form, setForm] = useState({
    name: "",
    contact: "",
    service: initialService,
    message: ""
  });

  const [sent, setSent] = useState(false);


  useEffect(() => {

    setForm((prev) => ({
      ...prev,
      service: initialService || prev.service
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


  const handleSubmit = (e) => {

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


    const lead = {
      ...form,
      date: new Date().toLocaleString("ru-RU")
    };


    try {

      const oldLeads =
        JSON.parse(
          localStorage.getItem("oksana_leads") || "[]"
        );

      oldLeads.push(lead);

      localStorage.setItem(
        "oksana_leads",
        JSON.stringify(oldLeads)
      );

    } catch (error) {
      console.log(error);
    }


    const subject =
      `Заявка с сайта — ${form.service || "новый проект"}`;


    const body =
      `Здравствуйте, Оксана!

Имя: ${form.name}
Контакт: ${form.contact}
Услуга: ${form.service || "не выбрана"}

Задача:
${form.message || "не указана"}`;


    const mailto =
      `mailto:${CONFIG.email}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;


    setSent(true);


    window.location.href = mailto;

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
            style={{ width: "100%" }}
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

function NeuroPricesModal({ onClose, onOrder }) {

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

function Footer() {

  const year =
    new Date().getFullYear();

  return (
    <footer className="footer">

      <div className="container">

        <div className="footer-inner">

          <div className="footer-brand">
            Оксана Баннова — сайты, нейрофото,
            визуал для бизнеса
          </div>


          <div className="footer-links">

            <a
              href="#services"
            >
              Услуги
            </a>

            <a
              href="#portfolio"
            >
              Портфолио
            </a>

            <a
              href="#prices"
            >
              Цены
            </a>

            <a
              href="#faq"
            >
              FAQ
            </a>

          </div>

        </div>


        <div className="footer-copy">
          © {year} Оксана Баннова. Все права защищены.
        </div>

      </div>

    </footer>
  );
}


/* =========================================================
   FLOATING CTA
   ========================================================= */

function FloatingCTA({ onClick }) {

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


  const openOrder = (service = "") => {

    setSelectedService(service);

    setOrderOpen(true);

    document.body.style.overflow = "hidden";

  };


  const closeOrder = () => {

    setOrderOpen(false);

    setSelectedService("");

    document.body.style.overflow = "";

  };


  const openService = (service) => {

    setServiceModal(service);

    document.body.style.overflow = "hidden";

  };


  const closeService = () => {

    setServiceModal(null);

    document.body.style.overflow = "";

  };


  const openNeuro = () => {

    setNeuroModal(true);

    document.body.style.overflow = "hidden";

  };


  const closeNeuro = () => {

    setNeuroModal(false);

    document.body.style.overflow = "";

  };


  useEffect(() => {

    const handleKeyDown = (e) => {

      if (e.key === "Escape") {

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

      document.body.style.overflow = "";

    };

  }, []);


  return (
    <>

      <Header
        onOrder={() => openOrder()}
      />


      <main>

        <Hero
          onOrder={() => openOrder()}
        />


        <Services
          onService={openService}
        />


        <Portfolio
          onOrder={() => openOrder()}
        />


        

<Business
  onOrder={openOrder}
/>


<Process
  onOrder={openOrder}
/>


<Prices
  onOrder={openOrder}
  onNeuroPrices={openNeuro}
/>

        <Advantages />


        <FAQ />


        <FinalCTA
          onOrder={() => openOrder()}
        />

      </main>


      <Footer />


      <FloatingCTA
        onClick={() => openOrder()}
      />


      {serviceModal && (

        <ServiceModal
          service={serviceModal}
          onClose={closeService}
          onOrder={openOrder}
        />

      )}


      {neuroModal && (

        <NeuroPricesModal
          onClose={closeNeuro}
          onOrder={openOrder}
        />

      )}


      {orderOpen && (

        <OrderModal
          onClose={closeOrder}
          initialService={selectedService}
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
  ReactDOM.createRoot(rootElement);


root.render(
  <App />
);