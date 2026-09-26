"use strict";

/* =========================================================
   FRILANCE ADMIN — SUPABASE AUTH
========================================================= */

const SUPABASE_URL =
    "https://vmiehkctmtpmpmizhkzt.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_XeGc3k4Wl67a0MSXzSufYA_L0Zl-sRS";


/* =========================================================
   SUPABASE CLIENT
========================================================= */

if (!window.supabase) {

    console.error(
        "FRILANCE AUTH: библиотека Supabase не загружена."
    );

} else {

    try {

        window.frilanceSupabase =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY,
                {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: true
                    },
                    global: {
                        headers: {
                            "X-Client-Info": "frilance-admin"
                        }
                    }
                }
            );

        console.log(
            "FRILANCE AUTH: Supabase client создан."
        );

    } catch (error) {

        console.error(
            "FRILANCE AUTH: ошибка создания Supabase client:",
            error
        );

    }
}


/* =========================================================
   LOGIN OVERLAY
========================================================= */

function createLoginOverlay() {

    if (document.getElementById("frilanceLoginOverlay")) {
        return;
    }

    const overlay = document.createElement("div");

    overlay.id = "frilanceLoginOverlay";

    overlay.innerHTML = `
        <div class="frilance-login-box">

            <div class="frilance-login-logo">
                FRILANCE
            </div>

            <h2>Вход в админ-панель</h2>

            <p class="frilance-login-subtitle">
                Введите данные администратора
            </p>

            <form id="frilanceLoginForm">

                <div class="frilance-login-field">

                    <label for="frilanceLoginEmail">
                        Email
                    </label>

                    <input
                        type="email"
                        id="frilanceLoginEmail"
                        autocomplete="username"
                        required
                    >

                </div>

                <div class="frilance-login-field">

                    <label for="frilanceLoginPassword">
                        Пароль
                    </label>

                    <input
                        type="password"
                        id="frilanceLoginPassword"
                        autocomplete="current-password"
                        required
                    >

                </div>

                <div
                    id="frilanceLoginError"
                    class="frilance-login-error"
                ></div>

                <button
                    type="submit"
                    class="frilance-login-button"
                >
                    Войти
                </button>

            </form>

        </div>
    `;

    document.body.appendChild(overlay);

    return overlay;
}


/* =========================================================
   LOGIN STYLES
========================================================= */

function addLoginStyles() {

    if (document.getElementById("frilanceLoginStyles")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "frilanceLoginStyles";

    style.textContent = `

        #frilanceLoginOverlay {
            position: fixed;
            inset: 0;
            z-index: 99999;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 20px;

            background:
                radial-gradient(
                    circle at top,
                    rgba(124, 108, 255, 0.12),
                    transparent 45%
                ),
                rgba(10, 8, 20, 0.97);
        }

        .frilance-login-box {
            width: 100%;
            max-width: 420px;
            box-sizing: border-box;

            padding: 36px;

            border-radius: 20px;

            background: #171324;
            border: 1px solid rgba(255,255,255,0.08);

            box-shadow:
                0 30px 80px rgba(0,0,0,0.55);

            color: #ffffff;
        }

        .frilance-login-logo {
            margin-bottom: 20px;

            font-size: 14px;
            font-weight: 700;
            letter-spacing: 3px;

            color: #aeb8ff;
        }

        .frilance-login-box h2 {
            margin: 0 0 8px;

            font-size: 26px;
            line-height: 1.2;
        }

        .frilance-login-subtitle {
            margin: 0 0 28px;

            color: #9d98aa;
            font-size: 14px;
        }

        .frilance-login-field {
            margin-bottom: 18px;
        }

        .frilance-login-field label {
            display: block;

            margin-bottom: 7px;

            font-size: 13px;
            color: #aaa4b8;
        }

        .frilance-login-field input {
            display: block;

            width: 100%;
            box-sizing: border-box;

            padding: 13px 14px;

            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.1);

            background: #0f0d17;

            color: #ffffff;

            outline: none;

            transition:
                border-color 0.2s ease,
                box-shadow 0.2s ease;
        }

        .frilance-login-field input:focus {
            border-color: #8d7cff;

            box-shadow:
                0 0 0 3px rgba(141,124,255,0.12);
        }

        .frilance-login-button {
            width: 100%;

            margin-top: 8px;

            padding: 14px 18px;

            border: 0;
            border-radius: 10px;

            background: #7c6cff;

            color: #ffffff;

            font-weight: 700;

            cursor: pointer;

            transition:
                opacity 0.2s ease,
                transform 0.2s ease;
        }

        .frilance-login-button:hover {
            opacity: 0.92;
        }

        .frilance-login-button:active {
            transform: translateY(1px);
        }

        .frilance-login-button:disabled {
            opacity: 0.6;
            cursor: wait;
        }

        .frilance-login-error {
            min-height: 20px;

            margin-bottom: 8px;

            color: #ff7f96;

            font-size: 13px;
            line-height: 1.4;
        }

    `;

    document.head.appendChild(style);
}


/* =========================================================
   LOGIN
========================================================= */

async function handleLogin(event) {

    event.preventDefault();

    const emailInput =
        document.getElementById(
            "frilanceLoginEmail"
        );

    const passwordInput =
        document.getElementById(
            "frilanceLoginPassword"
        );

    const errorBox =
        document.getElementById(
            "frilanceLoginError"
        );

    const button =
        document.querySelector(
            ".frilance-login-button"
        );

    if (!emailInput || !passwordInput) {
        return;
    }

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    if (errorBox) {
        errorBox.textContent = "";
    }

    if (button) {
        button.disabled = true;
        button.textContent = "Вход...";
    }

    try {

        if (!window.frilanceSupabase) {
            throw new Error(
                "Supabase не инициализирован."
            );
        }

        const {
            data,
            error
        } =
            await window.frilanceSupabase.auth
                .signInWithPassword({
                    email,
                    password
                });

        if (error) {
            throw error;
        }

        if (!data || !data.session) {
            throw new Error(
                "Сессия не создана."
            );
        }

        console.log(
            "FRILANCE AUTH: вход выполнен."
        );

        const overlay =
            document.getElementById(
                "frilanceLoginOverlay"
            );

        if (overlay) {
            overlay.remove();
        }

    } catch (error) {

        console.error(
            "FRILANCE AUTH: ошибка входа:",
            error
        );

        if (errorBox) {
            errorBox.textContent =
                error?.message ||
                "Не удалось выполнить вход.";
        }

    } finally {

        if (button) {
            button.disabled = false;
            button.textContent = "Войти";
        }

    }
}


/* =========================================================
   CHECK SESSION
========================================================= */

async function checkSession() {

    try {

        if (!window.frilanceSupabase) {
            return false;
        }

        const {
            data,
            error
        } =
            await window.frilanceSupabase.auth
                .getSession();

        if (error) {
            throw error;
        }

        const session =
            data?.session || null;

        if (session) {

            console.log(
                "FRILANCE AUTH: активная сессия найдена."
            );

            return true;
        }

        console.log(
            "FRILANCE AUTH: активной сессии нет."
        );

        return false;

    } catch (error) {

        console.error(
            "FRILANCE AUTH: ошибка проверки сессии:",
            error
        );

        return false;
    }
}


/* =========================================================
   SHOW LOGIN
========================================================= */

function showLogin() {

    addLoginStyles();

    const overlay =
        createLoginOverlay();

    if (!overlay) {
        return;
    }

    const form =
        document.getElementById(
            "frilanceLoginForm"
        );

    if (form) {

        form.addEventListener(
            "submit",
            handleLogin
        );

    }
}


/* =========================================================
   LOGOUT
========================================================= */

window.frilanceLogout =
    async function () {

        try {

            if (!window.frilanceSupabase) {
                return;
            }

            const { error } =
                await window.frilanceSupabase.auth
                    .signOut();

            if (error) {
                throw error;
            }

            console.log(
                "FRILANCE AUTH: выход выполнен."
            );

            window.location.reload();

        } catch (error) {

            console.error(
                "FRILANCE AUTH: ошибка выхода:",
                error
            );

        }

    };


/* =========================================================
   AUTH STATE
========================================================= */

if (window.frilanceSupabase) {

    window.frilanceSupabase.auth.onAuthStateChange(
        (event, session) => {

            console.log(
                "FRILANCE AUTH:",
                event
            );

            if (session) {

                const overlay =
                    document.getElementById(
                        "frilanceLoginOverlay"
                    );

                if (overlay) {
                    overlay.remove();
                }

            }

        }
    );

}


/* =========================================================
   START AUTH
========================================================= */

(async function initAuth() {

    console.log(
        "FRILANCE AUTH: запуск..."
    );

    if (
        !window.frilanceSupabase ||
        !window.frilanceSupabase.auth
    ) {

        console.error(
            "FRILANCE AUTH: Supabase недоступен."
        );

        return;
    }

    const hasSession =
        await checkSession();

    if (!hasSession) {

        showLogin();

    } else {

        console.log(
            "FRILANCE AUTH: админка готова."
        );

    }

})();