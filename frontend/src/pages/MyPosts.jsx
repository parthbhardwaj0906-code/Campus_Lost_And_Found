import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ItemCard from "../components/ItemCard";

export default function MyPosts() {
  const { user } = useAuth();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/items?limit=50")
      .then(({ data }) => setItems((data.items || []).filter(item => (item.postedBy?._id || item.postedBy) === (user.id || user._id))))
      .catch(err => setError(err.response?.data?.message || "Could not load your posts."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async id => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try { await api.delete(`/items/${id}`); load(); }
    catch (err) { setError(err.response?.data?.message || "Could not delete post."); }
  };

  return (
    <div className="container page-section">
      <div className="page-title-row"><div><span className="eyebrow">YOUR ACTIVITY</span><h1>My posts.</h1><p>Keep track of the items you've shared with campus.</p></div><Link className="btn btn-primary" to="/create-item">＋ New post</Link></div>
      {location.state?.notice && <div className="alert alert-success">{location.state.notice}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <div className="page-loader">Loading your posts...</div> : items.length ? <div className="items-grid">{items.map(item => <div className="managed-card" key={item._id}><ItemCard item={item} /><button className="delete-link" onClick={() => remove(item._id)}>Delete post</button></div>)}</div> : <div className="empty-state"><div className="empty-icon">＋</div><h3>You haven't posted anything yet</h3><p>Your lost and found posts will appear here.</p><Link className="btn btn-primary" to="/create-item">Create your first post</Link></div>}
    </div>
  );
}
