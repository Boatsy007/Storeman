const serviceMenu = document.querySelector('.service-menu');
const serviceNav = document.querySelector('.service-nav');

if (serviceMenu && serviceNav) {
  serviceMenu.addEventListener('click', () => {
    const open = serviceMenu.getAttribute('aria-expanded') === 'true';
    serviceMenu.setAttribute('aria-expanded', String(!open));
    serviceNav.classList.toggle('mobile-open', !open);
  });

  serviceNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      serviceNav.classList.remove('mobile-open');
      serviceMenu.setAttribute('aria-expanded', 'false');
    });
  });
}

document.querySelectorAll('.service-quote, .service-actions .service-btn-yellow, .service-cta .service-btn').forEach((link) => {
  link.href = '/quote.html';
  link.textContent = 'GET YOUR FREE QUOTE →';
});
