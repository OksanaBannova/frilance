"use strict";

/* =========================================================
   FRILANCE ADMIN — SUPABASE AUTH
========================================================= */

const SUPABASE_URL = "https://vmiehkctmtpmpmizhkzt.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_XeGc3k4Wl67a0MSXzSufYA_L0Zl-sRS";

const frilanceSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* =========================================================
   СОЗДАНИЕ ЭКРАНА ВХОДА
========================================================= */

function createLoginScreen() {

    if (document.getElementById("frilanceLoginScreen")) {
        return;
    }

    const loginScreen = document.createElement("div");

    loginScreen.id = "frilanceLoginScreen";

    loginScreen.innerHTML = `
        <div class="frilance-login-card">

            <div class="frilance-login-logo">
                <div class="frilance-login-logo-mark">OB</div>

                <div>
                    <div class="frilance-login-logo-title">
                        FRILANCE
                    </div>

                    <div class="frilance-login-logo-subtitle">
                        Панель управления
                    </div>
                </div>
            </div>

            <div class="frilance-login-header">
                <h1>Вход в админку</h1>
                <p>Введите данные администратора</p>
            </div>

            <form id="frilanceLoginForm">

                <div class="frilance-login-field">
                    <label for="frilanceLoginEmail">
                        Email
                    </label>

                    <input
                        type="email"
                        id="frilanceLoginEmail"
                        placeholder="Введите email"
                        autocomplete="email"
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
                        placeholder="Введите пароль"
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
                    id="frilanceLoginButton"
                >
                    Войти
                </button>

            </form>

        </div>
    `;

    document.body.prepend(loginScreen);

    document
        .getElementById("frilanceLoginForm")
        .addEventListener("submit", handleLogin);

    injectLoginStyles();
}


/* =========================================================
   СТИЛИ ЭКРАНА ВХОДА
========================================================= */

function injectLoginStyles() {

    if (document.getElementById("frilanceAuthStyles")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "frilanceAuthStyles";

    style.textContent = `

        #frilanceLoginScreen {
            position: fixed;
            inset: 0;
            z-index: 999999;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 20px;

            background:
                radial-gradient(
                    circle at top left,
                    rgba(98, 200, 255, .12),
                    transparent 35%
                ),
                radial-gradient(
                    circle at bottom right,
                    rgba(255, 79, 154, .12),
                    transparent 35%
                ),
                #08070d;

            color: #fff;
        }

        .frilance-login-card {
            width: 100%;
            max-width: 430px;

            padding: 34px;

            background: rgba(255,255,255,.055);

            border: 1px solid rgba(255,255,255,.1);

            border-radius: 24px;

            box-shadow:
                0 25px 80px rgba(0,0,0,.55);

            backdrop-filter: blur(20px);
        }

        .frilance-login-logo {
            display: flex;
            align-items: center;
            gap: 14px;

            margin-bottom: 38px;
        }

        .frilance-login-logo-mark {
            width: 48px;
            height: 48px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 14px;

            background:
                linear-gradient(
                    135deg,
                    #55c8ff,
                    #8d6cff,
                    #ff4f9a
                );

            color: #fff;

            font-size: 15px;
            font-weight: 800;

            box-shadow:
                0 10px 30px rgba(98,200,255,.2);
        }

        .frilance-login-logo-title {
            font-size: 18px;
            font-weight: 800;
            letter-spacing: .08em;
        }

        .frilance-login-logo-subtitle {
            margin-top: 3px;

            color: #858092;

            font-size: 12px;
        }

        .frilance-login-header {
            margin-bottom: 26px;
        }

        .frilance-login-header h1 {
            margin: 0 0 8px;

            font-size: 28px;
            line-height: 1.2;
        }

        .frilance-login-header p {
            margin: 0;

            color: #b8b4c5;

            font-size: 14px;
        }

        .frilance-login-field {
            margin-bottom: 18px;
        }

        .frilance-login-field label {
            display: block;

            margin-bottom: 8px;

            color: #b8b4c5;

            font-size: 13px;
            font-weight: 600;
        }

        .frilance-login-field input {
            width: 100%;
            box-sizing: border-box;

            padding: 14px 15px;

            border: 1px solid rgba(255,255,255,.1);

            border-radius: 12px;

            outline: none;

            background: rgba(255,255,255,.045);

            color: #fff;

            font: inherit;

            transition: .25s ease;
        }

        .frilance-login-field input::placeholder {
            color: #858092;
        }

        .frilance-login-field input:focus {
            border-color: #62c8ff;

            background: rgba(255,255,255,.065);

            box-shadow:
                0 0 0 3px rgba(98,200,255,.1);
        }

        .frilance-login-button {
            width: 100%;

            margin-top: 8px;

            padding: 14px 18px;

            border: 0;

            border-radius: 12px;

            background:
                linear-gradient(
                    135deg,
                    #55c8ff,
                    #8d6cff,
                    #ff4f9a
                );

            color: #fff;

            font: inherit;
            font-weight: 700;

            cursor: pointer;

            transition: .25s ease;
        }

        .frilance-login-button:hover {
            transform: translateY(-1px);

            box-shadow:
                0 12px 30px rgba(141,108,255,.25);
        }

        .frilance-login-button:disabled {
            opacity: .6;
            cursor: wait;
            transform: none;
        }

        .frilance-login-error {
            min-height: 20px;

            margin: 4px 0 8px;

            color: #ff6fae;

            font-size: 13px;
            line-height: 1.4;
        }

        @media (max-width: 500px) {

            .frilance-login-card {
                padding: 25px;
                border-radius: 20px;
            }

            .frilance-login-header h1 {
                font-size: 24px;
            }

        }

    `;

    document.head.appendChild(style);
}


/* =========================================================
   ВХОД
========================================================= */

async function handleLogin(event) {

    event.preventDefault();

    const email =
        document.getElementById("frilanceLoginEmail").value.trim();

    const password =
        document.getElementById("frilanceLoginPassword").value;

    const errorElement =
        document.getElementById("frilanceLoginError");

    const button =
        document.getElementById("frilanceLoginButton");

    errorElement.textContent = "";

    button.disabled = true;
    button.textContent = "Входим...";

    try {

        const { error } =
            await frilanceSupabase.auth.signInWithPassword({
                email,
                password
            });

        if (error) {
            throw error;
        }

        hideLoginScreen();

    } catch (error) {

        console.error("FRILANCE AUTH ERROR:", error);

        errorElement.textContent =
            "Неверный email или пароль.";

        button.disabled = false;
        button.textContent = "Войти";
    }
}


/* =========================================================
   СКРЫТЬ ЭКРАН ВХОДА
========================================================= */

function hideLoginScreen() {

    const loginScreen =
        document.getElementById("frilanceLoginScreen");

    if (!loginScreen) {
        return;
    }

    loginScreen.style.opacity = "0";

    loginScreen.style.pointerEvents = "none";

    setTimeout(() => {
        loginScreen.remove();
    }, 250);
}


/* =========================================================
   ПОКАЗАТЬ ЭКРАН ВХОДА
========================================================= */

function showLoginScreen() {

    createLoginScreen();

    const loginScreen =
        document.getElementById("frilanceLoginScreen");

    if (loginScreen) {
        loginScreen.style.opacity = "1";
        loginScreen.style.pointerEvents = "auto";
    }
}


/* =========================================================
   ПРОВЕРКА АВТОРИЗАЦИИ
========================================================= */

async function checkAdminAuth() {

    createLoginScreen();

    const {
        data,
        error
    } = await frilanceSupabase.auth.getSession();

    if (error) {

        console.error(
            "Ошибка проверки сессии:",
            error
        );

        showLoginScreen();

        return;
    }

    if (data.session) {
        hideLoginScreen();
    } else {
        showLoginScreen();
    }
}


/* =========================================================
   СЛЕДИМ ЗА СОСТОЯНИЕМ АВТОРИЗАЦИИ
========================================================= */

frilanceSupabase.auth.onAuthStateChange(
    (event, session) => {

        if (session) {
            hideLoginScreen();
        } else {
            showLoginScreen();
        }

    }
);


/* =========================================================
   ВЫХОД
   Можно вызвать из консоли:
   frilanceLogout()
========================================================= */

async function frilanceLogout() {

    await frilanceSupabase.auth.signOut();

    showLoginScreen();
}


/* =========================================================
   ЗАПУСК
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    checkAdminAuth();

});