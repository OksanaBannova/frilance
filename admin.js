"use strict";

/* =========================================================
   FRILANCE ADMIN
   Админ-панель сайта Оксаны Банновой

   Версия:
   - Supabase
   - Портфолио
   - Услуги
   - Тексты
   - Контакты
   - Заявки
   - Встроенные превью без изображений
========================================================= */


/* =========================================================
   ГЛОБАЛЬНЫЕ ДАННЫЕ
========================================================= */

let portfolio = [];
let services = null;
let texts = null;
let contacts = null;
let leads = [];


/* =========================================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
========================================================= */

function $(selector, root = document) {
    return root.querySelector(selector);
}

function $$(selector, root = document) {
    return [...root.querySelectorAll(selector)];
}

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(date) {
    if (!date) {
        return "—";
    }

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
        return "—";
    }

    return d.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

function formatDateTime(date) {
    if (!date) {
        return "—";
    }

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
        return "—";
    }

    return d.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function showNotification(message, type = "success") {
    let notification = $("#adminNotification");

    if (!notification) {
        notification = document.createElement("div");
        notification.id = "adminNotification";
        notification.className = "admin-notification";

        document.body.appendChild(notification);
    }

    notification.textContent = message;

    notification.classList.remove(
        "show",
        "success",
        "error"
    );

    notification.classList.add(
        "show",
        type === "error" ? "error" : "success"
    );

    clearTimeout(notification._timer);

    notification._timer = setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}


/* =========================================================
   ВСТРОЕННЫЕ ПРЕВЬЮ ПОРТФОЛИО
========================================================= */

/*
   Картинки нам больше не нужны.

   Если в Supabase есть image_url, сначала пробуем показать
   реальную картинку.

   Если её нет или она отдаёт 404 —
   автоматически показываем встроенное превью.
*/

function getPortfolioPreviewType(item) {
    const text = [
        item?.title || "",
        item?.category || "",
        item?.description || ""
    ]
        .join(" ")
        .toLowerCase();

    if (
        text.includes("нейро") ||
        text.includes("фото") ||
        text.includes("ai")
    ) {
        return "neuro";
    }

    if (
        text.includes("карточ") ||
        text.includes("товар") ||
        text.includes("market") ||
        text.includes("маркет")
    ) {
        return "marketplace";
    }

    return "website";
}


function getBuiltInPreview(type) {

    if (type === "neuro") {
        return `
            <div class="portfolio-built-preview portfolio-preview-neuro">
                <div class="preview-glow preview-glow-one"></div>
                <div class="preview-glow preview-glow-two"></div>

                <div class="neuro-preview-content">
                    <div class="neuro-spark">✦</div>

                    <div class="neuro-face">
                        <div class="neuro-hair"></div>
                        <div class="neuro-face-shape">
                            <div class="neuro-eye left"></div>
                            <div class="neuro-eye right"></div>
                            <div class="neuro-mouth"></div>
                        </div>
                    </div>

                    <div class="neuro-label">
                        <span>AI</span>
                        <strong>НЕЙРОФОТО</strong>
                    </div>
                </div>
            </div>
        `;
    }


    if (type === "marketplace") {
        return `
            <div class="portfolio-built-preview portfolio-preview-marketplace">

                <div class="market-top">
                    <span class="market-logo">MARKET</span>
                    <span class="market-icon">♡</span>
                </div>

                <div class="market-product">
                    <div class="product-box">
                        <div class="product-shine"></div>
                        <div class="product-line"></div>
                        <div class="product-circle"></div>
                    </div>
                </div>

                <div class="market-info">
                    <div class="market-lines">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <div class="market-price">
                        от 1 500 ₽
                    </div>
                </div>

                <div class="market-badge">
                    КАРТОЧКА ТОВАРА
                </div>
            </div>
        `;
    }


    return `
        <div class="portfolio-built-preview portfolio-preview-website">

            <div class="browser-window">

                <div class="browser-top">
                    <div class="browser-dots">
                        <i></i>
                        <i></i>
                        <i></i>
                    </div>

                    <div class="browser-address">
                        your-site.ru
                    </div>
                </div>

                <div class="browser-content">

                    <div class="site-nav">
                        <strong>BRAND</strong>

                        <div class="site-nav-lines">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>

                    <div class="site-hero">

                        <div class="site-hero-text">
                            <small>САЙТ ПОД КЛЮЧ</small>

                            <strong>
                                Цифровая<br>
                                упаковка
                            </strong>

                            <div class="site-button">
                                Обсудить проект
                            </div>
                        </div>

                        <div class="site-hero-card">
                            <div class="site-card-glow"></div>
                            <div class="site-card-circle"></div>
                        </div>

                    </div>

                    <div class="site-bottom">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                </div>
            </div>

            <div class="website-label">
                <span>WEB</span>
                <strong>САЙТ</strong>
            </div>

        </div>
    `;
}


/* =========================================================
   ДОБАВЛЯЕМ СТИЛИ ВСТРОЕННЫХ ПРЕВЬЮ
========================================================= */

function injectPortfolioPreviewStyles() {

    if ($("#portfolioBuiltPreviewStyles")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "portfolioBuiltPreviewStyles";

    style.textContent = `

        .portfolio-preview-area {
            position: relative;
            width: 100%;
            height: 230px;
            overflow: hidden;
            border-radius: 18px 18px 0 0;
            background: #0d0a16;
        }


        .portfolio-built-preview {
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
        }


        /* ================================
           WEBSITE
        ================================= */

        .portfolio-preview-website {
            background:
                radial-gradient(
                    circle at 80% 20%,
                    rgba(98, 200, 255, .25),
                    transparent 35%
                ),
                radial-gradient(
                    circle at 20% 80%,
                    rgba(155, 92, 255, .25),
                    transparent 40%
                ),
                #090711;
            padding: 22px;
        }

        .browser-window {
            position: absolute;
            left: 8%;
            right: 8%;
            top: 15%;
            bottom: -15%;
            border-radius: 12px 12px 0 0;
            background: #11101a;
            border: 1px solid rgba(255,255,255,.12);
            box-shadow: 0 18px 45px rgba(0,0,0,.45);
            overflow: hidden;
            transform: perspective(700px) rotateX(3deg);
        }

        .browser-top {
            height: 28px;
            background: rgba(255,255,255,.055);
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 10px;
        }

        .browser-dots {
            display: flex;
            gap: 4px;
        }

        .browser-dots i {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: rgba(255,255,255,.3);
        }

        .browser-address {
            flex: 1;
            height: 14px;
            border-radius: 20px;
            background: rgba(255,255,255,.05);
            color: rgba(255,255,255,.3);
            font-size: 7px;
            display: flex;
            align-items: center;
            padding-left: 8px;
        }

        .browser-content {
            padding: 18px;
        }

        .site-nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: white;
        }

        .site-nav strong {
            font-size: 11px;
            letter-spacing: 1px;
        }

        .site-nav-lines {
            display: flex;
            gap: 5px;
        }

        .site-nav-lines span {
            width: 22px;
            height: 3px;
            border-radius: 10px;
            background: rgba(255,255,255,.25);
        }

        .site-hero {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 25px;
        }

        .site-hero-text small {
            display: block;
            color: #62c8ff;
            font-size: 7px;
            margin-bottom: 7px;
            letter-spacing: 1px;
        }

        .site-hero-text strong {
            display: block;
            color: white;
            font-size: 19px;
            line-height: 1.05;
        }

        .site-button {
            display: inline-block;
            margin-top: 12px;
            padding: 6px 10px;
            border-radius: 7px;
            background: linear-gradient(
                135deg,
                #62c8ff,
                #9b5cff
            );
            color: white;
            font-size: 6px;
        }

        .site-hero-card {
            width: 65px;
            height: 85px;
            border-radius: 14px;
            position: relative;
            overflow: hidden;
            background:
                linear-gradient(
                    145deg,
                    rgba(98,200,255,.5),
                    rgba(255,79,154,.45)
                );
            box-shadow:
                0 0 30px rgba(98,200,255,.2);
        }

        .site-card-glow {
            position: absolute;
            width: 55px;
            height: 55px;
            border-radius: 50%;
            background: rgba(255,255,255,.25);
            filter: blur(10px);
            top: 10px;
            left: 8px;
        }

        .site-card-circle {
            position: absolute;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            border: 1px solid rgba(255,255,255,.5);
            bottom: 13px;
            right: 12px;
        }

        .site-bottom {
            display: flex;
            gap: 7px;
            margin-top: 20px;
        }

        .site-bottom span {
            height: 5px;
            border-radius: 10px;
            background: rgba(255,255,255,.1);
            width: 35px;
        }

        .site-bottom span:first-child {
            width: 65px;
        }

        .website-label {
            position: absolute;
            bottom: 15px;
            left: 22px;
            display: flex;
            flex-direction: column;
            color: white;
        }

        .website-label span {
            font-size: 7px;
            color: #62c8ff;
            letter-spacing: 2px;
        }

        .website-label strong {
            font-size: 14px;
            letter-spacing: 1px;
        }


        /* ================================
           MARKETPLACE
        ================================= */

        .portfolio-preview-marketplace {
            background:
                radial-gradient(
                    circle at 50% 40%,
                    rgba(255,79,154,.18),
                    transparent 40%
                ),
                #100b18;
            padding: 18px;
        }

        .market-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: white;
        }

        .market-logo {
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 2px;
        }

        .market-icon {
            color: #ff4f9a;
            font-size: 18px;
        }

        .market-product {
            height: 105px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .product-box {
            width: 82px;
            height: 82px;
            border-radius: 18px;
            position: relative;
            background:
                linear-gradient(
                    145deg,
                    #2b213a,
                    #171020
                );
            border: 1px solid rgba(255,255,255,.12);
            box-shadow:
                0 15px 35px rgba(0,0,0,.4),
                0 0 25px rgba(255,79,154,.12);
        }

        .product-shine {
            position: absolute;
            top: 10px;
            right: 12px;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: rgba(255,255,255,.14);
            filter: blur(3px);
        }

        .product-line {
            position: absolute;
            left: 18px;
            right: 18px;
            bottom: 20px;
            height: 5px;
            border-radius: 5px;
            background: rgba(255,255,255,.2);
        }

        .product-circle {
            position: absolute;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 1px solid rgba(255,79,154,.7);
            left: 24px;
            top: 22px;
        }

        .market-info {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .market-lines {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .market-lines span {
            width: 55px;
            height: 4px;
            border-radius: 10px;
            background: rgba(255,255,255,.12);
        }

        .market-lines span:first-child {
            width: 80px;
            background: rgba(255,255,255,.25);
        }

        .market-price {
            color: white;
            font-size: 11px;
            font-weight: 700;
        }

        .market-badge {
            position: absolute;
            right: 15px;
            bottom: 15px;
            padding: 5px 8px;
            border-radius: 5px;
            background: rgba(255,79,154,.12);
            border: 1px solid rgba(255,79,154,.25);
            color: #ff82b5;
            font-size: 6px;
            letter-spacing: .7px;
        }


        /* ================================
           NEURO PHOTO
        ================================= */

        .portfolio-preview-neuro {
            background:
                radial-gradient(
                    circle at 50% 35%,
                    rgba(255,79,154,.35),
                    transparent 34%
                ),
                radial-gradient(
                    circle at 20% 80%,
                    rgba(155,92,255,.25),
                    transparent 35%
                ),
                #0d0915;
        }

        .preview-glow {
            position: absolute;
            border-radius: 50%;
            filter: blur(25px);
        }

        .preview-glow-one {
            width: 90px;
            height: 90px;
            top: 25px;
            left: 25px;
            background: rgba(255,79,154,.18);
        }

        .preview-glow-two {
            width: 80px;
            height: 80px;
            right: 25px;
            bottom: 20px;
            background: rgba(98,200,255,.14);
        }

        .neuro-preview-content {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .neuro-spark {
            position: absolute;
            top: 28px;
            right: 28%;
            color: #ff78b0;
            font-size: 22px;
        }

        .neuro-face {
            position: relative;
            width: 100px;
            height: 135px;
        }

        .neuro-hair {
            position: absolute;
            width: 100px;
            height: 105px;
            border-radius: 48% 48% 35% 35%;
            background:
                linear-gradient(
                    135deg,
                    #171020,
                    #3a2447
                );
            top: 2px;
            box-shadow:
                0 0 35px rgba(255,79,154,.18);
        }

        .neuro-face-shape {
            position: absolute;
            width: 63px;
            height: 82px;
            left: 18px;
            top: 24px;
            border-radius: 46% 46% 48% 48%;
            background:
                linear-gradient(
                    135deg,
                    #f3c6ba,
                    #c98982
                );
            box-shadow:
                0 8px 20px rgba(0,0,0,.3);
        }

        .neuro-eye {
            position: absolute;
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #30202d;
            top: 34px;
        }

        .neuro-eye.left {
            left: 17px;
        }

        .neuro-eye.right {
            right: 17px;
        }

        .neuro-mouth {
            position: absolute;
            width: 13px;
            height: 5px;
            border-bottom: 1px solid #713e46;
            border-radius: 50%;
            left: 25px;
            bottom: 17px;
        }

        .neuro-label {
            position: absolute;
            left: 22px;
            bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .neuro-label span {
            color: #ff4f9a;
            font-size: 10px;
            font-weight: 800;
        }

        .neuro-label strong {
            color: white;
            font-size: 9px;
            letter-spacing: 1px;
        }


        /* ================================
           FALLBACK
        ================================= */

        .portfolio-image-error {
            width: 100%;
            height: 100%;
        }

        .portfolio-preview-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }


        /* ================================
           LEADS LOADING
        ================================= */

        .leads-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            min-height: 100px;
            color: rgba(255,255,255,.55);
        }

        .leads-loading-spinner {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,.12);
            border-top-color: #62c8ff;
            animation: frilanceSpin .8s linear infinite;
        }

        @keyframes frilanceSpin {
            to {
                transform: rotate(360deg);
            }
        }

    `;

    document.head.appendChild(style);
}


/* =========================================================
   ИНИЦИАЛИЗАЦИЯ
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    injectPortfolioPreviewStyles();

    initNavigation();
    initPortfolio();
    initServices();
    initTexts();
    initContacts();
    initLeads();
    initQuickActions();

    waitForSupabase();
});


/* =========================================================
   ОЖИДАНИЕ SUPABASE
========================================================= */

function waitForSupabase() {

    if (typeof frilanceSupabase !== "undefined") {

        console.log(
            "FRILANCE ADMIN: Supabase готов"
        );

        loadAllData();

        return;
    }

    console.log(
        "FRILANCE ADMIN: ждём Supabase..."
    );

    setTimeout(waitForSupabase, 100);
}


/* =========================================================
   ЗАГРУЗКА ВСЕХ ДАННЫХ
========================================================= */

async function loadAllData() {

    console.log(
        "FRILANCE ADMIN: начинаем загрузку данных"
    );


    try {
        await loadPortfolio();
    } catch (error) {
        console.error(
            "Ошибка загрузки портфолио:",
            error
        );
    }


    try {
        await loadServices();
    } catch (error) {
        console.error(
            "Ошибка загрузки услуг:",
            error
        );
    }


    try {
        await loadTexts();
    } catch (error) {
        console.error(
            "Ошибка загрузки текстов:",
            error
        );
    }


    try {
        await loadContacts();
    } catch (error) {
        console.error(
            "Ошибка загрузки контактов:",
            error
        );
    }


    try {
        await loadLeads();
    } catch (error) {
        console.error(
            "Ошибка загрузки заявок:",
            error
        );
    }


    updateDashboard();

    console.log(
        "FRILANCE ADMIN: загрузка завершена"
    );
}


/* =========================================================
   НАВИГАЦИЯ
========================================================= */

function initNavigation() {

    $$(".admin-nav-item").forEach(item => {

        item.addEventListener("click", event => {

            event.preventDefault();

            const section =
                item.dataset.section ||
                item.getAttribute("data-section");

            if (section) {
                showSection(section);
            }
        });
    });


    $$("[data-section]").forEach(item => {

        if (
            item.classList.contains("admin-nav-item")
        ) {
            return;
        }

        if (
            item.dataset.section &&
            item.tagName === "BUTTON"
        ) {

            item.addEventListener("click", () => {

                showSection(
                    item.dataset.section
                );

            });
        }

    });


    const hash =
        window.location.hash.replace("#", "");

    if (hash) {
        showSection(hash);
    } else {
        showSection("dashboard");
    }
}


function showSection(sectionName) {

    if (!sectionName) {
        return;
    }

    const sections = $$(".admin-section");

    sections.forEach(section => {

        section.classList.toggle(
            "active",
            section.id ===
            `section-${sectionName}`
        );

    });


    const navItems =
        $$(".admin-nav-item");

    navItems.forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.section === sectionName
        );

    });


    const title =
        $("[data-page-title]");

    if (title) {

        const titles = {
            dashboard: "Обзор",
            portfolio: "Портфолио",
            services: "Услуги",
            texts: "Тексты",
            contacts: "Контакты",
            leads: "Заявки",
            seo: "SEO",
            settings: "Настройки"
        };

        title.textContent =
            titles[sectionName] ||
            "Админ-панель";
    }


    window.location.hash = sectionName;


    if (sectionName === "leads") {
        renderLeads();
    }

    if (sectionName === "portfolio") {
        renderPortfolio();
    }
}


/* =========================================================
   БЫСТРЫЕ ДЕЙСТВИЯ
========================================================= */

function initQuickActions() {

    $$("[data-open-section]").forEach(button => {

        button.addEventListener("click", () => {

            const section =
                button.dataset.openSection;

            if (section) {
                showSection(section);
            }
        });
    });
}


/* =========================================================
   ПОРТФОЛИО
========================================================= */

function initPortfolio() {

    const addButton =
        $("#addPortfolioButton");

    const addEmptyButton =
        $("#addPortfolioButtonEmpty");

    if (addButton) {

        addButton.addEventListener(
            "click",
            () => openPortfolioModal()
        );
    }

    if (addEmptyButton) {

        addEmptyButton.addEventListener(
            "click",
            () => openPortfolioModal()
        );
    }


    const closeButton =
        $("#closePortfolioModal");

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closePortfolioModal
        );
    }


    const cancelButton =
        $("#cancelPortfolioButton");

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closePortfolioModal
        );
    }


    const modal =
        $("#portfolioModal");

    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {
                    closePortfolioModal();
                }
            }
        );
    }


    const form =
        $("#portfolioForm");

    if (form) {

        form.addEventListener(
            "submit",
            savePortfolio
        );
    }


    const imageInput =
        $("#portfolioImage");

    if (imageInput) {

        imageInput.addEventListener(
            "change",
            previewPortfolioImage
        );
    }
}


async function loadPortfolio() {

    console.log(
        "FRILANCE: загружаем portfolio..."
    );


    const { data, error } =
        await frilanceSupabase
            .from("portfolio")
            .select("*")
            .order("sort_order", {
                ascending: true
            })
            .order("created_at", {
                ascending: false
            });


    if (error) {
        throw error;
    }


    portfolio =
        Array.isArray(data)
            ? data
            : [];


    console.log(
        "FRILANCE: portfolio загружено:",
        portfolio.length
    );


    renderPortfolio();
    updatePortfolioCount();
}


function renderPortfolio() {

    const grid =
        $("#portfolioAdminGrid");

    const emptyState =
        $("#portfolioEmptyState");


    if (!grid) {
        return;
    }


    if (!portfolio.length) {

        grid.innerHTML = "";

        if (emptyState) {
            emptyState.style.display = "";
        }

        return;
    }


    if (emptyState) {
        emptyState.style.display = "none";
    }


    grid.innerHTML =
        portfolio
            .map(item =>
                createPortfolioCard(item)
            )
            .join("");


    $$(".portfolio-edit-button", grid)
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    const item =
                        portfolio.find(
                            portfolioItem =>
                                portfolioItem.id === id
                        );

                    if (item) {
                        openPortfolioModal(item);
                    }
                }
            );
        });


    $$(".portfolio-delete-button", grid)
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    deletePortfolio(id);
                }
            );
        });
}


function createPortfolioCard(item) {

    const previewType =
        getPortfolioPreviewType(item);


    const hasImage =
        item.image_url &&
        String(item.image_url).trim();


    let preview;


    if (hasImage) {

        preview = `
            <div class="portfolio-preview-area">
                <img
                    class="portfolio-preview-image"
                    src="${escapeHtml(item.image_url)}"
                    alt="${escapeHtml(item.title)}"
                    loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                >

                <div
                    class="portfolio-image-error"
                    style="display:none;"
                >
                    ${getBuiltInPreview(previewType)}
                </div>
            </div>
        `;

    } else {

        preview = `
            <div class="portfolio-preview-area">
                ${getBuiltInPreview(previewType)}
            </div>
        `;
    }


    return `
        <article class="portfolio-admin-card">

            ${preview}

            <div class="portfolio-admin-card-content">

                <div class="portfolio-admin-card-top">

                    <div>
                        <div class="portfolio-category">
                            ${escapeHtml(
                                item.category || "Работа"
                            )}
                        </div>

                        <h3>
                            ${escapeHtml(
                                item.title || "Без названия"
                            )}
                        </h3>
                    </div>

                    <div class="portfolio-price">
                        ${escapeHtml(
                            item.price || ""
                        )}
                    </div>

                </div>


                <p class="portfolio-description">
                    ${escapeHtml(
                        item.description || ""
                    )}
                </p>


                <div class="portfolio-card-actions">

                    <button
                        type="button"
                        class="admin-button portfolio-edit-button"
                        data-id="${escapeHtml(item.id)}"
                    >
                        Редактировать
                    </button>

                    <button
                        type="button"
                        class="admin-button admin-button-danger portfolio-delete-button"
                        data-id="${escapeHtml(item.id)}"
                    >
                        Удалить
                    </button>

                </div>

            </div>

        </article>
    `;
}


function openPortfolioModal(item = null) {

    const modal =
        $("#portfolioModal");

    const form =
        $("#portfolioForm");


    if (!modal) {
        return;
    }


    if (form) {
        form.reset();
    }


    const modalTitle =
        $("#portfolioModalTitle");

    const idInput =
        $("#portfolioId");


    if (item) {

        if (modalTitle) {
            modalTitle.textContent =
                "Редактировать работу";
        }

        if (idInput) {
            idInput.value =
                item.id || "";
        }

        const title =
            $("#portfolioTitle");

        const category =
            $("#portfolioCategory");

        const price =
            $("#portfolioPrice");

        const description =
            $("#portfolioDescription");


        if (title) {
            title.value =
                item.title || "";
        }

        if (category) {
            category.value =
                item.category || "";
        }

        if (price) {
            price.value =
                item.price || "";
        }

        if (description) {
            description.value =
                item.description || "";
        }


    } else {

        if (modalTitle) {
            modalTitle.textContent =
                "Добавить работу";
        }

        if (idInput) {
            idInput.value = "";
        }
    }


    modal.classList.add("active");
    modal.style.display = "flex";
}


function closePortfolioModal() {

    const modal =
        $("#portfolioModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");
    modal.style.display = "none";
}


function previewPortfolioImage(event) {

    const file =
        event.target.files?.[0];

    const preview =
        $("#portfolioImagePreview");


    if (!file || !preview) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload = () => {

        preview.src =
            reader.result;

        preview.style.display =
            "block";
    };


    reader.readAsDataURL(file);
}


async function savePortfolio(event) {

    event.preventDefault();


    const id =
        $("#portfolioId")?.value.trim() || "";


    const title =
        $("#portfolioTitle")?.value.trim() || "";


    const category =
        $("#portfolioCategory")?.value.trim() || "";


    const price =
        $("#portfolioPrice")?.value.trim() || "";


    const description =
        $("#portfolioDescription")?.value.trim() || "";


    if (!title || !category || !price) {

        showNotification(
            "Заполните название, категорию и цену.",
            "error"
        );

        return;
    }


    const payload = {
        title,
        category,
        price,
        description
    };


    try {

        let result;


        if (id) {

            result =
                await frilanceSupabase
                    .from("portfolio")
                    .update(payload)
                    .eq("id", id);

        } else {

            const maxSort =
                portfolio.reduce(
                    (max, item) =>
                        Math.max(
                            max,
                            Number(item.sort_order) || 0
                        ),
                    0
                );


            payload.sort_order =
                maxSort + 1;


            result =
                await frilanceSupabase
                    .from("portfolio")
                    .insert(payload);
        }


        if (result.error) {
            throw result.error;
        }


        closePortfolioModal();

        await loadPortfolio();

        updateDashboard();

        showNotification(
            id
                ? "Работа обновлена."
                : "Работа добавлена."
        );


    } catch (error) {

        console.error(
            "Ошибка сохранения портфолио:",
            error
        );

        showNotification(
            "Не удалось сохранить работу.",
            "error"
        );
    }
}


async function deletePortfolio(id) {

    if (!id) {
        return;
    }


    const item =
        portfolio.find(
            portfolioItem =>
                portfolioItem.id === id
        );


    const confirmed =
        confirm(
            `Удалить работу «${item?.title || "Без названия"}»?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const { error } =
            await frilanceSupabase
                .from("portfolio")
                .delete()
                .eq("id", id);


        if (error) {
            throw error;
        }


        await loadPortfolio();

        updateDashboard();

        showNotification(
            "Работа удалена."
        );


    } catch (error) {

        console.error(
            "Ошибка удаления портфолио:",
            error
        );

        showNotification(
            "Не удалось удалить работу.",
            "error"
        );
    }
}


function updatePortfolioCount() {

    const elements = [
        $("#dashboardPortfolioCount"),
        $("#portfolioCount")
    ];


    elements.forEach(element => {

        if (element) {
            element.textContent =
                portfolio.length;
        }

    });
}


/* =========================================================
   УСЛУГИ
========================================================= */

function initServices() {

    const form =
        $("#servicesForm");

    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        saveServices
    );
}


async function loadServices() {

    const { data, error } =
        await frilanceSupabase
            .from("services")
            .select("*")
            .order("created_at", {
                ascending: true
            })
            .limit(1);


    if (error) {
        throw error;
    }


    services =
        data?.[0] || null;


    fillServicesForm();

    updateServicesCount();
}


function fillServicesForm() {

    if (!services) {
        return;
    }


    const fields = {
        serviceNeuroPrice:
            services.neuro_price,

        serviceWebsitePrice:
            services.website_price,

        serviceMarketplacePrice:
            services.marketplace_price,

        serviceStartPrice:
            services.start_price,

        serviceBusinessPrice:
            services.business_price
    };


    Object.entries(fields)
        .forEach(([id, value]) => {

            const field =
                $(`#${id}`);

            if (field) {
                field.value =
                    value || "";
            }
        });
}


async function saveServices(event) {

    event.preventDefault();


    const payload = {

        neuro_price:
            $("#serviceNeuroPrice")?.value.trim()
            || "от 700 ₽",

        website_price:
            $("#serviceWebsitePrice")?.value.trim()
            || "от 15 000 ₽",

        marketplace_price:
            $("#serviceMarketplacePrice")?.value.trim()
            || "от 1 500 ₽",

        start_price:
            $("#serviceStartPrice")?.value.trim()
            || "15 000 ₽",

        business_price:
            $("#serviceBusinessPrice")?.value.trim()
            || "25 000 ₽"
    };


    try {

        let result;


        if (services?.id) {

            result =
                await frilanceSupabase
                    .from("services")
                    .update(payload)
                    .eq("id", services.id);

        } else {

            result =
                await frilanceSupabase
                    .from("services")
                    .insert(payload);
        }


        if (result.error) {
            throw result.error;
        }


        await loadServices();

        showNotification(
            "Цены сохранены."
        );


    } catch (error) {

        console.error(
            "Ошибка сохранения услуг:",
            error
        );

        showNotification(
            "Не удалось сохранить цены.",
            "error"
        );
    }
}


function updateServicesCount() {

    const element =
        $("#dashboardServicesCount");

    if (element) {
        element.textContent =
            services ? "5" : "0";
    }
}


/* =========================================================
   ТЕКСТЫ
========================================================= */

function initTexts() {

    const forms = [
        "#textsHeroForm",
        "#textsSectionsForm",
        "#textsAdditionalForm"
    ];


    forms.forEach(selector => {

        const form = $(selector);

        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            saveTexts
        );
    });
}


async function loadTexts() {

    const { data, error } =
        await frilanceSupabase
            .from("texts")
            .select("*")
            .order("created_at", {
                ascending: true
            })
            .limit(1);


    if (error) {
        throw error;
    }


    texts =
        data?.[0] || null;


    fillTextsForms();
}


function fillTextsForms() {

    if (!texts) {
        return;
    }


    const fields = {

        textHeroTitle:
            texts.hero_title,

        textHeroSubtitle:
            texts.hero_subtitle,

        textHeroPrimaryButton:
            texts.hero_primary_button,

        textHeroSecondaryButton:
            texts.hero_secondary_button,

        textServicesTitle:
            texts.services_title,

        textPortfolioTitle:
            texts.portfolio_title,

        textProcessTitle:
            texts.process_title,

        textFaqTitle:
            texts.faq_title,

        textFinalTitle:
            texts.final_title,

        textFinalButton:
            texts.final_button,

        textAbout:
            texts.about
    };


    Object.entries(fields)
        .forEach(([id, value]) => {

            const field =
                $(`#${id}`);

            if (field) {
                field.value =
                    value || "";
            }
        });
}


async function saveTexts(event) {

    event.preventDefault();


    const payload = {

        hero_title:
            $("#textHeroTitle")?.value.trim()
            || "",

        hero_subtitle:
            $("#textHeroSubtitle")?.value.trim()
            || "",

        hero_primary_button:
            $("#textHeroPrimaryButton")?.value.trim()
            || "",

        hero_secondary_button:
            $("#textHeroSecondaryButton")?.value.trim()
            || "",

        services_title:
            $("#textServicesTitle")?.value.trim()
            || "",

        portfolio_title:
            $("#textPortfolioTitle")?.value.trim()
            || "",

        process_title:
            $("#textProcessTitle")?.value.trim()
            || "",

        faq_title:
            $("#textFaqTitle")?.value.trim()
            || "",

        final_title:
            $("#textFinalTitle")?.value.trim()
            || "",

        final_button:
            $("#textFinalButton")?.value.trim()
            || "",

        about:
            $("#textAbout")?.value.trim()
            || ""
    };


    try {

        let result;


        if (texts?.id) {

            result =
                await frilanceSupabase
                    .from("texts")
                    .update(payload)
                    .eq("id", texts.id);

        } else {

            result =
                await frilanceSupabase
                    .from("texts")
                    .insert(payload);
        }


        if (result.error) {
            throw result.error;
        }


        await loadTexts();

        showNotification(
            "Тексты сохранены."
        );


    } catch (error) {

        console.error(
            "Ошибка сохранения текстов:",
            error
        );

        showNotification(
            "Не удалось сохранить тексты.",
            "error"
        );
    }
}


/* =========================================================
   КОНТАКТЫ
========================================================= */

function initContacts() {

    const form =
        $("#contactsForm");

    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        saveContacts
    );
}


async function loadContacts() {

    const { data, error } =
        await frilanceSupabase
            .from("contacts")
            .select("*")
            .order("created_at", {
                ascending: true
            })
            .limit(1);


    if (error) {
        throw error;
    }


    contacts =
        data?.[0] || null;


    fillContactsForm();
}


function fillContactsForm() {

    if (!contacts) {
        return;
    }


    const email =
        $("#contactEmail");

    const site =
        $("#contactSite");


    if (email) {
        email.value =
            contacts.email || "";
    }


    if (site) {
        site.value =
            contacts.site || "";
    }
}


async function saveContacts(event) {

    event.preventDefault();


    const payload = {

        email:
            $("#contactEmail")?.value.trim()
            || "",

        site:
            $("#contactSite")?.value.trim()
            || ""
    };


    try {

        let result;


        if (contacts?.id) {

            result =
                await frilanceSupabase
                    .from("contacts")
                    .update(payload)
                    .eq("id", contacts.id);

        } else {

            result =
                await frilanceSupabase
                    .from("contacts")
                    .insert(payload);
        }


        if (result.error) {
            throw result.error;
        }


        await loadContacts();

        showNotification(
            "Контакты сохранены."
        );


    } catch (error) {

        console.error(
            "Ошибка сохранения контактов:",
            error
        );

        showNotification(
            "Не удалось сохранить контакты.",
            "error"
        );
    }
}


/* =========================================================
   ЗАЯВКИ
========================================================= */

function initLeads() {

    const refreshButton =
        $("#refreshLeadsButton");


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            () => loadLeads(true)
        );
    }


    const closeButton =
        $("#closeLeadDetailsModal");


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeLeadDetailsModal
        );
    }


    const closeDetailsButton =
        $("#closeLeadDetailsButton");


    if (closeDetailsButton) {

        closeDetailsButton.addEventListener(
            "click",
            closeLeadDetailsModal
        );
    }


    const modal =
        $("#leadDetailsModal");


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {
                    closeLeadDetailsModal();
                }
            }
        );
    }
}


async function loadLeads(showMessage = false) {

    const tbody =
        $("#leadsTableBody");


    if (tbody) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="leads-loading">
                        <span class="leads-loading-spinner"></span>
                        <span>Загрузка заявок...</span>
                    </div>
                </td>
            </tr>
        `;
    }


    try {

        const { data, error } =
            await frilanceSupabase
                .from("leads")
                .select("*")
                .order("created_at", {
                    ascending: false
                });


        if (error) {
            throw error;
        }


        leads =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "FRILANCE: заявок загружено:",
            leads.length
        );


        renderLeads();
        renderRecentLeads();
        updateLeadsCount();


        if (showMessage) {

            showNotification(
                "Заявки обновлены."
            );
        }


    } catch (error) {

        console.error(
            "Ошибка загрузки заявок:",
            error
        );


        leads = [];


        if (tbody) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="admin-empty-state">
                            Не удалось загрузить заявки.
                        </div>
                    </td>
                </tr>
            `;
        }


        updateLeadsCount();


        if (showMessage) {

            showNotification(
                "Ошибка загрузки заявок.",
                "error"
            );
        }


        throw error;
    }
}


function renderLeads() {

    const tbody =
        $("#leadsTableBody");

    const total =
        $("#leadsTotal");


    if (total) {

        total.textContent =
            `Всего: ${leads.length}`;
    }


    if (!tbody) {
        return;
    }


    if (!leads.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="admin-empty-state">
                        Пока нет заявок.
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        leads
            .map(
                (lead, index) =>
                    createLeadRow(
                        lead,
                        index
                    )
            )
            .join("");


    $$(".lead-details-button", tbody)
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    const lead =
                        leads.find(
                            item =>
                                item.id === id
                        );

                    if (lead) {
                        openLeadDetailsModal(
                            lead
                        );
                    }
                }
            );
        });


    $$(".lead-delete-button", tbody)
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    deleteLead(id);
                }
            );
        });
}


function createLeadRow(lead, index) {

    return `
        <tr>

            <td>
                <div class="lead-name">
                    ${escapeHtml(
                        lead.name || "Без имени"
                    )}
                </div>
            </td>

            <td>
                <div class="lead-contact">
                    ${escapeHtml(
                        lead.contact || "—"
                    )}
                </div>
            </td>

            <td>
                <div class="lead-service">
                    ${escapeHtml(
                        lead.service || "—"
                    )}
                </div>
            </td>

            <td>
                <div class="lead-message">
                    ${escapeHtml(
                        lead.message || "—"
                    )}
                </div>
            </td>

            <td>
                <div class="lead-date">
                    ${formatDateTime(
                        lead.created_at
                    )}
                </div>
            </td>

            <td>

                <div class="lead-actions">

                    <button
                        type="button"
                        class="admin-button lead-details-button"
                        data-id="${escapeHtml(lead.id)}"
                    >
                        Подробнее
                    </button>

                    <button
                        type="button"
                        class="admin-button admin-button-danger lead-delete-button"
                        data-id="${escapeHtml(lead.id)}"
                    >
                        Удалить
                    </button>

                </div>

            </td>

        </tr>
    `;
}


function renderRecentLeads() {

    const container =
        $("#recentLeads");


    if (!container) {
        return;
    }


    if (!leads.length) {

        container.innerHTML = `
            <div class="admin-empty-state">
                Пока нет новых заявок.
            </div>
        `;

        return;
    }


    container.innerHTML =
        leads
            .slice(0, 5)
            .map(
                lead => `
                    <div class="recent-lead-item">

                        <div class="recent-lead-main">

                            <strong>
                                ${escapeHtml(
                                    lead.name || "Без имени"
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    lead.service || "Запрос"
                                )}
                            </span>

                        </div>

                        <div class="recent-lead-date">
                            ${formatDate(
                                lead.created_at
                            )}
                        </div>

                    </div>
                `
            )
            .join("");
}


function updateLeadsCount() {

    const count =
        leads.length;


    const elements = [
        $("#dashboardLeadsCount"),
        $("#leadsCount")
    ];


    elements.forEach(element => {

        if (!element) {
            return;
        }

        element.textContent =
            count;
    });
}


function openLeadDetailsModal(lead) {

    const modal =
        $("#leadDetailsModal");


    if (!modal) {
        return;
    }


    const fields = {

        leadDetailsTitle:
            `Заявка от ${lead.name || "клиента"}`,

        leadDetailsName:
            lead.name || "—",

        leadDetailsContact:
            lead.contact || "—",

        leadDetailsService:
            lead.service || "—",

        leadDetailsDate:
            formatDateTime(lead.created_at),

        leadDetailsMessage:
            lead.message || "Сообщение отсутствует."
    };


    Object.entries(fields)
        .forEach(([id, value]) => {

            const element =
                $(`#${id}`);

            if (element) {
                element.textContent =
                    value;
            }
        });


    modal.classList.add("active");
    modal.style.display = "flex";
}


function closeLeadDetailsModal() {

    const modal =
        $("#leadDetailsModal");


    if (!modal) {
        return;
    }


    modal.classList.remove("active");
    modal.style.display = "none";
}


async function deleteLead(id) {

    if (!id) {
        return;
    }


    const lead =
        leads.find(
            item =>
                item.id === id
        );


    const confirmed =
        confirm(
            `Удалить заявку от «${lead?.name || "клиента"}»?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const { error } =
            await frilanceSupabase
                .from("leads")
                .delete()
                .eq("id", id);


        if (error) {
            throw error;
        }


        await loadLeads();

        updateDashboard();

        showNotification(
            "Заявка удалена."
        );


    } catch (error) {

        console.error(
            "Ошибка удаления заявки:",
            error
        );

        showNotification(
            "Не удалось удалить заявку.",
            "error"
        );
    }
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    updatePortfolioCount();
    updateServicesCount();
    updateLeadsCount();
    renderRecentLeads();
}


/* =========================================================
   ESC — ЗАКРЫТЬ МОДАЛЬНЫЕ ОКНА
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }


        closePortfolioModal();
        closeLeadDetailsModal();
    }
);


/* =========================================================
   ПУБЛИЧНЫЙ API
========================================================= */

window.FRILANCE_ADMIN = {

    reload: loadAllData,

    reloadPortfolio: loadPortfolio,

    reloadLeads: loadLeads,

    showSection,

    getPortfolio: () =>
        [...portfolio],

    getServices: () =>
        services,

    getTexts: () =>
        texts,

    getContacts: () =>
        contacts,

    getLeads: () =>
        [...leads]
};


/* =========================================================
   ГОТОВО
========================================================= */

console.log(
    "FRILANCE ADMIN: admin.js загружен"
);