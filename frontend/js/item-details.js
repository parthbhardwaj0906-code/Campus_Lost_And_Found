import api, { getImageUrl, escapeHtml } from "./api.js";
import auth from "./auth.js";
import renderNav from "./navbar.js";

document.addEventListener("DOMContentLoaded", async () => {
  renderNav("dashboard");
  await auth.verifyAuth();
  renderNav("dashboard");

  const user = auth.getUser();
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const mainContainer = document.querySelector(".detail-main");
  const sidebarContainer = document.querySelector(".detail-sidebar");

  if (!id) {
    if (mainContainer) {
      mainContainer.innerHTML = `
        <a class="back-link" href="dashboard.html">← Back to community board</a>
        <div class="alert alert-error">Item ID not specified.</div>
      `;
    }
    return;
  }

  const loadItem = async () => {
    try {
      const data = await api.get(`/items/${id}`);
      const item = data.item;

      if (!item) {
        if (mainContainer) {
          mainContainer.innerHTML = `
            <a class="back-link" href="dashboard.html">← Back to community board</a>
            <div class="alert alert-error">Item not found.</div>
          `;
        }
        return;
      }

      const postedById = item.postedBy?._id || item.postedBy?.id || item.postedBy;
      const currentUserId = user?._id || user?.id;
      const isOwner = Boolean(user && postedById && String(postedById) === String(currentUserId));
      const isAdmin = user?.role === "admin";
      const canManage = isOwner || isAdmin;

      const isLost = item.itemType === "lost";
      const pillClass = isLost ? "pill-lost" : "pill-found";
      const pillText = `${item.itemType} item`;
      const dateFormatted = item.date ? new Date(item.date).toLocaleDateString() : "";
      const imageUrl = item.imageUrl ? getImageUrl(item.imageUrl) : "";

      const visualHtml = imageUrl
        ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.title || '')}" />`
        : `<div class="item-placeholder large"><span>${isLost ? "⌕" : "✓"}</span><small>No image provided</small></div>`;

      if (mainContainer) {
        mainContainer.innerHTML = `
          <a class="back-link" href="dashboard.html">← Back to community board</a>
          <div class="detail-image">${visualHtml}</div>
          <div class="detail-content">
            <div class="detail-pills">
              <span class="pill ${pillClass}">${pillText}</span>
              <span class="pill pill-neutral">${escapeHtml(item.status || "open")}</span>
            </div>
            <span class="eyebrow">${escapeHtml(item.category || "General")}</span>
            <h1>${escapeHtml(item.title || "")}</h1>
            <p class="detail-description">${escapeHtml(item.description || "")}</p>
            <div class="detail-info">
              <div>
                <small>LAST SEEN / FOUND AT</small>
                <strong>⌖ ${escapeHtml(item.location || "")}</strong>
              </div>
              <div>
                <small>DATE</small>
                <strong>${escapeHtml(dateFormatted)}</strong>
              </div>
              <div>
                <small>POSTED BY</small>
                <strong>${escapeHtml(item.postedBy?.name || "Campus member")}</strong>
              </div>
            </div>
          </div>
        `;
      }

      // Sidebar logic
      let claims = [];
      if (canManage && item.itemType === "found") {
        try {
          const claimsRes = await api.get(`/claims/item/${id}`);
          claims = claimsRes.claims || [];
        } catch {
          claims = [];
        }
      }

      let sidebarHtml = `
        <div class="alert alert-error hidden" id="sidebar-error"></div>
        <div class="alert alert-success hidden" id="sidebar-success"></div>
      `;

      if (item.itemType === "found" && item.status === "open" && user && !canManage) {
        sidebarHtml += `
          <form class="form-card side-card" id="claim-form">
            <span class="eyebrow">THINK IT'S YOURS?</span>
            <h2>Make a claim</h2>
            <p class="muted small">Share details that help verify you are the rightful owner.</p>
            <label>
              Your message
              <textarea rows="5" id="claim-message" placeholder="Describe unique identifying marks or details..." required></textarea>
            </label>
            <button class="btn btn-primary btn-full" id="claim-submit-btn" type="submit">Submit claim</button>
          </form>
        `;
      } else if (!user && item.itemType === "found") {
        const returnUrl = `item-details.html?id=${encodeURIComponent(id)}`;
        sidebarHtml += `
          <div class="form-card side-card">
            <h2>Is this yours?</h2>
            <p class="muted">Log in to submit a verified claim request.</p>
            <a class="btn btn-primary btn-full" href="login.html?redirect=${encodeURIComponent(returnUrl)}">Log in to claim</a>
          </div>
        `;
      } else if (item.itemType === "lost") {
        sidebarHtml += `
          <div class="form-card side-card">
            <h2>Have you seen this?</h2>
            <p class="muted">If you found this item, post a found-item report so the owner can connect with you.</p>
            <a class="btn btn-primary btn-full" href="create-item.html?type=found">Report a found item</a>
          </div>
        `;
      }

      if (canManage && item.itemType === "found") {
        sidebarHtml += `
          <div class="form-card side-card">
            <h2>Claim requests</h2>
            <div id="claims-list">
              ${claims.length > 0 ? claims.map(c => `
                <div class="claim-card" data-claim-id="${escapeHtml(c._id)}">
                  <strong>${escapeHtml(c.claimedBy?.name || "Campus member")}</strong>
                  <p>${escapeHtml(c.message || "")}</p>
                  <span class="pill pill-neutral">${escapeHtml(c.status || "pending")}</span>
                  ${c.status === "pending" ? `
                    <div class="claim-actions">
                      <button class="btn btn-primary btn-small approve-claim-btn" data-id="${c._id}">Approve</button>
                      <button class="btn btn-outline btn-small reject-claim-btn" data-id="${c._id}">Reject</button>
                    </div>
                  ` : ''}
                </div>
              `).join("") : '<p class="muted small">No claims submitted yet.</p>'}
            </div>
          </div>
        `;
      }

      sidebarHtml += `
        <div class="safety-note">
          <strong>↗ Meet safely</strong>
          <p>Arrange handover in a public campus location (security office or library front desk). Verify ownership before handover.</p>
        </div>
      `;

      if (sidebarContainer) {
        sidebarContainer.innerHTML = sidebarHtml;

        const claimForm = document.getElementById("claim-form");
        const sidebarError = document.getElementById("sidebar-error");
        const sidebarSuccess = document.getElementById("sidebar-success");

        if (claimForm) {
          claimForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            sidebarError?.classList.add("hidden");
            sidebarSuccess?.classList.add("hidden");

            const msgInput = document.getElementById("claim-message");
            const btn = document.getElementById("claim-submit-btn");
            if (btn) btn.disabled = true;

            try {
              await api.post("/claims", { itemId: id, message: msgInput.value.trim() });
              if (sidebarSuccess) {
                sidebarSuccess.textContent = "Your claim request has been submitted.";
                sidebarSuccess.classList.remove("hidden");
              }
              msgInput.value = "";
            } catch (err) {
              if (sidebarError) {
                sidebarError.textContent = err.message || "Could not submit claim.";
                sidebarError.classList.remove("hidden");
              }
            } finally {
              if (btn) btn.disabled = false;
            }
          });
        }

        sidebarContainer.querySelectorAll(".approve-claim-btn").forEach(btn => {
          btn.addEventListener("click", () => handleClaimStatus(btn.dataset.id, "approved"));
        });
        sidebarContainer.querySelectorAll(".reject-claim-btn").forEach(btn => {
          btn.addEventListener("click", () => handleClaimStatus(btn.dataset.id, "rejected"));
        });
      }

    } catch (err) {
      if (mainContainer) {
        mainContainer.innerHTML = `
          <a class="back-link" href="dashboard.html">← Back to community board</a>
          <div class="alert alert-error">${err.message || "Could not load item details."}</div>
        `;
      }
    }
  };

  const handleClaimStatus = async (claimId, status) => {
    try {
      await api.patch(`/claims/${claimId}`, { status });
      await loadItem();
    } catch (err) {
      alert(err.message || "Could not update claim status.");
    }
  };

  loadItem();
});
