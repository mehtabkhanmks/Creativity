/* ═══════════════════════════════════════════════════════════
   IDEAVAULT — Interactive JavaScript
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ── Navbar scroll effect ──────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ── Hamburger / Mobile menu ──────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.mobile-link, .mobile-menu .btn').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
  });
});

// ── Smooth active nav highlighting ──────────────────────────
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active-nav', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// ── Intersection Observer — reveal animations ────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.section-header, .side-card, .tx-card, .bento-card, ' +
  '.cat-card, .mono-card, .metric-item, .trust-point, ' +
  '.roadmap-phase, .footer-brand, .footer-col'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ── Step items staggered reveal ──────────────────────────────
const stepObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const step = entry.target;
      const delay = (parseInt(step.dataset.step || 1) - 1) * 60;
      setTimeout(() => step.classList.add('visible'), delay);
      stepObserver.unobserve(step);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.step-item').forEach(el => stepObserver.observe(el));

// ── Animated counter ─────────────────────────────────────────
function animateCounter(el, target, duration = 1600) {
  const startTime = performance.now();
  const startVal  = 0;

  function update(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out-quart
    const eased    = 1 - Math.pow(1 - progress, 4);
    const current  = Math.round(startVal + (target - startVal) * eased);
    el.textContent = current;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObserver.observe(el));

// ── Stagger reveal for grids ─────────────────────────────────
function addStaggerDelay(selector, baseDelay = 80) {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.style.transitionDelay = `${i * baseDelay}ms`;
  });
}

addStaggerDelay('.side-card',   90);
addStaggerDelay('.cat-card',    40);
addStaggerDelay('.tx-card',     70);
addStaggerDelay('.bento-card',  60);
addStaggerDelay('.mono-card',   70);
addStaggerDelay('.metric-item', 50);

// ── Active nav link style ────────────────────────────────────
const style = document.createElement('style');
style.textContent = `.nav-link.active-nav { color: #f1f5f9 !important; }`;
document.head.appendChild(style);

// ── Waitlist form ─────────────────────────────────────────────
const wlForm    = document.getElementById('wl-form');
const wlSuccess = document.getElementById('wl-success');

if (wlForm) {
  wlForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameEl  = document.getElementById('wl-name');
    const emailEl = document.getElementById('wl-email');

    const name  = nameEl.value.trim();
    const email = emailEl.value.trim();

    // Basic validation
    if (!name) {
      shakeInput(nameEl);
      return;
    }
    if (!email || !isValidEmail(email)) {
      shakeInput(emailEl);
      return;
    }

    // Simulate submission
    const btn  = document.getElementById('wl-submit');
    const text = btn.querySelector('.btn-text');
    text.textContent = 'Submitting…';
    btn.disabled = true;

    setTimeout(() => {
      wlForm.style.display    = 'none';
      wlSuccess.style.display = 'block';
      wlSuccess.style.animation = 'fadeUp 0.5s ease both';
    }, 900);
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function shakeInput(el) {
  el.style.borderColor = '#e11d48';
  el.style.animation   = 'none';
  el.offsetHeight; // reflow
  el.style.animation   = 'shake 0.4s ease';
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.animation   = '';
  }, 800);
}

// Shake keyframe
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(4px); }
}`;
document.head.appendChild(shakeStyle);

// ── Parallax-lite on hero orbs ───────────────────────────────
let ticking = false;
window.addEventListener('mousemove', (e) => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;

      const orb1 = document.querySelector('.orb-1');
      const orb2 = document.querySelector('.orb-2');
      const orb3 = document.querySelector('.orb-3');

      if (orb1) orb1.style.transform = `translate(${dx * 18}px, ${dy * 18}px)`;
      if (orb2) orb2.style.transform = `translate(${-dx * 14}px, ${-dy * 14}px)`;
      if (orb3) orb3.style.transform = `translate(${dx * 10}px, ${-dy * 10}px)`;

      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// ── Category cards — subtle tilt on hover ────────────────────
document.querySelectorAll('.cat-card, .tx-card, .side-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width  - 0.5;
    const y    = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-6px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
    card.style.transformOrigin = 'center';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ── Typing animation for hero badge ─────────────────────────
const badgeTexts = [
  'Now accepting early creators & investors',
  'Your ideas deserve a global audience',
  'Turn creativity into tradeable assets',
  'The marketplace for original ideas',
];
let badgeIdx = 0;
const badgeSpan = document.querySelector('.hero-badge span:last-child');

function cycleBadge() {
  if (!badgeSpan) return;
  badgeSpan.style.opacity = '0';
  badgeSpan.style.transition = 'opacity 0.4s';
  setTimeout(() => {
    badgeIdx = (badgeIdx + 1) % badgeTexts.length;
    badgeSpan.textContent = badgeTexts[badgeIdx];
    badgeSpan.style.opacity = '1';
  }, 400);
}

setInterval(cycleBadge, 4000);



// ── Scroll-to-top on logo click ──────────────────────────────
document.getElementById('nav-logo')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Trust shield mouse parallax ──────────────────────────────
const shield = document.querySelector('.trust-shield');
if (shield) {
  shield.addEventListener('mousemove', (e) => {
    const rect = shield.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    shield.style.transform = `rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg)`;
    shield.style.transition = 'transform 0.1s';
  });
  shield.addEventListener('mouseleave', () => {
    shield.style.transform = '';
    shield.style.transition = 'transform 0.5s';
  });
}

// ── Floating card hover glows ────────────────────────────────
document.querySelectorAll('.fcard').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.zIndex = '10';
  });
  card.addEventListener('mouseleave', () => {
    card.style.zIndex = '';
  });
});

// ── Random "activity" ping on floating cards ─────────────────
const fcards = document.querySelectorAll('.fcard');
function pingRandomCard() {
  if (fcards.length === 0) return;
  const card = fcards[Math.floor(Math.random() * fcards.length)];
  card.style.boxShadow = '0 0 30px rgba(124,58,237,0.5)';
  card.style.borderColor = 'rgba(124,58,237,0.5)';
  setTimeout(() => {
    card.style.boxShadow = '';
    card.style.borderColor = '';
  }, 1200);
}
setInterval(pingRandomCard, 2800);

// ── Cursor glow effect ───────────────────────────────────────
const cursorGlow = document.createElement('div');
cursorGlow.style.cssText = `
  position: fixed;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124,58,237,0.06), transparent 70%);
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s;
  mix-blend-mode: screen;
`;
document.body.appendChild(cursorGlow);

let cursorTicking = false;
document.addEventListener('mousemove', (e) => {
  if (!cursorTicking) {
    requestAnimationFrame(() => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top  = e.clientY + 'px';
      cursorTicking = false;
    });
    cursorTicking = true;
  }
}, { passive: true });

document.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0'; });
document.addEventListener('mouseenter', () => { cursorGlow.style.opacity = '1'; });

// ── Console branding ─────────────────────────────────────────
console.log(
  '%c⬡ IdeaVault%c\n%cYou create. The world discovers.\nhttps://ideavault.io',
  'color:#a78bfa;font-family:sans-serif;font-size:22px;font-weight:900;',
  '',
  'color:#64748b;font-family:sans-serif;font-size:12px;'
);
