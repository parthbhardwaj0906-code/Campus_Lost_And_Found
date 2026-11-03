import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ItemDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get(`/items/${id}`);
      setItem(data.item);
      const owner = data.item.postedBy?._id === user?.id || data.item.postedBy?._id === user?._id;
      if (user && (owner || user.role === "admin") && data.item.itemType === "found") {
        const result = await api.get(`/claims/item/${id}`);
        setClaims(result.data.claims || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load this item.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id, user]);

  const submitClaim = async e => {
    e.preventDefault(); setError(""); setNotice("");
    try {
      await api.post("/claims", { itemId: id, message });
      setNotice("Your claim request has been submitted.");
      setMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit claim.");
    }
  };

  const updateClaim = async (claimId, status) => {
    setError(""); setNotice("");
    try {
      await api.patch(`/claims/${claimId}`, { status });
      setNotice(`Claim ${status}.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update claim.");
    }
  };

  if (loading) return <div className="page-loader">Loading item...</div>;
  if (!item) return <div className="container page-section"><div className="alert alert-error">{error || "Item not found"}</div><Link to="/dashboard">Back to items</Link></div>;

  const owner = item.postedBy?._id === user?.id || item.postedBy?._id === user?._id;
  const canManage = owner || user?.role === "admin";

  return (
    <div className="container page-section detail-layout">
      <div className="detail-main">
        <Link className="back-link" to="/dashboard">← Back to community board</Link>
        <div className="detail-image">{item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : <div className="item-placeholder large"><span>{item.itemType === "lost" ? "⌕" : "✓"}</span><small>No image provided</small></div>}</div>
        <div className="detail-content">
          <div className="detail-pills"><span className={`pill ${item.itemType === "lost" ? "pill-lost" : "pill-found"}`}>{item.itemType} item</span><span className="pill pill-neutral">{item.status}</span></div>
          <span className="eyebrow">{item.category}</span>
          <h1>{item.title}</h1>
          <p className="detail-description">{item.description}</p>
          <div className="detail-info"><div><small>LAST SEEN / FOUND AT</small><strong>⌖ {item.location}</strong></div><div><small>DATE</small><strong>{new Date(item.date).toLocaleDateString()}</strong></div><div><small>POSTED BY</small><strong>{item.postedBy?.name || "Campus member"}</strong></div></div>
        </div>
      </div>
      <aside className="detail-sidebar">
        {error && <div className="alert alert-error">{error}</div>}
        {notice && <div className="alert alert-success">{notice}</div>}
        {item.itemType === "found" && item.status === "open" && user && !canManage && (
          <form className="form-card side-card" onSubmit={submitClaim}><span className="eyebrow">THINK IT'S YOURS?</span><h2>Make a claim</h2><p className="muted small">Share details that help the person who found it verify that it belongs to you.</p><label>Your message<textarea rows="5" value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe a detail only the owner would know..." required /></label><button className="btn btn-primary btn-full">Submit claim</button></form>
        )}
        {!user && item.itemType === "found" && <div className="form-card side-card"><h2>Is this yours?</h2><p className="muted">Log in to submit a claim request.</p><Link className="btn btn-primary btn-full" to="/login">Log in to claim</Link></div>}
        {item.itemType === "lost" && <div className="form-card side-card"><h2>Have you seen this?</h2><p className="muted">If you find this item, please create a found-item post with its details.</p><Link className="btn btn-primary btn-full" to="/create-item?type=found">Report a found item</Link></div>}
        {canManage && item.itemType === "found" && <div className="form-card side-card"><h2>Claim requests</h2>{claims.length ? claims.map(claim => <div className="claim-card" key={claim._id}><strong>{claim.claimedBy?.name}</strong><p>{claim.message}</p><span className="pill pill-neutral">{claim.status}</span>{claim.status === "pending" && <div className="claim-actions"><button className="btn btn-primary btn-small" onClick={() => updateClaim(claim._id, "approved")}>Approve</button><button className="btn btn-outline btn-small" onClick={() => updateClaim(claim._id, "rejected")}>Reject</button></div>}</div>) : <p className="muted small">No claims yet.</p>}</div>}
        <div className="safety-note"><strong>↗ Meet safely</strong><p>Arrange handover in a public campus location. Verify ownership before returning an item.</p></div>
      </aside>
    </div>
  );
}
