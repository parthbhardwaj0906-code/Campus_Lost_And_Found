import api, { getImageUrl, escapeHtml } from "./api.js";
import auth from "./auth.js";
import renderNav from "./navbar.js";

document.addEventListener("DOMContentLoaded", () => {
  renderNav("dashboard");
  auth.verifyAuth().then(() => {
    renderNav("dashboard");
    loadItem();
  }).catch(() => {});

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

      const user = auth.getUser();
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

      const placeholderHtml = `<div class="item-placeholder large"><span>${isLost ? "⌕" : "✓"}</span><small>No image provided</small></div>`;
      const visualHtml = imageUrl
        ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.title || '')}" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />${placeholderHtml.replace('class="item-placeholder large"', 'class="item-placeholder large" style="display:none"')}`
        : placeholderHtml;

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

      // Sidebar logic: Fetch claims for this item
      let claims = [];
      let ownerContact = null;
      if (user) {
        try {
          const claimsRes = await api.get(`/claims/item/${id}`);
          claims = claimsRes.claims || [];
          ownerContact = claimsRes.ownerContact || null;
        } catch {
          claims = [];
        }
      }

      let sidebarHtml = `
        <div class="alert alert-error hidden" id="sidebar-error"></div>
        <div class="alert alert-success hidden" id="sidebar-success"></div>
      `;

      const returnUrl = `item-details.html?id=${encodeURIComponent(id)}`;

      if (canManage) {
        // OWNER / ADMIN VIEW: See responses and manage them
        const heading = isLost ? "Found item reports" : "Claim requests";
        const subtitle = isLost
          ? "Responses from people who found or saw your missing item."
          : "Claims submitted by campus members for this found item.";

        const approvedClaim = claims.find(c => c.status === "approved");

        if (approvedClaim) {
          const finderEmail = approvedClaim.claimedBy?.email;
          const finderName = approvedClaim.claimedBy?.name || "Campus member";
          sidebarHtml += `
            <div class="form-card side-card">
              <div class="exchange-card">
                <h3>✓ Report approved!</h3>
                <p>You connected with <strong>${escapeHtml(finderName)}</strong>. You can contact them to coordinate handover:</p>
                ${finderEmail ? `
                  <a class="exchange-email" href="mailto:${escapeHtml(finderEmail)}">
                    ✉ ${escapeHtml(finderEmail)}
                  </a>
                ` : ''}
              </div>

              <div class="resolve-prompt">
                <h4>Item resolved!</h4>
                <p>Now that your missing item has been located and confirmed, would you like to delete this missing item request from the campus board?</p>
                <div class="resolve-actions">
                  <button class="btn btn-danger btn-small" id="delete-resolved-btn" type="button">Delete missing item request</button>
                </div>
              </div>
            </div>
          `;
        }

        sidebarHtml += `
          <div class="form-card side-card">
            <h2>${heading}</h2>
            <p class="muted small">${subtitle}</p>
            <div id="claims-list">
              ${claims.length > 0 ? claims.map(c => `
                <div class="claim-card" data-claim-id="${escapeHtml(c._id)}">
                  <strong>${escapeHtml(c.claimedBy?.name || "Campus member")}</strong>
                  ${c.status === "approved" && c.claimedBy?.email ? `
                    <div style="margin: 6px 0;">
                      <a class="exchange-email" href="mailto:${escapeHtml(c.claimedBy.email)}">✉ ${escapeHtml(c.claimedBy.email)}</a>
                    </div>
                  ` : ''}
                  <p>${escapeHtml(c.message || "")}</p>
                  <span class="pill pill-neutral">${escapeHtml(c.status || "pending")}</span>
                  ${c.status === "pending" ? `
                    <div class="claim-actions">
                      <button class="btn btn-primary btn-small approve-claim-btn" data-id="${c._id}">Approve report</button>
                      <button class="btn btn-outline btn-small reject-claim-btn" data-id="${c._id}">Reject</button>
                    </div>
                  ` : ''}
                </div>
              `).join("") : `<p class="muted small">${isLost ? "No one has reported finding this item yet." : "No claims submitted yet."}</p>`}
            </div>
          </div>
        `;
      } else if (!user) {
        // NOT LOGGED IN VIEW
        if (isLost) {
          sidebarHtml += `
            <div class="form-card side-card">
              <span class="eyebrow">HAVE YOU SEEN THIS?</span>
              <h2>Found this item?</h2>
              <p class="muted">Log in to report that you've found this item so the owner can connect with you.</p>
              <a class="btn btn-primary btn-full" href="login.html?redirect=${encodeURIComponent(returnUrl)}">Log in to report</a>
            </div>
          `;
        } else {
          sidebarHtml += `
            <div class="form-card side-card">
              <span class="eyebrow">THINK IT'S YOURS?</span>
              <h2>Is this yours?</h2>
              <p class="muted">Log in to submit a claim request to the finder.</p>
              <a class="btn btn-primary btn-full" href="login.html?redirect=${encodeURIComponent(returnUrl)}">Log in to claim</a>
            </div>
          `;
        }
      } else {
        // LOGGED IN VISITOR (Not owner)
        const myClaim = claims.find(c => {
          const cid = c.claimedBy?._id || c.claimedBy?.id || c.claimedBy;
          return String(cid) === String(currentUserId);
        });

        if (myClaim) {
          // Already submitted
          if (myClaim.status === "approved") {
            const ownerEmail = ownerContact?.email || item.postedBy?.email;
            const ownerName = ownerContact?.name || item.postedBy?.name || "The owner";
            sidebarHtml += `
              <div class="form-card side-card">
                <div class="exchange-card">
                  <h3>✓ Report approved by owner!</h3>
                  <p><strong>${escapeHtml(ownerName)}</strong> approved your report. You can now coordinate handover directly via email:</p>
                  ${ownerEmail ? `
                    <a class="exchange-email" href="mailto:${escapeHtml(ownerEmail)}">
                      ✉ ${escapeHtml(ownerEmail)}
                    </a>
                  ` : ''}
                </div>
                <div class="claim-card">
                  <strong>Your report message:</strong>
                  <p>${escapeHtml(myClaim.message || "")}</p>
                  <span class="pill pill-found">Status: Approved</span>
                </div>
              </div>
            `;
          } else if (myClaim.status === "rejected") {
            sidebarHtml += `
              <div class="form-card side-card">
                <h2>Report not matched</h2>
                <p class="muted small">The owner reviewed your report and marked it as not matching their item.</p>
              </div>
            `;
          } else {
            // Pending
            sidebarHtml += `
              <div class="form-card side-card">
                <span class="eyebrow">REPORT SENT</span>
                <h2>Report submitted</h2>
                <p class="muted small">Your response has been sent to the person who reported this missing item. As soon as they approve, their email will be shared here.</p>
                <div class="claim-card">
                  <strong>Your message:</strong>
                  <p>${escapeHtml(myClaim.message || "")}</p>
                  <span class="pill pill-neutral">Status: Pending owner review</span>
                </div>
              </div>
            `;
          }
        } else if (item.status === "open") {
          // Can submit a response/report
          const title = isLost ? "Report a found item" : "Make a claim";
          const eyebrow = isLost ? "HAVE YOU SEEN THIS?" : "THINK IT'S YOURS?";
          const desc = isLost
            ? "Send a message to the owner describing where you found it, where it is stored, or how they can verify."
            : "Share details that help verify you are the rightful owner.";
          const placeholder = isLost
            ? "e.g. I found your black umbrella on the 2nd floor near the water cooler. It is currently with the library front desk..."
            : "Describe unique identifying marks or details only the owner would know...";
          const submitBtnText = isLost ? "Send report to owner" : "Submit claim";

          sidebarHtml += `
            <form class="form-card side-card" id="claim-form">
              <span class="eyebrow">${eyebrow}</span>
              <h2>${title}</h2>
              <p class="muted small">${desc}</p>
              <label>
                Your message
                <textarea rows="4" id="claim-message" placeholder="${placeholder}" required></textarea>
              </label>
              <button class="btn btn-primary btn-full" id="claim-submit-btn" type="submit">${submitBtnText}</button>
            </form>
          `;
        } else {
          sidebarHtml += `
            <div class="form-card side-card">
              <h2>Item ${escapeHtml(item.status)}</h2>
              <p class="muted small">This item has already been marked as ${escapeHtml(item.status)}.</p>
            </div>
          `;
        }
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
            if (sidebarError) sidebarError.classList.add("hidden");
            if (sidebarSuccess) sidebarSuccess.classList.add("hidden");

            const msgInput = document.getElementById("claim-message");
            const btn = document.getElementById("claim-submit-btn");
            if (btn) btn.disabled = true;

            try {
              await api.post("/claims", { itemId: id, message: msgInput.value.trim() });
              await loadItem();
            } catch (err) {
              if (sidebarError) {
                sidebarError.textContent = err.message || "Could not submit report.";
                sidebarError.classList.remove("hidden");
              }
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

        const deleteResolvedBtn = document.getElementById("delete-resolved-btn");
        if (deleteResolvedBtn) {
          deleteResolvedBtn.addEventListener("click", async () => {
            if (!confirm("Are you sure you want to delete this missing item request from the campus board?")) {
              return;
            }
            try {
              deleteResolvedBtn.disabled = true;
              deleteResolvedBtn.textContent = "Deleting...";
              await api.delete(`/items/${id}`);
              alert("Missing item post deleted successfully.");
              window.location.href = "dashboard.html";
            } catch (err) {
              alert(err.message || "Could not delete item.");
              deleteResolvedBtn.disabled = false;
              deleteResolvedBtn.textContent = "Delete missing item request";
            }
          });
        }
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
      alert(err.message || "Could not update report status.");
    }
  };

  loadItem();
});
