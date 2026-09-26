"use strict";

/* =========================================================
   FRILANCE ADMIN
   Админ-панель сайта Оксаны Банновой

   Версия:
   - Supabase
   - Портфолио
   - Многофайловая загрузка изображений
   - Supabase Storage
   - portfolio_images
   - Услуги
   - Тексты
   - Контакты
   - Заявки
   - Авторизация
   - Повторные запросы
   - Realtime заявок
========================================================= */


/* =========================================================
   ГЛОБАЛЬНЫЕ ДАННЫЕ
========================================================= */

let portfolio = [];
let services = null;
let texts = null;
let contacts = null;
let leads = [];

let portfolioImages = [];
let currentExistingPortfolioImages = [];

let leadsRealtimeChannel = null;
let leadsFallbackTimer = null;
let leadsRealtimeActive = false;
let leadsLoading = false;

let frilanceAdminInitialized = false;


/* =========================================================
   DOM HELPERS
========================================================= */

function $(selector, root = document) {
    return root.querySelector(selector);
}


function $$(selector, root = document) {
    return [...root.querySelectorAll(selector)];
}


/* =========================================================
   ОБЩИЕ HELPERS
========================================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
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

    return d.toLocaleDateString(
        "ru-RU",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


function formatDateTime(date) {

    if (!date) {
        return "—";
    }

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
        return "—";
    }

    return d.toLocaleString(
        "ru-RU",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function sleep(ms) {

    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}


/* =========================================================
   SUPABASE RETRY
========================================================= */

function isRetryableSupabaseError(error) {

    const message =
        String(error?.message || "").toLowerCase();

    const details =
        String(error?.details || "").toLowerCase();

    const hint =
        String(error?.hint || "").toLowerCase();

    const code =
        String(error?.code || "").toLowerCase();

    const combined =
        `${message} ${details} ${hint} ${code}`;

    return (
        combined.includes("failed to fetch") ||
        combined.includes("networkerror") ||
        combined.includes("network error") ||
        combined.includes("http2") ||
        combined.includes("timeout") ||
        combined.includes("502") ||
        combined.includes("503") ||
        combined.includes("504") ||
        combined.includes("connection reset") ||
        combined.includes("connection closed") ||
        combined.includes("connection refused") ||
        combined.includes("network request failed") ||
        combined.includes("err_connection_reset") ||
        combined.includes("err_http2_ping_failed")
    );
}


async function withSupabaseRetry(
    operation,
    label,
    options = {}
) {

    const attempts =
        Number(options.attempts) || 5;

    const baseDelay =
        Number(options.baseDelay) || 800;

    let lastError = null;

    for (
        let attempt = 1;
        attempt <= attempts;
        attempt++
    ) {

        try {

            console.log(
                `FRILANCE: запрос ${label}, попытка ${attempt}/${attempts}`
            );

            const result =
                await operation();

            if (result?.error) {

                lastError =
                    result.error;

                if (
                    !isRetryableSupabaseError(
                        result.error
                    ) ||
                    attempt === attempts
                ) {
                    return result;
                }

            } else {

                return result;
            }

        } catch (error) {

            lastError =
                error;

            if (
                !isRetryableSupabaseError(error) ||
                attempt === attempts
            ) {
                throw error;
            }
        }

        /*
           Экспоненциальная задержка.
           Для Storage даём серверу немного больше времени.
        */

        const delay =
            Math.min(
                baseDelay * Math.pow(2, attempt - 1),
                8000
            );

        console.warn(
            `FRILANCE: временная ошибка ${label}. ` +
            `Повтор через ${delay} мс.`
        );

        await sleep(delay);
    }

    throw (
        lastError ||
        new Error(
            `Не удалось выполнить запрос: ${label}`
        )
    );
}


/* =========================================================
   AUTH
========================================================= */

async function waitForAuthSession(timeout = 10000) {

    if (
        typeof frilanceSupabase === "undefined" ||
        !frilanceSupabase
    ) {

        console.warn(
            "FRILANCE AUTH: Supabase client пока недоступен."
        );

        return null;
    }

    const started =
        Date.now();

    while (
        Date.now() - started < timeout
    ) {

        try {

            const result =
                await frilanceSupabase.auth.getSession();

            const session =
                result?.data?.session;

            if (session) {

                console.log(
                    "FRILANCE AUTH: активная сессия подтверждена."
                );

                return session;
            }

        } catch (error) {

            console.warn(
                "FRILANCE AUTH: ошибка проверки сессии:",
                error
            );
        }

        await sleep(300);
    }

    console.warn(
        "FRILANCE AUTH: активная сессия не найдена."
    );

    return null;
}


/* =========================================================
   УВЕДОМЛЕНИЯ
========================================================= */

function showNotification(
    message,
    type = "success"
) {

    let notification =
        $("#adminNotification");

    if (!notification) {

        notification =
            document.createElement("div");

        notification.id =
            "adminNotification";

        notification.className =
            "admin-notification";

        document.body.appendChild(
            notification
        );
    }

    notification.textContent =
        message;

    notification.classList.remove(
        "show",
        "success",
        "error"
    );

    notification.classList.add(
        "show",
        type === "error"
            ? "error"
            : "success"
    );

    clearTimeout(
        notification._timer
    );

    notification._timer =
        setTimeout(() => {

            notification.classList.remove(
                "show"
            );

        }, 3500);
}


/* =========================================================
   NORMALIZE IMAGE URL
========================================================= */

function normalizePortfolioImageUrl(url) {

    if (
        url === null ||
        url === undefined
    ) {
        return "";
    }

    const value =
        String(url).trim();

    if (!value) {
        return "";
    }

    const lower =
        value.toLowerCase();

    if (
        lower.startsWith("images/") ||
        lower.startsWith("/images/") ||
        lower.startsWith("./images/") ||
        lower.includes("127.0.0.1") ||
        lower.includes("localhost")
    ) {

        console.warn(
            "FRILANCE: найден старый локальный путь изображения:",
            value
        );

        return "";
    }

    return value;
}


/* =========================================================
   ВСТРОЕННЫЕ ПРЕВЬЮ
========================================================= */

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

                            <small>
                                САЙТ ПОД КЛЮЧ
                            </small>

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
   СТИЛИ ПРЕВЬЮ
========================================================= */

function injectPortfolioPreviewStyles() {

    if ($("#portfolioBuiltPreviewStyles")) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "portfolioBuiltPreviewStyles";

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
        }

        .product-shine {
            position: absolute;
            top: 10px;
            right: 12px;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: rgba(255,255,255,.14);
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
        }

        .portfolio-preview-neuro {
            background:
                radial-gradient(
                    circle at 50% 35%,
                    rgba(255,79,154,.35),
                    transparent 34%
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
            background: linear-gradient(
                135deg,
                #171020,
                #3a2447
            );
            top: 2px;
        }

        .neuro-face-shape {
            position: absolute;
            width: 63px;
            height: 82px;
            left: 18px;
            top: 24px;
            border-radius: 46%;
            background: linear-gradient(
                135deg,
                #f3c6ba,
                #c98982
            );
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

        .portfolio-preview-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .portfolio-image-error {
            width: 100%;
            height: 100%;
        }

        .portfolio-images-editor {
            display: grid;
            grid-template-columns: repeat(
                auto-fill,
                minmax(120px, 1fr)
            );
            gap: 12px;
            margin-top: 14px;
        }

        .portfolio-selected-image {
            position: relative;
            height: 120px;
            border-radius: 12px;
            overflow: hidden;
            background: #11101a;
            border: 1px solid rgba(255,255,255,.1);
        }

        .portfolio-selected-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .portfolio-selected-remove,
        .portfolio-existing-remove {
            position: absolute;
            top: 7px;
            right: 7px;
            width: 28px;
            height: 28px;
            border: 0;
            border-radius: 50%;
            background: rgba(0,0,0,.75);
            color: white;
            cursor: pointer;
            font-size: 18px;
            line-height: 1;
        }

        .portfolio-selected-remove:hover,
        .portfolio-existing-remove:hover {
            background: #ff4f9a;
        }

        .portfolio-existing-images {
            margin-top: 20px;
            padding-top: 18px;
            border-top: 1px solid rgba(255,255,255,.08);
        }

        .portfolio-existing-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }

        .portfolio-existing-header span {
            min-width: 25px;
            padding: 3px 8px;
            border-radius: 20px;
            background: rgba(255,255,255,.08);
            text-align: center;
        }

        .portfolio-existing-grid {
            display: grid;
            grid-template-columns: repeat(
                auto-fill,
                minmax(120px, 1fr)
            );
            gap: 12px;
        }

        .portfolio-existing-image {
            position: relative;
            height: 120px;
            border-radius: 12px;
            overflow: hidden;
            background: #11101a;
            border: 1px solid rgba(255,255,255,.1);
        }

        .portfolio-existing-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .portfolio-existing-main {
            position: absolute;
            left: 7px;
            bottom: 7px;
            padding: 4px 7px;
            border-radius: 5px;
            background: rgba(0,0,0,.75);
            color: white;
            font-size: 10px;
        }

        .portfolio-existing-remove {
            z-index: 5;
        }

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

        .portfolio-image-loading {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,.55);
            color: white;
            font-size: 12px;
            z-index: 4;
        }

        .portfolio-image-broken {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px;
            text-align: center;
            color: rgba(255,255,255,.55);
            font-size: 11px;
        }
    `;

    document.head.appendChild(style);
}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (frilanceAdminInitialized) {

            console.warn(
                "FRILANCE ADMIN: повторная инициализация предотвращена."
            );

            return;
        }

        frilanceAdminInitialized = true;

        console.log(
            "FRILANCE ADMIN: запуск..."
        );

        injectPortfolioPreviewStyles();

        initNavigation();
        initPortfolio();
        initServices();
        initTexts();
        initContacts();
        initLeads();
        initQuickActions();

        waitForSupabase();
    }
);


/* =========================================================
   ОЖИДАНИЕ SUPABASE
========================================================= */

function waitForSupabase() {

    if (
        typeof frilanceSupabase !== "undefined" &&
        frilanceSupabase
    ) {

        console.log(
            "FRILANCE ADMIN: Supabase готов."
        );

        loadAllData();

        return;
    }

    setTimeout(
        waitForSupabase,
        100
    );
}


/* =========================================================
   ЗАГРУЗКА ДАННЫХ
========================================================= */

async function loadAllData() {

    console.log(
        "FRILANCE ADMIN: начинаем загрузку данных..."
    );

    const session =
        await waitForAuthSession();

    if (session) {

        console.log(
            "FRILANCE ADMIN: пользователь:",
            session.user?.email || "без email"
        );

    } else {

        console.error(
            "FRILANCE ADMIN: активная Supabase-сессия не найдена."
        );
    }


    try {

        await loadLeads(false);

    } catch (error) {

        console.error(
            "FRILANCE: ошибка первичной загрузки заявок:",
            error
        );
    }


    const loaders = [

        ["портфолио", loadPortfolio],
        ["услуги", loadServices],
        ["тексты", loadTexts],
        ["контакты", loadContacts]

    ];


    for (
        const [name, loader]
        of loaders
    ) {

        try {

            await loader();

        } catch (error) {

            console.error(
                `FRILANCE: ошибка загрузки ${name}:`,
                error
            );
        }
    }


    updateDashboard();

    initLeadsRealtime();

    console.log(
        "FRILANCE ADMIN: загрузка завершена."
    );
}


/* =========================================================
   НАВИГАЦИЯ
========================================================= */

function initNavigation() {

    $$(".admin-nav-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const section =
                        item.dataset.section;

                    if (section) {
                        showSection(section);
                    }
                }
            );
        });


    $$("[data-section]")
        .forEach(item => {

            if (
                item.classList.contains(
                    "admin-nav-item"
                )
            ) {
                return;
            }

            if (
                item.dataset.section &&
                item.tagName === "BUTTON"
            ) {

                item.addEventListener(
                    "click",
                    () => {

                        showSection(
                            item.dataset.section
                        );
                    }
                );
            }
        });


    const hash =
        window.location.hash.replace(
            "#",
            ""
        );

    showSection(
        hash || "dashboard"
    );
}


function showSection(sectionName) {

    if (!sectionName) {
        return;
    }


    $$(".admin-section")
        .forEach(section => {

            section.classList.toggle(
                "active",
                section.id ===
                `section-${sectionName}`
            );
        });


    $$(".admin-nav-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.section ===
                sectionName
            );
        });


    window.location.hash =
        sectionName;


    if (sectionName === "leads") {
        renderLeads();
    }


    if (sectionName === "portfolio") {
        renderPortfolio();
    }
}


/* =========================================================
   QUICK ACTIONS
========================================================= */

function initQuickActions() {

    $$("[data-open-section]")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const section =
                        button.dataset.openSection;

                    if (section) {
                        showSection(section);
                    }
                }
            );
        });
}


/* =========================================================
   ПОРТФОЛИО — ИНИЦИАЛИЗАЦИЯ
========================================================= */

function initPortfolio() {

    const addButton =
        $("#addPortfolioButton");

    const addEmptyButton =
        $("#addPortfolioButtonEmpty");

    const closeButton =
        $("#closePortfolioModal");

    const cancelButton =
        $("#cancelPortfolioButton");

    const modal =
        $("#portfolioModal");

    const form =
        $("#portfolioForm");

    const imageInput =
        $("#portfolioImages");


    if (addButton) {

        addButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openPortfolioModal();
            }
        );
    }


    if (addEmptyButton) {

        addEmptyButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openPortfolioModal();
            }
        );
    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                closePortfolioModal();
            }
        );
    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                closePortfolioModal();
            }
        );
    }


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


    if (form) {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                savePortfolio(event);
            }
        );
    }


    if (imageInput) {

        imageInput.addEventListener(
            "change",
            previewPortfolioImages
        );
    }
}


/* =========================================================
   ЗАГРУЗКА PORTFOLIO
========================================================= */

async function loadPortfolio() {

    console.log(
        "FRILANCE: загружаем portfolio..."
    );


    const result =
        await withSupabaseRetry(
            () =>
                frilanceSupabase
                    .from("portfolio")
                    .select("*")
                    .order(
                        "sort_order",
                        {
                            ascending: true
                        }
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    ),
            "portfolio"
        );


    if (result.error) {
        throw result.error;
    }


    portfolio =
        Array.isArray(result.data)
            ? result.data.map(item => ({

                ...item,

                image_url:
                    normalizePortfolioImageUrl(
                        item.image_url
                    )

            }))
            : [];


    console.log(
        "FRILANCE: portfolio загружено:",
        portfolio.length
    );


    renderPortfolio();

    updatePortfolioCount();
}


/* =========================================================
   ЗАГРУЗКА PORTFOLIO_IMAGES
========================================================= */

async function loadPortfolioImages(
    portfolioId
) {

    if (!portfolioId) {
        return [];
    }


    try {

        const result =
            await withSupabaseRetry(
                () =>
                    frilanceSupabase
                        .from("portfolio_images")
                        .select("*")
                        .eq(
                            "portfolio_id",
                            portfolioId
                        )
                        .order(
                            "sort_order",
                            {
                                ascending: true
                            }
                        )
                        .order(
                            "created_at",
                            {
                                ascending: true
                            }
                        ),
                "portfolio_images",
                {
                    attempts: 4,
                    baseDelay: 1000
                }
            );


        if (result.error) {
            throw result.error;
        }


        return Array.isArray(result.data)
            ? result.data
            : [];


    } catch (error) {

        /*
           ВАЖНО:
           Дополнительные изображения не должны блокировать
           открытие и редактирование самой работы.
        */

        console.warn(
            "FRILANCE: portfolio_images временно недоступна:",
            error
        );

        return [];
    }
}


/* =========================================================
   STORAGE UPLOAD
========================================================= */

async function uploadPortfolioImage(file) {

    if (!file) {
        return null;
    }


    const session =
        await waitForAuthSession(5000);


    if (!session) {

        throw new Error(
            "Сессия администратора не найдена. " +
            "Обновите страницу и войдите снова."
        );
    }


    const allowedTypes = [

        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"

    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        throw new Error(
            `Файл «${file.name}» имеет неподдерживаемый формат.`
        );
    }


    const maxSize =
        10 * 1024 * 1024;


    if (file.size > maxSize) {

        throw new Error(
            `Файл «${file.name}» больше 10 МБ.`
        );
    }


    const extension =
        (
            file.name
                .split(".")
                .pop() ||
            "jpg"
        )
            .toLowerCase()
            .replace(
                /[^a-z0-9]/g,
                ""
            );


    const randomPart =
        Math.random()
            .toString(36)
            .slice(2, 10);


    const timestamp =
        Date.now();


    const storagePath =
        `portfolio/${timestamp}-${randomPart}.${extension}`;


    console.log(
        "FRILANCE: загружаем изображение:",
        storagePath
    );


    const uploadResult =
        await withSupabaseRetry(
            () =>
                frilanceSupabase
                    .storage
                    .from("portfolio-images")
                    .upload(
                        storagePath,
                        file,
                        {
                            cacheControl: "3600",
                            upsert: false,
                            contentType: file.type
                        }
                    ),
            `загрузка ${file.name}`,
            {
                attempts: 6,
                baseDelay: 1200
            }
        );


    if (uploadResult.error) {
        throw uploadResult.error;
    }


    const publicResult =
        frilanceSupabase
            .storage
            .from("portfolio-images")
            .getPublicUrl(
                storagePath
            );


    const publicUrl =
        publicResult?.data?.publicUrl;


    if (!publicUrl) {

        throw new Error(
            "Изображение загружено, но публичный URL не получен."
        );
    }


    console.log(
        "FRILANCE: изображение загружено:",
        publicUrl
    );


    return {

        publicUrl,

        storagePath

    };
}


/* =========================================================
   УДАЛЕНИЕ ФАЙЛА ИЗ STORAGE
========================================================= */

async function removePortfolioStorageFile(
    storagePath
) {

    if (!storagePath) {
        return;
    }


    try {

        const result =
            await withSupabaseRetry(
                () =>
                    frilanceSupabase
                        .storage
                        .from("portfolio-images")
                        .remove([
                            storagePath
                        ]),
                `удаление Storage ${storagePath}`,
                {
                    attempts: 4,
                    baseDelay: 1000
                }
            );


        if (result.error) {
            throw result.error;
        }


        console.log(
            "FRILANCE: файл Storage удалён:",
            storagePath
        );


    } catch (error) {

        /*
           Удаление Storage не должно ломать удаление
           записи из базы.
        */

        console.warn(
            "FRILANCE: не удалось удалить файл Storage:",
            storagePath,
            error
        );
    }
}


/* =========================================================
   RENDER PORTFOLIO
========================================================= */

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
            .map(createPortfolioCard)
            .join("");


    $$(".portfolio-edit-button", grid)
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

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
                event => {

                    event.preventDefault();

                    deletePortfolio(
                        button.dataset.id
                    );
                }
            );
        });
}


/* =========================================================
   PORTFOLIO CARD
========================================================= */

function createPortfolioCard(item) {

    const previewType =
        getPortfolioPreviewType(item);


    const imageUrl =
        normalizePortfolioImageUrl(
            item.image_url
        );


    let preview;


    if (imageUrl) {

        preview = `

            <div class="portfolio-preview-area">

                <img
                    class="portfolio-preview-image"
                    src="${escapeHtml(imageUrl)}"
                    alt="${escapeHtml(item.title)}"
                    loading="lazy"
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='block';
                    "
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
                                item.category ||
                                "Работа"
                            )}
                        </div>

                        <h3>
                            ${escapeHtml(
                                item.title ||
                                "Без названия"
                            )}
                        </h3>

                    </div>

                    <div class="portfolio-price">
                        ${escapeHtml(
                            item.price ||
                            ""
                        )}
                    </div>

                </div>


                <p class="portfolio-description">
                    ${escapeHtml(
                        item.description ||
                        ""
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


/* =========================================================
   OPEN PORTFOLIO MODAL
========================================================= */

async function openPortfolioModal(item = null) {

    const modal =
        $("#portfolioModal");

    const form =
        $("#portfolioForm");


    if (!modal) {
        return;
    }


    portfolioImages = [];
    currentExistingPortfolioImages = [];


    if (form) {
        form.reset();
    }


    const modalTitle =
        $("#portfolioModalTitle");

    const idInput =
        $("#portfolioId");


    clearSelectedImagesPreview();

    clearExistingImages();


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


        modal.classList.add("active");
        modal.style.display = "flex";


        try {

            const images =
                await loadPortfolioImages(
                    item.id
                );

            currentExistingPortfolioImages =
                images;

            renderExistingImages(
                images
            );

        } catch (error) {

            console.error(
                "FRILANCE: ошибка загрузки изображений портфолио:",
                error
            );

            renderExistingImages([]);

        }

    } else {

        if (modalTitle) {
            modalTitle.textContent =
                "Добавить работу";
        }


        if (idInput) {
            idInput.value = "";
        }


        renderExistingImages([]);
    }


    modal.classList.add("active");
    modal.style.display = "flex";
}


/* =========================================================
   CLOSE PORTFOLIO MODAL
========================================================= */

function closePortfolioModal() {

    const modal =
        $("#portfolioModal");


    if (!modal) {
        return;
    }


    modal.classList.remove("active");

    modal.style.display =
        "none";


    portfolioImages = [];
    currentExistingPortfolioImages = [];

    clearSelectedImagesPreview();
    clearExistingImages();
}


/* =========================================================
   PREVIEW MULTIPLE IMAGES
========================================================= */

function previewPortfolioImages(event) {

    const input =
        event.target;


    const files =
        [...(
            input.files ||
            []
        )];


    if (!files.length) {

        portfolioImages = [];

        clearSelectedImagesPreview();

        return;
    }


    const allowedTypes = [

        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"

    ];


    const maxSize =
        10 * 1024 * 1024;


    const validFiles = [];


    for (const file of files) {

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            showNotification(
                `Файл «${file.name}» имеет неподдерживаемый формат.`,
                "error"
            );

            continue;
        }


        if (file.size > maxSize) {

            showNotification(
                `Файл «${file.name}» больше 10 МБ.`,
                "error"
            );

            continue;
        }


        validFiles.push(file);
    }


    portfolioImages =
        validFiles;


    renderSelectedImages(
        portfolioImages
    );
}


/* =========================================================
   RENDER SELECTED FILES
========================================================= */

function renderSelectedImages(files) {

    const container =
        $("#portfolioImagesEditor");


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (!files.length) {
        return;
    }


    files.forEach(
        (file, index) => {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "portfolio-selected-image";


            const img =
                document.createElement("img");


            const removeButton =
                document.createElement("button");


            removeButton.type =
                "button";

            removeButton.className =
                "portfolio-selected-remove";

            removeButton.textContent =
                "×";

            removeButton.title =
                "Убрать изображение";


            removeButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    portfolioImages.splice(
                        index,
                        1
                    );

                    renderSelectedImages(
                        portfolioImages
                    );
                }
            );


            wrapper.appendChild(img);
            wrapper.appendChild(removeButton);

            container.appendChild(
                wrapper
            );


            const reader =
                new FileReader();


            reader.onload =
                () => {

                    img.src =
                        reader.result;
                };


            reader.readAsDataURL(file);
        }
    );
}


/* =========================================================
   CLEAR SELECTED PREVIEW
========================================================= */

function clearSelectedImagesPreview() {

    const container =
        $("#portfolioImagesEditor");


    if (container) {
        container.innerHTML = "";
    }


    const input =
        $("#portfolioImages");


    if (input) {
        input.value = "";
    }
}


/* =========================================================
   EXISTING IMAGES
========================================================= */

function clearExistingImages() {

    const grid =
        $("#portfolioExistingGrid");

    const count =
        $("#portfolioExistingCount");


    if (grid) {
        grid.innerHTML = "";
    }


    if (count) {
        count.textContent = "0";
    }
}


function renderExistingImages(images) {

    const grid =
        $("#portfolioExistingGrid");

    const count =
        $("#portfolioExistingCount");


    if (!grid) {
        return;
    }


    grid.innerHTML =
        "";


    if (count) {
        count.textContent =
            String(images.length);
    }


    if (!images.length) {
        return;
    }


    images.forEach(
        (image, index) => {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "portfolio-existing-image";


            const img =
                document.createElement("img");


            img.src =
                image.image_url;

            img.alt =
                image.description ||
                "Изображение проекта";

            img.loading =
                "lazy";


            img.onerror =
                () => {

                    img.style.display =
                        "none";

                    const broken =
                        document.createElement("div");

                    broken.className =
                        "portfolio-image-broken";

                    broken.textContent =
                        "Изображение временно недоступно";

                    wrapper.appendChild(
                        broken
                    );
                };


            const mainLabel =
                document.createElement("span");

            mainLabel.className =
                "portfolio-existing-main";


            if (index === 0) {

                mainLabel.textContent =
                    "Основное";

            } else {

                mainLabel.textContent =
                    "Изображение";
            }


            const removeButton =
                document.createElement("button");

            removeButton.type =
                "button";

            removeButton.className =
                "portfolio-existing-remove";

            removeButton.textContent =
                "×";

            removeButton.title =
                "Удалить изображение";


            removeButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    deleteExistingPortfolioImage(
                        image,
                        wrapper
                    );
                }
            );


            wrapper.appendChild(img);
            wrapper.appendChild(mainLabel);
            wrapper.appendChild(removeButton);


            grid.appendChild(
                wrapper
            );
        }
    );
}


/* =========================================================
   DELETE EXISTING PORTFOLIO IMAGE
========================================================= */

async function deleteExistingPortfolioImage(
    image,
    wrapper
) {

    if (!image?.id) {
        return;
    }


    const confirmed =
        confirm(
            "Удалить это изображение?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const deleteResult =
            await withSupabaseRetry(
                () =>
                    frilanceSupabase
                        .from("portfolio_images")
                        .delete()
                        .eq(
                            "id",
                            image.id
                        ),
                "удаление portfolio_images",
                {
                    attempts: 5,
                    baseDelay: 1000
                }
            );


        if (deleteResult.error) {
            throw deleteResult.error;
        }


        await removePortfolioStorageFile(
            image.storage_path
        );


        currentExistingPortfolioImages =
            currentExistingPortfolioImages.filter(
                item =>
                    item.id !== image.id
            );


        /*
           Если удалили основное изображение,
           назначаем первым оставшееся изображение.
        */

        const portfolioId =
            $("#portfolioId")?.value.trim() ||
            "";


        if (
            portfolioId &&
            currentExistingPortfolioImages.length
        ) {

            const first =
                currentExistingPortfolioImages[0];


            const updateResult =
                await withSupabaseRetry(
                    () =>
                        frilanceSupabase
                            .from("portfolio")
                            .update({
                                image_url:
                                    first.image_url
                            })
                            .eq(
                                "id",
                                portfolioId
                            ),
                    "обновление основного изображения",
                    {
                        attempts: 4,
                        baseDelay: 800
                    }
                );


            if (updateResult.error) {
                console.warn(
                    "FRILANCE: не удалось обновить основное изображение:",
                    updateResult.error
                );
            }
        }


        if (
            portfolioId &&
            !currentExistingPortfolioImages.length
        ) {

            const updateResult =
                await withSupabaseRetry(
                    () =>
                        frilanceSupabase
                            .from("portfolio")
                            .update({
                                image_url: ""
                            })
                            .eq(
                                "id",
                                portfolioId
                            ),
                    "очистка основного изображения",
                    {
                        attempts: 4,
                        baseDelay: 800
                    }
                );


            if (updateResult.error) {
                console.warn(
                    "FRILANCE: не удалось очистить основное изображение:",
                    updateResult.error
                );
            }
        }


        if (wrapper) {
            wrapper.remove();
        }


        const count =
            $("#portfolioExistingCount");

        if (count) {
            count.textContent =
                String(
                    currentExistingPortfolioImages.length
                );
        }


        await loadPortfolio();


        showNotification(
            "Изображение удалено."
        );


    } catch (error) {

        console.error(
            "FRILANCE: ошибка удаления изображения:",
            error
        );


        showNotification(
            error?.message ||
            "Не удалось удалить изображение.",
            "error"
        );
    }
}


/* =========================================================
   СОХРАНЕНИЕ PORTFOLIO_IMAGES
========================================================= */

async function savePortfolioImageRecords(
    portfolioId,
    uploadedImages,
    description
) {

    if (
        !portfolioId ||
        !uploadedImages.length
    ) {
        return {
            saved: 0,
            failed: 0
        };
    }


    let saved = 0;
    let failed = 0;


    for (
        let index = 0;
        index < uploadedImages.length;
        index++
    ) {

        const uploaded =
            uploadedImages[index];


        const imageRecord = {

            portfolio_id:
                portfolioId,

            image_url:
                uploaded.publicUrl,

            storage_path:
                uploaded.storagePath,

            description:
                description || "",

            sort_order:
                index

        };


        try {

            const imageResult =
                await withSupabaseRetry(
                    () =>
                        frilanceSupabase
                            .from("portfolio_images")
                            .insert(
                                imageRecord
                            ),
                    "добавление portfolio_images",
                    {
                        attempts: 5,
                        baseDelay: 1000
                    }
                );


            if (imageResult.error) {
                throw imageResult.error;
            }


            saved++;


        } catch (error) {

            failed++;


            console.warn(
                "FRILANCE: не удалось сохранить portfolio_images:",
                error
            );

            /*
               Важно:
               файл уже находится в Storage.
               Не удаляем его автоматически при временной
               сетевой ошибке, чтобы не потерять загруженное
               изображение.
            */
        }
    }


    return {
        saved,
        failed
    };
}


/* =========================================================
   СОХРАНЕНИЕ ПОРТФОЛИО
========================================================= */

async function savePortfolio(event) {

    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }


    console.log(
        "FRILANCE: savePortfolio запущен пользователем."
    );


    const id =
        $("#portfolioId")?.value.trim() ||
        "";


    const title =
        $("#portfolioTitle")?.value.trim() ||
        "";


    const category =
        $("#portfolioCategory")?.value.trim() ||
        "";


    const price =
        $("#portfolioPrice")?.value.trim() ||
        "";


    const description =
        $("#portfolioDescription")?.value.trim() ||
        "";


    if (
        !title ||
        !category ||
        !price
    ) {

        showNotification(
            "Заполните название, категорию и цену.",
            "error"
        );

        return;
    }


    const selectedFiles =
        [...portfolioImages];


    const payload = {

        title,
        category,
        price,
        description

    };


    const saveButton =
        $("#savePortfolioButton");


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.dataset.originalText =
            saveButton.textContent;

        saveButton.textContent =
            "Сохранение...";
    }


    try {

        let uploadedImages = [];


        /*
           =================================================
           1. СНАЧАЛА ЗАГРУЖАЕМ ФАЙЛЫ В STORAGE
           =================================================
        */

        if (selectedFiles.length) {

            showNotification(
                `Загружаем ${selectedFiles.length} изображений...`
            );


            for (
                let i = 0;
                i < selectedFiles.length;
                i++
            ) {

                const file =
                    selectedFiles[i];


                console.log(
                    `FRILANCE: загрузка изображения ${i + 1}/${selectedFiles.length}:`,
                    file.name
                );


                try {

                    const uploaded =
                        await uploadPortfolioImage(
                            file
                        );


                    if (uploaded?.publicUrl) {

                        uploadedImages.push(
                            uploaded
                        );
                    }


                } catch (error) {

                    console.error(
                        `FRILANCE: не удалось загрузить ${file.name}:`,
                        error
                    );


                    showNotification(
                        `Не удалось загрузить «${file.name}».`,
                        "error"
                    );
                }
            }
        }


        /*
           =================================================
           2. ЕСЛИ ЕСТЬ НОВОЕ ИЗОБРАЖЕНИЕ —
              ДЕЛАЕМ ЕГО ОСНОВНЫМ
           =================================================
        */

        if (
            uploadedImages.length
        ) {

            payload.image_url =
                uploadedImages[0].publicUrl;
        }


        /*
           =================================================
           3. СОХРАНЯЕМ САМУ РАБОТУ
           =================================================
        */

        let portfolioId =
            id;


        if (id) {

            console.log(
                "FRILANCE: обновляем portfolio..."
            );


            const result =
                await withSupabaseRetry(
                    () =>
                        frilanceSupabase
                            .from("portfolio")
                            .update(payload)
                            .eq(
                                "id",
                                id
                            ),
                    "обновление portfolio",
                    {
                        attempts: 5,
                        baseDelay: 1000
                    }
                );


            if (result.error) {
                throw result.error;
            }


            portfolioId =
                id;

        } else {

            const maxSort =
                portfolio.reduce(
                    (
                        max,
                        item
                    ) =>
                        Math.max(
                            max,
                            Number(
                                item.sort_order
                            ) || 0
                        ),
                    0
                );


            payload.sort_order =
                maxSort + 1;


            if (
                !Object.prototype.hasOwnProperty.call(
                    payload,
                    "image_url"
                )
            ) {
                payload.image_url = "";
            }


            console.log(
                "FRILANCE: добавляем новую работу..."
            );


            const result =
                await withSupabaseRetry(
                    () =>
                        frilanceSupabase
                            .from("portfolio")
                            .insert(
                                payload
                            )
                            .select()
                            .single(),
                    "добавление portfolio",
                    {
                        attempts: 5,
                        baseDelay: 1000
                    }
                );


            if (result.error) {
                throw result.error;
            }


            portfolioId =
                result.data?.id ||
                "";
        }


        /*
           =================================================
           4. СОХРАНЯЕМ ДОПОЛНИТЕЛЬНЫЕ ИЗОБРАЖЕНИЯ
           =================================================

           Ошибка этой таблицы больше НЕ отменяет
           сохранение самой работы.
        */

        let imageSaveResult = {
            saved: 0,
            failed: 0
        };


        if (
            uploadedImages.length &&
            portfolioId
        ) {

            console.log(
                "FRILANCE: сохраняем изображения в portfolio_images..."
            );


            imageSaveResult =
                await savePortfolioImageRecords(
                    portfolioId,
                    uploadedImages,
                    description
                );


            console.log(
                "FRILANCE: portfolio_images результат:",
                imageSaveResult
            );
        }


        /*
           =================================================
           5. ОБНОВЛЯЕМ ПОРТФОЛИО
           =================================================
        */

        closePortfolioModal();


        await loadPortfolio();


        updateDashboard();


        /*
           =================================================
           6. УВЕДОМЛЕНИЕ
           =================================================
        */

        if (uploadedImages.length) {

            if (
                imageSaveResult.failed > 0
            ) {

                showNotification(
                    id
                        ? "Работа обновлена. Некоторые изображения сохранены в Storage, но пока не добавлены в галерею."
                        : "Работа добавлена. Некоторые изображения сохранены в Storage, но пока не добавлены в галерею."
                );

            } else {

                showNotification(
                    id
                        ? `Работа обновлена. Загружено изображений: ${uploadedImages.length}`
                        : `Работа добавлена. Загружено изображений: ${uploadedImages.length}`
                );
            }

        } else {

            showNotification(
                id
                    ? "Работа обновлена."
                    : "Работа добавлена."
            );
        }


    } catch (error) {

        console.error(
            "FRILANCE: ошибка сохранения портфолио:",
            error
        );


        showNotification(
            error?.message ||
            "Не удалось сохранить работу.",
            "error"
        );


    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                saveButton.dataset.originalText ||
                "Сохранить";
        }
    }
}


/* =========================================================
   УДАЛЕНИЕ ПОРТФОЛИО
========================================================= */

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

        /*
           Сначала получаем изображения.
           Даже если portfolio_images временно недоступна,
           удаление самой работы всё равно должно работать.
        */

        let images = [];

        try {

            images =
                await loadPortfolioImages(id);

        } catch (error) {

            console.warn(
                "FRILANCE: не удалось получить изображения перед удалением:",
                error
            );
        }


        /*
           Удаляем саму работу.
           portfolio_images удалятся благодаря ON DELETE CASCADE.
        */

        const result =
            await withSupabaseRetry(
                () =>
                    frilanceSupabase
                        .from("portfolio")
                        .delete()
                        .eq(
                            "id",
                            id
                        ),
                "удаление portfolio",
                {
                    attempts: 5,
                    baseDelay: 1000
                }
            );


        if (result.error) {
            throw result.error;
        }


        /*
           После удаления записи удаляем физические файлы
           из Storage.
        */

        if (images.length) {

            for (const image of images) {

                await removePortfolioStorageFile(
                    image.storage_path
                );
            }
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
            error?.message ||
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


    elements.forEach(
        element => {

            if (element) {

                element.textContent =
                    portfolio.length;
            }
        }
    );
}


/* =========================================================
   SERVICES
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

    const result =
        await withSupabaseRetry(
            () =>
                frilanceSupabase
                    .from("services")
                    .select("*")
                    .order(
                        "created_at",
                        {
                            ascending: true
                        }
                    )
                    .limit(1),
            "services"
        );


    if (result.error) {
        throw result.error;
    }


    services =
        result.data?.[0] ||
        null;


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
        .forEach(
            ([id, value]) => {

                const field =
                    $(`#${id}`);


                if (field) {

                    field.value =
                        value || "";
                }
            }
        );
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
                await withSupabaseRetry(
                    () =>
                        frilanceSupabase
                            .from("services")
                            .update(payload)
                            .eq(
                                "id",
                                services.id
                            ),
                    "обновление services"
                );

        } else {

            result =
                await withSupabaseRetry(
                    () =>
                        frilanceSupabase
                            .from("services")
                            .insert(payload),
                    "добавление services"
                );
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
            services
                ? "5"
                : "0";
    }
}


/* =========================================================
   TEXTS
========================================================= */

function initTexts() {

    const forms = [

        "#textsHeroForm",
        "#textsSectionsForm",
        "#textsAdditionalForm"

    ];


    forms.forEach(
        selector => {

            const form =
                $(selector);


            if (!form) {
                return;
            }


            form.addEventListener(
                "submit",
                saveTexts
            );
        }
    );
}


async function loadTexts() {

    const result =
        await withSupabaseRetry(
            () =>
                frilanceSupabase
                    .from("texts")
                    .select("*")
                    .order(
                        "created_at",
                        {
                            ascending: true
                        }
                    )
                    .limit(1),
            "texts"
        );


    if (result.error) {
        throw result.error;
    }


    texts =
        result.data?.[0] ||
        null;


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
        .forEach(
            ([id, value]) => {

                const field =
                    $(`#${id}`);


                if (field) {

                    field.value =
                        value || "";
                }
            }
        );
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
                await withSupabaseRetry(
                    () =>
                        frilanceSupabase
                            .from("texts")
                            .update(payload)
                            .eq(
                                "id",
                                texts.id
                            ),
                    "обновление texts"
                );

        } else {

            result =
                await withSupabaseRetry(
                    () =>
                        frilanceSupabase
                            .from("texts")
                            .insert(payload),
                    "добавление texts"
                );
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
   CONTACTS
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

    const result =
        await withSupabaseRetry(
            () =>
                frilanceSupabase
                    .from("contacts")
                    .select("*")
                    .order(
                        "created_at",
                        {
                            ascending: true
                        }
                    )
                    .limit(1),
            "contacts"
        );


    if (result.error) {
        throw result.error;
    }


    contacts =
        result.data?.[0] ||
        null;


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
                await withSupabaseRetry(
                    () =>
                        frilanceSupabase
                            .from("contacts")
                            .update(payload)
                            .eq(
                                "id",
                                contacts.id
                            ),
                    "обновление contacts"
                );

        } else {

            result =
                await withSupabaseRetry(
                    () =>
                        frilanceSupabase
                            .from("contacts")
                            .insert(payload),
                    "добавление contacts"
                );
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
   LEADS
========================================================= */

function initLeads() {

    const refreshButton =
        $("#refreshLeadsButton");


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                loadLeads(true);
            }
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


/* =========================================================
   REALTIME
========================================================= */

function initLeadsRealtime() {

    if (
        typeof frilanceSupabase === "undefined" ||
        !frilanceSupabase
    ) {

        startLeadsFallbackRefresh();

        return;
    }


    if (leadsRealtimeChannel) {
        return;
    }


    console.log(
        "FRILANCE: подключаем Realtime для заявок..."
    );


    try {

        leadsRealtimeChannel =
            frilanceSupabase
                .channel(
                    "frilance-leads-realtime"
                )
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "leads"
                    },
                    async payload => {

                        console.log(
                            "FRILANCE: Realtime изменение заявок:",
                            payload.eventType
                        );


                        await loadLeads(false);

                        updateDashboard();


                        if (
                            payload.eventType ===
                            "INSERT"
                        ) {

                            showNotification(
                                "Поступила новая заявка!"
                            );
                        }
                    }
                )
                .subscribe(
                    status => {

                        console.log(
                            "FRILANCE: статус Realtime заявок:",
                            status
                        );


                        if (
                            status ===
                            "SUBSCRIBED"
                        ) {

                            leadsRealtimeActive =
                                true;

                            stopLeadsFallbackRefresh();

                            console.log(
                                "FRILANCE: Realtime заявок подключён."
                            );

                            return;
                        }


                        if (
                            status ===
                            "CHANNEL_ERROR" ||
                            status ===
                            "TIMED_OUT" ||
                            status ===
                            "CLOSED"
                        ) {

                            leadsRealtimeActive =
                                false;

                            startLeadsFallbackRefresh();
                        }
                    }
                );

    } catch (error) {

        console.error(
            "FRILANCE: ошибка подключения Realtime:",
            error
        );


        leadsRealtimeActive =
            false;


        startLeadsFallbackRefresh();
    }
}


/* =========================================================
   FALLBACK LEADS
========================================================= */

function startLeadsFallbackRefresh() {

    if (leadsFallbackTimer) {
        return;
    }


    leadsFallbackTimer =
        setInterval(
            async () => {

                if (leadsRealtimeActive) {

                    stopLeadsFallbackRefresh();

                    return;
                }


                try {

                    await loadLeads(false);

                } catch (error) {

                    console.warn(
                        "FRILANCE: резервное обновление заявок не удалось:",
                        error
                    );
                }

            },
            10000
        );
}


function stopLeadsFallbackRefresh() {

    if (!leadsFallbackTimer) {
        return;
    }


    clearInterval(
        leadsFallbackTimer
    );


    leadsFallbackTimer =
        null;
}


/* =========================================================
   LOAD LEADS
========================================================= */

async function loadLeads(
    showMessage = false
) {

    if (leadsLoading) {

        return leads;
    }


    leadsLoading =
        true;


    const tbody =
        $("#leadsTableBody");


    if (
        tbody &&
        !leads.length
    ) {

        tbody.innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="leads-loading">

                        <span class="leads-loading-spinner"></span>

                        <span>
                            Загрузка заявок...
                        </span>

                    </div>

                </td>

            </tr>

        `;
    }


    try {

        const result =
            await withSupabaseRetry(
                () =>
                    frilanceSupabase
                        .from("leads")
                        .select("*")
                        .order(
                            "created_at",
                            {
                                ascending: false
                            }
                        ),
                "leads",
                {
                    attempts: 6,
                    baseDelay: 1000
                }
            );


        if (result.error) {
            throw result.error;
        }


        leads =
            Array.isArray(result.data)
                ? result.data
                : [];


        renderLeads();
        renderRecentLeads();
        updateLeadsCount();


        if (showMessage) {

            showNotification(
                `Заявки обновлены. Найдено: ${leads.length}`
            );
        }


        return leads;


    } catch (error) {

        console.error(
            "FRILANCE: ошибка загрузки заявок:",
            error
        );


        renderLeads();
        renderRecentLeads();
        updateLeadsCount();


        if (showMessage) {

            showNotification(
                "Не удалось обновить заявки.",
                "error"
            );
        }


        throw error;


    } finally {

        leadsLoading =
            false;
    }
}


/* =========================================================
   RENDER LEADS
========================================================= */

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
            .map(createLeadRow)
            .join("");


    $$(".lead-details-button", tbody)
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const lead =
                        leads.find(
                            item =>
                                item.id ===
                                button.dataset.id
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

                    deleteLead(
                        button.dataset.id
                    );
                }
            );
        });
}


function createLeadRow(lead) {

    return `

        <tr>

            <td>
                <div class="lead-name">
                    ${escapeHtml(
                        lead.name ||
                        "Без имени"
                    )}
                </div>
            </td>

            <td>
                <div class="lead-contact">
                    ${escapeHtml(
                        lead.contact ||
                        "—"
                    )}
                </div>
            </td>

            <td>
                <div class="lead-service">
                    ${escapeHtml(
                        lead.service ||
                        "—"
                    )}
                </div>
            </td>

            <td>
                <div class="lead-message">
                    ${escapeHtml(
                        lead.message ||
                        "—"
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


/* =========================================================
   RECENT LEADS
========================================================= */

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
                                    lead.name ||
                                    "Без имени"
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    lead.service ||
                                    "Запрос"
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


/* =========================================================
   LEADS COUNT
========================================================= */

function updateLeadsCount() {

    const count =
        leads.length;


    [
        $("#dashboardLeadsCount"),
        $("#leadsCount")
    ]
        .forEach(
            element => {

                if (element) {

                    element.textContent =
                        count;
                }
            }
        );
}


/* =========================================================
   LEAD MODAL
========================================================= */

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
            formatDateTime(
                lead.created_at
            ),

        leadDetailsMessage:
            lead.message ||
            "Сообщение отсутствует."

    };


    Object.entries(fields)
        .forEach(
            ([id, value]) => {

                const element =
                    $(`#${id}`);


                if (element) {

                    element.textContent =
                        value;
                }
            }
        );


    modal.classList.add("active");

    modal.style.display =
        "flex";
}


function closeLeadDetailsModal() {

    const modal =
        $("#leadDetailsModal");


    if (!modal) {
        return;
    }


    modal.classList.remove("active");

    modal.style.display =
        "none";
}


/* =========================================================
   DELETE LEAD
========================================================= */

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

        const result =
            await withSupabaseRetry(
                () =>
                    frilanceSupabase
                        .from("leads")
                        .delete()
                        .eq(
                            "id",
                            id
                        ),
                "удаление заявки"
            );


        if (result.error) {
            throw result.error;
        }


        await loadLeads(false);

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
   ESC
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {
            return;
        }


        closePortfolioModal();
        closeLeadDetailsModal();
    }
);


/* =========================================================
   PUBLIC API
========================================================= */

window.FRILANCE_ADMIN = {

    reload:
        loadAllData,

    reloadPortfolio:
        loadPortfolio,

    reloadLeads:
        loadLeads,

    showSection,

    getPortfolio:
        () => [...portfolio],

    getServices:
        () => services,

    getTexts:
        () => texts,

    getContacts:
        () => contacts,

    getLeads:
        () => [...leads]

};


/* =========================================================
   READY
========================================================= */

console.log(
    "FRILANCE ADMIN: admin.js загружен."
);