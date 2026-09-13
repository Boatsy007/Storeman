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
  if (location.pathname === '/membership.html' && link.classList.contains('member-join')) {
    link.href = '/quote.html?membership=1';
    link.textContent = 'GET MY MEMBER PRICE →';
  } else {
    link.href = '/quote.html';
    link.textContent = 'FREE INSTANT QUOTE →';
  }
});

// Signature Storeman Finish marketing across the pages where lawn service is sold.
const isLawnPage = location.pathname === '/lawn-garden.html';
const isMembershipPage = location.pathname === '/membership.html';
const isGroundsPage = location.pathname === '/grounds.html';
if ((isLawnPage || isMembershipPage || isGroundsPage) && !document.querySelector('.signature-finish')) {
  const anchor = document.querySelector('.service-intro');
  if (anchor) {
    const finish = document.createElement('section');
    finish.className = 'signature-finish';
    finish.id = 'storeman-finish';
    finish.innerHTML = `<div class="service-container signature-finish-inner">
      <div class="signature-finish-copy">
        <p class="service-kicker">THE STOREMAN DIFFERENCE</p>
        <h2>THE STOREMAN<br><span>FINISH.</span></h2>
        <div class="signature-free">INCLUDED · $0 EXTRA</div>
      </div>
      <div class="signature-finish-detail">
        <h3>WE DON'T JUST CUT IT. WE FINISH IT GREEN.</h3>
        <p>Every standard lawn visit includes Storeman Lawn Green-Up where lawn and site conditions are suitable. It is our signature final step after the mow, snip, edge and tidy — included in the service, not added to the bill.</p>
        <div class="signature-flow"><span>MOW</span><b>→</b><span>SNIP</span><b>→</b><span>EDGE</span><b>→</b><span>BLOW & TIDY</span><b>→</b><span class="signature-green">GREEN-UP ✓</span></div>
        <a href="/quote.html${isMembershipPage ? '?membership=1' : ''}" class="signature-finish-cta">${isMembershipPage ? 'GET MY MEMBER PRICE' : 'FREE INSTANT QUOTE'} <b>→</b></a>
        <small>*Lawn Green-Up is applied where lawn and site conditions are suitable.</small>
      </div>
    </div>`;
    anchor.insertAdjacentElement('afterend', finish);

    const style = document.createElement('style');
    style.textContent = `.signature-finish{padding:64px 0;background:#ffe000;color:#111;border-top:2px solid #111;border-bottom:2px solid #111}.signature-finish-inner{display:grid;grid-template-columns:.7fr 1.3fr;gap:56px;align-items:center}.signature-finish-copy h2{margin:0;font-family:"Archivo Black",sans-serif;font-size:58px;line-height:.87;letter-spacing:-2.4px}.signature-finish-copy h2 span{display:inline-block;background:#111;color:#ffe000;padding:2px 7px}.signature-free{display:inline-block;margin-top:20px;background:#111;color:#ffe000;padding:9px 12px;font-family:"Archivo Black",sans-serif;font-size:11px;letter-spacing:.7px}.signature-finish-detail h3{margin:0 0 12px;font-family:"Archivo Black",sans-serif;font-size:27px;line-height:1}.signature-finish-detail>p{margin:0 0 18px;max-width:760px;line-height:1.65;font-size:14px}.signature-flow{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:18px 0}.signature-flow span{border:2px solid #111;padding:8px 9px;font-family:"Archivo Black",sans-serif;font-size:10px}.signature-flow b{font-family:"Archivo Black",sans-serif}.signature-flow .signature-green{background:#111;color:#ffe000}.signature-finish-cta{display:inline-flex;align-items:center;gap:18px;background:#111;color:#fff;padding:14px 18px;text-decoration:none;font-family:"Archivo Black",sans-serif;font-size:12px}.signature-finish-detail>small{display:block;margin-top:9px;font-size:10px;font-weight:700}@media(max-width:800px){.signature-finish{padding:46px 0}.signature-finish-inner{grid-template-columns:1fr;gap:28px}.signature-finish-copy h2{font-size:44px}.signature-flow b{display:none}.signature-flow{display:grid;grid-template-columns:1fr 1fr}.signature-flow span{text-align:center}.signature-flow .signature-green{grid-column:1/-1}.signature-finish-cta{width:100%;justify-content:space-between}}`;
    document.head.appendChild(style);
  }
}
