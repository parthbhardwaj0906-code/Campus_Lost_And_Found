import api from "./api.js";
import auth from "./auth.js";
import renderNav from "./navbar.js";
import renderItemCard from "./item-card.js";

document.addEventListener("DOMContentLoaded", async () => {
  const user = auth.requireAdmin();
  if (!user) return;

  renderNav("admin");

  const errorAlert = document.getElementById("error-alert");
  const itemsContainer = document.getElementById("items-container");

  const loadPosts = async () => {
    if (itemsContainer) {
      itemsContainer.innerHTML = '<div class="page-loader">Loading posts...</div>';
    }
    if (errorAlert) {
      errorAlert.classList.add("hidden");
      errorAlert.textContent = "";
    }

    try {
      const data = await api.get("/items", { limit: 50 });
      const items = data.items || [];

      if (itemsContainer) {
        if (items.length > 0) {
          itemsContainer.innerHTML = `
            <div class="items-grid">
              ${items.map(item => `
                <div class="managed-card" data-card-id="${item._id}">
                  ${renderItemCard(item)}
                  <button class="delete-link remove-post-btn" data-id="${item._id}" type="button">Remove post</button>
                </div>
              `).join("")}
            </div>
          `;

          itemsContainer.querySelectorAll(".remove-post-btn").forEach(btn => {
            btn.addEventListener("click", () => handleRemove(btn.dataset.id));
          });
        } else {
          itemsContainer.innerHTML = `
            <div class="empty-state">
              <h3>No posts to review</h3>
            </div>
          `;
        }
      }
    } catch (err) {
      if (errorAlert) {
        errorAlert.textContent = err.message || "Could not load items.";
        errorAlert.classList.remove("hidden");
      }
      if (itemsContainer) {
        itemsContainer.innerHTML = "";
      }
    }
  };

  const handleRemove = async (itemId) => {
    if (!window.confirm("Delete this item post?")) return;

    try {
      await api.delete(`/items/${itemId}`);
      loadPosts();
    } catch (err) {
      if (errorAlert) {
        errorAlert.textContent = err.message || "Could not delete item.";
        errorAlert.classList.remove("hidden");
      }
    }
  };

  loadPosts();
});
