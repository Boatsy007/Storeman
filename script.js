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
const form = document.getElementById('quoteForm');
const note = document.getElementById('formNote');
const review = document.getElementById('quoteReview');
const fileInput = document.getElementById('quoteFiles');
const fileSummary = document.getElementById('fileSummary');
let lastFocused = null;
let currentStep = 1;
let autoPopupTimer = null;

function setStep(step) {
  currentStep = step;
  document.querySelectorAll('[data-form-stage]').forEach((stage) => {
    stage.classList.toggle('active', Number(stage.dataset.formStage) === step);
  });
  document.querySelectorAll('[data-step-indicator]').forEach((indicator) => {
    indicator.classList.toggle('active', Number(indicator.dataset.stepIndicator) <= step);
  });
  if (step === 3) updateReview();
  modal?.querySelector('.quote-form-panel')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStage(step) {
  const stage = document.querySelector(`[data-form-stage="${step}"]`);
  if (!stage) return true;
  const required = [...stage.querySelectorAll('[required]')];
  for (const field of required) {
    if (!field.checkValidity()) {
      field.reportValidity();
      field.focus();
      return false;
    }
  }
  return true;
}

function updateReview() {
  if (!form || !review) return;
  const data = new FormData(form);
  const lines = [
    ['Name', data.get('name')],
    ['Business', data.get('business')],
    ['Phone', data.get('phone')],
    ['Email', data.get('email')],
    ['Property', data.get('address')],
    ['Property type', data.get('propertyType')],
    ['Service', data.get('service')],
    ['Frequency', data.get('frequency')],
    ['Notes', data.get('message')]
  ].filter(([, value]) => value);

  review.innerHTML = `<strong>Your quote request</strong>${lines.map(([label, value]) => `<div><b>${label}:</b> ${String(value).replace(/[<>]/g, '')}</div>`).join('')}`;
}

function openModal({ auto = false } = {}) {
  if (window.innerWidth <= 620) return;
  if (!modal || modal.classList.contains('is-open')) return;
  if (autoPopupTimer) {
    clearTimeout(autoPopupTimer);
    autoPopupTimer = null;
  }
  lastFocused = auto ? null : document.activeElement;
  setStep(1);
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

document.querySelectorAll('[data-next-step]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!validateStage(currentStep)) return;
    setStep(Number(button.dataset.nextStep));
  });
});

document.querySelectorAll('[data-prev-step]').forEach((button) => {
  button.addEventListener('click', () => setStep(Number(button.dataset.prevStep)));
});

if (fileInput && fileSummary) {
  fileInput.addEventListener('change', () => {
    const files = [...fileInput.files];
    if (!files.length) {
      fileSummary.textContent = 'JPG, PNG or PDF (Max 10MB each)';
      return;
    }
    const oversized = files.find((file) => file.size > 10 * 1024 * 1024);
    if (oversized) {
      fileSummary.textContent = `${oversized.name} is over 10MB.`;
      fileInput.value = '';
      return;
    }
    fileSummary.textContent = `${files.length} file${files.length > 1 ? 's' : ''} selected: ${files.map((file) => file.name).join(', ')}`;
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal?.classList.contains('is-open')) closeModal();
});

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateStage(2)) return;

    const data = new FormData(form);
    const subject = encodeURIComponent(`Storeman quote request — ${data.get('business') || data.get('name') || 'New enquiry'}`);
    const body = encodeURIComponent(
      `Name: ${data.get('name') || ''}\nBusiness: ${data.get('business') || ''}\nPhone: ${data.get('phone') || ''}\nEmail: ${data.get('email') || ''}\n\nProperty address: ${data.get('address') || ''}\nProperty type: ${data.get('propertyType') || ''}\nService: ${data.get('service') || ''}\nFrequency: ${data.get('frequency') || ''}\nBest contact time: ${data.get('contactTime') || ''}\n\nSite details:\n${data.get('message') || ''}\n\nPhotos selected: ${fileInput?.files?.length || 0}`
    );

    if (note) note.textContent = 'Opening your email app with the quote request ready to send…';
    window.location.href = `mailto:hello@storeman.com.au?subject=${subject}&body=${body}`;
  });
}

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

if (modal && window.innerWidth > 620) {
  autoPopupTimer = window.setTimeout(() => openModal({ auto: true }), 1600);
}
