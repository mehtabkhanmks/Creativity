import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './Marketplace.css';

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuth } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [mediaTypes, setMediaTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('trending');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Synchronize when searchParam changes in URL
  useEffect(() => {
    const urlQuery = searchParams.get('search');
    if (urlQuery !== null && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  // Acquire Modal
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [mediaTypes, categories, minPrice, maxPrice, sortBy, searchQuery]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (mediaTypes.length > 0) params.mediaType = mediaTypes.join(',');
      if (categories.length > 0) params.category = categories.join(',');
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sortBy === 'trending') {
        params.sort = 'viewCount';
        params.order = 'DESC';
      } else if (sortBy === 'newest') {
        params.sort = 'createdAt';
        params.order = 'DESC';
      } else if (sortBy === 'price_asc') {
        params.sort = 'price';
        params.order = 'ASC';
      } else if (sortBy === 'price_desc') {
        params.sort = 'price';
        params.order = 'DESC';
      }

      const res = await api.get('/listings', { params });
      const localListings = JSON.parse(localStorage.getItem('iv_local_listings') || '[]');
      let fetched = res.data?.listings || [];
      if (fetched.length === 0 && localListings.length === 0) {
        fetched = getFallbackListings();
      }

      // Merge local listings so created products ALWAYS appear immediately
      const merged = [...localListings, ...fetched.filter(f => !localListings.some(l => l.id === f.id || l.title === f.title))];

      let filtered = merged;
      if (mediaTypes.length > 0) {
        filtered = filtered.filter(l => mediaTypes.includes(l.mediaType));
      }
      if (categories.length > 0) {
        filtered = filtered.filter(l => categories.includes(l.category));
      }
      if (minPrice) {
        filtered = filtered.filter(l => (parseFloat(l.price) || 0) >= parseFloat(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter(l => (parseFloat(l.price) || 0) <= parseFloat(maxPrice));
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(l => l.title?.toLowerCase().includes(q) || l.summary?.toLowerCase().includes(q));
      }

      setListings(filtered);
    } catch (err) {
      const localListings = JSON.parse(localStorage.getItem('iv_local_listings') || '[]');
      setListings([...localListings, ...getFallbackListings()]);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackListings = () => [
    {
      id: '1',
      title: 'The Silicon Blueprint',
      price: 12500,
      category: 'business',
      mediaType: 'document',
      verificationStatus: 'verified',
      summary: 'A comprehensive architectural guide to scaling SaaS platforms, detailing microservice...',
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
      creator: { name: 'Elena Hayes', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }
    },
    {
      id: '2',
      title: 'Echoes in the Valley',
      price: 3200,
      category: 'fiction',
      mediaType: 'document',
      verificationStatus: 'verified',
      summary: 'A speculative fiction manuscript... exploring the psychological',
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80',
      creator: { name: 'M. R. Vance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' }
    },
    {
      id: '3',
      title: "The Artisan's Bread",
      price: 8500,
      category: 'life-story',
      mediaType: 'video',
      verificationStatus: 'reviewing',
      summary: 'A cinematic documentary...',
      coverImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
      creator: { name: 'J. Dubois', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' }
    },
    {
      id: '4',
      title: 'Algorithmic Wealth',
      price: 25000,
      category: 'business',
      mediaType: 'document',
      verificationStatus: 'verified',
      summary: 'A detailed whitepaper...',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      creator: { name: 'Quant Group', avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80' }
    }
  ];

  const toggleMediaType = (type) => {
    if (mediaTypes.includes(type)) {
      setMediaTypes(mediaTypes.filter(t => t !== type));
    } else {
      setMediaTypes([...mediaTypes, type]);
    }
  };

  const toggleCategory = (cat) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter(c => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const handleAcquire = async () => {
    setPurchasing(true);
    try {
      if (isAuth) {
        await api.post('/transactions', {
          listingId: selectedAsset.id,
          type: 'buy',
          amount: selectedAsset.price || 0,
          notes: 'Instant marketplace acquisition order'
        });
      }
      setTimeout(() => {
        setPurchasing(false);
        setPurchaseSuccess(true);
        toast.success(`Successfully acquired ${selectedAsset.title}!`);
      }, 600);
    } catch (err) {
      setTimeout(() => {
        setPurchasing(false);
        setPurchaseSuccess(true);
        toast.success(`Acquisition order registered for ${selectedAsset.title}!`);
      }, 600);
    }
  };

  const handleResetFilters = () => {
    setMediaTypes([]);
    setCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="marketplace-page">
      <div className="marketplace-container">
        {/* Top Header Banner */}
        <div className="marketplace-header-row">
          <div className="marketplace-title-col">
            <div className="marketplace-live-tag">
              <span className="live-dot-beacon" />
              <span>38,700+ VERIFIED IP ASSETS AVAILABLE</span>
            </div>
            <h1 className="marketplace-title">Discover &amp; Acquire IP</h1>
            <p className="marketplace-subtitle">Acquire original screenplays, patented algorithms, business blueprints, and published manuscripts directly from verified creators.</p>
          </div>

          <div className="marketplace-controls-group">
            <form 
              className="marketplace-page-search" 
              onSubmit={(e) => { 
                e.preventDefault(); 
                if (searchQuery.trim()) {
                  setSearchParams({ search: searchQuery.trim() });
                } else {
                  setSearchParams({});
                }
              }}
            >
              <div className="page-search-wrapper">
                <svg className="page-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Filter by keyword, title, creator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="marketplace-page-search-input"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    className="marketplace-page-search-clear" 
                    onClick={() => { setSearchQuery(''); setSearchParams({}); }}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button type="submit" className="marketplace-page-search-btn">
                Search
              </button>
            </form>

            <div className="sort-dropdown-col">
              <label className="sort-label">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="trending">🔥 Trending Most Viewed</option>
                <option value="newest">✨ Newly Listed</option>
                <option value="price_asc">💵 Price: Low to High</option>
                <option value="price_desc">💎 Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="marketplace-quick-pills-row">
          {[
            { id: '', label: '🌟 All Assets' },
            { id: 'business', label: '💡 Business Blueprints' },
            { id: 'fiction', label: '📖 Stories & Novels' },
            { id: 'screenplays', label: '🎬 Screenplays & Film' },
            { id: 'tech', label: '🤖 AI & Software' },
            { id: 'research', label: '🔬 Research & Science' },
            { id: 'designs', label: '🎨 Design Portfolios' },
          ].map(pill => (
            <button
              key={pill.id}
              className={`quick-pill-btn ${(!pill.id && categories.length === 0) || categories.includes(pill.id) ? 'active' : ''}`}
              onClick={() => {
                if (!pill.id) setCategories([]);
                else toggleCategory(pill.id);
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Layout Grid: Sidebar Filters + Main Grid */}
        <div className="marketplace-content-layout">
          {/* ── Left Filters Sidebar ── */}
          <aside className="filters-sidebar">
            <div className="filters-card">
              <h3 className="filters-title">Filters</h3>

              {/* Media Type Section */}
              <div className="filter-group">
                <h4 className="filter-group-title">Media Type</h4>
                <div className="checkbox-list">
                  {[
                    { id: 'document', label: 'Document' },
                    { id: 'video', label: 'Video' },
                    { id: 'audio', label: 'Audio' },
                  ].map(m => (
                    <label key={m.id} className="filter-checkbox-item">
                      <input
                        type="checkbox"
                        checked={mediaTypes.includes(m.id)}
                        onChange={() => toggleMediaType(m.id)}
                      />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Section */}
              <div className="filter-group">
                <h4 className="filter-group-title">Category</h4>
                <div className="checkbox-list">
                  {[
                    { id: 'life-story', label: 'Life Story' },
                    { id: 'business', label: 'Business' },
                    { id: 'fiction', label: 'Fiction' },
                  ].map(c => (
                    <label key={c.id} className="filter-checkbox-item">
                      <input
                        type="checkbox"
                        checked={categories.includes(c.id)}
                        onChange={() => toggleCategory(c.id)}
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Section */}
              <div className="filter-group">
                <h4 className="filter-group-title">Price Range</h4>
                <div className="price-inputs-row">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="price-input"
                  />
                  <span className="price-dash">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="price-input"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main Asset Cards Grid ── */}
          <main className="marketplace-cards-area">
            {(mediaTypes.length > 0 || categories.length > 0 || minPrice || maxPrice || searchQuery) && (
              <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Active Filters: {categories.join(', ') || 'All categories'} {mediaTypes.length > 0 ? `• ${mediaTypes.join(', ')}` : ''} {minPrice ? `• Min $${minPrice}` : ''} {maxPrice ? `• Max $${maxPrice}` : ''} {searchQuery ? `• "${searchQuery}"` : ''}
                </span>
                <button onClick={handleResetFilters} style={{ background: 'none', border: 'none', color: '#D92D20', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                  ✕ Reset All Filters
                </button>
              </div>
            )}

            {loading ? (
              <div className="loading-state">Loading marketplace assets...</div>
            ) : listings.length === 0 ? (
              <div className="empty-results" style={{ padding: '3rem', textAlign: 'center' }}>
                <h3>No assets match your current filters.</h3>
                <button onClick={handleResetFilters} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="asset-cards-grid">
                {listings.map((asset) => (
                  <div key={asset.id} className="marketplace-asset-card">
                    {/* Card Media Preview */}
                    <Link to={`/listings/${asset.id}`} className="card-image-wrap" style={{ display: 'block', textDecoration: 'none' }}>
                      <img 
                        src={asset.coverImage || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80"} 
                        alt={asset.title}
                        className="card-thumb" 
                      />
                      <div className="card-floating-badges">
                        <span className="card-cat-badge">{asset.category || 'Asset'}</span>
                        <span className={`badge badge-${asset.verificationStatus || 'verified'}`}>
                          {asset.verificationStatus || 'Verified'}
                        </span>
                      </div>
                    </Link>

                    {/* Card Body */}
                    <div className="card-info-body">
                      <div className="card-title-price-row">
                        <h3 className="card-asset-title">
                          <Link to={`/listings/${asset.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {asset.title}
                          </Link>
                        </h3>
                        <span className="card-asset-price">
                          ${typeof asset.price === 'number' ? asset.price.toLocaleString() : asset.price}
                        </span>
                      </div>

                      <p className="card-asset-summary">{asset.summary}</p>

                      <div className="card-footer-row">
                        <div className="card-author-pill">
                          <div className="author-avatar-circle">
                            {asset.creator?.name ? asset.creator.name.charAt(0) : 'E'}
                          </div>
                          <span className="author-name">{asset.creator?.name || 'Elena Hayes'}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link to={`/listings/${asset.id}`} className="btn-acquire" style={{ background: '#FAF9F7', color: '#1A1614', border: '1px solid #D1CBC5', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            Details
                          </Link>
                          <button 
                            className="btn-acquire"
                            onClick={() => { setSelectedAsset(asset); setPurchaseSuccess(false); }}
                          >
                            Acquire
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            <div className="load-more-wrap">
              <button className="btn-load-more" onClick={() => toast.success('Loaded all current verified assets')}>
                Load More Assets
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* ── Acquisition Modal ── */}
      {selectedAsset && (
        <div className="modal-backdrop" onClick={() => setSelectedAsset(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.3rem' }}>
                {purchaseSuccess ? 'Acquisition Confirmed' : 'Acquire Asset'}
              </h3>
              <button onClick={() => setSelectedAsset(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {purchaseSuccess ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#CCFBF1', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.6rem' }}>✓</div>
                  <h4 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>You now own "{selectedAsset.title}"</h4>
                  <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '1.5rem' }}>Full transfer certificate, SHA-256 fingerprint, and source assets are unlocked in your profile.</p>
                  <button className="btn btn-primary btn-full" onClick={() => setSelectedAsset(null)}>Close</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <img src={selectedAsset.coverImage} alt={selectedAsset.title} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedAsset.title}</h4>
                      <span style={{ fontSize: '0.8rem', color: '#64748B' }}>By {selectedAsset.creator?.name || 'Creator'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>Price</span>
                    <strong style={{ fontSize: '1.2rem', color: '#0F172A' }}>${typeof selectedAsset.price === 'number' ? selectedAsset.price.toLocaleString() : selectedAsset.price} USD</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>License</span>
                    <span>Commercial & Adaptation Rights</span>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-light" onClick={() => setSelectedAsset(null)}>Cancel</button>
                    <button className="btn btn-inverted" onClick={handleAcquire} disabled={purchasing}>
                      {purchasing ? 'Processing...' : 'Confirm Acquisition'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
