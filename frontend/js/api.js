// API service for Campus Lost & Found (Pure Vanilla JS)

export function getBaseUrl() {
  if (typeof window !== "undefined" && window.API_BASE_URL) {
    return window.API_BASE_URL;
  }
  if (typeof localStorage !== "undefined" && localStorage.getItem("clf_api_url")) {
    return localStorage.getItem("clf_api_url");
  }

  const isLocalhost =
    typeof window !== "undefined" &&
    Boolean(
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.endsWith(".local")
    );

  if (isLocalhost) {
    return "http://localhost:8000/api";
  }

  try {
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) {
      const viteUrl = import.meta.env.VITE_API_URL;
      if (viteUrl && !viteUrl.includes("localhost") && !viteUrl.includes("127.0.0.1")) {
        return viteUrl;
      }
    }
  } catch (e) {
    // import.meta not available
  }

  return "https://deck-critical-hamster.abasthan.app/api";
}

export function getApiOrigin() {
  return getBaseUrl().replace(/\/api\/?$/, "");
}

export const API_BASE = getBaseUrl();
export const API_ORIGIN = getApiOrigin();

export function getImageUrl(imagePath) {
  if (!imagePath) return "";
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }
  const origin = getApiOrigin();
  return `${origin}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
}

export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function request(endpoint, options = {}) {
  const baseUrl = getBaseUrl();
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = { ...(options.headers || {}) };
  const token = localStorage.getItem("clf_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (netErr) {
    throw new Error("Unable to reach the backend server. Please verify your connection or backend status.");
  }

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      data = { message: text };
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMsg =
      (data && data.message) ||
      (data && data.error) ||
      (data && Array.isArray(data.errors) && data.errors.map(e => e.msg).join(", ")) ||
      `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get(endpoint, params = {}) {
    let url = endpoint;
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, value);
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
    return request(url, { method: "GET" });
  },

  post(endpoint, body) {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    return request(endpoint, {
      method: "POST",
      body: isFormData ? body : JSON.stringify(body)
    });
  },

  put(endpoint, body) {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    return request(endpoint, {
      method: "PUT",
      body: isFormData ? body : JSON.stringify(body)
    });
  },

  patch(endpoint, body) {
    return request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return request(endpoint, { method: "DELETE" });
  },

  getImageUrl,
  escapeHtml
};

export default api;
