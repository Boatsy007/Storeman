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

  function improveQuoteFlow() {
    const choiceGrid = document.querySelector('[data-stage="2"] .choice-grid');
    if (choiceGrid && !document.querySelector('.property-conditions-intro')) {
      const intro = document.createElement('div');
      intro.className = 'property-conditions-intro';
      intro.innerHTML = '<span>OPTIONAL</span><div><strong>DO ANY OF THESE APPLY?</strong><p>If none of these apply to your property, leave them unticked and continue.</p></div>';
      choiceGrid.insertAdjacentElement('beforebegin', intro);
      choiceGrid.classList.add('optional-choice-grid');
    }

    const signature = document.querySelector('[data-stage="3"] .quote-signature');
    if (signature && !signature.querySelector('.included-green-waste')) {
      const extra = document.createElement('div');
      extra.className = 'included-green-waste';
      extra.innerHTML = '<span>✓ INCLUDED</span><div><strong>STANDARD GREEN WASTE REMOVAL</strong><small>Normal lawn clippings and standard green waste from the visit are removed free.</small></div>';
      signature.appendChild(extra);
    }

    const wasteToggle = document.querySelector('[data-addon-toggle="waste"]');
    if (wasteToggle) {
      const title = wasteToggle.querySelector('b');
      const helper = wasteToggle.querySelector('small');
      if (title) title.textContent = 'Extra green waste removal';
      if (helper) helper.textContent = 'Standard green waste is already included — only add this if you need more removed';
      const options = document.querySelector('[data-addon-options="waste"]');
      if (options) {
        options.querySelector('input[value="greenWasteStandard"]')?.closest('label')?.remove();
        const prompt = options.querySelector('p');
        if (prompt) prompt.textContent = 'How much EXTRA green waste needs removing?';
      }
    }
  }

  function updateMembershipComparison() {
    const offer = root.querySelector('.membership-offer');
    const mainPrice = root.querySelector('.membership-main-price');
    const options = root.querySelector('.membership-options');
    const oneOffPrice = parseMoney(root.querySelector('.quote-card .price')?.textContent);
    if (!offer || !mainPrice || !options || !oneOffPrice) return;

    const optionSpans = [...options.querySelectorAll('span')];
    const annualSpan = optionSpans.find((span) => /annual|yearly/i.test(span.textContent));
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
    .property-conditions-intro{display:flex;align-items:flex-start;gap:12px;margin:22px 0 10px;padding:14px 16px;background:#f7f7f3;border-left:5px solid #ffe000}
    .property-conditions-intro>span{flex:0 0 auto;background:#111;color:#ffe000;padding:7px 9px;font:900 9px/1 "Archivo Black",sans-serif;letter-spacing:.7px}
    .property-conditions-intro strong{display:block;font-family:"Archivo Black",sans-serif;font-size:14px;line-height:1.1}
    .property-conditions-intro p{margin:5px 0 0;color:#666;font-size:11px;line-height:1.4}
    .optional-choice-grid{margin-top:0!important}
    .optional-choice-grid label{background:#fff!important}
    .optional-choice-grid label:has(input:checked){background:#fffbe0!important;border-color:#111!important}
    .quote-signature{align-items:start!important}
    .included-green-waste{grid-column:1/-1;display:flex;align-items:flex-start;gap:10px;margin-top:11px;padding-top:11px;border-top:1px solid #b9d9c2}
    .included-green-waste>span{flex:0 0 auto;background:#1f7a3d;color:#fff;padding:7px 8px;font:900 8px/1 "Archivo Black",sans-serif;letter-spacing:.5px}
    .included-green-waste strong{display:block;font:900 12px/1.1 "Archivo Black",sans-serif;color:#111}
    .included-green-waste small{display:block;margin-top:4px;color:#555;font-size:10px;line-height:1.35}
    .membership-visit-saving{margin:12px 0 4px;padding:12px 0;border-top:2px solid rgba(0,0,0,.18);border-bottom:2px solid rgba(0,0,0,.18)}
    .membership-visit-saving strong{display:block;font-family:"Archivo Black",sans-serif;font-size:16px;line-height:1.05}
    .membership-visit-saving span{display:block;margin-top:6px;font-size:11px;font-weight:800}
    .membership-options{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
    .membership-options span{display:block;padding:10px;background:rgba(0,0,0,.08);font-size:11px;font-weight:800}
    @media(max-width:700px){
      .property-conditions-intro{margin-top:20px;padding:13px 14px}
      .property-conditions-intro strong{font-size:13px}
      .property-conditions-intro p{font-size:10.5px}
      .included-green-waste{display:grid;grid-template-columns:auto 1fr}
      .membership-options{grid-template-columns:1fr 1fr!important}
      .membership-visit-saving strong{font-size:14px}
    }
  `;
  document.head.appendChild(style);

  improveQuoteFlow();
  const observer = new MutationObserver(() => requestAnimationFrame(() => {
    improveQuoteFlow();
    updateMembershipComparison();
  }));
  observer.observe(document.body, { childList: true, subtree: true });
  updateMembershipComparison();
})();
