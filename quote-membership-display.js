(() => {
  const root = document.querySelector('[data-quote-result]');
  if (!root) return;

  const parseMoney = (text = '') => {
    const value = Number(String(text).replace(/[^0-9.]/g, ''));
    return Number.isFinite(value) ? value : 0;
  };

  const formatMoney = (value, decimals = 0) => new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value || 0);

  function updateMembershipComparison() {
    const offer = root.querySelector('.membership-offer');
    const mainPrice = root.querySelector('.membership-main-price');
    const options = root.querySelector('.membership-options');
    const oneOffPrice = parseMoney(root.querySelector('.quote-card .price')?.textContent);
    if (!offer || !mainPrice || !options || !oneOffPrice) return;

    const optionSpans = [...options.querySelectorAll('span')];
    const annualSpan = optionSpans.find((span) => /annual/i.test(span.textContent));
    if (!annualSpan) return;

    const annual = parseMoney(annualSpan.textContent);
    if (!annual) return;

    const visitsMatch = offer.textContent.match(/(\d+)\s+scheduled visits/i);
    const visits = visitsMatch ? Number(visitsMatch[1]) : 19;
    if (!visits) return;

    const memberPerVisit = annual / visits;
    const savingPerVisit = Math.max(0, oneOffPrice - memberPerVisit);

    mainPrice.innerHTML = `${formatMoney(memberPerVisit, memberPerVisit % 1 ? 2 : 0)}<span>/VISIT</span>`;

    let saving = offer.querySelector('.membership-visit-saving');
    if (!saving) {
      saving = document.createElement('div');
      saving.className = 'membership-visit-saving';
      mainPrice.insertAdjacentElement('afterend', saving);
    }
    saving.innerHTML = `<strong>SAVE ${formatMoney(savingPerVisit, savingPerVisit % 1 ? 2 : 0)} EVERY VISIT</strong><span>One-off ${formatMoney(oneOffPrice)} → Member ${formatMoney(memberPerVisit, memberPerVisit % 1 ? 2 : 0)}</span>`;

    const weekly = annual / 52;
    const fortnightly = annual / 26;
    const monthly = annual / 12;
    options.innerHTML = `<span>${formatMoney(weekly, 2)} weekly</span><span>${formatMoney(fortnightly, 2)} fortnightly</span><span>${formatMoney(monthly, 2)} monthly</span><span>${formatMoney(annual, annual % 1 ? 2 : 0)} yearly</span>`;
  }

  const style = document.createElement('style');
  style.textContent = `
    .membership-visit-saving{margin:12px 0 4px;padding:12px 0;border-top:2px solid rgba(0,0,0,.18);border-bottom:2px solid rgba(0,0,0,.18)}
    .membership-visit-saving strong{display:block;font-family:"Archivo Black",sans-serif;font-size:16px;line-height:1.05}
    .membership-visit-saving span{display:block;margin-top:6px;font-size:11px;font-weight:800}
    .membership-options{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
    .membership-options span{display:block;padding:10px;background:rgba(0,0,0,.08);font-size:11px;font-weight:800}
    @media(max-width:700px){.membership-options{grid-template-columns:1fr 1fr!important}.membership-visit-saving strong{font-size:14px}}
  `;
  document.head.appendChild(style);

  const observer = new MutationObserver(() => requestAnimationFrame(updateMembershipComparison));
  observer.observe(root, { childList: true, subtree: true });
  updateMembershipComparison();
})();