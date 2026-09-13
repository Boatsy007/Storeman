const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.desktop-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('mobile-open', !open);
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('mobile-open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));
}

// One quote system only: every quote CTA goes straight to the instant quote flow.
const legacyModal = document.getElementById('quoteModal');
legacyModal?.remove();
const legacyPopupStyles = document.querySelector('link[href="/quote-popup.css"]');
legacyPopupStyles?.remove();

const quoteTriggers = document.querySelectorAll('.quote-trigger');
quoteTriggers.forEach((button) => {
  button.innerHTML = 'FREE INSTANT QUOTE <span>→</span>';
  button.setAttribute('aria-label', 'Free instant Storeman quote');
  button.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = '/quote.html';
  });
});

// Keep the footer branding consistent with the header.
const footerBrand = document.querySelector('.footer-brand');
if (footerBrand) {
  footerBrand.innerHTML = '<img class="footer-logo-image" src="/assets/storemanlogo.jpg" alt="Storeman Complete Exterior Care">';
  const footerLogoStyle = document.createElement('style');
  footerLogoStyle.textContent = `.footer-logo-image{display:block;width:100%;max-width:280px;height:auto;object-fit:contain;object-position:left center}@media(max-width:680px){.footer-logo-image{max-width:245px}}`;
  document.head.appendChild(footerLogoStyle);
}

// About content presentation.
const aboutStyle = document.createElement('style');
aboutStyle.textContent = `.about-storeman{padding:64px 0;background:#fff}.about-storeman-inner{display:grid;grid-template-columns:.9fr 1.1fr;gap:64px;align-items:center}.about-storeman-copy h2{margin:0 0 24px;font-family:"Archivo Black",sans-serif;font-size:52px;line-height:.92;letter-spacing:-2.4px}.about-storeman-copy h2 span{color:#ffe000}.about-storeman-copy>p:not(.label){max-width:610px;margin:0 0 16px;color:#555;font-size:15px;line-height:1.65}.about-storeman-copy .button{margin-top:10px}.about-storeman-panel{display:grid;grid-template-columns:1fr 1fr;border:1px solid #dedede;background:#111}.about-storeman-panel>div{min-height:185px;padding:24px;border-right:1px solid #333;border-bottom:1px solid #333;display:flex;flex-direction:column}.about-storeman-panel>div:nth-child(2n){border-right:0}.about-storeman-panel>div:nth-last-child(-n+2){border-bottom:0}.about-storeman-panel b{color:#ffe000;font-family:"Archivo Black",sans-serif;font-size:10px;letter-spacing:1.4px}.about-storeman-panel strong{margin:30px 0 10px;color:#fff;font-family:"Archivo Black",sans-serif;font-size:17px;line-height:1.05}.about-storeman-panel span{color:#c8c8c8;font-size:12px;line-height:1.5}@media(max-width:980px){.about-storeman-inner{grid-template-columns:1fr;gap:34px}.about-storeman-copy h2{font-size:46px}}@media(max-width:680px){.about-storeman{padding:46px 0}.about-storeman-inner{gap:26px}.about-storeman-copy h2{font-size:39px;letter-spacing:-1.8px}.about-storeman-copy>p:not(.label){font-size:14px}.about-storeman-panel{grid-template-columns:1fr}.about-storeman-panel>div{min-height:145px;border-right:0;border-bottom:1px solid #333}.about-storeman-panel>div:nth-last-child(-n+2){border-bottom:1px solid #333}.about-storeman-panel>div:last-child{border-bottom:0}.about-storeman-panel strong{margin-top:22px}.about-storeman-copy .button{width:100%}}`;
document.head.appendChild(aboutStyle);

const showcase = document.querySelector('.industries');
if (showcase) {
  const style = document.createElement('style');
  style.textContent = `.capability-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.capability-tile{position:relative;height:180px;overflow:hidden;background:#ddd;display:block}.capability-tile img{width:100%;height:100%;object-fit:cover;transition:transform .3s ease}.capability-tile:after{content:"";position:absolute;inset:38% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.84))}.capability-tile span{position:absolute;z-index:2;left:14px;bottom:12px;color:#fff;font-family:"Archivo Black",sans-serif;font-size:15px;line-height:1}.capability-tile:hover img{transform:scale(1.035)}@media(max-width:980px){.capability-grid{grid-template-columns:repeat(2,1fr)}.capability-tile{height:180px}}@media(max-width:620px){.capability-grid{grid-template-columns:1fr}.capability-tile{height:220px}}`;
  document.head.appendChild(style);
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  const revealGroups = [['.section-heading',0],['.service-card',42],['.who-heading > *',34],['.who-card',34],['.about-storeman-copy > *',34],['.about-storeman-panel > *',34],['.why-left > *',36],['.why-image',0],['.capability-tile',38],['.service-areas-copy > *',34],['.service-areas-grid > *',36],['.faq-heading > *',32],['.faq-list details',36],['.cta-inner > *',40],['.footer-inner > *',34]];
  const revealObserver = new IntersectionObserver((entries,observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('scroll-in');
      observer.unobserve(entry.target);
    });
  }, { threshold:.06, rootMargin:'0px 0px -2% 0px' });
  revealGroups.forEach(([selector,stagger]) => document.querySelectorAll(selector).forEach((element,index) => {
    element.classList.add('scroll-reveal');
    element.style.setProperty('--reveal-delay',`${Math.min(index*stagger,150)}ms`);
    revealObserver.observe(element);
  }));
}

const parallaxImage = document.querySelector('.hero-image img');
let parallaxFrame = null;
function updateParallax() {
  parallaxFrame = null;
  if (!parallaxImage || reduceMotion || window.innerWidth < 681) {
    if (parallaxImage) parallaxImage.style.removeProperty('--scroll-shift');
    return;
  }
  const shift = Math.max(-10, Math.min(10, window.scrollY * .018));
  parallaxImage.style.setProperty('--scroll-shift', `${shift}px`);
}
function queueParallax() {
  if (parallaxFrame !== null) return;
  parallaxFrame = requestAnimationFrame(updateParallax);
}
if (parallaxImage && !reduceMotion) {
  window.addEventListener('scroll', queueParallax, { passive:true });
  window.addEventListener('resize', queueParallax, { passive:true });
  updateParallax();
}

let quoteNudgePlayed = false;
function getVisibleQuoteNudgeTarget() {
  const preferred = window.innerWidth <= 980
    ? document.querySelector('.hero-actions .button-yellow.quote-trigger')
    : document.querySelector('.header-cta.quote-trigger');
  if (preferred && preferred.getClientRects().length) return preferred;
  return [...document.querySelectorAll('.quote-trigger')].find((el) => el.getClientRects().length) || null;
}
function maybeNudgeQuoteButton() {
  if (quoteNudgePlayed || reduceMotion || window.scrollY < 120) return;
  const target = getVisibleQuoteNudgeTarget();
  if (!target) return;
  quoteNudgePlayed = true;
  target.classList.add('quote-scroll-nudge');
  window.setTimeout(() => target.classList.remove('quote-scroll-nudge'), 1250);
  window.removeEventListener('scroll', maybeNudgeQuoteButton);
}
window.addEventListener('scroll', maybeNudgeQuoteButton, { passive:true });

// Mobile conversion CTA: reveal after the hero is fully scrolled past.
const heroQuoteButton = document.querySelector('.hero-actions .button-yellow.quote-trigger');
const heroSection = document.querySelector('.hero');
if (heroQuoteButton && heroSection) {
  const stickyQuote = document.createElement('button');
  stickyQuote.type = 'button';
  stickyQuote.className = 'sticky-mobile-quote';
  stickyQuote.setAttribute('aria-label', 'Free instant Storeman quote');
  stickyQuote.innerHTML = '<span>FREE INSTANT QUOTE</span><b>→</b>';
  stickyQuote.addEventListener('click', () => { window.location.href = '/quote.html'; });
  document.body.appendChild(stickyQuote);

  const stickyStyle = document.createElement('style');
  stickyStyle.textContent = `.sticky-mobile-quote{display:none;position:fixed;left:14px;right:14px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:95;min-height:58px;border:2px solid #111;background:#ffe000;color:#111;padding:0 20px;font-family:"Archivo Black",sans-serif;font-size:13px;letter-spacing:-.2px;align-items:center;justify-content:space-between;box-shadow:0 8px 24px rgba(0,0,0,.24);opacity:0;transform:translateY(18px);pointer-events:none;transition:opacity .28s ease,transform .28s cubic-bezier(.22,.61,.36,1)}.sticky-mobile-quote b{font-size:20px;line-height:1}.sticky-mobile-quote.is-visible{opacity:1;transform:translateY(0);pointer-events:auto}@media(max-width:680px){.sticky-mobile-quote{display:flex}}@media(min-width:681px){.sticky-mobile-quote{display:none!important}}@media(prefers-reduced-motion:reduce){.sticky-mobile-quote{transition:none}}`;
  document.head.appendChild(stickyStyle);

  function syncStickyQuote() {
    const heroBottom = heroSection.getBoundingClientRect().bottom;
    const shouldShow = window.innerWidth <= 680 && heroBottom <= 0;
    stickyQuote.classList.toggle('is-visible', shouldShow);
  }

  window.addEventListener('scroll', syncStickyQuote, { passive:true });
  window.addEventListener('resize', syncStickyQuote, { passive:true });
  syncStickyQuote();
}

// Old deep links now enter the current instant quote instead of opening a legacy modal.
const params = new URLSearchParams(window.location.search);
if (params.get('quote') === '1' || params.get('estimate') === '1') {
  window.location.replace('/quote.html');
}
