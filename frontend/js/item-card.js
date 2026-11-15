// Reusable Item Card component (Vanilla JS)
import { getImageUrl, escapeHtml } from "./api.js";

export function renderItemCard(item) {
  const isLost = item.itemType === "lost";
  const pillClass = isLost ? "pill-lost" : "pill-found";
  const pillText = isLost ? "Lost item" : "Found item";
  const dateFormatted = item.date ? new Date(item.date).toLocaleDateString() : "";
  const imageUrl = item.imageUrl ? getImageUrl(item.imageUrl) : "";

  const visualContent = imageUrl
    ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.title || '')}" />`
    : `<div class="item-placeholder"><span>${isLost ? "⌕" : "✓"}</span><small>No image provided</small></div>`;

  return `
    <article class="item-card" data-item-id="${escapeHtml(item._id || '')}">
      <div class="item-visual">
        ${visualContent}
        <span class="pill ${pillClass}">${pillText}</span>
      </div>
      <div class="item-card-body">
        <div class="item-meta">
          ${escapeHtml(item.category || "General")} <span>·</span> ${escapeHtml(item.status || "open")}
        </div>
        <h3>${escapeHtml(item.title || "")}</h3>
        <p class="item-description">${escapeHtml(item.description || "")}</p>
        <div class="item-location">⌖ ${escapeHtml(item.location || "")}</div>
        <div class="item-card-bottom">
          <span class="muted small">${escapeHtml(dateFormatted)}</span>
          <a class="text-link" href="item-details.html?id=${encodeURIComponent(item._id)}">
            View details <span>→</span>
          </a>
        </div>
      </div>
    </article>
  `;
}

export default renderItemCard;
