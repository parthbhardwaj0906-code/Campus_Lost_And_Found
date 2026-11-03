import { useEffect, useState } from "react";
import api from "../services/api";
import ItemCard from "../components/ItemCard";

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/items?limit=50")
      .then(({ data }) => setItems(data.items || []))
      .catch(err => setError(err.response?.data?.message || "Could not load items."))
      .finally(() => setLoading(false));
  };

  const remove = async id => {
    if (!window.confirm("Delete this item post?")) return;
    try { await api.delete(`/items/${id}`); load(); }
    catch (err) { setError(err.response?.data?.message || "Could not delete item."); }
  };

  return (
    <div className="container page-section">
      <div className="page-title-row"><div><span className="eyebrow">CAMPUS MODERATION</span><h1>Admin dashboard.</h1><p>Review community posts and remove inappropriate listings.</p></div><span className="admin-tag">ADMIN ACCESS</span></div>
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <div className="page-loader">Loading posts...</div> : items.length ? <div className="items-grid">{items.map(item => <div className="managed-card" key={item._id}><ItemCard item={item} /><button className="delete-link" onClick={() => remove(item._id)}>Remove post</button></div>)}</div> : <div className="empty-state"><h3>No posts to review</h3></div>}
    </div>
  );
}
