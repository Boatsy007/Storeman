const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.desktop-nav');
if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('mobile-open', !open);
  });
}

const form = document.getElementById('quoteForm');
const note = document.getElementById('formNote');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent(`Storeman site quote — ${data.get('business') || data.get('name') || 'New enquiry'}`);
    const body = encodeURIComponent(
      `Name: ${data.get('name') || ''}\nBusiness: ${data.get('business') || ''}\nEmail: ${data.get('email') || ''}\nPhone: ${data.get('phone') || ''}\n\nSite needs:\n${data.get('message') || ''}`
    );
    window.location.href = `mailto:hello@storeman.com.au?subject=${subject}&body=${body}`;
    if (note) note.textContent = 'Your email app should open with the quote request ready to send.';
  });
}
