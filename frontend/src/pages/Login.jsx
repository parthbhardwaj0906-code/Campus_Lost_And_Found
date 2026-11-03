import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log in. Check that the backend is running.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-heading"><span className="eyebrow">WELCOME BACK</span><h1>Good to see<br />you again.</h1><p>Log in to reconnect with your campus community.</p></div>
        <form className="form-card" onSubmit={submit}>
          <h2>Log in to your account</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <label>Email address<input type="email" name="email" value={form.email} onChange={change} placeholder="you@college.edu" required /></label>
          <label>Password<input type="password" name="password" value={form.password} onChange={change} placeholder="Enter your password" required /></label>
          <button className="btn btn-primary btn-full" disabled={busy}>{busy ? "Logging in..." : "Log in"} <span>→</span></button>
          <p className="form-foot">New to CampusFind? <Link to="/register">Create an account</Link></p>
        </form>
      </div>
      <aside className="auth-aside"><div className="aside-quote">“The smallest act of kindness is worth more than the grandest intention.”</div><div className="aside-bottom">A campus that cares, finds a way.</div></aside>
    </div>
  );
}
