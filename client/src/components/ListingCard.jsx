import { Link } from 'react-router-dom';
import './ListingCard.css';

const CATEGORY_COLORS = {
  stories: 'violet', screenplays: 'blue', business: 'gold', research: 'cyan',
  creative: 'rose', games: 'violet', 'ai-software': 'green', designs: 'blue',
  social: 'cyan', education: 'gold', poetry: 'violet', other: 'blue',
};

const TX_LABELS = { buy: '💎 For Sale', license: '📜 License', support: '❤️ Support', invest: '📈 Invest', collaborate: '🤝 Collaborate', contact: '💬 Contact' };

export default function ListingCard({ listing }) {
  const { id, title, summary, category, price, transactionTypes = [], coverImage, creator, viewCount, isFeatured, visibilityTier } = listing;
  const color = CATEGORY_COLORS[category] || 'violet';

  return (
    <Link to={`/listings/${id}`} className="listing-card">
      <div className="lc-cover">
        {coverImage
          ? <img src={coverImage.startsWith('http') ? coverImage : `http://localhost:5000${coverImage}`} alt={title} />
          : <div className="lc-cover-placeholder">
              <span>{getCategoryEmoji(category)}</span>
            </div>
        }
        {isFeatured && <span className="lc-featured">⭐ Featured</span>}
        {visibilityTier === 'teaser' && <span className="lc-teaser">🔒 NDA Required</span>}
      </div>

      <div className="lc-body">
        <div className="lc-meta">
          <span className={`badge badge-${color}`}>{formatCategory(category)}</span>
          <span className="lc-views">👁 {viewCount || 0}</span>
        </div>

        <h3 className="lc-title">{title}</h3>
        <p className="lc-summary">{summary?.slice(0, 110)}{summary?.length > 110 ? '…' : ''}</p>

        <div className="lc-footer">
          <div className="lc-tx-types">
            {(Array.isArray(transactionTypes) ? transactionTypes : []).slice(0, 2).map(t => (
              <span key={t} className="lc-tx">{TX_LABELS[t] || t}</span>
            ))}
          </div>
          {price > 0 && <span className="lc-price">${price.toLocaleString()}</span>}
        </div>

        {creator && (
          <div className="lc-creator">
            <div className="lc-avatar">
              {creator.avatar
                ? <img src={creator.avatar.startsWith('http') ? creator.avatar : `http://localhost:5000${creator.avatar}`} alt={creator.name} />
                : <span>{creator.name?.charAt(0)}</span>
              }
            </div>
            <span className="lc-creator-name">{creator.name}</span>
            {creator.isVerified && <span className="lc-verified" title="Verified">✓</span>}
          </div>
        )}
      </div>
    </Link>
  );
}

function getCategoryEmoji(cat) {
  const map = { stories: '📖', screenplays: '🎬', business: '🚀', research: '🔬', creative: '🎨', games: '🎮', 'ai-software': '🤖', designs: '📐', social: '🌍', education: '📚', poetry: '✍️' };
  return map[cat] || '💡';
}
function formatCategory(cat) {
  return (cat || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
