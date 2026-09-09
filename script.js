const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.desktop-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('mobile-open', !open);
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { nav.classList.remove('mobile-open'); menuButton.setAttribute('aria-expanded', 'false'); }));
}

const modal = document.getElementById('quoteModal');
const quoteTriggers = document.querySelectorAll('.quote-trigger');
const closeTargets = document.querySelectorAll('[data-close-modal]');
let lastFocused = null;
let autoPopupTimer = null;

function openModal({ auto = false } = {}) {
  if (window.innerWidth <= 620) { if (!auto) window.location.href = '/quote.html'; return; }
  if (!modal || modal.classList.contains('is-open')) return;
  if (autoPopupTimer) { clearTimeout(autoPopupTimer); autoPopupTimer = null; }
  lastFocused = auto ? null : document.activeElement;
  modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('modal-open');
  setTimeout(() => modal.querySelector('input')?.focus(), 80);
}
function closeModal() { if (!modal) return; modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('modal-open'); lastFocused?.focus?.(); }
quoteTriggers.forEach((button) => button.addEventListener('click', () => openModal()));
closeTargets.forEach((target) => target.addEventListener('click', closeModal));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal?.classList.contains('is-open')) closeModal(); });

const servicePages = {
  '.service-sweeping': '/sweeping.html',
  '.service-grounds': '/grounds.html',
  '.service-lawn': '/lawn-garden.html',
  '.service-pressure': '/pressure-washing.html',
  '.service-fleet': '/fleet-washing.html'
};
Object.entries(servicePages).forEach(([selector, href]) => {
  const card = document.querySelector(selector); if (!card) return;
  card.setAttribute('role', 'link'); card.setAttribute('tabindex', '0'); card.style.cursor = 'pointer';
  card.addEventListener('click', () => window.location.href = href);
  card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); window.location.href = href; } });
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
    grid.innerHTML = `<a class="capability-tile" href="/sweeping.html"><img src="/assets/sweeping.jpg" alt="Storeman sweeping service" loading="lazy"><span>SWEEPING</span></a><a class="capability-tile" href="/grounds.html"><img src="/assets/grounds.jpg" alt="Storeman grounds service" loading="lazy"><span>GROUNDS</span></a><a class="capability-tile" href="/lawn-garden.html"><img src="/assets/mowing.jpg" alt="Storeman lawn and garden service" loading="lazy"><span>LAWN &amp; GARDEN</span></a><a class="capability-tile" href="/pressure-washing.html"><img src="/assets/pressure%20washing.jpg" alt="Storeman pressure washing service" loading="lazy"><span>PRESSURE WASHING</span></a><a class="capability-tile" href="/fleet-washing.html"><img src="/assets/fleetwash.jpg" alt="Storeman fleet washing service" loading="lazy"><span>FLEET WASHING</span></a>`;
  }
  document.querySelectorAll('a[href="#industries"]').forEach((link) => { link.href = '#capabilities'; link.textContent = 'Capabilities'; });
  const style = document.createElement('style');
  style.textContent = `.capability-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.capability-tile{position:relative;height:180px;overflow:hidden;background:#ddd;display:block}.capability-tile img{width:100%;height:100%;object-fit:cover;transition:transform .3s ease}.capability-tile:after{content:"";position:absolute;inset:38% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.84))}.capability-tile span{position:absolute;z-index:2;left:14px;bottom:12px;color:#fff;font-family:"Archivo Black",sans-serif;font-size:15px;line-height:1}.capability-tile:hover img{transform:scale(1.035)}@media(max-width:980px){.capability-grid{grid-template-columns:repeat(2,1fr)}.capability-tile{height:180px}}@media(max-width:620px){.capability-grid{grid-template-columns:1fr}.capability-tile{height:220px}}`;
  document.head.appendChild(style);
}

// Keep the footer branding consistent with the header: yellow Storeman logo on black.
const footerBrand = document.querySelector('.footer-brand');
if (footerBrand) {
  footerBrand.innerHTML = '<img class="footer-logo-image" src="/assets/storemanlogo.jpg" alt="Storeman External Property Solutions">';
  const footerLogoStyle = document.createElement('style');
  footerLogoStyle.textContent = `.footer-logo-image{display:block;width:100%;max-width:280px;height:auto;object-fit:contain;object-position:left center}@media(max-width:680px){.footer-logo-image{max-width:245px}}`;
  document.head.appendChild(footerLogoStyle);
}

const whySection = document.querySelector('.why');
if (whySection) {
  const inlineQuote = document.createElement('section');
  inlineQuote.className = 'inline-quote'; inlineQuote.id = 'start-quote';
  inlineQuote.innerHTML = `<div class="container inline-quote-inner"><div class="inline-quote-copy"><p class="label light">GET YOUR FREE SITE QUOTE</p><h2>READY FOR A<br><span>CLEANER SITE?</span></h2><p>Start your quote here. Add your details, then choose the services you want Storeman to assess.</p><div class="inline-quote-trust"><span>✓ FREE SITE ASSESSMENT</span><span>✓ NO OBLIGATION</span><span>✓ SOUTH EAST QLD</span></div></div><form class="inline-quote-card" data-inline-quote-form><div class="inline-quote-fields"><label><span>Contact Name *</span><input name="name" autocomplete="name" required placeholder="John Smith"></label><label><span>Business Name *</span><input name="business" autocomplete="organization" required placeholder="ABC Pty Ltd"></label><label><span>Email *</span><input type="email" name="email" autocomplete="email" required placeholder="you@company.com"></label><label><span>Phone *</span><input name="phone" autocomplete="tel" required placeholder="0400 123 456"></label><label class="inline-quote-full"><span>Business Address / Location *</span><input name="address" autocomplete="street-address" required placeholder="Street address, suburb"></label></div><button class="inline-quote-submit" type="submit">START MY FREE QUOTE <span>→</span></button><p class="inline-quote-note">Next: select the services you need. Storeman will then contact you to arrange the site assessment.</p></form></div>`;
  whySection.insertAdjacentElement('afterend', inlineQuote);
  const inlineForm = inlineQuote.querySelector('[data-inline-quote-form]');
  inlineForm?.addEventListener('submit', (event) => {
    event.preventDefault(); if (!inlineForm.reportValidity()) return;
    const data = new FormData(inlineForm);
    const prefill = { name:String(data.get('name')||'').trim(), business:String(data.get('business')||'').trim(), email:String(data.get('email')||'').trim(), phone:String(data.get('phone')||'').trim(), address:String(data.get('address')||'').trim() };
    try { sessionStorage.setItem('storeman-quote-prefill', JSON.stringify(prefill)); } catch (_) {}
    if (window.innerWidth <= 620) { window.location.href = '/quote.html?prefill=1'; return; }
    openModal();
    window.setTimeout(() => { const modalForm = modal?.querySelector('[data-quote-form]'); if (!modalForm) return; Object.entries(prefill).forEach(([name,value]) => { const field=modalForm.elements.namedItem(name); if(field) field.value=value; }); modalForm.querySelector('[data-save-quote-lead]')?.click(); }, 100);
  });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  const revealGroups = [['.section-heading',0],['.service-card',42],['.why-left > *',36],['.why-image',0],['.inline-quote-copy > *',34],['.inline-quote-card',0],['.capability-tile',38],['.service-areas-copy > *',34],['.service-areas-grid > *',36],['.faq-heading > *',32],['.faq-list details',36],['.cta-inner > *',40],['.footer-inner > *',34]];
  const revealObserver = new IntersectionObserver((entries,observer) => { entries.forEach((entry) => { if (!entry.isIntersecting) return; entry.target.classList.add('scroll-in'); observer.unobserve(entry.target); }); }, { threshold:.06, rootMargin:'0px 0px -2% 0px' });
  revealGroups.forEach(([selector,stagger]) => document.querySelectorAll(selector).forEach((element,index) => { element.classList.add('scroll-reveal'); element.style.setProperty('--reveal-delay',`${Math.min(index*stagger,150)}ms`); revealObserver.observe(element); }));
}

const parallaxImage = document.querySelector('.hero-image img'); let parallaxFrame = null;
function updateParallax() { parallaxFrame=null; if(!parallaxImage||reduceMotion||window.innerWidth<681){if(parallaxImage)parallaxImage.style.removeProperty('--scroll-shift');return;} const shift=Math.max(-10,Math.min(10,window.scrollY*.018)); parallaxImage.style.setProperty('--scroll-shift',`${shift}px`); }
function queueParallax(){if(parallaxFrame!==null)return;parallaxFrame=requestAnimationFrame(updateParallax);}
if(parallaxImage&&!reduceMotion){window.addEventListener('scroll',queueParallax,{passive:true});window.addEventListener('resize',queueParallax,{passive:true});updateParallax();}

let quoteNudgePlayed=false;
function getVisibleQuoteNudgeTarget(){const preferred=window.innerWidth<=980?document.querySelector('.hero-actions .button-yellow.quote-trigger'):document.querySelector('.header-cta.quote-trigger');if(preferred&&preferred.getClientRects().length)return preferred;return [...document.querySelectorAll('.quote-trigger')].find((el)=>el.getClientRects().length)||null;}
function maybeNudgeQuoteButton(){if(quoteNudgePlayed||reduceMotion||window.scrollY<120)return;const target=getVisibleQuoteNudgeTarget();if(!target)return;quoteNudgePlayed=true;target.classList.add('quote-scroll-nudge');window.setTimeout(()=>target.classList.remove('quote-scroll-nudge'),1250);window.removeEventListener('scroll',maybeNudgeQuoteButton);}
window.addEventListener('scroll',maybeNudgeQuoteButton,{passive:true});

const params=new URLSearchParams(window.location.search);
if(params.get('quote')==='1'||params.get('estimate')==='1'){setTimeout(()=>openModal(),250);}else if(modal&&window.innerWidth>620){autoPopupTimer=window.setTimeout(()=>openModal({auto:true}),1600);}
