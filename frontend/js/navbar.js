// Dynamic Header & Footer updater (Vanilla JS)
import auth from "./auth.js";
import { escapeHtml } from "./api.js";

export function renderNav(activePage = "") {
  const header = document.querySelector(".site-header");
  const user = auth.getUser();

  if (header) {
    const firstName = user?.name ? user.name.split(" ")[0] : "";

    header.innerHTML = `
      <nav class="navbar container">
        <a class="brand" href="index.html">
          <span class="brand-mark">⌕</span>
          <span>Campus<span class="brand-accent">Find</span></span>
        </a>
        <div class="nav-links">
          <a href="index.html" class="${activePage === 'home' ? 'active' : ''}">Home</a>
          ${user ? `<a href="dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">Browse items</a>` : ''}
          ${user ? `<a href="my-posts.html" class="${activePage === 'my-posts' ? 'active' : ''}">My posts</a>` : ''}
          ${user?.role === "admin" ? `<a href="admin.html" class="${activePage === 'admin' ? 'active' : ''}">Admin</a>` : ''}
        </div>
        <div class="nav-actions">
          ${user ? `
            <span class="nav-user">Hi, ${escapeHtml(firstName)}</span>
            <button class="btn btn-outline btn-small" id="nav-logout-btn" type="button">Logout</button>
          ` : `
            <a class="nav-login ${activePage === 'login' ? 'active' : ''}" href="login.html">Log in</a>
            <a class="btn btn-primary btn-small" href="login.html#register">Join campus</a>
          `}
        </div>
      </nav>
    `;

    const logoutBtn = document.getElementById("nav-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => auth.logout());
    }
  }

  const footer = document.querySelector(".footer");
  if (footer) {
    footer.innerHTML = `
      <div class="container footer-inner">
        <a class="brand" href="index.html">
          <span class="brand-mark">⌕</span> Campus<span class="brand-accent">Find</span>
        </a>
        <span>Helping campus belongings find their way home.</span>
        <span>© ${new Date().getFullYear()} CampusFind</span>
      </div>
    `;
  }
}

export default renderNav;
