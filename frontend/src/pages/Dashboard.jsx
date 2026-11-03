import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import ItemCard from "../components/ItemCard";

export default function Dashboard() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(params.get("search") || "");
  const [type, setType] = useState(params.get("type") || "");
  const [category, setCategory] = useState("");

  const fetchItems = async (query = {}) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/items", { params: query });
      setItems(data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load items. Check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems({
      search: params.get("search") || undefined,
      type: params.get("type") || undefined
    });
  }, [params]);

  const submit = e => {
    e.preventDefault();
    const next = {};
    if (search.trim()) next.search = search.trim();
    if (type) next.type = type;
    if (category) next.category = category;
    setParams(next);
    // category is applied directly as the query parameter after submit
    if (category) fetchItems({ ...next, category });
  };

  const clear = () => {
    setSearch(""); setType(""); setCategory(""); setParams({});
  };

  return (
    <div className="page-section container">
      <div className="page-title-row"><div><span className="eyebrow">CAMPUS COMMUNITY BOARD</span><h1>Find what you're<br className="mobile-break" /> looking for.</h1><p>Browse lost and found posts shared by students.</p></div><Link className="btn btn-primary" to="/create-item">＋ Report an item</Link></div>
      <form className="filter-bar" onSubmit={submit}>
        <div className="search-field"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by item, description or location..." /></div>
        <select value={type} onChange={e => setType(e.target.value)}><option value="">All posts</option><option value="lost">Lost items</option><option value="found">Found items</option></select>
        <select value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option>{["Electronics","Accessories","Books","Clothing","ID Cards","Keys","Other"].map(c => <option key={c}>{c}</option>)}</select>
        <button className="btn btn-primary" type="submit">Search</button>
        <button className="btn btn-ghost" type="button" onClick={clear}>Clear</button>
      </form>
      <div className="results-heading"><h2>Community posts</h2><span className="muted small">{items.length} results on this page</span></div>
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <div className="page-loader">Finding campus posts...</div> : items.length ? <div className="items-grid">{items.map(item => <ItemCard key={item._id} item={item} />)}</div> : <div className="empty-state"><div className="empty-icon">⌕</div><h3>No matching items</h3><p>Try another search or clear your filters.</p><button className="btn btn-outline" onClick={clear}>Clear filters</button></div>}
    </div>
  );
}
