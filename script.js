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


const showcase = document.querySelector('.industries');
if (showcase) {
  const style = document.createElement('style');
  style.textContent = `.capability-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.capability-tile{position:relative;height:180px;overflow:hidden;background:#ddd;display:block}.capability-tile img{width:100%;height:100%;object-fit:cover;transition:transform .3s ease}.capability-tile:after{content:"";position:absolute;inset:38% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.84))}.capability-tile span{position:absolute;z-index:2;left:14px;bottom:12px;color:#fff;font-family:"Archivo Black",sans-serif;font-size:15px;line-height:1}.capability-tile:hover img{transform:scale(1.035)}@media(max-width:980px){.capability-grid{grid-template-columns:repeat(2,1fr)}.capability-tile{height:180px}}@media(max-width:620px){.capability-grid{grid-template-columns:1fr}.capability-tile{height:220px}}`;
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

// About content now lives in index.html; retain its presentation styles here.
const aboutStyle = document.createElement('style');
aboutStyle.textContent = `.about-storeman{padding:64px 0;background:#fff}.about-storeman-inner{display:grid;grid-template-columns:.9fr 1.1fr;gap:64px;align-items:center}.about-storeman-copy h2{margin:0 0 24px;font-family:"Archivo Black",sans-serif;font-size:52px;line-height:.92;letter-spacing:-2.4px}.about-storeman-copy h2 span{color:#ffe000}.about-storeman-copy>p:not(.label){max-width:610px;margin:0 0 16px;color:#555;font-size:15px;line-height:1.65}.about-storeman-copy .button{margin-top:10px}.about-storeman-panel{display:grid;grid-template-columns:1fr 1fr;border:1px solid #dedede;background:#111}.about-storeman-panel>div{min-height:185px;padding:24px;border-right:1px solid #333;border-bottom:1px solid #333;display:flex;flex-direction:column}.about-storeman-panel>div:nth-child(2n){border-right:0}.about-storeman-panel>div:nth-last-child(-n+2){border-bottom:0}.about-storeman-panel b{color:#ffe000;font-family:"Archivo Black",sans-serif;font-size:10px;letter-spacing:1.4px}.about-storeman-panel strong{margin:30px 0 10px;color:#fff;font-family:"Archivo Black",sans-serif;font-size:17px;line-height:1.05}.about-storeman-panel span{color:#c8c8c8;font-size:12px;line-height:1.5}@media(max-width:980px){.about-storeman-inner{grid-template-columns:1fr;gap:34px}.about-storeman-copy h2{font-size:46px}}@media(max-width:680px){.about-storeman{padding:46px 0}.about-storeman-inner{gap:26px}.about-storeman-copy h2{font-size:39px;letter-spacing:-1.8px}.about-storeman-copy>p:not(.label){font-size:14px}.about-storeman-panel{grid-template-columns:1fr}.about-storeman-panel>div{min-height:145px;border-right:0;border-bottom:1px solid #333}.about-storeman-panel>div:nth-last-child(-n+2){border-bottom:1px solid #333}.about-storeman-panel>div:last-child{border-bottom:0}.about-storeman-panel strong{margin-top:22px}.about-storeman-copy .button{width:100%}}`;
document.head.appendChild(aboutStyle);

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
  const revealGroups = [['.section-heading',0],['.service-card',42],['.who-heading > *',34],['.who-card',34],['.about-storeman-copy > *',34],['.about-storeman-panel > *',34],['.why-left > *',36],['.why-image',0],['.inline-quote-copy > *',34],['.inline-quote-card',0],['.capability-tile',38],['.service-areas-copy > *',34],['.service-areas-grid > *',36],['.faq-heading > *',32],['.faq-list details',36],['.cta-inner > *',40],['.footer-inner > *',34]];
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

// Mobile conversion CTA: reveal a slim quote bar once the main hero quote button has scrolled away.
const heroQuoteButton = document.querySelector('.hero-actions .button-yellow.quote-trigger');
if (heroQuoteButton) {
  const stickyQuote = document.createElement('button');
  stickyQuote.type = 'button';
  stickyQuote.className = 'sticky-mobile-quote';
  stickyQuote.setAttribute('aria-label', 'Get your free Storeman quote');
  stickyQuote.innerHTML = '<span>GET YOUR FREE QUOTE</span><b>→</b>';
  stickyQuote.addEventListener('click', () => { window.location.href = '/quote.html'; });
  document.body.appendChild(stickyQuote);

  const stickyStyle = document.createElement('style');
  stickyStyle.textContent = `.sticky-mobile-quote{display:none;position:fixed;left:14px;right:14px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:95;min-height:58px;border:2px solid #111;background:#ffe000;color:#111;padding:0 20px;font-family:"Archivo Black",sans-serif;font-size:13px;letter-spacing:-.2px;align-items:center;justify-content:space-between;box-shadow:0 8px 24px rgba(0,0,0,.24);opacity:0;transform:translateY(18px);pointer-events:none;transition:opacity .28s ease,transform .28s cubic-bezier(.22,.61,.36,1)}.sticky-mobile-quote b{font-size:20px;line-height:1}.sticky-mobile-quote.is-visible{opacity:1;transform:translateY(0);pointer-events:auto}@media(max-width:680px){.sticky-mobile-quote{display:flex}}@media(min-width:681px){.sticky-mobile-quote{display:none!important}}@media(prefers-reduced-motion:reduce){.sticky-mobile-quote{transition:none}}`;
  document.head.appendChild(stickyStyle);

  let heroQuoteVisible = true;
  function syncStickyQuote() {
    const shouldShow = window.innerWidth <= 680 && !heroQuoteVisible && window.scrollY > 850;
    stickyQuote.classList.toggle('is-visible', shouldShow);
  }
  if ('IntersectionObserver' in window) {
    const heroQuoteObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { heroQuoteVisible = entry.isIntersecting; syncStickyQuote(); });
    }, { threshold: 0.15 });
    heroQuoteObserver.observe(heroQuoteButton);
  } else {
    const checkHeroQuote = () => { const rect = heroQuoteButton.getBoundingClientRect(); heroQuoteVisible = rect.bottom > 0 && rect.top < window.innerHeight; syncStickyQuote(); };
    window.addEventListener('scroll', checkHeroQuote, { passive:true });
    checkHeroQuote();
  }
  window.addEventListener('resize', syncStickyQuote, { passive:true });
}

const params=new URLSearchParams(window.location.search);
if(params.get('quote')==='1'||params.get('estimate')==='1'){setTimeout(()=>openModal(),250);}else if(modal&&window.innerWidth>620){autoPopupTimer=window.setTimeout(()=>openModal({auto:true}),1600);}
