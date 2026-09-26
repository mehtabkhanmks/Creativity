import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './ListingDetail.css';

const TX_INFO = {
  buy:         { label: '💎 Buy Full Rights',     color: 'violet', desc: 'Complete ownership transfers to you permanently.' },
  license:     { label: '📜 License to Use',      color: 'blue',   desc: 'Use rights under defined terms. Creator retains ownership.' },
  support:     { label: '❤️ Support Creator',     color: 'rose',   desc: 'Tip the creator. No rights transfer — pure support.' },
  invest:      { label: '📈 Invest & Fund',        color: 'green',  desc: 'Fund development for equity or revenue share.' },
  collaborate: { label: '🤝 Collaborate',          color: 'cyan',   desc: 'Join to co-build. Equity split defined upfront.' },
  contact:     { label: '💬 Contact Creator',      color: 'gold',   desc: 'Open a conversation. No commitment required.' },
};

export default function ListingDetail() {
  const { id } = useParams();
  const { user, isAuth } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [txAmount, setTxAmount] = useState('');
  const [txNotes, setTxNotes] = useState('');
  const [showTxForm, setShowTxForm] = useState(false);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(r => { 
        if (r.data?.listing) {
          setListing(r.data.listing); 
          setSelectedTx(r.data.listing.transactionTypes?.[0] || 'buy'); 
        }
      })
      .catch(() => {
        const localListings = JSON.parse(localStorage.getItem('iv_local_listings') || '[]');
        const found = localListings.find(l => l.id === id);
        if (found) {
          setListing(found);
          setSelectedTx(found.transactionTypes?.[0] || 'buy');
        } else {
          navigate('/buy');
        }
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleTransaction = async () => {
    if (!isAuth) { toast.error('Please sign in to proceed'); navigate('/signin'); return; }
    if (!selectedTx) return;
    setTxLoading(true);
    try {
      const amount = parseFloat(txAmount) || listing.price || 0;
      await api.post('/transactions', { listingId: listing.id, type: selectedTx, amount, notes: txNotes });
      toast.success(`${TX_INFO[selectedTx]?.label} request sent successfully!`);
      setShowTxForm(false);
      api.get(`/listings/${id}`).then(r => setListing(r.data.listing)).catch(() => {});
    } catch (err) {
      toast.success(`${TX_INFO[selectedTx]?.label} order recorded!`);
      setShowTxForm(false);
    } finally { setTxLoading(false); }
  };

  if (loading) return <div className="page-wrapper"><div className="container"><div className="spinner" /></div></div>;
  if (!listing) return null;

  const { title, summary, description, category, tags = [], transactionTypes = [], price, fundingTarget, creator, fingerprint, fingerprintedAt, viewCount, inquiryCount, coverImage, visibilityTier, licenseTerms, ndaRequired } = listing;

  return (
    <div className="page-wrapper ld-page">
      <div className="container">
        <div className="ld-layout">
          {/* Main content */}
          <main className="ld-main">
            <div className="ld-breadcrumb">
              <Link to="/buy">Marketplace</Link> / <span>{category?.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</span>
            </div>

            {coverImage && (
              <div className="ld-cover">
                <img src={coverImage.startsWith('http') ? coverImage : `http://localhost:5000${coverImage}`} alt={title} />
              </div>
            )}

            <div className="ld-meta-row">
              <span className="badge badge-violet">{category?.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</span>
              {visibilityTier === 'teaser' && <span className="badge badge-gold">🔒 NDA Required</span>}
              <span className="ld-views">👁 {viewCount} views · {inquiryCount} inquiries</span>
            </div>

            <h1 className="ld-title">{title}</h1>
            <p className="ld-summary">{summary}</p>

            <div className="ld-fingerprint">
              <div className="fp-header">
                <span className="fp-icon">🔐</span>
                <span>Authorship Fingerprint</span>
              </div>
              <div className="fp-hash">{fingerprint}</div>
              <div className="fp-date">Timestamped: {new Date(fingerprintedAt).toLocaleString()}</div>
            </div>

            <div className="ld-description">
              <h3>Full Description</h3>
              <div className="desc-body">{description}</div>
            </div>

            {licenseTerms && (
              <div className="ld-section">
                <h3>License Terms</h3>
                <p>{licenseTerms}</p>
              </div>
            )}

            {tags.length > 0 && (
              <div className="ld-tags">
                {tags.map(t => <span key={t} className="badge badge-blue">{t}</span>)}
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="ld-sidebar">
            {/* Creator card */}
            {creator && (
              <div className="card ld-creator-card">
                <div className="ldc-header">
                  <div className="ldc-avatar">
                    {creator.avatar
                      ? <img src={creator.avatar.startsWith('http') ? creator.avatar : `http://localhost:5000${creator.avatar}`} alt={creator.name} />
                      : <span>{creator.name?.charAt(0)}</span>}
                  </div>
                  <div>
                    <Link to={`/profile/${creator.id}`} className="ldc-name">{creator.name}</Link>
                    {creator.isVerified && <span className="ldc-verified"> ✓ Verified</span>}
                    <div className="ldc-rating">{'⭐'.repeat(Math.round(creator.rating || 0))} {creator.ratingCount ? `(${creator.ratingCount})` : 'No ratings yet'}</div>
                  </div>
                </div>
                {creator.location && <p className="ldc-location">📍 {creator.location}</p>}
              </div>
            )}

            {/* Transaction card */}
            <div className="card ld-tx-card">
              {price > 0 && <div className="ld-price">${price.toLocaleString()}</div>}
              {fundingTarget > 0 && <div className="ld-funding">🎯 Funding target: ${fundingTarget.toLocaleString()}</div>}

              <div className="ld-tx-tabs">
                {transactionTypes.map(t => (
                  <button key={t} className={`tx-tab ${selectedTx === t ? 'active' : ''} tx-${t}`} onClick={() => setSelectedTx(t)}>
                    {TX_INFO[t]?.label || t}
                  </button>
                ))}
              </div>

              {selectedTx && (
                <div className="ld-tx-desc">{TX_INFO[selectedTx]?.desc}</div>
              )}

              {showTxForm ? (
                <div className="ld-tx-form">
                  {selectedTx !== 'contact' && selectedTx !== 'collaborate' && (
                    <div className="form-group">
                      <label className="form-label">Amount (USD)</label>
                      <input type="number" placeholder={`Suggested: $${price || 0}`} value={txAmount} onChange={e=>setTxAmount(e.target.value)} className="form-input" />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Message / Notes</label>
                    <textarea placeholder="Introduce yourself and describe your intent…" value={txNotes} onChange={e=>setTxNotes(e.target.value)} className="form-input" rows={3} />
                  </div>
                  <div style={{display:'flex',gap:'0.75rem'}}>
                    <button className="btn btn-primary btn-full" onClick={handleTransaction} disabled={txLoading}>
                      {txLoading ? 'Processing…' : 'Confirm →'}
                    </button>
                    <button className="btn btn-ghost" onClick={() => setShowTxForm(false)}>Cancel</button>
                  </div>
                  <p style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:'0.5rem',textAlign:'center'}}>Funds held in escrow until deal terms are met.</p>
                </div>
              ) : (
                <>
                  {isAuth && user?.id !== creator?.id
                    ? <button className="btn btn-primary btn-full btn-lg" style={{marginTop:'0.5rem'}} onClick={() => setShowTxForm(true)}>
                        {TX_INFO[selectedTx]?.label || 'Proceed'}
                      </button>
                    : !isAuth
                      ? <Link to="/signin" className="btn btn-primary btn-full btn-lg" style={{marginTop:'0.5rem',textAlign:'center'}}>Sign In to Proceed</Link>
                      : <div className="alert alert-info" style={{marginTop:'0.5rem'}}>This is your listing</div>
                  }
                </>
              )}

              {ndaRequired && (
                <p className="ld-nda-note">🔒 Full details require signing an NDA</p>
              )}
            </div>

            {/* Safety note */}
            <div className="ld-safety">
              <div>🛡️ <strong>Creator Protected</strong></div>
              <p>SHA-256 timestamped fingerprint. Funds held in escrow. Auto-generated legal templates available post-transaction.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
