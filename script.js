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

function openModal() {
  if (!modal) return;
  lastFocused = document.activeElement;
  setStep(1);
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  setTimeout(() => modal.querySelector('input')?.focus(), 40);
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  lastFocused?.focus?.();
}

quoteTriggers.forEach((button) => button.addEventListener('click', openModal));
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
