import api from "./api.js";
import auth from "./auth.js";
import renderNav from "./navbar.js";

document.addEventListener("DOMContentLoaded", () => {
  const user = auth.requireAuth("create-item.html");
  if (!user) return;

  renderNav("create-item");

  const params = new URLSearchParams(window.location.search);
  let itemType = params.get("type") === "found" ? "found" : "lost";
  let imageFile = null;

  const lostRadio = document.querySelector('input[name="itemType"][value="lost"]');
  const foundRadio = document.querySelector('input[name="itemType"][value="found"]');
  const dateInput = document.getElementById("date-input") || document.querySelector('input[name="date"]');
  const form = document.getElementById("create-item-form");
  const errorAlert = document.getElementById("error-alert");
  const publishBtn = document.getElementById("publish-btn");
  const galleryInput = document.getElementById("gallery-input");
  const cameraInput = document.getElementById("camera-input");
  const previewBox = document.querySelector(".image-preview-box");

  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }

  if (itemType === "found" && foundRadio) {
    foundRadio.checked = true;
  } else if (lostRadio) {
    lostRadio.checked = true;
  }

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      if (errorAlert) {
        errorAlert.textContent = "Please select a valid image.";
        errorAlert.classList.remove("hidden");
      }
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      if (errorAlert) {
        errorAlert.textContent = "Image size must be less than 5 MB.";
        errorAlert.classList.remove("hidden");
      }
      return;
    }

    if (errorAlert) {
      errorAlert.classList.add("hidden");
      errorAlert.textContent = "";
    }

    imageFile = file;
    if (previewBox) {
      previewBox.innerHTML = `
        <span style="font-size: 24px;">✓</span>
        <strong style="color: var(--green); font-size: 11px;">${file.name}</strong>
        <small style="color: var(--muted); font-size: 10px;">(${(file.size / (1024 * 1024)).toFixed(2)} MB)</small>
      `;
    }
  };

  if (galleryInput) {
    galleryInput.addEventListener("change", (e) => handleFile(e.target.files?.[0]));
  }
  if (cameraInput) {
    cameraInput.addEventListener("change", (e) => handleFile(e.target.files?.[0]));
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (errorAlert) {
        errorAlert.classList.add("hidden");
        errorAlert.textContent = "";
      }

      const selectedType = document.querySelector('input[name="itemType"]:checked')?.value || itemType;

      const formData = new FormData();
      formData.append("title", form.title.value.trim());
      formData.append("category", form.category.value);
      formData.append("date", form.date.value);
      formData.append("location", form.location.value.trim());
      formData.append("description", form.description.value.trim());
      formData.append("itemType", selectedType);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (publishBtn) {
        publishBtn.disabled = true;
        publishBtn.textContent = "Publishing to Campus...";
      }

      try {
        await api.post("/items", formData);
        window.location.href = `my-posts.html?notice=${encodeURIComponent("Your item has been posted successfully.")}`;
      } catch (err) {
        if (errorAlert) {
          errorAlert.textContent = err.message || "Could not post item. Please verify all fields.";
          errorAlert.classList.remove("hidden");
        }
      } finally {
        if (publishBtn) {
          publishBtn.disabled = false;
          publishBtn.textContent = "Publish post →";
        }
      }
    });
  }
});
