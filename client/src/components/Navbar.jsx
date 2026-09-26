import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuth, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasNotif, setHasNotif] = useState(true);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/buy?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/buy');
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return 'active';
    if (path === '/sell' && (location.pathname === '/sell' || location.pathname === '/dashboard')) return 'active';
    if (path === '/buy' && (location.pathname === '/buy' || location.pathname === '/marketplace')) return 'active';
    if (path === '/collaborate' && location.pathname === '/collaborate') return 'active';
    if (path === '/admin' && location.pathname === '/admin') return 'active';
    return '';
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="site-header-wrapper">
      {/* Top Brand Bar */}
      <div className="top-brand-bar">
        <div className="top-brand-inner">
          <Link to="/" className="perini-brand-logo">
            <span className="perini-logo-text">Anti</span>
            <span className="perini-logo-sub">gravity</span>
          </Link>
          <div className="top-brand-tagline">
            <span className="tagline-main">WHERE VISION DEFIES LIMITS</span>
            <span className="tagline-sub">for creative assets &amp; verified intellectual property</span>
          </div>
        </div>
      </div>

      {/* Segmented Stone Navigation Bar */}
      <div className="site-nav-bar">
        <div className="header-container">
          <nav className="header-nav">
            <Link to="/" className={`nav-tab ${isActive('/')}`}>WELCOME</Link>
            <Link to="/sell" className={`nav-tab ${isActive('/sell')}`}>CREATE &amp; SELL</Link>
            <Link to="/buy" className={`nav-tab ${isActive('/buy')}`}>DISCOVER &amp; BUY</Link>
            <Link to="/collaborate" className={`nav-tab ${isActive('/collaborate')}`}>COLLABORATE</Link>
          </nav>

          {/* Search Bar with dedicated Search Button */}
          <form className="header-search-form" onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search IP, scripts, blueprints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <button type="submit" className="search-submit-btn" title="Search all assets">
              Search
            </button>
          </form>

          {/* Right Red Action Button */}
          <div className="header-actions">
            <Link to="/buy" className="btn-wishlist-red">
              <span>♥</span> VIEW ASSETS
            </Link>
          {/* Upload Button */}
          <Link to="/sell" className="btn-upload">
            Upload
          </Link>

          {/* Notifications Bell */}
          <div className="notif-wrapper">
            <button 
              className="icon-btn" 
              onClick={() => { setShowNotifMenu(!showNotifMenu); setShowUserMenu(false); setHasNotif(false); }} 
              aria-label="Notifications"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {hasNotif && <span className="notif-dot" />}
            </button>

            {showNotifMenu && (
              <div className="notif-dropdown">
                <div className="notif-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Notifications</span>
                  <button onClick={() => setHasNotif(false)} style={{ background: 'none', border: 'none', color: '#D92D20', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                    Mark all read
                  </button>
                </div>
                <div className="notif-item unread">
                  <div className="notif-avatar">SJ</div>
                  <div className="notif-text">
                    <strong>Sarah Jenkins</strong> requested to collaborate on <em>Neon Genesis Adaptation</em>
                    <span className="notif-time">2h ago</span>
                  </div>
                </div>
                <div className="notif-item">
                  <div className="notif-avatar">NE</div>
                  <div className="notif-text">
                    Your asset <em>The Silicon Blueprint</em> was verified by Admin.
                    <span className="notif-time">5h ago</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Account / Role Badge & Dropdown */}
          {isAuth ? (
            <div className="user-profile-wrapper">
              <button 
                className="user-profile-btn" 
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifMenu(false); }}
              >
                <div className="user-avatar-circle">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{user?.name?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <span className={`badge badge-role ${user?.role === 'admin' ? 'badge-archived' : ''}`}>
                  {user?.role?.toUpperCase() || 'CREATOR'}
                </span>
              </button>

              {showUserMenu && (
                <div className="user-dropdown-menu">
                  <div className="user-dropdown-header">
                    <strong>{user?.name}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <div className="user-dropdown-links">
                    <Link to="/sell" onClick={() => setShowUserMenu(false)}>Creator Studio (Sell)</Link>
                    <Link to="/buy" onClick={() => setShowUserMenu(false)}>Marketplace (Buy)</Link>
                    <Link to="/collaborate" onClick={() => setShowUserMenu(false)}>Project Board (Collaborate)</Link>
                    {user?.id && (
                      <Link to={`/profile/${user.id}`} onClick={() => setShowUserMenu(false)}>My Profile</Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link to="/admin" onClick={() => setShowUserMenu(false)} style={{ color: '#D92D20', fontWeight: 700 }}>
                        🛡️ Admin Control Center
                      </Link>
                    )}
                    <Link to="/signin" onClick={() => setShowUserMenu(false)} style={{ color: '#4F46E5' }}>Switch Role / Verify Code</Link>
                  </div>
                  <div className="user-dropdown-footer">
                    <button onClick={handleLogout} className="btn-dropdown-logout">Sign Out</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/signin" className="btn-signin-nav">
              Verify & Login
            </Link>
          )}
          </div>
        </div>
      </div>
    </header>
  );
}
