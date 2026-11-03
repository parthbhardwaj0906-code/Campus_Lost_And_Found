import { getImageUrl } from "../services/imageUrl";
import { Link } from "react-router-dom";

export default function ItemCard({ item }) {
  const isLost = item.itemType === "lost";
  return (
    <article className="item-card">
      <div className="item-visual">
        {item.imageUrl ? (
          <img src={getImageUrl(item.imageUrl)} alt={item.title} />
        ) : (
          <div className="item-placeholder"><span>{isLost ? "⌕" : "✓"}</span><small>No image provided</small></div>
        )}
        <span className={`pill ${isLost ? "pill-lost" : "pill-found"}`}>{isLost ? "Lost item" : "Found item"}</span>
      </div>
      <div className="item-card-body">
        <div className="item-meta">{item.category || "General"} <span>·</span> {item.status || "open"}</div>
        <h3>{item.title}</h3>
        <p className="item-description">{item.description}</p>
        <div className="item-location">⌖ {item.location}</div>
        <div className="item-card-bottom">
          <span className="muted small">{new Date(item.date).toLocaleDateString()}</span>
          <Link className="text-link" to={`/items/${item._id}`}>View details <span>→</span></Link>
        </div>
      </div>
    </article>
  );
}
