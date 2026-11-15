import api from "./api.js";
import auth from "./auth.js";
import renderNav from "./navbar.js";
import renderItemCard from "./item-card.js";

document.addEventListener("DOMContentLoaded", async () => {
  const user = auth.requireAuth("my-posts.html");
  if (!user) return;

  renderNav("my-posts");

  const noticeAlert = document.getElementById("notice-alert");
  const errorAlert = document.getElementById("error-alert");
  const itemsContainer = document.getElementById("items-container");

  const params = new URLSearchParams(window.location.search);
  const notice = params.get("notice");
  if (notice && noticeAlert) {
    noticeAlert.textContent = notice;
    noticeAlert.classList.remove("hidden");
    window.history.replaceState(null, "", window.location.pathname);
  }

  const loadPosts = async () => {
    if (itemsContainer) {
      itemsContainer.innerHTML = '<div class="page-loader">Loading your posts...</div>';
    }
    if (errorAlert) {
      errorAlert.classList.add("hidden");
      errorAlert.textContent = "";
    }

    try {
      const data = await api.get("/items", { limit: 50 });
      const currentUserId = user._id || user.id;

      const myItems = (data.items || []).filter(item => {
        const postedId = item.postedBy?._id || item.postedBy?.id || item.postedBy;
        return String(postedId) === String(currentUserId);
      });

      if (itemsContainer) {
        if (myItems.length > 0) {
          itemsContainer.innerHTML = `
            <div class="items-grid">
              ${myItems.map(item => `
                <div class="managed-card" data-card-id="${item._id}">
                  ${renderItemCard(item)}
                  <button class="delete-link delete-post-btn" data-id="${item._id}" type="button">Delete post</button>
                </div>
              `).join("")}
            </div>
          `;

          itemsContainer.querySelectorAll(".delete-post-btn").forEach(btn => {
            btn.addEventListener("click", () => handleDelete(btn.dataset.id));
          });
        } else {
          itemsContainer.innerHTML = `
            <div class="empty-state">
              <div class="empty-icon">＋</div>
              <h3>You haven't posted anything yet</h3>
              <p>Your lost and found posts will appear here.</p>
              <a class="btn btn-primary" href="create-item.html">Create your first post</a>
            </div>
          `;
        }
      }
    } catch (err) {
      if (errorAlert) {
        errorAlert.textContent = err.message || "Could not load your posts.";
        errorAlert.classList.remove("hidden");
      }
      if (itemsContainer) {
        itemsContainer.innerHTML = "";
      }
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await api.delete(`/items/${itemId}`);
      loadPosts();
    } catch (err) {
      if (errorAlert) {
        errorAlert.textContent = err.message || "Could not delete post.";
        errorAlert.classList.remove("hidden");
      }
    }
  };

  loadPosts();
});
