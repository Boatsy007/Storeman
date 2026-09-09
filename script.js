const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.desktop-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('mobile-open', !open);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('mobile-open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

const modal = document.getElementById('quoteModal');
const quoteTriggers = document.querySelectorAll('.quote-trigger');
const closeTargets = document.querySelectorAll('[data-close-modal]');
let lastFocused = null;
let autoPopupTimer = null;

function openModal({ auto = false } = {}) {
  if (window.innerWidth <= 620) {
    if (!auto) window.location.href = '/quote.html';
    return;
  }
  if (!modal || modal.classList.contains('is-open')) return;
  if (autoPopupTimer) {
    clearTimeout(autoPopupTimer);
    autoPopupTimer = null;
  }
  lastFocused = auto ? null : document.activeElement;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  setTimeout(() => modal.querySelector('input')?.focus(), 80);
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  lastFocused?.focus?.();
}

quoteTriggers.forEach((button) => button.addEventListener('click', () => openModal()));
closeTargets.forEach((target) => target.addEventListener('click', closeModal));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal?.classList.contains('is-open')) closeModal();
});

const servicePages = {
  '.service-sweeping': '/sweeping.html',
  '.service-grounds': '/grounds.html',
  '.service-pressure': '/pressure-washing.html',
  '.service-fleet': '/fleet-washing.html'
};

Object.entries(servicePages).forEach(([selector, href]) => {
  const card = document.querySelector(selector);
  if (!card) return;
  card.setAttribute('role', 'link');
  card.setAttribute('tabindex', '0');
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => window.location.href = href);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.location.href = href;
    }
  });
});

const showcase = document.querySelector('.industries');
if (showcase) {
  showcase.id = 'capabilities';
  const label = showcase.querySelector('.section-heading .label');
  const heading = showcase.querySelector('.section-heading h2');
  const grid = showcase.querySelector('.industry-grid');

  if (label) label.textContent = 'MORE OF WHAT WE DO';
  if (heading) heading.textContent = 'FIVE CORE SERVICES. ONE STOREMAN TEAM.';

  if (grid) {
    grid.className = 'capability-grid';
    grid.innerHTML = `
      <a class="capability-tile" href="/sweeping.html"><img src="/assets/sweeping.jpg" alt="Storeman sweeping service" loading="lazy"><span>SWEEPING</span></a>
      <a class="capability-tile" href="/grounds.html"><img src="/assets/grounds.jpg" alt="Storeman grounds service" loading="lazy"><span>GROUNDS</span></a>
      <a class="capability-tile" href="/lawn-garden.html"><img src="/assets/mowing.jpg" alt="Storeman lawn and garden service" loading="lazy"><span>LAWN &amp; GARDEN</span></a>
      <a class="capability-tile" href="/pressure-washing.html"><img src="/assets/pressure%20washing.jpg" alt="Storeman pressure washing service" loading="lazy"><span>PRESSURE WASHING</span></a>
      <a class="capability-tile" href="/fleet-washing.html"><img src="/assets/fleetwash.jpg" alt="Storeman fleet washing service" loading="lazy"><span>FLEET WASHING</span></a>`;
  }

  document.querySelectorAll('a[href="#industries"]').forEach((link) => {
    link.href = '#capabilities';
    link.textContent = 'Capabilities';
  });

  const style = document.createElement('style');
  style.textContent = `.capability-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.capability-tile{position:relative;height:180px;overflow:hidden;background:#ddd;display:block}.capability-tile img{width:100%;height:100%;object-fit:cover;transition:transform .3s ease}.capability-tile:after{content:"";position:absolute;inset:38% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.84))}.capability-tile span{position:absolute;z-index:2;left:14px;bottom:12px;color:#fff;font-family:"Archivo Black",sans-serif;font-size:15px;line-height:1}.capability-tile:hover img{transform:scale(1.035)}@media(max-width:980px){.capability-grid{grid-template-columns:repeat(2,1fr)}.capability-tile{height:180px}}@media(max-width:620px){.capability-grid{grid-template-columns:1fr}.capability-tile{height:220px}}`;
  document.head.appendChild(style);
}

// Give the sticky header quote CTA one restrained attention nudge after the
// visitor has moved through roughly the first quarter of the page. It runs once
// only and respects reduced-motion preferences.
const headerQuoteButton = document.querySelector('.header-cta.quote-trigger');
let quoteNudgePlayed = false;

function maybeNudgeQuoteButton() {
  if (!headerQuoteButton || quoteNudgePlayed || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return;
  const progress = window.scrollY / scrollable;
  if (progress >= 0.25) {
    quoteNudgePlayed = true;
    headerQuoteButton.classList.add('quote-scroll-nudge');
    window.setTimeout(() => headerQuoteButton.classList.remove('quote-scroll-nudge'), 1200);
    window.removeEventListener('scroll', maybeNudgeQuoteButton);
  }
}

if (headerQuoteButton) {
  window.addEventListener('scroll', maybeNudgeQuoteButton, { passive: true });
  maybeNudgeQuoteButton();
}

const params = new URLSearchParams(window.location.search);
if (params.get('quote') === '1' || params.get('estimate') === '1') {
  setTimeout(() => openModal(), 250);
} else if (modal && window.innerWidth > 620) {
  autoPopupTimer = window.setTimeout(() => openModal({ auto: true }), 1600);
}
