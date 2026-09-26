import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function SignIn() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'creator';

  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1); // 1 = Enter Gmail, 2 = Enter 6-digit code
  const [loading, setLoading] = useState(false);
  const [codePreview, setCodePreview] = useState(null);
  const [timer, setTimer] = useState(0);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [usePasswordLogin, setUsePasswordLogin] = useState(false);

  const { sendVerificationCode, verifyCodeAndLogin, loginWithGoogle, login } = useAuth();
  const navigate = useNavigate();

  // Public roles
  const roles = [
    {
      id: 'creator',
      title: 'Creator',
      badge: 'Sell & Monetize',
      desc: 'Publish scripts, media & blueprints to global buyers',
      target: '/sell',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    {
      id: 'buyer',
      title: 'Buyer',
      badge: 'Acquire & Invest',
      desc: 'Browse verified creative assets, stories & commercial IP',
      target: '/buy',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      )
    },
    {
      id: 'collaborator',
      title: 'Collaborator',
      badge: 'Co-Build & Partner',
      desc: 'Join active productions, ventures & podcasts',
      target: '/collaborate',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    }
  ];

  // Pre-configured Google Accounts for simulation
  const googleAccounts = [
    {
      name: 'Elena Hayes',
      email: 'elena.hayes@gmail.com',
      role: 'creator',
      target: '/sell',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'Marcus Vance',
      email: 'marcus.vance@gmail.com',
      role: 'creator',
      target: '/sell',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@gmail.com',
      role: 'collaborator',
      target: '/collaborate',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'Alex Mercer (Buyer)',
      email: 'alex.mercer@gmail.com',
      role: 'buyer',
      target: '/buy',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    }
  ];

  const handleSelectGoogleAccount = async (acct) => {
    setShowGoogleModal(false);
    setLoading(true);
    const res = await loginWithGoogle(acct);
    setLoading(false);
    if (res.success) {
      toast.success(`Signed in with Google as ${acct.name}!`);
      navigate(acct.target || '/sell');
    } else {
      toast.error('Google authentication failed');
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!customGoogleEmail || !customGoogleEmail.includes('@')) {
      toast.error('Please enter a valid Google email');
      return;
    }
    const acct = {
      name: customGoogleEmail.split('@')[0],
      email: customGoogleEmail,
      role: role || 'creator',
      target: role === 'buyer' ? '/buy' : role === 'collaborator' ? '/collaborate' : '/sell',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    handleSelectGoogleAccount(acct);
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid Gmail address');
      return;
    }

    setLoading(true);
    const res = await sendVerificationCode(email, role, name);
    setLoading(false);

    if (res.success) {
      toast.success(`Verification code sent to ${email}`);
      setCodePreview(res.codePreview || null);
      setStep(2);
      setTimer(60);
      const interval = setInterval(() => {
        setTimer(t => {
          if (t <= 1) { clearInterval(interval); return 0; }
          return t - 1;
        });
      }, 1000);
    } else {
      toast.error(res.message || 'Failed to send verification code');
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code || code.trim().length < 6) {
      toast.error('Please enter the full 6-digit verification code');
      return;
    }

    setLoading(true);
    const res = await verifyCodeAndLogin(email, code.trim(), role, name);
    setLoading(false);

    if (res.success) {
      toast.success(`Successfully verified as ${role.toUpperCase()}!`);
      const targetRoleObj = roles.find(r => r.id === role);
      navigate(targetRoleObj?.target || '/sell');
    } else {
      toast.error(res.message || 'Invalid verification code');
    }
  };

  const handlePasswordLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in both email and password');
      return;
    }
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      toast.success('Signed in successfully!');
      const targetRoleObj = roles.find(r => r.id === role);
      navigate(targetRoleObj?.target || '/sell');
    } else {
      toast.error(res.message || 'Invalid email or password');
    }
  };

  const selectedRoleObj = roles.find(r => r.id === role) || roles[0];

  return (
    <div className="auth-verification-page">
      <div className="auth-card-wrapper">
        {/* Header */}
        <div className="auth-header">
          <Link to="/" className="auth-brand-logo">Creativity</Link>
          <h1 className="auth-title">
            {step === 1 ? 'Sign In & Select Role' : 'Enter Gmail Verification Code'}
          </h1>
          <p className="auth-subtitle">
            {step === 1 
              ? 'Choose your platform role, continue with Google, or verify with your Gmail.'
              : `We sent a 6-digit security code to ${email}`}
          </p>
        </div>

        {/* ── STEP 1: Main Auth Options ── */}
        {step === 1 && (
          <div className="auth-form-body">
            {/* 1. Continue with Google Button */}
            <button 
              type="button" 
              className="btn-google-auth"
              onClick={() => setShowGoogleModal(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="auth-divider-line">OR CHOOSE ROLE &amp; VERIFY GMAIL</div>

            {/* Role Selection Grid */}
            <div className="role-selection-section">
              <label className="form-label">Choose Your Platform Role</label>
              <div className="roles-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`role-option-card ${role === r.id ? 'active' : ''}`}
                    onClick={() => setRole(r.id)}
                  >
                    <div className="role-card-top">
                      <div className="role-icon-circle">{r.icon}</div>
                      <span className="role-badge-chip">{r.badge}</span>
                    </div>
                    <strong className="role-title-text">{r.title}</strong>
                    <span className="role-desc-text">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {usePasswordLogin ? (
              <form onSubmit={handlePasswordLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                  {loading ? 'Authenticating...' : `Sign In to ${selectedRoleObj.title} Panel →`}
                </button>
                <button type="button" onClick={() => setUsePasswordLogin(false)} className="btn-link" style={{ textAlign: 'center' }}>
                  ← Switch back to 6-Digit Gmail Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div className="form-group">
                  <label className="form-label">Gmail / Email Address</label>
                  <div className="input-with-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="input-icon">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <input
                      type="email"
                      className="form-input has-icon"
                      placeholder="yourname@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name or Alias (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Elena Hayes"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-full btn-lg"
                  disabled={loading}
                >
                  {loading ? 'Sending Code...' : `Send 6-Digit Code for ${selectedRoleObj.title} Panel →`}
                </button>

                <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
                  <button type="button" onClick={() => setUsePasswordLogin(true)} className="btn-link">
                    Or sign in with existing Password
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ── STEP 2: Enter 6-Digit Gmail OTP ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="auth-form-body">
            {codePreview && (
              <div className="demo-code-banner">
                <span>🔑 Demo Gmail OTP:</span>
                <strong onClick={() => setCode(codePreview)} title="Click to fill">
                  {codePreview} (Click to Autofill)
                </strong>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ textAlign: 'center' }}>
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                maxLength="6"
                className="form-input otp-digits-input"
                placeholder="••••••"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                autoFocus
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-secondary btn-full btn-lg"
              disabled={loading || code.length < 6}
            >
              {loading ? 'Verifying...' : `Verify Code & Enter ${selectedRoleObj.title} Panel`}
            </button>

            <div className="auth-actions-footer">
              {timer > 0 ? (
                <span className="timer-text">Resend code in {timer}s</span>
              ) : (
                <button type="button" onClick={handleSendCode} className="btn-link">
                  Resend Verification Code
                </button>
              )}
              <span className="dot-divider">•</span>
              <button type="button" onClick={() => { setStep(1); setCode(''); }} className="btn-link">
                Change Role or Email
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Google Account Chooser Modal ── */}
      {showGoogleModal && (
        <div className="modal-backdrop" onClick={() => setShowGoogleModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', fontWeight: 700 }}>Choose a Google Account</h3>
              </div>
              <button onClick={() => setShowGoogleModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1rem' }}>
                to continue to <strong style={{ color: '#FFFFFF' }}>Creativity</strong>
              </p>

              <div className="google-account-list">
                {googleAccounts.map((acct, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="google-account-item"
                    onClick={() => handleSelectGoogleAccount(acct)}
                  >
                    <img src={acct.avatar} alt={acct.name} className="google-avatar-img" />
                    <div className="google-account-info">
                      <span className="google-user-name">{acct.name}</span>
                      <span className="google-user-email">{acct.email}</span>
                    </div>
                    <span className="google-role-badge">{acct.role.toUpperCase()}</span>
                  </button>
                ))}
              </div>

              <div className="auth-divider-line">OR ENTER ANOTHER GOOGLE ACCOUNT</div>

              <form onSubmit={handleCustomGoogleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="yourname@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  style={{ background: '#0D1527', color: '#FFFFFF' }}
                />
                <button type="submit" className="btn btn-secondary btn-full">
                  Continue with this Account →
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
