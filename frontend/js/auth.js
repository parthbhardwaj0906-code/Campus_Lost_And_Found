// Authentication service (Vanilla JS)
import api from "./api.js";

export const auth = {
  getToken() {
    return localStorage.getItem("clf_token");
  },

  getUser() {
    try {
      const data = localStorage.getItem("clf_user");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return Boolean(this.getToken() && this.getUser());
  },

  setAuth(data) {
    if (data.token) {
      localStorage.setItem("clf_token", data.token);
    }
    if (data.user) {
      localStorage.setItem("clf_user", JSON.stringify(data.user));
    }
  },

  logout() {
    localStorage.removeItem("clf_token");
    localStorage.removeItem("clf_user");
    window.location.href = "login.html";
  },

  async verifyAuth() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const data = await api.get("/auth/me");
      if (data && data.user) {
        localStorage.setItem("clf_user", JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem("clf_token");
        localStorage.removeItem("clf_user");
      }
    }
    return this.getUser();
  },

  requireAuth(redirectUrl = null) {
    const user = this.getUser();
    if (!user || !this.getToken()) {
      const current = redirectUrl || window.location.pathname.split("/").pop() || "dashboard.html";
      window.location.href = `login.html?redirect=${encodeURIComponent(current)}`;
      return null;
    }
    return user;
  },

  requireAdmin() {
    const user = this.requireAuth();
    if (!user) return null;
    if (user.role !== "admin") {
      alert("Access denied. Admin privileges required.");
      window.location.href = "dashboard.html";
      return null;
    }
    return user;
  }
};

export default auth;
