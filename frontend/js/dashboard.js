import api from "./api.js";
import auth from "./auth.js";
import renderNav from "./navbar.js";
import renderItemCard from "./item-card.js";

document.addEventListener("DOMContentLoaded", () => {
  renderNav("dashboard");
  auth.verifyAuth().then(() => renderNav("dashboard")).catch(() => {});

  const searchInput = document.getElementById("search-input");
  const typeSelect = document.getElementById("type-select");
  const categorySelect = document.getElementById("category-select");
  const filterForm = document.getElementById("filter-form");
  const clearBtn = document.getElementById("clear-btn");
  const itemsContainer = document.getElementById("items-container");
  const resultsCount = document.getElementById("results-count");
  const errorAlert = document.getElementById("error-alert");

  const getParamsFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      search: params.get("search") || "",
      type: params.get("type") || "",
      category: params.get("category") || ""
    };
  };

  const syncFormFromParams = () => {
    const { search, type, category } = getParamsFromUrl();
    if (searchInput) searchInput.value = search;
    if (typeSelect) typeSelect.value = type;
    if (categorySelect) categorySelect.value = category;
  };

  syncFormFromParams();

  const fetchItems = async () => {
    const { search, type, category } = getParamsFromUrl();

    if (errorAlert) {
      errorAlert.classList.add("hidden");
      errorAlert.textContent = "";
    }
    if (itemsContainer) {
      itemsContainer.innerHTML = '<div class="page-loader">Finding campus posts...</div>';
    }

    const query = {};
    if (search.trim()) query.search = search.trim();
    if (type) query.type = type;
    if (category) query.category = category;

    try {
      const data = await api.get("/items", query);
      const items = data.items || [];

      if (resultsCount) {
        resultsCount.textContent = `${items.length} results on this page`;
      }

      if (items.length > 0) {
        itemsContainer.innerHTML = `
          <div class="items-grid">
            ${items.map(item => renderItemCard(item)).join("")}
          </div>
        `;
      } else {
        itemsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">⌕</div>
            <h3>No matching items</h3>
            <p>Try another search or clear your filters.</p>
            <button class="btn btn-outline" id="empty-clear-btn" type="button">Clear filters</button>
          </div>
        `;
        const emptyClear = document.getElementById("empty-clear-btn");
        if (emptyClear) {
          emptyClear.addEventListener("click", clearFilters);
        }
      }
    } catch (err) {
      if (errorAlert) {
        errorAlert.textContent = err.message || "Could not load items from the database.";
        errorAlert.classList.remove("hidden");
      }
      if (itemsContainer) {
        itemsContainer.innerHTML = "";
      }
    }
  };

  const updateUrlAndFetch = () => {
    const searchVal = searchInput ? searchInput.value.trim() : "";
    const typeVal = typeSelect ? typeSelect.value : "";
    const catVal = categorySelect ? categorySelect.value : "";

    const params = new URLSearchParams();
    if (searchVal) params.set("search", searchVal);
    if (typeVal) params.set("type", typeVal);
    if (catVal) params.set("category", catVal);

    const newUrl = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
    window.history.pushState(null, "", newUrl);

    fetchItems();
  };

  const clearFilters = () => {
    if (searchInput) searchInput.value = "";
    if (typeSelect) typeSelect.value = "";
    if (categorySelect) categorySelect.value = "";
    window.history.pushState(null, "", window.location.pathname);
    fetchItems();
  };

  if (filterForm) {
    filterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      updateUrlAndFetch();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearFilters);
  }

  window.addEventListener("popstate", () => {
    syncFormFromParams();
    fetchItems();
  });

  fetchItems();
});
