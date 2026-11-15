import api from "./api.js";
import auth from "./auth.js";
import renderNav from "./navbar.js";

document.addEventListener("DOMContentLoaded", () => {
  renderNav("login");

  // If already logged in, redirect to dashboard
  if (auth.isLoggedIn()) {
    window.location.href = "dashboard.html";
    return;
  }

  // Check if register tab was requested via URL
  const hash = window.location.hash;
  const searchParams = new URLSearchParams(window.location.search);
  const modeRegisterRadio = document.getElementById("mode-register");
  if (modeRegisterRadio && (hash === "#register" || searchParams.get("tab") === "register")) {
    modeRegisterRadio.checked = true;
  }

  // Login form handler
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error-alert");
  const loginBtn = document.getElementById("login-submit-btn");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      loginError.classList.add("hidden");
      loginError.textContent = "";

      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;

      loginBtn.disabled = true;
      loginBtn.innerHTML = 'Verifying credentials... <span>→</span>';

      try {
        const data = await api.post("/auth/login", { email, password });
        auth.setAuth(data);

        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect") || "dashboard.html";
        window.location.href = redirect;
      } catch (err) {
        loginError.textContent = err.message || "Invalid credentials. Please verify your email and password.";
        loginError.classList.remove("hidden");
      } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Log in to Campus <span>→</span>';
      }
    });
  }

  // Register form handler
  const registerForm = document.getElementById("register-form");
  const registerError = document.getElementById("register-error-alert");
  const registerBtn = document.getElementById("register-submit-btn");

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      registerError.classList.add("hidden");
      registerError.textContent = "";

      const name = registerForm.name.value.trim();
      const email = registerForm.email.value.trim();
      const password = registerForm.password.value;

      registerBtn.disabled = true;
      registerBtn.innerHTML = 'Creating account... <span>→</span>';

      try {
        const data = await api.post("/auth/register", { name, email, password });
        auth.setAuth(data);
        window.location.href = "dashboard.html";
      } catch (err) {
        registerError.textContent = err.message || "Could not create account. Please check the information entered.";
        registerError.classList.remove("hidden");
      } finally {
        registerBtn.disabled = false;
        registerBtn.innerHTML = 'Create account <span>→</span>';
      }
    });
  }
});
