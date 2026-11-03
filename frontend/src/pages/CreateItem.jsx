
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function CreateItem() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const galleryRef = useRef(null);
  const cameraRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Other",
    location: "",
    itemType: params.get("type") === "found" ? "found" : "lost",
    date: new Date().toISOString().slice(0, 10)
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Generate image preview
  useEffect(() => {
    if (!imageFile) {
      setPreview("");
      return;
    }

    const imageURL = URL.createObjectURL(imageFile);
    setPreview(imageURL);

    return () => URL.revokeObjectURL(imageURL);
  }, [imageFile]);

  // Handle gallery or camera image
  const handleImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);
  };

  const removeImage = () => {
    setImageFile(null);

    if (galleryRef.current) galleryRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  // Submit item with image
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.post("/items", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      navigate("/my-posts", {
        state: {
          notice: "Your item has been posted successfully."
        }
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not post item. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form-page container">

      <div className="form-page-intro">
        <span className="eyebrow">ADD TO THE COMMUNITY BOARD</span>
        <h1>Share the details.</h1>
        <p>
          Add item details and a photo to help its owner find it.
        </p>
      </div>

      <form className="form-card wide-form" onSubmit={submit}>

        <div className="type-toggle">
          <button
            type="button"
            className={
              form.itemType === "lost"
                ? "type-option selected lost-selected"
                : "type-option"
            }
            onClick={() => setForm({ ...form, itemType: "lost" })}
          >
            <b>⌕</b>
            <span>
              <strong>I lost something</strong>
              <small>Help me find my belonging</small>
            </span>
          </button>

          <button
            type="button"
            className={
              form.itemType === "found"
                ? "type-option selected found-selected"
                : "type-option"
            }
            onClick={() => setForm({ ...form, itemType: "found" })}
          >
            <b>✓</b>
            <span>
              <strong>I found something</strong>
              <small>Help it reach its owner</small>
            </span>
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-grid">

          <label className="span-two">
            Item name
            <input
              name="title"
              value={form.title}
              onChange={change}
              placeholder="e.g. Black water bottle"
              required
              maxLength="120"
            />
          </label>

          <label>
            Category
            <select
              name="category"
              value={form.category}
              onChange={change}
            >
              {[
                "Electronics",
                "Accessories",
                "Books",
                "Clothing",
                "ID Cards",
                "Keys",
                "Other"
              ].map(category => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label>
            Date {form.itemType === "lost" ? "lost" : "found"}
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={change}
              required
            />
          </label>

          <label className="span-two">
            Location
            <input
              name="location"
              value={form.location}
              onChange={change}
              placeholder="e.g. Central library"
              required
              maxLength="120"
            />
          </label>

          <label className="span-two">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={change}
              placeholder="Add colour, brand and identifying details..."
              rows="5"
              required
              maxLength="2000"
            />
          </label>

          {/* Image upload section */}
          <div className="span-two image-upload-section">

            <strong>Item photograph (optional)</strong>

            <p className="muted small">
              Upload from gallery or capture a new photo.
              Maximum size: 5 MB.
            </p>

            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              onChange={handleImage}
              hidden
            />

            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImage}
              hidden
            />

            <div className="image-upload-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => galleryRef.current?.click()}
              >
                Choose from Gallery
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => cameraRef.current?.click()}
              >
                Capture with Camera
              </button>
            </div>

            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Selected item preview" />

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={removeImage}
                >
                  Remove image
                </button>
              </div>
            )}

          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            disabled={busy}
          >
            {busy ? "Publishing..." : "Publish post →"}
          </button>
        </div>

        <p className="form-hint">
          Avoid uploading photos containing private information.
        </p>

      </form>
    </div>
  );
}
