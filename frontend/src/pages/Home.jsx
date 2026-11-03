import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import ItemCard from "../components/ItemCard";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get("/items?limit=3")
      .then(({ data }) => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot"></span> YOUR CAMPUS COMMUNITY HUB</span>
            <h1>Lost something?<br /><em>Found something?</em><br />Let's bring it home.</h1>
            <p className="hero-description">A little help from your campus community can make a big difference. Report lost belongings, share found items, and reconnect people with what matters.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to={user ? "/create-item?type=lost" : "/register"}>Report an item <span>→</span></Link>
              <Link className="btn btn-light" to="/dashboard">Browse found items</Link>
            </div>
            <div className="hero-note"><span className="avatar-stack">● ● ●</span> Made for students, powered by community</div>
          </div>
          <div className="hero-art">
            <div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div>
            <div className="art-card art-card-main">
              <div className="art-card-top"><span className="art-icon">✳</span><span className="pill pill-found">FOUND</span></div>
              <div className="illustration-bag">▰</div>
              <h3>Someone found your<br />next favourite thing.</h3>
              <p>Campus Library · Today</p>
            </div>
            <div className="floating-note note-one">✓ <span>Good things get returned</span></div>
            <div className="floating-note note-two">⌕ <span>Search your campus</span></div>
            <div className="art-spark spark-one">✦</div><div className="art-spark spark-two">✳</div>
          </div>
        </div>
      </section>

      <section className="container steps-section">
        <div className="section-heading centered">
          <span className="eyebrow">HOW IT WORKS</span>
          <h2>Three steps. One happy reunion.</h2>
          <p>Getting your belongings back is easier when we look out for each other.</p>
        </div>
        <div className="steps-grid">
          <div className="step-card"><span className="step-number">01</span><div className="step-icon">⌕</div><h3>Search or report</h3><p>Look through recent posts or tell the campus what you've lost or found.</p></div>
          <div className="step-card"><span className="step-number">02</span><div className="step-icon">↗</div><h3>Connect safely</h3><p>Send a claim request with details that help verify the rightful owner.</p></div>
          <div className="step-card"><span className="step-number">03</span><div className="step-icon">♡</div><h3>Make a reunion</h3><p>Coordinate a safe handover and mark the item as returned.</p></div>
        </div>
      </section>

      <section className="recent-section">
        <div className="container">
          <div className="section-row">
            <div><span className="eyebrow">COMMUNITY BOARD</span><h2>Recently posted items</h2><p className="muted">A few things your campus community has shared.</p></div>
            <Link className="text-link" to="/dashboard">See all items →</Link>
          </div>
          {loading ? <p className="muted">Loading recent items...</p> : items.length ? (
            <div className="items-grid">{items.map(item => <ItemCard key={item._id} item={item} />)}</div>
          ) : (
            <div className="empty-state"><div className="empty-icon">⌕</div><h3>It's quiet around here</h3><p>No items have been posted yet. Be the first to help your campus community.</p><Link className="btn btn-primary" to={user ? "/create-item" : "/register"}>Post an item</Link></div>
          )}
        </div>
      </section>
      <section className="cta-section container">
        <div><span className="eyebrow">SMALL ACTS, BIG IMPACT</span><h2>Be someone's favourite<br />notification today.</h2></div>
        <Link className="btn btn-dark" to={user ? "/create-item" : "/register"}>Get started <span>→</span></Link>
      </section>
    </>
  );
}
