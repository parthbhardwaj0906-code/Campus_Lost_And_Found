import api, { escapeHtml } from "./api.js";
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

  const compressImage = async (file) => {
    // If image is already reasonably small, no compression needed
    if (file.size <= 1.5 * 1024 * 1024) return file;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1920;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
                type: "image/jpeg",
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      if (errorAlert) {
        errorAlert.textContent = "Please select a valid image.";
        errorAlert.classList.remove("hidden");
      }
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      if (errorAlert) {
        errorAlert.textContent = "Image size must be less than 25 MB.";
        errorAlert.classList.remove("hidden");
      }
      return;
    }

    if (errorAlert) {
      errorAlert.classList.add("hidden");
      errorAlert.textContent = "";
    }

    if (previewBox) {
      previewBox.innerHTML = `
        <span style="font-size: 20px;">⏳</span>
        <span class="muted small">Optimizing photo for upload...</span>
      `;
    }

    try {
      imageFile = await compressImage(file);
    } catch {
      imageFile = file;
    }

    if (previewBox) {
      const sizeMb = (imageFile.size / (1024 * 1024)).toFixed(2);
      previewBox.innerHTML = `
        <span style="font-size: 24px;">✓</span>
        <strong style="color: var(--green); font-size: 11px;">${escapeHtml(file.name)}</strong>
        <small style="color: var(--muted); font-size: 10px;">(${sizeMb} MB ready to publish)</small>
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
