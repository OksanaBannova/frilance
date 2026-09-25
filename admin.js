"use strict";

/* =========================================================
   FRILANCE ADMIN
   Supabase admin panel
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const ADMIN_CONFIG = {

    siteUrl: "https://oksanabannova.github.io/frilance/",

    email: "oksanchik2170@yandex.ru"

};


/* =========================================================
   STATE
========================================================= */

let portfolio = [];

let services = null;

let texts = null;

let contacts = null;

let leads = [];

let editingPortfolioId = null;

let selectedPortfolioImage = "";

let notificationTimer = null;


/* =========================================================
   DEFAULTS
========================================================= */

const DEFAULT_SERVICES = {

    neuro_price: "от 700 ₽",

    website_price: "от 15 000 ₽",

    marketplace_price: "от 1 500 ₽",

    start_price: "15 000 ₽",

    business_price: "25 000 ₽"

};


const DEFAULT_TEXTS = {

    hero_title:
        "Цифровая упаковка, которая помогает продавать",

    hero_subtitle:
        "Сайты, нейрофото и карточки товаров для мастеров, специалистов и малого бизнеса.",

    hero_primary_button:
        "Обсудить проект",

    hero_secondary_button:
        "Смотреть работы",

    services_title:
        "Услуги",

    portfolio_title:
        "Портфолио",

    process_title:
        "Как работаю",

    faq_title:
        "FAQ",

    final_title:
        "Готовы обсудить проект?",

    final_button:
        "Обсудить проект",

    about:
        "Создаю сайты, нейрофото и карточки товаров, которые помогают специалистам и небольшому бизнесу выглядеть профессионально в интернете."

};


const DEFAULT_CONTACTS = {

    email:
        ADMIN_CONFIG.email,

    site:
        ADMIN_CONFIG.siteUrl

};


/* =========================================================
   HELPERS
========================================================= */

function $(selector, root = document) {

    return root.querySelector(selector);

}


function $$(selector, root = document) {

    return Array.from(root.querySelectorAll(selector));

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


function setText(selector, value) {

    const element = $(selector);

    if (!element) return;

    element.textContent =
        value === null || value === undefined || value === ""
            ? "—"
            : String(value);

}


function formatDate(dateValue) {

    if (!dateValue) {

        return "—";

    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {

        return "—";

    }

    return date.toLocaleString("ru-RU", {

        day: "2-digit",

        month: "2-digit",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit"

    });

}


function formatDateShort(dateValue) {

    if (!dateValue) {

        return "—";

    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {

        return "—";

    }

    return date.toLocaleDateString("ru-RU", {

        day: "2-digit",

        month: "2-digit",

        year: "numeric"

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

    notification.className =
        `admin-notification ${type}`;

    notification.classList.add("show");

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(() => {

        notification.classList.remove("show");

    }, 3500);

}


function setButtonLoading(button, loading, loadingText = "Сохранение...") {

    if (!button) return;

    if (loading) {

        button.dataset.originalText = button.textContent;

        button.disabled = true;

        button.classList.add("is-loading");

        button.textContent = loadingText;

    } else {

        button.disabled = false;

        button.classList.remove("is-loading");

        button.textContent =
            button.dataset.originalText || "Сохранить";

    }

}


async function getCurrentSession() {

    if (
        !window.frilanceSupabase ||
        !frilanceSupabase.auth
    ) {

        return null;

    }

    const { data, error } =
        await frilanceSupabase.auth.getSession();

    if (error) {

        console.error("Auth error:", error);

        return null;

    }

    return data?.session || null;

}


async function requireSession() {

    const session = await getCurrentSession();

    if (!session) {

        showNotification(
            "Сессия администратора не найдена.",
            "error"
        );

        return false;

    }

    return true;

}


/* =========================================================
   INIT
========================================================= */
document.addEventListener("DOMContentLoaded", () => {

    initNavigation();

    initQuickActions();

    initPortfolio();

    initServices();

    initTexts();

    initContacts();

    initLeads();

    initGeneralButtons();

    showSection("dashboard");

    loadAllData();

    /*
       После авторизации заново загружаем данные.
       Это важно, потому что admin.js может
       запуститься раньше, чем Supabase установит сессию.
    */
    if (
        window.frilanceSupabase &&
        frilanceSupabase.auth
    ) {

        frilanceSupabase.auth.onAuthStateChange(
            (event, session) => {

                console.log(
                    "FRILANCE AUTH:",
                    event
                );

                if (
                    event === "SIGNED_IN" &&
                    session
                ) {

                    setTimeout(() => {

                        loadAllData();

                    }, 300);

                }

            }
        );

    }

});

/* =========================================================
   LOAD ALL DATA
========================================================= */

async function loadAllData() {

    try {

        await Promise.all([

            loadPortfolio(),

            loadServices(),

            loadTexts(),

            loadContacts(),

            loadLeads()

        ]);

        updateDashboard();

    } catch (error) {

        console.error(
            "Ошибка загрузки данных:",
            error
        );

        showNotification(
            "Не удалось загрузить данные.",
            "error"
        );

    }

}


/* =========================================================
   NAVIGATION
========================================================= */

function initNavigation() {

    const navItems = $$(".admin-nav-item");

    navItems.forEach(item => {

        item.addEventListener("click", event => {

            event.preventDefault();

            const section =
                item.dataset.section;

            if (!section) return;

            showSection(section);

        });

    });

}


function showSection(sectionName) {

    const sections =
        $$(".admin-section");

    sections.forEach(section => {

        section.classList.remove("active");

    });


    const target =
        $(`#section-${sectionName}`);

    if (target) {

        target.classList.add("active");

    }


    const navItems =
        $$(".admin-nav-item");

    navItems.forEach(item => {

        item.classList.toggle(

            "active",

            item.dataset.section === sectionName

        );

    });


    if (sectionName === "leads") {

        loadLeads();

    }

}


/* =========================================================
   QUICK ACTIONS
========================================================= */

function initQuickActions() {

    $$("[data-open-section]").forEach(button => {

        button.addEventListener("click", () => {

            const section =
                button.dataset.openSection;

            if (!section) return;

            showSection(section);

        });

    });

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


function updatePortfolioCount() {

    setText(
        "#dashboardPortfolioCount",
        portfolio.length
    );

}


function updateServicesCount() {

    const element =
        $("#dashboardServicesCount");

    if (!element) return;

    element.textContent = services ? "5" : "0";

}


function updateLeadsCount() {

    const count = leads.length;

    setText(
        "#dashboardLeadsCount",
        count
    );

    setText(
        "#leadsCount",
        count
    );

    setText(
        "#leadsTotal",
        count
    );

}


/* =========================================================
   PORTFOLIO
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

    const form =
        $("#portfolioForm");

    const imageInput =
        $("#portfolioImage");

    const uploadBox =
        $("#portfolioUploadBox");


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


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closePortfolioModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closePortfolioModal
        );

    }


    if (form) {

        form.addEventListener(
            "submit",
            savePortfolioItem
        );

    }


    if (imageInput) {

        imageInput.addEventListener(
            "change",
            handlePortfolioImage
        );

    }


    if (uploadBox) {

        uploadBox.addEventListener(
            "click",
            () => {

                if (imageInput) {

                    imageInput.click();

                }

            }
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

}


async function loadPortfolio() {

    const { data, error } =
        await frilanceSupabase

            .from("portfolio")

            .select("*")

            .order(
                "sort_order",
                { ascending: true }
            )

            .order(
                "created_at",
                { ascending: false }
            );


    if (error) {

        throw error;

    }


    portfolio = data || [];

    renderPortfolio();

    updatePortfolioCount();

}


function renderPortfolio() {

    const grid =
        $("#portfolioAdminGrid");

    const emptyState =
        $("#portfolioEmptyState");


    if (!grid) return;


    grid.innerHTML = "";


    if (!portfolio.length) {

        if (emptyState) {

            emptyState.style.display = "block";

        }

        return;

    }


    if (emptyState) {

        emptyState.style.display = "none";

    }


    portfolio.forEach(item => {

        const card =
            document.createElement("article");

        card.className =
            "portfolio-admin-card";


        const image =
            item.image_url

                ? `
                    <div class="portfolio-admin-image">
                        <img
                            src="${escapeHtml(item.image_url)}"
                            alt="${escapeHtml(item.title)}"
                        >
                    </div>
                `

                : `
                    <div class="portfolio-admin-image portfolio-admin-image-empty">
                        <span>Нет изображения</span>
                    </div>
                `;


        card.innerHTML = `

            ${image}

            <div class="portfolio-admin-content">

                <div class="portfolio-admin-category">
                    ${escapeHtml(item.category || "—")}
                </div>

                <h3>
                    ${escapeHtml(item.title || "Без названия")}
                </h3>

                <div class="portfolio-admin-price">
                    ${escapeHtml(item.price || "—")}
                </div>

                <p>
                    ${escapeHtml(item.description || "")}
                </p>

                <div class="portfolio-admin-actions">

                    <button
                        type="button"
                        class="admin-button secondary"
                        data-edit-portfolio="${escapeHtml(item.id)}"
                    >
                        Изменить
                    </button>

                    <button
                        type="button"
                        class="admin-button danger"
                        data-delete-portfolio="${escapeHtml(item.id)}"
                    >
                        Удалить
                    </button>

                </div>

            </div>
        `;


        grid.appendChild(card);

    });


    $$("[data-edit-portfolio]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openPortfolioModal(
                    button.dataset.editPortfolio
                );

            }
        );

    });


    $$("[data-delete-portfolio]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                deletePortfolioItem(
                    button.dataset.deletePortfolio
                );

            }
        );

    });

}


function openPortfolioModal(id = null) {

    const modal =
        $("#portfolioModal");

    const form =
        $("#portfolioForm");


    if (!modal || !form) return;


    editingPortfolioId = id;

    selectedPortfolioImage = "";


    form.reset();


    const idInput =
        $("#portfolioId");

    if (idInput) {

        idInput.value = id || "";

    }


    const title =
        $("#portfolioModalTitle");

    if (title) {

        title.textContent =
            id
                ? "Редактировать работу"
                : "Добавить работу";

    }


    const preview =
        $("#portfolioImagePreview");

    if (preview) {

        preview.innerHTML = "";

        preview.style.display = "none";

    }


    if (id) {

        const item =
            portfolio.find(
                portfolioItem =>
                    portfolioItem.id === id
            );


        if (item) {

            const titleInput =
                $("#portfolioTitle");

            const categoryInput =
                $("#portfolioCategory");

            const priceInput =
                $("#portfolioPrice");

            const descriptionInput =
                $("#portfolioDescription");


            if (titleInput) {

                titleInput.value =
                    item.title || "";

            }


            if (categoryInput) {

                categoryInput.value =
                    item.category || "";

            }


            if (priceInput) {

                priceInput.value =
                    item.price || "";

            }


            if (descriptionInput) {

                descriptionInput.value =
                    item.description || "";

            }


            selectedPortfolioImage =
                item.image_url || "";


            if (
                preview &&
                item.image_url
            ) {

                preview.innerHTML = `
                    <img
                        src="${escapeHtml(item.image_url)}"
                        alt=""
                    >
                `;

                preview.style.display = "block";

            }

        }

    }


    modal.classList.add("active");

    document.body.classList.add(
        "modal-open"
    );

}


function closePortfolioModal() {

    const modal =
        $("#portfolioModal");

    if (!modal) return;

    modal.classList.remove("active");

    document.body.classList.remove(
        "modal-open"
    );

    editingPortfolioId = null;

    selectedPortfolioImage = "";

}


function handlePortfolioImage(event) {

    const file =
        event.target.files?.[0];

    if (!file) return;


    if (!file.type.startsWith("image/")) {

        showNotification(
            "Выберите изображение.",
            "error"
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload = () => {

        selectedPortfolioImage =
            reader.result;


        const preview =
            $("#portfolioImagePreview");


        if (preview) {

            preview.innerHTML = `
                <img
                    src="${reader.result}"
                    alt="Предпросмотр"
                >
            `;

            preview.style.display =
                "block";

        }

    };


    reader.readAsDataURL(file);

}


async function savePortfolioItem(event) {

    event.preventDefault();


    if (!(await requireSession())) {

        return;

    }


    const form =
        event.currentTarget;


    const title =
        $("#portfolioTitle")?.value.trim() || "";


    const category =
        $("#portfolioCategory")?.value.trim() || "";


    const price =
        $("#portfolioPrice")?.value.trim() || "";


    const description =
        $("#portfolioDescription")?.value.trim() || "";


    const id =
        $("#portfolioId")?.value || "";


    if (!title) {

        showNotification(
            "Введите название работы.",
            "error"
        );

        return;

    }


    if (!category) {

        showNotification(
            "Введите категорию.",
            "error"
        );

        return;

    }


    if (!price) {

        showNotification(
            "Введите цену.",
            "error"
        );

        return;

    }


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    setButtonLoading(
        submitButton,
        true
    );


    try {

        const payload = {

            title,

            category,

            price,

            description,

            image_url:
                selectedPortfolioImage || "",

            updated_at:
                new Date().toISOString()

        };


        if (id) {

            const { error } =
                await frilanceSupabase

                    .from("portfolio")

                    .update(payload)

                    .eq("id", id);


            if (error) {

                throw error;

            }


            showNotification(
                "Работа обновлена."
            );

        } else {

            payload.sort_order =
                portfolio.length;


            const { error } =
                await frilanceSupabase

                    .from("portfolio")

                    .insert(payload);


            if (error) {

                throw error;

            }


            showNotification(
                "Работа добавлена."
            );

        }


        closePortfolioModal();

        await loadPortfolio();

        updateDashboard();


    } catch (error) {

        console.error(
            "Ошибка сохранения портфолио:",
            error
        );

        showNotification(
            error.message ||
            "Не удалось сохранить работу.",
            "error"
        );

    } finally {

        setButtonLoading(
            submitButton,
            false
        );

    }

}


async function deletePortfolioItem(id) {

    if (!(await requireSession())) {

        return;

    }


    const item =
        portfolio.find(
            portfolioItem =>
                portfolioItem.id === id
        );


    const title =
        item?.title || "эту работу";


    if (
        !confirm(
            `Удалить «${title}»?`
        )
    ) {

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


        showNotification(
            "Работа удалена."
        );


        await loadPortfolio();

        updateDashboard();


    } catch (error) {

        console.error(
            "Ошибка удаления:",
            error
        );

        showNotification(
            error.message ||
            "Не удалось удалить работу.",
            "error"
        );

    }

}


/* =========================================================
   SERVICES
========================================================= */

function initServices() {

    const form =
        $("#servicesForm");


    if (!form) return;


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

            .order(
                "created_at",
                { ascending: true }
            )

            .limit(1);


    if (error) {

        throw error;

    }


    services =
        data?.[0] || {
            ...DEFAULT_SERVICES
        };


    fillServicesForm();

    updateServicesCount();

}


function fillServicesForm() {

    if (!services) return;


    const fields = {

        "#serviceNeuroPrice":
            services.neuro_price,

        "#serviceWebsitePrice":
            services.website_price,

        "#serviceMarketplacePrice":
            services.marketplace_price,

        "#serviceStartPrice":
            services.start_price,

        "#serviceBusinessPrice":
            services.business_price

    };


    Object.entries(fields).forEach(
        ([selector, value]) => {

            const element =
                $(selector);

            if (element) {

                element.value =
                    value || "";

            }

        }
    );

}


async function saveServices(event) {

    event.preventDefault();


    if (!(await requireSession())) {

        return;

    }


    const form =
        event.currentTarget;


    const button =
        $("#saveServicesButton");


    const payload = {

        neuro_price:
            $("#serviceNeuroPrice")?.value.trim()
            || DEFAULT_SERVICES.neuro_price,

        website_price:
            $("#serviceWebsitePrice")?.value.trim()
            || DEFAULT_SERVICES.website_price,

        marketplace_price:
            $("#serviceMarketplacePrice")?.value.trim()
            || DEFAULT_SERVICES.marketplace_price,

        start_price:
            $("#serviceStartPrice")?.value.trim()
            || DEFAULT_SERVICES.start_price,

        business_price:
            $("#serviceBusinessPrice")?.value.trim()
            || DEFAULT_SERVICES.business_price,

        updated_at:
            new Date().toISOString()

    };


    setButtonLoading(
        button,
        true
    );


    try {

        if (services?.id) {

            const { data, error } =
                await frilanceSupabase

                    .from("services")

                    .update(payload)

                    .eq("id", services.id)

                    .select()

                    .single();


            if (error) {

                throw error;

            }


            services = data;


        } else {

            const { data, error } =
                await frilanceSupabase

                    .from("services")

                    .insert(payload)

                    .select()

                    .single();


            if (error) {

                throw error;

            }


            services = data;

        }


        fillServicesForm();

        showNotification(
            "Цены сохранены."
        );


    } catch (error) {

        console.error(
            "Ошибка сохранения услуг:",
            error
        );

        showNotification(
            error.message ||
            "Не удалось сохранить цены.",
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false
        );

    }

}


/* =========================================================
   TEXTS
========================================================= */

function initTexts() {

    $$("form[id^='texts']").forEach(form => {

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

            .order(
                "created_at",
                { ascending: true }
            )

            .limit(1);


    if (error) {

        throw error;

    }


    texts =
        data?.[0] || {
            ...DEFAULT_TEXTS
        };


    fillTextsForms();

}


function fillTextsForms() {

    if (!texts) return;


    const fields = {

        "#textHeroTitle":
            texts.hero_title,

        "#textHeroSubtitle":
            texts.hero_subtitle,

        "#textHeroPrimaryButton":
            texts.hero_primary_button,

        "#textHeroSecondaryButton":
            texts.hero_secondary_button,

        "#textServicesTitle":
            texts.services_title,

        "#textPortfolioTitle":
            texts.portfolio_title,

        "#textProcessTitle":
            texts.process_title,

        "#textFaqTitle":
            texts.faq_title,

        "#textFinalTitle":
            texts.final_title,

        "#textFinalButton":
            texts.final_button,

        "#textAbout":
            texts.about

    };


    Object.entries(fields).forEach(
        ([selector, value]) => {

            const element =
                $(selector);

            if (element) {

                element.value =
                    value || "";

            }

        }
    );

}


async function saveTexts(event) {

    event.preventDefault();


    if (!(await requireSession())) {

        return;

    }


    const form =
        event.currentTarget;


    const payload = {

        hero_title:
            $("#textHeroTitle")?.value.trim()
            || DEFAULT_TEXTS.hero_title,

        hero_subtitle:
            $("#textHeroSubtitle")?.value.trim()
            || DEFAULT_TEXTS.hero_subtitle,

        hero_primary_button:
            $("#textHeroPrimaryButton")?.value.trim()
            || DEFAULT_TEXTS.hero_primary_button,

        hero_secondary_button:
            $("#textHeroSecondaryButton")?.value.trim()
            || DEFAULT_TEXTS.hero_secondary_button,

        services_title:
            $("#textServicesTitle")?.value.trim()
            || DEFAULT_TEXTS.services_title,

        portfolio_title:
            $("#textPortfolioTitle")?.value.trim()
            || DEFAULT_TEXTS.portfolio_title,

        process_title:
            $("#textProcessTitle")?.value.trim()
            || DEFAULT_TEXTS.process_title,

        faq_title:
            $("#textFaqTitle")?.value.trim()
            || DEFAULT_TEXTS.faq_title,

        final_title:
            $("#textFinalTitle")?.value.trim()
            || DEFAULT_TEXTS.final_title,

        final_button:
            $("#textFinalButton")?.value.trim()
            || DEFAULT_TEXTS.final_button,

        about:
            $("#textAbout")?.value.trim()
            || DEFAULT_TEXTS.about,

        updated_at:
            new Date().toISOString()

    };


    const button =
        form.querySelector(
            'button[type="submit"]'
        );


    setButtonLoading(
        button,
        true
    );


    try {

        if (texts?.id) {

            const { data, error } =
                await frilanceSupabase

                    .from("texts")

                    .update(payload)

                    .eq("id", texts.id)

                    .select()

                    .single();


            if (error) {

                throw error;

            }


            texts = data;


        } else {

            const { data, error } =
                await frilanceSupabase

                    .from("texts")

                    .insert(payload)

                    .select()

                    .single();


            if (error) {

                throw error;

            }


            texts = data;

        }


        fillTextsForms();

        showNotification(
            "Тексты сохранены."
        );


    } catch (error) {

        console.error(
            "Ошибка сохранения текстов:",
            error
        );

        showNotification(
            error.message ||
            "Не удалось сохранить тексты.",
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false
        );

    }

}


/* =========================================================
   CONTACTS
========================================================= */

function initContacts() {

    const form =
        $("#contactsForm");


    if (!form) return;


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

            .order(
                "created_at",
                { ascending: true }
            )

            .limit(1);


    if (error) {

        throw error;

    }


    contacts =
        data?.[0] || {
            ...DEFAULT_CONTACTS
        };


    fillContactsForm();

}


function fillContactsForm() {

    if (!contacts) return;


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


    if (!(await requireSession())) {

        return;

    }


    const form =
        event.currentTarget;


    const payload = {

        email:
            $("#contactEmail")?.value.trim()
            || DEFAULT_CONTACTS.email,

        site:
            $("#contactSite")?.value.trim()
            || DEFAULT_CONTACTS.site,

        updated_at:
            new Date().toISOString()

    };


    const button =
        form.querySelector(
            'button[type="submit"]'
        );


    setButtonLoading(
        button,
        true
    );


    try {

        if (contacts?.id) {

            const { data, error } =
                await frilanceSupabase

                    .from("contacts")

                    .update(payload)

                    .eq("id", contacts.id)

                    .select()

                    .single();


            if (error) {

                throw error;

            }


            contacts = data;


        } else {

            const { data, error } =
                await frilanceSupabase

                    .from("contacts")

                    .insert(payload)

                    .select()

                    .single();


            if (error) {

                throw error;

            }


            contacts = data;

        }


        fillContactsForm();

        showNotification(
            "Контакты сохранены."
        );


    } catch (error) {

        console.error(
            "Ошибка сохранения контактов:",
            error
        );

        showNotification(
            error.message ||
            "Не удалось сохранить контакты.",
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false
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
            async () => {

                await loadLeads(true);

            }
        );

    }


    const closeButton =
        $("#closeLeadDetailsModal");


    const closeDetailsButton =
        $("#closeLeadDetailsButton");


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeLeadDetails
        );

    }


    if (closeDetailsButton) {

        closeDetailsButton.addEventListener(
            "click",
            closeLeadDetails
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

                    closeLeadDetails();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeLeadDetails();

            }

        }
    );

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

        const session =
            await getCurrentSession();


        if (!session) {

            console.warn(
                "Нет активной сессии администратора."
            );

            leads = [];

            renderLeads();

            updateLeadsCount();

            renderRecentLeads();

            return;

        }


        const { data, error } =
            await frilanceSupabase

                .from("leads")

                .select("*")

                .order(
                    "created_at",
                    { ascending: false }
                );


        if (error) {

            throw error;

        }


        leads = data || [];


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

                        <div class="empty-state">

                            <h3>
                                Не удалось загрузить заявки
                            </h3>

                            <p>
                                ${escapeHtml(
                                    error.message ||
                                    "Проверьте соединение с Supabase."
                                )}
                            </p>

                        </div>

                    </td>

                </tr>

            `;

        }


        updateLeadsCount();

    }

}


function renderLeads() {

    const tbody =
        $("#leadsTableBody");


    if (!tbody) return;


    tbody.innerHTML = "";


    updateLeadsCount();


    if (!leads.length) {

        tbody.innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="empty-state">

                        <h3>
                            Заявок пока нет
                        </h3>

                        <p>
                            Новые заявки с сайта появятся здесь.
                        </p>

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    leads.forEach(lead => {

        const tr =
            document.createElement("tr");


        const name =
            lead.name || "Без имени";


        const contact =
            lead.contact || "—";


        const service =
            lead.service || "—";


        const message =
            lead.message || "—";


        const shortMessage =
            message.length > 90
                ? `${message.substring(0, 90)}…`
                : message;


        tr.innerHTML = `

            <td>

                <div class="lead-name">

                    ${escapeHtml(name)}

                </div>

            </td>


            <td>

                <a
                    class="lead-contact-link"
                    href="${escapeHtml(
                        getContactHref(contact)
                    )}"
                    ${getContactHref(contact) !== "#"
                        ? 'target="_blank" rel="noopener noreferrer"'
                        : ""
                    }
                >

                    ${escapeHtml(contact)}

                </a>

            </td>


            <td>

                <span class="lead-service-badge">

                    ${escapeHtml(service)}

                </span>

            </td>


            <td>

                <div
                    class="lead-message-preview"
                    title="${escapeHtml(message)}"
                >

                    ${escapeHtml(shortMessage)}

                </div>

            </td>


            <td>

                <div class="lead-date">

                    ${formatDate(lead.created_at)}

                </div>

            </td>


            <td>

                <button
                    type="button"
                    class="lead-view-button"
                    data-lead-id="${escapeHtml(lead.id)}"
                >

                    Подробнее

                </button>

            </td>

        `;


        tbody.appendChild(tr);

    });


    $$("[data-lead-id]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openLeadDetails(
                    button.dataset.leadId
                );

            }
        );

    });

}


function getContactHref(contact) {

    if (!contact) {

        return "#";

    }


    const value =
        String(contact).trim();


    if (
        value.includes("@") &&
        !value.startsWith("http")
    ) {

        return `mailto:${value}`;

    }


    if (
        /^https?:\/\//i.test(value)
    ) {

        return value;

    }


    const phone =
        value.replace(
            /[^\d+]/g,
            ""
        );


    if (
        phone.length >= 10
    ) {

        return `tel:${phone}`;

    }


    return "#";

}


function openLeadDetails(id) {

    const lead =
        leads.find(
            item => item.id === id
        );


    if (!lead) return;


    setText(
        "#leadDetailsTitle",
        lead.name || "Заявка"
    );


    setText(
        "#leadDetailsName",
        lead.name || "—"
    );


    setText(
        "#leadDetailsContact",
        lead.contact || "—"
    );


    setText(
        "#leadDetailsService",
        lead.service || "—"
    );


    setText(
        "#leadDetailsDate",
        formatDate(lead.created_at)
    );


    setText(
        "#leadDetailsMessage",
        lead.message || "—"
    );


    const modal =
        $("#leadDetailsModal");


    if (!modal) return;


    modal.classList.add("active");

    document.body.classList.add(
        "modal-open"
    );

}


function closeLeadDetails() {

    const modal =
        $("#leadDetailsModal");


    if (!modal) return;


    modal.classList.remove("active");

    document.body.classList.remove(
        "modal-open"
    );

}


function renderRecentLeads() {

    const container =
        $("#recentLeads");


    if (!container) return;


    container.innerHTML = "";


    const recent =
        leads.slice(0, 5);


    if (!recent.length) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Пока нет заявок
                </h3>

                <p>
                    Новые обращения появятся здесь.
                </p>

            </div>

        `;

        return;

    }


    recent.forEach(lead => {

        const item =
            document.createElement("div");


        item.className =
            "recent-lead-item";


        item.innerHTML = `

            <div class="recent-lead-main">

                <div class="recent-lead-name">

                    ${escapeHtml(
                        lead.name || "Без имени"
                    )}

                </div>

                <div class="recent-lead-contact">

                    ${escapeHtml(
                        lead.contact || "—"
                    )}

                </div>

            </div>


            <div class="recent-lead-meta">

                <span>

                    ${escapeHtml(
                        lead.service || "—"
                    )}

                </span>

                <time>

                    ${formatDateShort(
                        lead.created_at
                    )}

                </time>

            </div>

        `;


        item.addEventListener(
            "click",
            () => {

                showSection("leads");

                setTimeout(() => {

                    openLeadDetails(lead.id);

                }, 50);

            }
        );


        container.appendChild(item);

    });

}


/* =========================================================
   GENERAL BUTTONS
========================================================= */

function initGeneralButtons() {

    const siteButtons =
        $$("[data-site-link]");


    siteButtons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                if (
                    button.tagName.toLowerCase()
                    === "a"
                ) {

                    return;

                }

                event.preventDefault();

                window.open(
                    ADMIN_CONFIG.siteUrl,
                    "_blank"
                );

            }
        );

    });


    const logoutButtons =
        $$("[data-logout]");


    logoutButtons.forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                if (
                    typeof window.frilanceLogout
                    === "function"
                ) {

                    await window.frilanceLogout();

                }

            }
        );

    });

}


/* =========================================================
   DEBUG / PUBLIC API
========================================================= */

window.FRILANCE_ADMIN = {

    reload:
        loadAllData,

    showSection:
        showSection,

    portfolio:
        () => portfolio,

    services:
        () => services,

    texts:
        () => texts,

    contacts:
        () => contacts,

    leads:
        () => leads,

    reloadLeads:
        loadLeads

};