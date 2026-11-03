import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-heading"><span className="eyebrow">JOIN THE COMMUNITY</span><h1>Good finds<br />start here.</h1><p>Create your student account and help make campus a little more connected.</p></div>
        <form className="form-card" onSubmit={submit}>
          <h2>Create your account</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <label>Full name<input name="name" value={form.name} onChange={change} placeholder="Your full name" required maxLength="80" /></label>
          <label>College email<input type="email" name="email" value={form.email} onChange={change} placeholder="you@college.edu" required /></label>
          <label>Password<input type="password" name="password" value={form.password} onChange={change} placeholder="At least 8 characters" minLength="8" required /></label>
          <button className="btn btn-primary btn-full" disabled={busy}>{busy ? "Creating account..." : "Create account"} <span>→</span></button>
          <p className="form-foot">Already have an account? <Link to="/login">Log in</Link></p>
          <p className="form-hint">New accounts are created with the student role.</p>
        </form>
      </div>
      <aside className="auth-aside register-aside"><div className="aside-quote">Every lost item has a story. Help it find its way back.</div><div className="aside-bottom">Find it. Claim it. Return it.</div></aside>
    </div>
  );
}
