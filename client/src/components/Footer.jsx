import { Link } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success('Thank you for subscribing to our verified IP catalog updates!');
    setEmail('');
  };

  return (
    <footer className="perini-footer-wrapper">
      {/* ── Top Newsletter / For Professionals Strip ── */}
      <div className="for-professionals-bar">
        <div className="for-prof-inner">
          <div className="for-prof-titles">
            <h3 className="for-prof-heading">FOR CREATORS &amp; STUDIOS</h3>
            <p className="for-prof-sub">Sign up for our newsletter for monthly updates on verified IP trends and industry specials</p>
          </div>

          <form onSubmit={handleSubscribe} className="for-prof-form">
            <input
              type="email"
              placeholder="ENTER EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="for-prof-input"
            />
            <button type="submit" className="btn-prof-signup">
              SIGN UP
            </button>
          </form>
        </div>
      </div>

      {/* ── Bottom Slate Blue Mediterranean Footer ── */}
      <div className="slate-footer-bar">
        <div className="slate-footer-inner">
          {/* Col 1: Links */}
          <div className="slate-col">
            <Link to="/">WELCOME</Link>
            <Link to="/sell">CREATE &amp; SELL</Link>
            <Link to="/buy">DISCOVER &amp; BUY</Link>
            <Link to="/collaborate">COLLABORATE</Link>
          </div>

          {/* Col 2: Info */}
          <div className="slate-col">
            <a href="#licensing">LICENSING</a>
            <a href="#blog">STUDIO BLOG</a>
            <a href="#contact">CONTACT US</a>
            <Link to="/buy">EXPLORE ASSETS</Link>
            <Link to="/admin" style={{ opacity: 0.75, fontSize: '0.78rem', color: '#CBD5E1' }}>🔒 ADMIN PORTAL</Link>
          </div>

          {/* Col 3: Social */}
          <div className="slate-col slate-social">
            <h4>CONNECT WITH US</h4>
            <div className="social-icons-row">
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="Twitter">t</a>
              <a href="#" aria-label="Pinterest">p</a>
              <a href="#" aria-label="Houzz">h</a>
            </div>
          </div>

          {/* Col 4: Studio Hub */}
          <div className="slate-col slate-address">
            <h4>ANTIGRAVITY HQ</h4>
            <p>615 Market St, Suite 400<br />San Francisco, CA 94105<br />(415) 890-2100</p>
          </div>

          {/* Col 5: Brand & Copyright */}
          <div className="slate-col slate-brand-col">
            <Link to="/" className="slate-logo">
              Antigravity
            </Link>
            <p className="slate-copy">
              Copyright © 2026 Antigravity. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .perini-footer-wrapper {
          width: 100%;
          position: relative;
          z-index: 10;
        }

        /* Top White Newsletter Bar */
        .for-professionals-bar {
          background: #FFFFFF;
          border-top: 1px solid #E5E0DB;
          border-bottom: 1px solid #E5E0DB;
          padding: 2.25rem 0;
        }

        .for-prof-inner {
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .for-prof-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.55rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: #1F2937;
          margin-bottom: 0.2rem;
        }

        .for-prof-sub {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 0.92rem;
          color: #6B7280;
          margin: 0;
        }

        .for-prof-form {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          max-width: 480px;
        }

        .for-prof-input {
          flex: 1;
          padding: 0.65rem 1rem;
          border: 1px solid #D1D5DB;
          border-radius: 2px;
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          color: #1F2937;
          outline: none;
          background: #FAFAFA;
        }

        .for-prof-input:focus {
          border-color: #D92D20;
          background: #FFFFFF;
        }

        .btn-prof-signup {
          padding: 0.65rem 1.6rem;
          background: #D92D20;
          color: #FFFFFF;
          border: none;
          border-radius: 2px;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: background 0.2s ease;
          white-space: nowrap;
        }

        .btn-prof-signup:hover {
          background: #B42318;
        }

        /* Bottom Slate Blue Bar */
        .slate-footer-bar {
          background: #5E899B;
          background-image: linear-gradient(180deg, #6490A2 0%, #527A8B 100%);
          padding: 3rem 0 3.5rem;
          color: #FFFFFF;
        }

        .slate-footer-inner {
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 2rem;
        }

        .slate-col {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .slate-col a {
          color: #FFFFFF;
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .slate-col a:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        .slate-col h4 {
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          color: #FFFFFF;
        }

        .slate-address p {
          font-size: 0.76rem;
          line-height: 1.6;
          color: #E2E8F0;
        }

        .social-icons-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .social-icons-row a {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 900;
          text-decoration: none;
          color: #FFFFFF;
        }

        .social-icons-row a:hover {
          background: #FFFFFF;
          color: #5E899B;
        }

        .slate-brand-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .slate-logo {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 1.8rem;
          font-weight: 900;
          color: #FFFFFF !important;
          text-decoration: none;
          letter-spacing: -0.03em;
        }

        .slate-copy {
          font-size: 0.72rem;
          color: #E2E8F0;
          line-height: 1.5;
        }

        @media (max-width: 960px) {
          .slate-footer-inner {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }
        }

        @media (max-width: 600px) {
          .slate-footer-inner {
            grid-template-columns: 1fr;
          }
          .for-prof-form {
            max-width: 100%;
          }
        }
      `}</style>
    </footer>
  );
}
