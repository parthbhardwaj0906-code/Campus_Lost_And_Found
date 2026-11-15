import api from "./api.js";
import auth from "./auth.js";
import renderNav from "./navbar.js";
import renderItemCard from "./item-card.js";

document.addEventListener("DOMContentLoaded", () => {
  renderNav("home");

  const syncButtons = () => {
    const user = auth.getUser();
    const reportBtn = document.getElementById("hero-report-btn");
    if (reportBtn) {
      reportBtn.href = user ? "create-item.html?type=lost" : "login.html";
    }

    const ctaBtn = document.getElementById("cta-start-btn");
    if (ctaBtn) {
      ctaBtn.href = user ? "create-item.html" : "login.html";
    }
  };

  syncButtons();

  auth.verifyAuth().then(() => {
    renderNav("home");
    syncButtons();
  }).catch(() => {});

  const loadRecentItems = async () => {
    const recentContainer = document.getElementById("recent-items-container");
    if (!recentContainer) return;

    try {
      const data = await api.get("/items", { limit: 3 });
      const items = data.items || [];

      if (items.length > 0) {
        recentContainer.innerHTML = `
          <div class="items-grid">
            ${items.map(item => renderItemCard(item)).join("")}
          </div>
        `;
      } else {
        const user = auth.getUser();
        const postHref = user ? "create-item.html" : "login.html";
        recentContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">⌕</div>
            <h3>It's quiet around here</h3>
            <p>No items have been posted yet. Be the first to help your campus community.</p>
            <a class="btn btn-primary" href="${postHref}">Post an item</a>
          </div>
        `;
      }
    } catch {
      recentContainer.innerHTML = `
        <div class="empty-state">
          <p class="muted">Could not load recent items right now.</p>
        </div>
      `;
    }
  };

  loadRecentItems();
});
