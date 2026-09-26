import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

// ── Marquee words for ticker strip
const marqueeItems = [
  'Life Stories', 'Novels', 'Screenplays', 'Business Ideas', 'Research',
  'Creative Concepts', 'Game Concepts', 'AI Software', 'Designs', 'Poetry',
  'Discoveries', 'Social Solutions', 'Educational Material', 'Courses & Skills',
];

// ═══════════════════════════════════════════════
// 13 HERO SLIDES — Intro + 12 Categories
// Full-HD Unsplash images, each category-matched
// ═══════════════════════════════════════════════
const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&auto=format&fit=crop&q=90',
    tag: '🌟 Creativity Platform',
    headline: 'Share Your Talent. Name It. Price It. Change the World.',
    desc: 'The ultimate platform for creators, buyers, and collaborators — where every story, idea, and skill finds its rightful audience and true value.',
    cta: 'Get Started Free',
    ctaLink: '/signup',
    accent: '#6366F1',
    hash: '0x8F42...E91C',
    liveOffer: '$45,000',
    creator: 'Elena Rostova',
    bids: '18 Active Bids'
  },
  {
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&auto=format&fit=crop&q=90',
    tag: '📖 Stories & Novels',
    headline: 'Your Story Deserves a Global Audience',
    desc: 'Publish fiction, memoirs, and narratives. Reach readers, literary agents, and publishers who will pay for your voice.',
    cta: 'List Your Story',
    ctaLink: '/sell',
    accent: '#6366F1',
    hash: '0x3D71...A420',
    liveOffer: '$12,500',
    creator: 'Julian Hayes',
    bids: '12 Publishers'
  },
  {
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&auto=format&fit=crop&q=90',
    tag: '🎬 Screenplays & Movie Concepts',
    headline: 'Lights, Camera — Your Vision on Screen',
    desc: 'The next Oscar-winning screenplay could be yours. Connect directly with directors, producers, and studios hungry for original stories.',
    cta: 'Sell Your Script',
    ctaLink: '/sell',
    accent: '#EC4899',
    hash: '0x99C2...771B',
    liveOffer: '$85,000',
    creator: 'R. Vance',
    bids: '3 Studios Attached'
  },
  {
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&auto=format&fit=crop&q=90',
    tag: '💡 Business Ideas',
    headline: 'Turn Your Concept Into Capital',
    desc: 'Find investors, partners, or buyers for your next big venture. Your business idea has more value than you think.',
    cta: 'Pitch Your Idea',
    ctaLink: '/sell',
    accent: '#F59E0B',
    hash: '0x55E1...890C',
    liveOffer: '$120,000',
    creator: 'Klaus Lindqvist',
    bids: '5 Angel Investors'
  },
  {
    image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1920&auto=format&fit=crop&q=90',
    tag: '🔬 Research & Discoveries',
    headline: 'Science That Deserves to Be Funded',
    desc: 'Share breakthroughs, discoveries, and academic findings. Monetize your intellectual contributions and reach global institutions.',
    cta: 'Share Your Research',
    ctaLink: '/sell',
    accent: '#10B981',
    hash: '0x1A44...09FE',
    liveOffer: '$65,000',
    creator: 'Dr. Aris Thorne',
    bids: 'Research Grant Ready'
  },
  {
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&auto=format&fit=crop&q=90',
    tag: '🧠 Creative Concepts',
    headline: 'If It Lives in Your Mind, It Belongs Here',
    desc: 'From art installations to cultural movements — your wildest creative concepts deserve a world-class stage and a paying audience.',
    cta: 'Upload Your Concept',
    ctaLink: '/sell',
    accent: '#8B5CF6',
    hash: '0x77B3...652A',
    liveOffer: '$28,000',
    creator: 'Mira Sato',
    bids: 'Exhibition Ready'
  },
  {
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&auto=format&fit=crop&q=90',
    tag: '🎮 Game Concepts',
    headline: 'Design Worlds. License Ideas. Build Empires.',
    desc: 'License your game mechanics, storylines, and world-building ideas to studios and indie developers worldwide.',
    cta: 'Sell Your Game Idea',
    ctaLink: '/sell',
    accent: '#EF4444',
    hash: '0x66D8...114F',
    liveOffer: '$50,000',
    creator: 'Alex Rivera',
    bids: 'Indie Studio Match'
  },
  {
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1920&auto=format&fit=crop&q=90',
    tag: '🤖 AI & Software Concepts',
    headline: 'Your Algorithm Could Be Worth Millions',
    desc: 'SaaS blueprints, AI models, software patents — sell your tech vision to the right buyer before someone else builds it first.',
    cta: 'List Your Tech Idea',
    ctaLink: '/sell',
    accent: '#06B6D4',
    hash: '0x22F0...883D',
    liveOffer: '$95,000',
    creator: 'David Zhao',
    bids: 'Tech Incubator Offer'
  },
  {
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&auto=format&fit=crop&q=90',
    tag: '🎨 Designs & Creative Work',
    headline: 'Art That Speaks, Sold Globally',
    desc: 'Visual art, UX concepts, fashion, and architecture. Let your creative portfolio earn for you 24/7 across the world.',
    cta: 'Showcase Your Work',
    ctaLink: '/sell',
    accent: '#F97316',
    hash: '0xCC81...55A2',
    liveOffer: '$34,000',
    creator: 'Chloe Moreau',
    bids: 'Brand Licensing'
  },
  {
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1920&auto=format&fit=crop&q=90',
    tag: '🌍 Social & Environmental Solutions',
    headline: 'Bold Ideas That Can Save the World',
    desc: 'Find NGOs, governments, and impact investors for your social innovations. Change begins with one idea shared at the right moment.',
    cta: 'Share Your Solution',
    ctaLink: '/sell',
    accent: '#059669',
    hash: '0xEE33...4490',
    liveOffer: '$70,000',
    creator: 'Amara Okafor',
    bids: 'Impact Fund Backed'
  },
  {
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&auto=format&fit=crop&q=90',
    tag: '📚 Educational Material',
    headline: 'Sell Knowledge to Institutions Globally',
    desc: 'Curricula, worksheets, training programs, and lesson plans that schools, universities, and companies will actively pay for.',
    cta: 'Upload Your Material',
    ctaLink: '/sell',
    accent: '#3B82F6',
    hash: '0x44B1...902C',
    liveOffer: '$22,000',
    creator: 'Prof. Sterling',
    bids: '8 Universities'
  },
  {
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1920&auto=format&fit=crop&q=90',
    tag: '✍️ Poetry & Writing',
    headline: 'Give Voice to Verse — Earn From Every Word',
    desc: 'Sell poetry collections, spoken word pieces, and literary art to publishers, collectors, and lovers of language across the globe.',
    cta: 'Publish Your Poetry',
    ctaLink: '/sell',
    accent: '#D946EF',
    hash: '0x88AA...33DF',
    liveOffer: '$18,000',
    creator: 'Maya Lin',
    bids: 'Press Commission'
  },
  {
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&auto=format&fit=crop&q=90',
    tag: '🎓 Courses & Skills',
    headline: 'Your Expertise Is Your Most Valuable Asset',
    desc: 'Package your knowledge into courses, workshops, and skill programs. Sell directly to eager learners and institutions worldwide.',
    cta: 'Create a Course',
    ctaLink: '/sell',
    accent: '#F59E0B',
    hash: '0x77E2...661A',
    liveOffer: '$42,000',
    creator: 'Erik Larson',
    bids: 'EdTech Network'
  },
];

// ── Content Categories with Professional Tool Visuals & Clear Information
const categories = [
  { 
    icon: '📖', 
    tool: 'Manuscript / ePub', 
    title: 'Stories & Novels', 
    desc: 'Publish fiction, non-fiction, memoirs, and narrative works. Direct studio & publisher matching with automated copyright timestamps.', 
    color: '#D92D20', 
    bg: '#FCE8E6' 
  },
  { 
    icon: '🎬', 
    tool: 'Final Draft / Fountain', 
    title: 'Screenplays & Movie Concepts', 
    desc: 'Pitch feature scripts, episodic pilots, and cinematic treatments directly to production houses, showrunners, and directors.', 
    color: '#D92D20', 
    bg: '#FCE8E6' 
  },
  { 
    icon: '💡', 
    tool: 'Pitch Deck / Model', 
    title: 'Business Ideas & Blueprints', 
    desc: 'Turn validated startup models and enterprise strategies into capital. Find co-founders, angels, or venture acquirers.', 
    color: '#C27D38', 
    bg: '#FBF2E9' 
  },
  { 
    icon: '🔬', 
    tool: 'Patent / Data Protocols', 
    title: 'Research & Discoveries', 
    desc: 'Share peer-reviewed findings, biotech formulations, and proprietary datasets. Monetize intellectual breakthroughs safely.', 
    color: '#0F766E', 
    bg: '#E6F4F2' 
  },
  { 
    icon: '🧠', 
    tool: 'Artistic Treatment', 
    title: 'Creative Concepts', 
    desc: 'Exhibition designs, spatial installations, and avant-garde creative direction protected under cryptographic escrow.', 
    color: '#7E746C', 
    bg: '#EFECE6' 
  },
  { 
    icon: '🎮', 
    tool: 'Unity / Unreal GDD', 
    title: 'Game Concepts & Lore', 
    desc: 'Game design documents, character bibles, and mechanics prototypes licensed to indie studios and AAA publishers.', 
    color: '#D92D20', 
    bg: '#FCE8E6' 
  },
  { 
    icon: '🤖', 
    tool: 'Algorithm / Python SDK', 
    title: 'AI & Software Blueprints', 
    desc: 'Proprietary machine learning pipelines, SaaS architectures, and algorithm patents sold with verified ownership chains.', 
    color: '#527D90', 
    bg: '#EBF2F5' 
  },
  { 
    icon: '🎨', 
    tool: 'Figma / 3D Assets', 
    title: 'Designs & Creative Work', 
    desc: 'Brand identity systems, architectural blueprints, UI design libraries, and 3D visual assets available for direct licensing.', 
    color: '#C27D38', 
    bg: '#FBF2E9' 
  },
  { 
    icon: '🌍', 
    tool: 'Impact Whitepaper', 
    title: 'Social & Environmental Impact', 
    desc: 'Renewable technology patents, circular economy frameworks, and social innovation models ready for institutional adoption.', 
    color: '#0F766E', 
    bg: '#E6F4F2' 
  },
  { 
    icon: '📚', 
    tool: 'Curriculum & Scorm', 
    title: 'Educational Courseware', 
    desc: 'University-grade curricula, training modules, and corporate upskilling programs licensed directly to global academies.', 
    color: '#527D90', 
    bg: '#EBF2F5' 
  },
  { 
    icon: '✍️', 
    tool: 'Anthology & Audio', 
    title: 'Poetry & Spoken Word', 
    desc: 'Publish poetry collections, lyrical compositions, and spoken word pieces with automated micro-royalty contracts.', 
    color: '#7E746C', 
    bg: '#EFECE6' 
  },
  { 
    icon: '🎓', 
    tool: 'Masterclass Suite', 
    title: 'Professional Masterclasses', 
    desc: 'High-leverage video courses, operational frameworks, and executive coaching systems packaged for global distribution.', 
    color: '#C27D38', 
    bg: '#FBF2E9' 
  },
];

// ── Security / Verification Roadmap Steps
const securitySteps = [
  { step: '01', icon: '🔐', title: 'Secure Account Creation', desc: 'Register with email verification and two-factor authentication. Your identity is protected from day one.', color: '#6366F1' },
  { step: '02', icon: '🪪', title: 'Creator Verification', desc: 'Submit government-issued ID or professional credentials. Verified badges build buyer trust instantly.', color: '#10B981' },
  { step: '03', icon: '📜', title: 'IP Ownership Proof', desc: 'Upload timestamps, copyright registrations, or notarized documents to prove originality of your work.', color: '#F59E0B' },
  { step: '04', icon: '🔏', title: 'Encrypted Listings', desc: 'Your content is encrypted at rest and in transit. Buyers only access full material after secure payment.', color: '#EC4899' },
  { step: '05', icon: '💳', title: 'Escrow & Safe Payment', desc: 'Funds are held in escrow until both parties confirm delivery. No disputes, no chargebacks, no stress.', color: '#8B5CF6' },
  { step: '06', icon: '⚖️', title: 'Legal Transfer & Receipt', desc: "Automated digital contracts and legal receipts are generated for every transaction. You're always protected.", color: '#06B6D4' },
];

export default function Landing() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef(null);

  const goToSlide = useCallback((idx) => {
    if (idx === activeSlide || isAnimating) return;
    setIsAnimating(true);
    setActiveSlide(idx);
    setTimeout(() => setIsAnimating(false), 800);
  }, [activeSlide, isAnimating]);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (activeSlide + 1) % heroSlides.length;
      goToSlide(next);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlide, goToSlide]);

  // ── Particle Canvas Background Animation in Hero ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connecting constellation lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(165, 180, 252, ${0.15 * (1 - dist / 130)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw and move particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#38BDF8';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const slide = heroSlides[activeSlide];

  return (
    <div className="landing-page">

      {/* ══════════════════════════════════════════
          PANEL 1 — FULL-SCREEN HERO SLIDER WITH ANIMATION
      ══════════════════════════════════════════ */}
      <section className="lp-hero">

        {/* Slide layers with Ken-Burns pan/zoom */}
        {heroSlides.map((s, i) => (
          <div
            key={i}
            className={`lp-slide-bg ${i === activeSlide ? 'lp-slide-bg--active' : ''}`}
            style={{ backgroundImage: `url(${s.image})` }}
          />
        ))}

        {/* Animated Aurora Glow Orbs */}
        <div className="lp-hero-aurora-wrap">
          <div className="lp-aurora-orb lp-aurora-orb-1" style={{ background: `radial-gradient(circle, ${slide.accent}55 0%, transparent 70%)` }} />
          <div className="lp-aurora-orb lp-aurora-orb-2" style={{ background: `radial-gradient(circle, #38BDF844 0%, transparent 70%)` }} />
        </div>

        {/* Animated Shooting Stars Rays */}
        <div className="lp-shooting-stars">
          <span className="shooting-star star-1"></span>
          <span className="shooting-star star-2"></span>
          <span className="shooting-star star-3"></span>
        </div>

        {/* Particle Canvas Overlay */}
        <canvas ref={canvasRef} className="lp-hero-canvas" />

        {/* Dark gradient overlay */}
        <div className="lp-hero-overlay" />

        {/* Main Content Layout */}
        <div className="lp-hero-content">
          <div className="lp-hero-inner">

            {/* Left Col: Main Headlines & CTAs */}
            <div className="lp-hero-text-col">
              {/* Category tag */}
              <div className="lp-hero-tag" style={{ '--tag-color': slide.accent }}>
                <span className="tag-pulse-dot" style={{ background: slide.accent }} />
                {slide.tag}
              </div>

              {/* Main headline */}
              <div className="perini-hero-quote-block">
                <p className="perini-hero-subtitle">
                  The way your intellectual property looks reflects who you are and how you build.
                </p>
                <div className="perini-quote-divider" />
                <h1 className="perini-hero-headline">
                  What story will you tell?
                </h1>
              </div>

              <p className="lp-hero-desc">
                {slide.desc}
              </p>

              {/* Action Buttons */}
              <div className="lp-hero-cta-group">
                <Link to="/sell" className="btn-perini-primary">
                  BROWSE COLLECTION
                </Link>
                <Link to="/buy" className="btn-perini-secondary">
                  VISIT MARKETPLACE
                </Link>
              </div>

              {/* Stats bar */}
              <div className="lp-hero-stats-bar">
                <div className="lp-hero-stat">
                  <strong>12,400+</strong>
                  <span>Creators</span>
                </div>
                <div className="lp-hero-stat-sep" />
                <div className="lp-hero-stat">
                  <strong>38,700+</strong>
                  <span>Listings Live</span>
                </div>
                <div className="lp-hero-stat-sep" />
                <div className="lp-hero-stat">
                  <strong>4,900+</strong>
                  <span>Deals Closed</span>
                </div>
                <div className="lp-hero-stat-sep" />
                <div className="lp-hero-stat">
                  <strong>13</strong>
                  <span>Categories</span>
                </div>
              </div>
            </div>

            {/* Right Col: Floating 3D Hologram Live Asset Card */}
            <div className="lp-hero-card-col">
              <div className="lp-live-hologram-card" key={`card-${activeSlide}`}>
                {/* Laser scan animation line */}
                <div className="laser-scanner-line" style={{ background: `linear-gradient(90deg, transparent, ${slide.accent}, transparent)` }} />

                <div className="live-card-badge-row">
                  <span className="live-pulse-beacon">
                    <span className="beacon-dot" />
                    LIVE VERIFIED IP
                  </span>
                  <span className="live-card-hash">{slide.hash}</span>
                </div>

                <div className="live-card-content">
                  <div className="live-card-category-label" style={{ color: slide.accent }}>
                    {slide.tag}
                  </div>
                  <h4 className="live-card-title">{slide.headline}</h4>
                  
                  {/* Equalizer rhythm animation */}
                  <div className="live-card-equalizer">
                    {[35, 75, 45, 90, 60, 100, 70, 85, 40, 95, 50, 80].map((h, idx) => (
                      <span 
                        key={idx} 
                        className="eq-bar" 
                        style={{ 
                          '--target-height': `${h}%`,
                          animationDelay: `${idx * 0.1}s`,
                          background: `linear-gradient(to top, #D92D20, ${slide.accent})` 
                        }} 
                      />
                    ))}
                  </div>

                  <div className="live-card-meta-row">
                    <div>
                      <span className="meta-sub">Current Valuation</span>
                      <strong className="meta-val" style={{ color: '#D92D20' }}>{slide.liveOffer}</strong>
                    </div>
                    <div>
                      <span className="meta-sub">Activity</span>
                      <strong className="meta-val" style={{ color: '#10B981' }}>{slide.bids}</strong>
                    </div>
                  </div>

                  <div className="live-card-footer">
                    <div className="live-creator-pill">
                      <div className="creator-dot-avatar" style={{ background: slide.accent }}>
                        {slide.creator.charAt(0)}
                      </div>
                      <span className="creator-name-txt">{slide.creator}</span>
                    </div>
                    <Link to="/buy" className="btn-card-explore" style={{ borderColor: slide.accent, color: '#FFFFFF' }}>
                      Inspect Asset →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Slide counter + dots */}
        <div className="lp-hero-nav">
          <span className="lp-hero-counter">
            {String(activeSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
          </span>
          <div className="lp-hero-dots">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                className={`lp-hero-dot ${i === activeSlide ? 'lp-hero-dot--active' : ''}`}
                onClick={() => goToSlide(i)}
                style={i === activeSlide ? { background: '#D92D20', boxShadow: '0 0 10px #D92D20' } : {}}
                aria-label={`Slide ${i + 1}: ${heroSlides[i].tag}`}
              />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="lp-hero-progress">
          <div
            key={activeSlide}
            className="lp-hero-progress-fill"
            style={{ '--fill-color': '#D92D20' }}
          />
        </div>

        {/* Scrolling marquee ticker */}
        <div className="lp-marquee-wrap">
          <div className="lp-marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="lp-marquee-item">
                <span className="lp-marquee-dot">✦</span> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PANEL 2 — ARCHITECTURAL PHOTO GRID (PERINI 5-CARD SHOWCASE)
      ══════════════════════════════════════════ */}
      <section className="perini-photo-grid-section">
        <div className="lp-section-inner">
          <div className="perini-grid-layout">
            
            {/* 1. Large Card: Tile Collections / Manuscripts */}
            <div className="perini-card perini-card--large" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80')" }}>
              <div className="perini-card-overlay" />
              <div className="perini-card-content">
                <h2 className="perini-card-title">MANUSCRIPTS &amp; NOVELS</h2>
                <p className="perini-card-sub">Where timeless literature meets digital adaptation</p>
                <div className="perini-card-btn-group">
                  <Link to="/buy?category=fiction" className="btn-perini-card-red">BROWSE COLLECTION</Link>
                  <Link to="/buy" className="btn-perini-card-grey">VISIT MARKETPLACE</Link>
                </div>
              </div>
            </div>

            {/* 2. Large Card: Kitchen & Bath / Screenplays */}
            <div className="perini-card perini-card--large" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=1200&auto=format&fit=crop&q=80')" }}>
              <div className="perini-card-overlay" />
              <div className="perini-card-content">
                <h2 className="perini-card-title">SCREENPLAYS &amp; FILM RENOVATIONS</h2>
                <p className="perini-card-sub">Where you bring cinematic visions together with studios</p>
                <div className="perini-card-btn-group">
                  <Link to="/buy?category=screenplays" className="btn-perini-card-red">VIEW SAMPLES</Link>
                  <Link to="/collaborate" className="btn-perini-card-slate">TALK TO OUR TEAM</Link>
                </div>
              </div>
            </div>

            {/* 3. Medium Card: Bathware / Business Blueprints */}
            <div className="perini-card perini-card--med" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&auto=format&fit=crop&q=80')" }}>
              <div className="perini-card-overlay" />
              <div className="perini-card-content">
                <h3 className="perini-card-title">BUSINESS BLUEPRINTS</h3>
                <p className="perini-card-sub">Your foundation for scalable enterprises</p>
                <div className="perini-card-btn-group">
                  <Link to="/buy?category=business" className="btn-perini-card-red">BROWSE COLLECTION</Link>
                  <Link to="/sell" className="btn-perini-card-ochre">SELL YOUR ASSETS</Link>
                </div>
              </div>
            </div>

            {/* 4. Small Card: Wishlist */}
            <div className="perini-card perini-card--small" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80')" }}>
              <div className="perini-card-overlay" />
              <div className="perini-card-content">
                <h3 className="perini-card-title perini-card-title--red">WISHLIST</h3>
                <p className="perini-card-sub">Curate your private IP portfolio</p>
                <div className="perini-card-btn-group">
                  <Link to="/buy" className="btn-perini-card-outline">CREATE YOUR ASSET WISHLIST</Link>
                </div>
              </div>
            </div>

            {/* 5. Small Card: eBook / Creator Playbook */}
            <div className="perini-card perini-card--small" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80')" }}>
              <div className="perini-card-overlay" />
              <div className="perini-card-content">
                <h3 className="perini-card-title">CREATOR PLAYBOOK</h3>
                <p className="perini-card-sub">How to choose the right licensing model for your project and get it right first time</p>
                <div className="perini-card-btn-group">
                  <a href="#playbook" className="btn-perini-card-outline" onClick={(e) => { e.preventDefault(); toast.success('Creator Playbook downloaded!'); }}>
                    DOWNLOAD OUR PLAYBOOK
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PANEL 3 — THREE WAYS TO ENGAGE (STUDIO LUXURY DESIGN)
      ══════════════════════════════════════════ */}
      <section className="lp-engage">
        <div className="lp-section-inner">
          <div className="lp-section-badge-wrap">
            <span className="lp-section-label">⚡ How The Ecosystem Works</span>
          </div>
          <h2 className="lp-section-title">Three Ways to Monetize &amp; Build</h2>
          <p className="lp-section-sub">Whether you're creating original stories, acquiring IP, or co-founding projects, our infrastructure is built for you.</p>

          <div className="lp-engage-grid">
            {/* Card 1: Sell */}
            <Link to="/sell" className="lp-engage-card lp-engage-card--sell">
              <div className="lp-engage-card-top-row">
                <div className="lp-engage-step-badge">01 // CREATORS</div>
                <span className="lp-engage-stat-pill">12.4k+ Sellers</span>
              </div>
              <div className="lp-engage-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <h3 className="lp-engage-card-title">Create &amp; Sell</h3>
              <p className="lp-engage-card-desc">Publish screenplays, life stories, software algorithms, or business models. Timestamp your IP and monetize directly to verified global buyers.</p>
              <ul className="lp-engage-card-features">
                <li><span>✦</span> Automatic SHA-256 IP Timestamping</li>
                <li><span>✦</span> Set Fixed Prices or Solicit Studio Bids</li>
                <li><span>✦</span> Retain Full Copyright Until Escrow Closes</li>
              </ul>
              <div className="lp-engage-card-footer">
                <span className="lp-engage-cta-text">Start Selling IP</span>
                <div className="lp-engage-arrow-circle">→</div>
              </div>
            </Link>

            {/* Card 2: Buy */}
            <Link to="/buy" className="lp-engage-card lp-engage-card--buy">
              <div className="lp-engage-card-top-row">
                <div className="lp-engage-step-badge">02 // BUYERS &amp; STUDIOS</div>
                <span className="lp-engage-stat-pill">38.7k+ Assets</span>
              </div>
              <div className="lp-engage-icon-box" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38BDF8' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <h3 className="lp-engage-card-title">Discover &amp; Buy</h3>
              <p className="lp-engage-card-desc">Browse thousands of vetted concepts, pre-market scripts, and patented solutions. Acquire rights safely with automated digital legal contracts.</p>
              <ul className="lp-engage-card-features">
                <li><span>✦</span> 100% Escrow Fund Security</li>
                <li><span>✦</span> Instant Ownership Transfer &amp; Legal PDF</li>
                <li><span>✦</span> Direct Negotiations With Verified Authors</li>
              </ul>
              <div className="lp-engage-card-footer">
                <span className="lp-engage-cta-text">Explore Marketplace</span>
                <div className="lp-engage-arrow-circle">→</div>
              </div>
            </Link>

            {/* Card 3: Collab */}
            <Link to="/collaborate" className="lp-engage-card lp-engage-card--collab">
              <div className="lp-engage-card-top-row">
                <div className="lp-engage-step-badge">03 // CO-FOUNDERS</div>
                <span className="lp-engage-stat-pill">4.9k+ Deals Closed</span>
              </div>
              <div className="lp-engage-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 className="lp-engage-card-title">Partner &amp; Collaborate</h3>
              <p className="lp-engage-card-desc">Find visionary directors, lead developers, or angel investors to co-produce your intellectual property under protected collaborative agreements.</p>
              <ul className="lp-engage-card-features">
                <li><span>✦</span> Skill-Matched Project Board &amp; Pitching</li>
                <li><span>✦</span> Direct Encrypted Messaging &amp; Texting</li>
                <li><span>✦</span> Milestone-Based Revenue Sharing</li>
              </ul>
              <div className="lp-engage-card-footer">
                <span className="lp-engage-cta-text">Find Partners</span>
                <div className="lp-engage-arrow-circle">→</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PANEL 3 — CONTENT CATEGORY ROADMAP (12)
      ══════════════════════════════════════════ */}
      <section className="lp-categories">
        <div className="lp-section-inner">
          <div className="lp-section-badge-wrap">
            <span className="lp-section-label">📚 12 Comprehensive Verticals</span>
          </div>
          <h2 className="lp-section-title">Every Creative Format, Welcome Here</h2>
          <p className="lp-section-sub">
            From a screenplay scribbled at midnight to a billion-dollar AI blueprint — if you created it, we help you protect and monetize it.
          </p>

          <div className="lp-cat-grid">
            {categories.map((cat, i) => (
              <Link to="/buy" key={i} className="lp-cat-card" style={{ '--cat-color': cat.color }}>
                <div className="lp-cat-top-bar">
                  <div className="lp-cat-icon-wrap" style={{ background: cat.bg, borderColor: `${cat.color}30` }}>
                    <span className="lp-cat-icon">{cat.icon}</span>
                  </div>
                  <span className="lp-cat-tool-pill">
                    {cat.tool}
                  </span>
                </div>
                <h3 className="lp-cat-title">{cat.title}</h3>
                <p className="lp-cat-desc">{cat.desc}</p>
                <div className="lp-cat-footer-row">
                  <span className="lp-cat-tag">EXPLORE LISTINGS</span>
                  <span className="lp-cat-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PANEL 4 — SECURITY & VERIFICATION PIPELINE
      ══════════════════════════════════════════ */}
      <section className="lp-security">
        <div className="lp-section-inner">
          <div className="lp-section-badge-wrap">
            <span className="lp-section-label lp-section-label--light">🛡️ Bank-Grade Trust &amp; Safety</span>
          </div>
          <h2 className="lp-section-title lp-section-title--light">Your Work is Protected,<br />Every Step of the Way</h2>
          <p className="lp-section-sub lp-section-sub--light">An immutable verification and escrow roadmap ensuring every creator, buyer, and collaborator is legally shielded.</p>
          
          <div className="lp-security-roadmap">
            {securitySteps.map((s, i) => (
              <div key={i} className="lp-sec-step" style={{ '--sec-color': s.color }}>
                <div className="lp-sec-node-wrapper">
                  <div className="lp-sec-node">
                    <span className="lp-sec-node-icon">{s.icon}</span>
                  </div>
                  <div className="lp-sec-line" />
                </div>
                <div className="lp-sec-content">
                  <div className="lp-sec-step-header">
                    <span className="lp-sec-step-num" style={{ color: s.color }}>STEP {s.step}</span>
                    <span className="lp-sec-status-dot" style={{ background: s.color }} />
                  </div>
                  <h3 className="lp-sec-title">{s.title}</h3>
                  <p className="lp-sec-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lp-security-badge-banner">
            <div className="security-banner-icon">🔒</div>
            <div className="security-banner-text">
              <strong>End-to-End Escrow Protection &amp; Immutable Digital Ownership</strong>
              <p>Platform contracts adhere to WIPO intellectual property standards and automated escrow clearance.</p>
            </div>
            <Link to="/signup" className="btn btn-sm btn-primary">Join Verified Creators</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PANEL 5 — FINAL CTA (COSMIC LUXURY STUDIO)
      ══════════════════════════════════════════ */}
      <section className="lp-final-cta">
        <div className="lp-final-cta-glow" />
        <div className="lp-section-inner lp-final-cta-inner">
          <div className="lp-cta-pill">🚀 START YOUR CREATIVE EMPIRE TODAY</div>
          <h2 className="lp-final-cta-title">What's Your Story Worth?</h2>
          <p className="lp-final-cta-sub">Name it. Price it. Share it with the world. Your idea could be the next global bestseller, the next award-winning film, or the next billion-dollar breakthrough.</p>
          
          <div className="lp-final-cta-btns">
            <Link to="/signup" className="btn btn-lg lp-cta-white">
              <span>✨ Create Free Creator Account</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link to="/buy" className="btn btn-lg lp-cta-ghost">Browse Marketplace</Link>
          </div>

          <div className="lp-cta-trust-bar">
            <span className="trust-item">✓ Zero Upfront Listing Fees</span>
            <span className="trust-dot">•</span>
            <span className="trust-item">✓ Instant IP Cryptographic Timestamp</span>
            <span className="trust-dot">•</span>
            <span className="trust-item">✓ Global Escrow Payouts in USD/EUR</span>
          </div>
        </div>
      </section>

    </div>
  );
}
