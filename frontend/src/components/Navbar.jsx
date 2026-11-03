import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="site-header">
      <nav className="navbar container">
        <Link className="brand" to="/">
          <span className="brand-mark">⌕</span>
          <span>Campus<span className="brand-accent">Find</span></span>
        </Link>
        <div className="nav-links">
          <NavLink to="/">Home</NavLink>
          {user && <NavLink to="/dashboard">Browse items</NavLink>}
          {user && <NavLink to="/my-posts">My posts</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
        </div>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="nav-user">Hi, {user.name.split(" ")[0]}</span>
              <button className="btn btn-outline btn-small" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="nav-login" to="/login">Log in</Link>
              <Link className="btn btn-primary btn-small" to="/register">Join campus</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
