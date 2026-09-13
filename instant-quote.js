(() => {
  const root = document.querySelector('[data-instant-quote]');
  if (!root || !window.StoremanQuoteEngine) return;
  const form = root.querySelector('[data-iq-form]');
  const status = root.querySelector('[data-status]');
  const stages = [...root.querySelectorAll('[data-stage]')];
  const progress = [...root.querySelectorAll('[data-progress]')];
  const result = root.querySelector('[data-quote-result]');
  const photoInput = form.elements.namedItem('photos');
  const photoSummary = root.querySelector('[data-photo-summary]');
  let currentQuote = null;
  let leadId = `stm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;

  const safe = (v) => String(v || '').replace(/[<>]/g, '').trim();
  const money = window.StoremanQuoteEngine.money;

  function setStage(n) {
    stages.forEach((s) => s.classList.toggle('active', Number(s.dataset.stage) === n));
    progress.forEach((p) => p.classList.toggle('active', Number(p.dataset.progress) <= n));
    status.textContent = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validateStage(n) {
    const stage = root.querySelector(`[data-stage="${n}"]`);
    for (const field of stage.querySelectorAll('[required]')) {
      if (!field.checkValidity()) { field.reportValidity(); field.focus(); return false; }
    }
    return true;
  }

  function dataSnapshot() {
    const fd = new FormData(form);
    const flags = fd.getAll('flag').map(safe);
    const type = safe(fd.get('propertyType'));
    if (['cornerBlock','largeProperty','acreage'].includes(type)) flags.push(type);
    return {
      id: leadId,
      name: safe(fd.get('name')),
      phone: safe(fd.get('phone')),
      email: safe(fd.get('email')),
      business: safe(fd.get('business')),
      address: safe(fd.get('address')),
      propertyType: type,
      flags,
      addons: fd.getAll('addon').map(safe)
    };
  }

  async function postLead(payload) {
    try {
      const res = await fetch('/api/lead', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      return await res.json();
    } catch (_) { return { ok:false }; }
  }

  function fileToDataUrl(file) { return new Promise((resolve,reject) => { const r = new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file); }); }
  async function compressPhoto(file) {
    const source = await fileToDataUrl(file);
    const img = new Image();
    await new Promise((resolve,reject) => { img.onload=resolve; img.onerror=reject; img.src=source; });
    const maxSide = 1400, scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale)); canvas.height = Math.max(1, Math.round(img.height * scale));
    canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', .72);
    return { name:file.name.replace(/\.[^.]+$/, '') + '.jpg', type:'image/jpeg', content:dataUrl.split(',')[1] };
  }
  async function preparePhotos() {
    if (!photoInput?.files?.length) return [];
    return Promise.all([...photoInput.files].slice(0,3).map(compressPhoto));
  }

  function linePrice(item) {
    if (item.price === 0) return 'FREE';
    return `${item.fromPrice ? 'FROM ' : ''}${money(item.price)}`;
  }

  function renderQuote(q) {
    if (q.manualReview) {
      result.innerHTML = `<div class="review-box"><p class="eyebrow">PROPERTY REVIEW</p><h3>WE JUST NEED TO CHECK THIS ONE.</h3><p>Your property has one or more details that fall outside our automatic quote rules. Your information is saved and Storeman can confirm the price without you needing to start again.</p><p><strong>Reason:</strong> ${q.reviewReasons.join(', ')}</p></div>`;
      return;
    }
    const lines = q.items.map((item) => `<div class="quote-line"><span>${item.label}</span><strong>${linePrice(item)}</strong></div>`).join('');
    result.innerHTML = `<div class="quote-card"><div class="small">YOUR STOREMAN PRICE</div><div class="price">${q.formattedTotal}</div><div class="sub">per visit · based on the property details supplied</div><div class="quote-lines">${lines}</div></div><div class="membership-offer"><div class="membership-kicker">SAVE 10% AS A MEMBER</div><h3>YOUR MEMBER PRICE</h3><div class="membership-main-price">${money(q.membership.weekly)}<span>/WEEK</span></div><p class="membership-summary"><strong>${q.membership.visits} scheduled visits per year.</strong><br>Save 10% compared with booking each visit separately.</p><div class="membership-options"><span>${money(q.membership.fortnightly)} fortnightly</span><span>${money(q.membership.monthly)} monthly</span><span>${money(q.membership.annual)} annually</span></div><p class="membership-includes">Includes mowing, snipping, edging, blow &amp; tidy on every scheduled visit.</p></div><div class="accept-row"><button type="button" class="oneoff" data-accept="oneoff">BOOK ONE-OFF</button><button type="button" class="member" data-accept="membership">BECOME A MEMBER</button></div><p class="fine">Final service is subject to the property reasonably matching the details and current photos supplied. Materially different site conditions may require confirmation before work starts.</p>`;
  }

  async function calculateAndSubmit() {
    if (!validateStage(4)) return;
    status.textContent = 'Preparing your property quote…';
    const snapshot = dataSnapshot();
    currentQuote = window.StoremanQuoteEngine.calculate(snapshot);
    let photos = [];
    try { photos = await preparePhotos(); } catch (_) {}
    await postLead({ ...snapshot, stage:currentQuote.manualReview ? 'instant_quote_review' : 'instant_quote_generated', services:['lawn'], photos, quote:currentQuote, source:'instant_quote' });
    renderQuote(currentQuote);
    setStage(5);
  }

  form.addEventListener('click', async (e) => {
    const next = e.target.closest('[data-next]');
    if (next) { e.preventDefault(); const from = Number(next.dataset.next) - 1; if (validateStage(from)) setStage(Number(next.dataset.next)); return; }
    const back = e.target.closest('[data-back]');
    if (back) { e.preventDefault(); setStage(Number(back.dataset.back)); return; }
    const calc = e.target.closest('[data-calculate]');
    if (calc) { e.preventDefault(); await calculateAndSubmit(); return; }
    const accept = e.target.closest('[data-accept]');
    if (accept && currentQuote) {
      e.preventDefault();
      const snapshot = dataSnapshot();
      const choice = accept.dataset.accept;
      await postLead({ ...snapshot, stage:'quote_accepted', services:['lawn'], source:'instant_quote', bookingChoice:choice, quote:currentQuote });
      status.textContent = choice === 'membership' ? 'Membership selected. Storeman will continue the setup from here.' : 'One-off service selected. Storeman will continue the booking from here.';
    }
  });
  form.addEventListener('submit', (e) => e.preventDefault());

  if (photoInput && photoSummary) photoInput.addEventListener('change', () => {
    const n = Math.min(photoInput.files.length, 3); photoSummary.textContent = n ? `${n} photo${n===1?'':'s'} selected` : 'Up to 3 photos';
  });

  const address = form.elements.namedItem('address');
  const mapAddress = root.querySelector('[data-map-address]');
  address?.addEventListener('input', () => { if (mapAddress) mapAddress.textContent = safe(address.value); });
})();
