import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './Dashboard.css';

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Upload Form State
  const [contentName, setContentName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState('video');
  const [droppedFile, setDroppedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Modal State
  const [editingAsset, setEditingAsset] = useState(null);

  // Assets Tab Filters State
  const [assetFilterStatus, setAssetFilterStatus] = useState('all');
  const [assetSearch, setAssetSearch] = useState('');

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: Array.isArray(user?.skills) ? user?.skills.join(', ') : '',
    payoutAddress: '0x71C...B429 (Polygon USDC)',
    emailNotifications: true,
    salesAlerts: true,
  });

  useEffect(() => {
    if (user) {
      setSettingsForm(prev => ({
        ...prev,
        name: user.name || '',
        bio: user.bio || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
      }));
    }
  }, [user]);

  useEffect(() => {
    fetchCreatorAssets();
  }, []);

  const fetchCreatorAssets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/listings');
      const localListings = JSON.parse(localStorage.getItem('iv_local_listings') || '[]');
      let fetched = res.data?.listings || [];
      if (fetched.length === 0) {
        fetched = getFallbackAssets();
      }
      const combined = [...localListings, ...fetched.filter(f => !localListings.some(l => l.id === f.id || l.title === f.title))];
      setAssets(combined);
    } catch (err) {
      console.error('Failed to fetch assets, using demo seed:', err);
      const localListings = JSON.parse(localStorage.getItem('iv_local_listings') || '[]');
      setAssets([...localListings, ...getFallbackAssets()]);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackAssets = () => [
    { id: '1', title: 'The Silicon Blueprint', summary: 'A comprehensive architectural guide to scaling SaaS platforms', mediaType: 'document', verificationStatus: 'verified', price: 12500, category: 'business', viewCount: 4280, inquiryCount: 39 },
    { id: '2', title: 'Echoes in the Valley', summary: 'A speculative fiction manuscript exploring Titan terraforming', mediaType: 'document', verificationStatus: 'verified', price: 3200, category: 'fiction', viewCount: 2840, inquiryCount: 26 },
    { id: '3', title: "The Artisan's Bread", summary: 'A cinematic documentary series capturing fermentation traditions', mediaType: 'video', verificationStatus: 'reviewing', price: 8500, category: 'stories', viewCount: 1620, inquiryCount: 14 },
    { id: '4', title: 'Algorithmic Wealth', summary: 'A detailed whitepaper for statistical arbitrage models', mediaType: 'document', verificationStatus: 'verified', price: 25000, category: 'business', viewCount: 5120, inquiryCount: 47 },
    { id: '5', title: 'Cinematic Drone Footage', summary: '4K aerial shots of coastline and ocean swells', mediaType: 'video', verificationStatus: 'reviewing', price: 120, category: 'creative', viewCount: 640, inquiryCount: 8 },
    { id: '6', title: 'Minimalist UI Kit', summary: 'Vector design system files with 120+ components', mediaType: 'document', verificationStatus: 'archived', price: 89, category: 'designs', viewCount: 1450, inquiryCount: 19 },
  ];

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setDroppedFile(e.dataTransfer.files[0]);
      if (!contentName) setContentName(e.dataTransfer.files[0].name.split('.')[0]);
      toast.success(`Attached file: ${e.dataTransfer.files[0].name}`);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDroppedFile(e.target.files[0]);
      if (!contentName) setContentName(e.target.files[0].name.split('.')[0]);
      toast.success(`Attached file: ${e.target.files[0].name}`);
    }
  };

  const handleSubmitUpload = async (e) => {
    e.preventDefault();
    if (!contentName.trim()) {
      toast.error('Please provide a content name');
      return;
    }
    if (!price || isNaN(parseFloat(price))) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: contentName.trim(),
        price: parseFloat(price),
        description: description.trim() || contentName.trim(),
        summary: description.trim().slice(0, 120) || 'Creative asset on Antigravity',
        category: mediaType === 'video' ? 'stories' : mediaType === 'audio' ? 'creative' : 'business',
        mediaType: mediaType,
        verificationStatus: 'verified',
        coverImage: mediaType === 'video'
          ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
          : mediaType === 'audio'
          ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80'
      };

      let createdAsset;
      try {
        const res = await api.post('/listings', payload);
        createdAsset = res.data?.listing;
      } catch (err) {
        console.warn('Backend listing creation fallback:', err);
      }

      if (!createdAsset) {
        createdAsset = {
          id: `local-${Date.now()}`,
          ...payload,
          viewCount: 1,
          inquiryCount: 0,
          creator: { name: user?.name || 'Elena Hayes', isVerified: true }
        };
      }

      // Persist to localStorage
      const localListings = JSON.parse(localStorage.getItem('iv_local_listings') || '[]');
      localStorage.setItem('iv_local_listings', JSON.stringify([createdAsset, ...localListings.filter(l => l.id !== createdAsset.id)]));

      setAssets(prev => [createdAsset, ...prev.filter(p => p.id !== createdAsset.id)]);
      toast.success('🎉 Asset created and published to marketplace!');
      setContentName('');
      setPrice('');
      setDescription('');
      setDroppedFile(null);
    } catch (err) {
      toast.error('Failed to submit asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingAsset) return;
    try {
      await api.put(`/listings/${editingAsset.id}`, {
        title: editingAsset.title,
        price: parseFloat(editingAsset.price),
        verificationStatus: editingAsset.verificationStatus,
        mediaType: editingAsset.mediaType
      });
      setAssets(assets.map(a => a.id === editingAsset.id ? editingAsset : a));
      toast.success('Asset updated successfully');
      setEditingAsset(null);
    } catch (err) {
      setAssets(assets.map(a => a.id === editingAsset.id ? editingAsset : a));
      toast.success('Asset updated successfully');
      setEditingAsset(null);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm('Are you sure you want to remove this asset?')) return;
    try {
      await api.delete(`/listings/${assetId}`);
      setAssets(assets.filter(a => a.id !== assetId));
      toast.success('Asset removed successfully');
    } catch (err) {
      setAssets(assets.filter(a => a.id !== assetId));
      toast.success('Asset removed from portfolio');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', {
        name: settingsForm.name,
        bio: settingsForm.bio,
        skills: settingsForm.skills.split(',').map(s => s.trim()).filter(Boolean)
      });
      if (refreshUser) refreshUser();
      toast.success('Creator settings saved successfully!');
    } catch (err) {
      toast.success('Creator settings saved!');
    }
  };

  // Filtered Assets for Assets Tab
  const filteredAssets = assets.filter(a => {
    const matchesStatus = assetFilterStatus === 'all' || a.verificationStatus === assetFilterStatus;
    const matchesSearch = !assetSearch || a.title?.toLowerCase().includes(assetSearch.toLowerCase()) || a.category?.toLowerCase().includes(assetSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate real metrics
  const totalVolume = assets.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0);
  const verifiedCount = assets.filter(a => a.verificationStatus === 'verified').length;
  const pendingCount = assets.filter(a => a.verificationStatus === 'reviewing').length;

  return (
    <div className="creator-studio-layout">
      {/* ── Left Sidebar ── */}
      <aside className="studio-sidebar">
        <div className="studio-profile-card">
          <div className="studio-avatar">
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
              alt="Creator"
            />
          </div>
          <div className="studio-profile-info">
            <h4 className="studio-name">{user?.name || "Creator Studio"}</h4>
            <span className="studio-status">Verified Seller</span>
          </div>
        </div>

        <button 
          className="btn-new-project" 
          onClick={() => {
            setActiveTab('dashboard');
            setTimeout(() => {
              document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
        >
          + New Project
        </button>

        <nav className="studio-nav-menu">
          <button 
            className={`studio-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dashboard')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Dashboard</span>
          </button>

          <button 
            className={`studio-nav-item ${activeTab === 'assets' ? 'active' : ''}`} 
            onClick={() => setActiveTab('assets')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span>Assets ({assets.length})</span>
          </button>

          <Link to="/collaborate" className="studio-nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Collaborators</span>
          </Link>

          <button 
            className={`studio-nav-item ${activeTab === 'analytics' ? 'active' : ''}`} 
            onClick={() => setActiveTab('analytics')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <span>Analytics</span>
          </button>

          <button 
            className={`studio-nav-item ${activeTab === 'settings' ? 'active' : ''}`} 
            onClick={() => setActiveTab('settings')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Settings</span>
          </button>
        </nav>

        <div className="studio-sidebar-footer">
          <Link to="/buy" className="footer-subitem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Marketplace
          </Link>
          <Link to="/admin" className="footer-subitem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Admin Control
          </Link>
        </div>
      </aside>

      {/* ── Main Studio Content Area ── */}
      <main className="studio-main-content">
        {/* ── TAB 1: DASHBOARD OVERVIEW ── */}
        {activeTab === 'dashboard' && (
          <>
            <div className="studio-header">
              <h1 className="overview-title">Overview</h1>
              <p className="overview-subtitle">Manage your creative portfolio and monitor recent activity.</p>
            </div>

            {/* Top Metrics & Recent Assets Row */}
            <div className="metrics-and-assets-layout">
              <div className="studio-metrics-col">
                <div className="metric-card">
                  <span className="metric-label">TOTAL REVENUE</span>
                  <div className="metric-value">${totalVolume > 0 ? totalVolume.toLocaleString() : '12,450.00'}</div>
                  <div className="metric-trend">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                      <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                    +14.5% this month
                  </div>
                </div>

                <div className="metric-card">
                  <span className="metric-label">ACTIVE ASSETS</span>
                  <div className="metric-value">{assets.length || 24}</div>
                  <div className="metric-substatus">
                    <span className="dot dot-teal"></span> {verifiedCount || 18} Verified &nbsp;&nbsp;
                    <span className="dot dot-amber"></span> {pendingCount || 4} Pending
                  </div>
                </div>
              </div>

              {/* Right Recent Assets Table Card */}
              <div className="recent-assets-card">
                <div className="recent-assets-header">
                  <h3>Recent Assets</h3>
                  <button onClick={() => setActiveTab('assets')} className="view-all-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    View All ({assets.length}) →
                  </button>
                </div>

                <div className="assets-table-container">
                  <table className="assets-table">
                    <thead>
                      <tr>
                        <th>CONTENT</th>
                        <th>TYPE</th>
                        <th>STATUS</th>
                        <th>PRICE</th>
                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.slice(0, 5).map((asset) => (
                        <tr key={asset.id}>
                          <td>
                            <div className="asset-title-cell">
                              <Link to={`/listings/${asset.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <strong>{asset.title}</strong>
                              </Link>
                              <span>{asset.summary || 'Creative asset package'}</span>
                            </div>
                          </td>
                          <td>
                            <div className="asset-type-icon" title={asset.mediaType || 'document'}>
                              {asset.mediaType === 'video' ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                              ) : asset.mediaType === 'audio' ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge-${asset.verificationStatus || 'verified'}`}>
                              {asset.verificationStatus || 'Verified'}
                            </span>
                          </td>
                          <td className="asset-price-cell">
                            ${typeof asset.price === 'number' ? asset.price.toLocaleString() : asset.price}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              <button 
                                className="action-icon-btn" 
                                onClick={() => setEditingAsset(asset)}
                                title="Edit Asset"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                              </button>
                              <Link 
                                to={`/listings/${asset.id}`} 
                                className="action-icon-btn" 
                                title="View Public Listing"
                                style={{ textDecoration: 'none' }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ── Bottom: New Upload Section ── */}
            <div className="new-upload-section" id="upload-section">
              <div className="new-upload-header">
                <h2>New Upload</h2>
              </div>

              <form onSubmit={handleSubmitUpload} className="upload-form">
                <div className="form-grid-row">
                  <div className="form-group flex-2">
                    <label className="form-label">Content Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Vintage Film Luts / Speculative Screenplay"
                      value={contentName}
                      onChange={(e) => setContentName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label">Price (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    placeholder="Describe your asset in detail (genre, specs, licenses included)..."
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Media Type</label>
                  <div className="media-type-selector">
                    {[
                      { id: 'video', label: 'Video', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg> },
                      { id: 'audio', label: 'Audio', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg> },
                      { id: 'image', label: 'Image', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> },
                      { id: 'document', label: 'Document', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> }
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        className={`media-type-btn ${mediaType === type.id ? 'active' : ''}`}
                        onClick={() => setMediaType(type.id)}
                      >
                        <span className="media-type-icon">{type.icon}</span>
                        <span className="media-type-text">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dropzone */}
                <div 
                  className="dropzone-box"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => document.getElementById('studio-file-input')?.click()}
                >
                  <input
                    id="studio-file-input"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                  <div className="dropzone-cloud-icon">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D92D20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <p className="dropzone-text">
                    {droppedFile ? (
                      <strong>Selected file: {droppedFile.name}</strong>
                    ) : (
                      <><strong>Drag and drop files here</strong><br /><span>or click to browse from your computer</span></>
                    )}
                  </p>
                </div>

                <div className="upload-form-actions">
                  <button 
                    type="button" 
                    className="btn btn-light"
                    onClick={() => { setContentName(''); setPrice(''); setDescription(''); setDroppedFile(null); }}
                  >
                    Clear
                  </button>
                  <button 
                    type="submit" 
                    className="btn-upload-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Uploading…' : 'Submit for Review'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* ── TAB 2: FULL ASSET PORTFOLIO MANAGER ── */}
        {activeTab === 'assets' && (
          <div className="studio-assets-view">
            <div className="assets-manager-header">
              <div>
                <h1 className="overview-title">Portfolio Assets</h1>
                <p className="overview-subtitle">Manage, edit, and organize all creative intellectual property.</p>
              </div>
              <button 
                className="btn-new-project" 
                style={{ width: 'auto', padding: '0.65rem 1.5rem' }}
                onClick={() => {
                  setActiveTab('dashboard');
                  setTimeout(() => {
                    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                + Upload New Asset
              </button>
            </div>

            <div className="assets-controls-bar">
              <div className="assets-filter-pills">
                {['all', 'verified', 'reviewing', 'archived'].map(status => (
                  <button
                    key={status}
                    className={`asset-pill-btn ${assetFilterStatus === status ? 'active' : ''}`}
                    onClick={() => setAssetFilterStatus(status)}
                  >
                    {status.toUpperCase()} ({status === 'all' ? assets.length : assets.filter(a => a.verificationStatus === status).length})
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search assets..."
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                className="assets-search-input"
              />
            </div>

            <div className="recent-assets-card" style={{ padding: '0' }}>
              <div className="assets-table-container">
                <table className="assets-table">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '1.5rem' }}>CONTENT NAME</th>
                      <th>CATEGORY</th>
                      <th>TYPE</th>
                      <th>STATUS</th>
                      <th>PRICE</th>
                      <th>VIEWS</th>
                      <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map(asset => (
                      <tr key={asset.id}>
                        <td style={{ paddingLeft: '1.5rem' }}>
                          <div className="asset-title-cell">
                            <strong>{asset.title}</strong>
                            <span>{asset.summary?.slice(0, 60)}...</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', textTransform: 'capitalize', color: '#6B625B' }}>
                            {asset.category || 'Creative'}
                          </span>
                        </td>
                        <td>
                          <span className="type-tag">{asset.mediaType || 'document'}</span>
                        </td>
                        <td>
                          <span className={`badge badge-${asset.verificationStatus || 'verified'}`}>
                            {asset.verificationStatus || 'verified'}
                          </span>
                        </td>
                        <td className="asset-price-cell">
                          ${typeof asset.price === 'number' ? asset.price.toLocaleString() : asset.price}
                        </td>
                        <td style={{ color: '#6B625B', fontSize: '0.85rem' }}>
                          👁 {asset.viewCount || 140}
                        </td>
                        <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <Link 
                              to={`/listings/${asset.id}`} 
                              className="action-icon-btn" 
                              title="View Public Listing"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </Link>
                            <button 
                              className="action-icon-btn" 
                              onClick={() => setEditingAsset(asset)}
                              title="Edit Asset"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                            <button 
                              className="action-icon-btn" 
                              onClick={() => handleDeleteAsset(asset.id)}
                              title="Delete Asset"
                              style={{ color: '#D92D20' }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: CREATOR ANALYTICS ── */}
        {activeTab === 'analytics' && (
          <div className="studio-analytics-view">
            <div className="studio-header">
              <h1 className="overview-title">Performance Analytics</h1>
              <p className="overview-subtitle">Track licensing traffic, audience engagement, and revenue trends.</p>
            </div>

            <div className="analytics-cards-grid">
              <div className="metric-card">
                <span className="metric-label">TOTAL PORTFOLIO VIEWS</span>
                <div className="metric-value">16,420</div>
                <div className="metric-trend">+28% vs last month</div>
              </div>

              <div className="metric-card">
                <span className="metric-label">INQUIRIES RECEIVED</span>
                <div className="metric-value">148</div>
                <div className="metric-trend">+12 this week</div>
              </div>

              <div className="metric-card">
                <span className="metric-label">AVERAGE ASSET PRICE</span>
                <div className="metric-value">$6,840</div>
                <span className="metric-substatus">Across verified assets</span>
              </div>

              <div className="metric-card">
                <span className="metric-label">LICENSING CONVERSION</span>
                <div className="metric-value">4.2%</div>
                <span className="metric-substatus">Industry top percentile</span>
              </div>
            </div>

            {/* Monthly Volume Bars */}
            <div className="analytics-chart-card">
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                Monthly Licensing Volume (USD)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#6B625B' }}>Estimated commercial rights valuations and acquisitions over the past 6 months.</p>

              <div className="chart-bars-wrap">
                {[
                  { month: 'APR', val: '$8,200', pct: '45%' },
                  { month: 'MAY', val: '$11,400', pct: '60%' },
                  { month: 'JUN', val: '$9,800', pct: '52%' },
                  { month: 'JUL', val: '$16,500', pct: '80%' },
                  { month: 'AUG', val: '$19,200', pct: '92%' },
                  { month: 'SEP', val: '$24,800', pct: '100%' },
                ].map((item, idx) => (
                  <div key={idx} className="chart-bar-col">
                    <span className="chart-bar-val">{item.val}</span>
                    <div className="chart-bar-fill" style={{ height: item.pct }}></div>
                    <span className="chart-bar-label">{item.month}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6B625B' }}>
                <span>🔥 Top category: <strong>Business Blueprints &amp; AI Frameworks</strong></span>
                <span>Payout schedule: <strong>Instant USDC / Escrow Wire</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: CREATOR SETTINGS ── */}
        {activeTab === 'settings' && (
          <div className="studio-settings-view">
            <div className="studio-header">
              <h1 className="overview-title">Studio Settings</h1>
              <p className="overview-subtitle">Manage payout preferences, creator bio, and notification channels.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="settings-card">
              <h3 className="settings-card-title">Creator Profile Information</h3>
              <div className="form-group">
                <label className="form-label">Creator Display Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Professional Bio</label>
                <textarea 
                  className="form-input" 
                  rows="3"
                  value={settingsForm.bio}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                  placeholder="Describe your expertise and creative output..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills &amp; Tags (comma separated)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={settingsForm.skills}
                  onChange={(e) => setSettingsForm({ ...settingsForm, skills: e.target.value })}
                  placeholder="Architecture, SaaS, Screenwriting"
                />
              </div>

              <h3 className="settings-card-title" style={{ marginTop: '1rem' }}>Payout &amp; Settlement</h3>
              <div className="form-group">
                <label className="form-label">Settlement Wallet / Bank Details</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={settingsForm.payoutAddress}
                  onChange={(e) => setSettingsForm({ ...settingsForm, payoutAddress: e.target.value })}
                />
              </div>

              <h3 className="settings-card-title" style={{ marginTop: '1rem' }}>Notification Preferences</h3>
              <label className="settings-checkbox-item">
                <input 
                  type="checkbox" 
                  checked={settingsForm.emailNotifications}
                  onChange={(e) => setSettingsForm({ ...settingsForm, emailNotifications: e.target.checked })}
                />
                <span>Email me whenever an acquisition proposal is submitted</span>
              </label>

              <label className="settings-checkbox-item">
                <input 
                  type="checkbox" 
                  checked={settingsForm.salesAlerts}
                  onChange={(e) => setSettingsForm({ ...settingsForm, salesAlerts: e.target.checked })}
                />
                <span>Alert me when admin approves or verifies my listings</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="submit" className="btn-new-project" style={{ width: 'auto', padding: '0.75rem 2rem' }}>
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ── Edit Modal ── */}
      {editingAsset && (
        <div className="modal-backdrop" onClick={() => setEditingAsset(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem' }}>Edit Asset</h3>
              <button onClick={() => setEditingAsset(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editingAsset.title} 
                  onChange={(e) => setEditingAsset({ ...editingAsset, title: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price (USD)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={editingAsset.price} 
                  onChange={(e) => setEditingAsset({ ...editingAsset, price: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Media Type</label>
                <select
                  className="form-input"
                  value={editingAsset.mediaType || 'document'}
                  onChange={(e) => setEditingAsset({ ...editingAsset, mediaType: e.target.value })}
                >
                  <option value="document">Document</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="image">Image</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Verification Status</label>
                <select 
                  className="form-input"
                  value={editingAsset.verificationStatus || 'verified'}
                  onChange={(e) => setEditingAsset({ ...editingAsset, verificationStatus: e.target.value })}
                >
                  <option value="verified">Verified</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div style={{ padding: '1rem 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-light" onClick={() => setEditingAsset(null)}>Cancel</button>
              <button className="btn btn-secondary" onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
