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
  const address = form.elements.namedItem('address');
  const suggestions = root.querySelector('[data-address-suggestions]');
  const mapAddress = root.querySelector('[data-map-address]');
  const propertyMap = root.querySelector('[data-property-map]');
  const mapPlaceholder = root.querySelector('[data-map-placeholder]');
  const mapCaption = root.querySelector('[data-map-caption]');
  const mapConfirmAddress = root.querySelector('[data-map-confirm-address]');
  const params = new URLSearchParams(window.location.search);
  const membershipIntent = params.get('membership') === '1';
  let currentQuote = null;
  let leadId = `stm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  let addressTimer = null;
  let addressRequest = 0;
  let manualAddress = false;

  const safe = (v) => String(v || '').replace(/[<>]/g, '').trim();
  const money = window.StoremanQuoteEngine.money;

  function loadPropertyMap() {
    const value = safe(address?.value);
    if (mapAddress) mapAddress.textContent = value;
    if (!value || !propertyMap) return;
    propertyMap.src = `https://www.google.com/maps?q=${encodeURIComponent(value)}&output=embed&t=k&z=20`;
    propertyMap.hidden = false;
    if (mapPlaceholder) mapPlaceholder.hidden = true;
    if (mapCaption) mapCaption.hidden = false;
    if (mapConfirmAddress) mapConfirmAddress.textContent = value;
  }

  function setStage(n) {
    stages.forEach((s) => s.classList.toggle('active', Number(s.dataset.stage) === n));
    progress.forEach((p) => p.classList.toggle('active', Number(p.dataset.progress) <= n));
    status.textContent = '';
    if (n === 2) loadPropertyMap();
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
    const addons = [...form.querySelectorAll('[data-addon-choice]:checked')].map((input) => safe(input.value)).filter(Boolean);
    return {
      id: leadId,
      name: safe(fd.get('name')),
      phone: safe(fd.get('phone')),
      email: safe(fd.get('email')),
      business: safe(fd.get('business')),
      address: safe(fd.get('address')),
      addressEntry: manualAddress ? 'manual' : 'autocomplete',
      propertyType: type,
      flags,
      addons
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
    const membershipHeading = membershipIntent ? 'YOUR LAWN MEMBERSHIP PRICE' : 'YOUR MEMBER PRICE';
    const membershipIntro = membershipIntent
      ? '<p class="membership-intent-note">You came here for membership, so your 10% member saving is already calculated below.</p>'
      : '';
    const membershipButton = membershipIntent ? 'START MEMBERSHIP' : 'BECOME A MEMBER';
    result.innerHTML = `<div class="quote-card"><div class="small">YOUR STOREMAN PRICE</div><div class="price">${q.formattedTotal}</div><div class="sub">per visit · based on the property details supplied</div><div class="quote-lines">${lines}</div></div><div class="membership-offer${membershipIntent ? ' membership-priority' : ''}"><div class="membership-kicker">SAVE 10% AS A MEMBER</div><h3>${membershipHeading}</h3>${membershipIntro}<div class="membership-main-price">${money(q.membership.weekly)}<span>/WEEK</span></div><p class="membership-summary"><strong>${q.membership.visits} scheduled visits per year.</strong><br>Save 10% compared with booking each lawn visit separately.</p><div class="membership-options"><span>${money(q.membership.fortnightly)} fortnightly</span><span>${money(q.membership.monthly)} monthly</span><span>${money(q.membership.annual)} annually</span></div><p class="membership-includes">Includes mowing, snipping, edging, blow &amp; tidy on every scheduled visit. Optional add-ons and first-service extras are quoted separately.</p></div><div class="accept-row"><button type="button" class="oneoff" data-accept="oneoff">BOOK ONE-OFF</button><button type="button" class="member" data-accept="membership">${membershipButton}</button></div><p class="fine">Quote based on the details supplied. Final price may vary if site conditions or scope differ on the day.</p>`;
  }

  async function calculateAndSubmit() {
    if (!validateStage(4)) return;
    status.textContent = membershipIntent ? 'Calculating your Storeman member price…' : 'Preparing your property quote…';
    const snapshot = dataSnapshot();
    currentQuote = window.StoremanQuoteEngine.calculate(snapshot);
    let photos = [];
    try { photos = await preparePhotos(); } catch (_) {}
    await postLead({ ...snapshot, stage:currentQuote.manualReview ? 'instant_quote_review' : 'instant_quote_generated', services:['lawn'], photos, quote:currentQuote, source:membershipIntent ? 'membership_quote' : 'instant_quote', bookingChoice:membershipIntent ? 'membership_interest' : '' });
    renderQuote(currentQuote);
    setStage(5);
  }

  function hideSuggestions() {
    if (!suggestions) return;
    suggestions.hidden = true;
    suggestions.innerHTML = '';
    address?.setAttribute('aria-expanded', 'false');
  }

  function renderSuggestions(items) {
    if (!suggestions || !items.length) { hideSuggestions(); return; }
    suggestions.innerHTML = items.map((item, index) => `<button type="button" class="address-suggestion" data-address-choice="${index}"><span>${safe(item.label)}</span></button>`).join('');
    suggestions._items = items;
    suggestions.hidden = false;
    address?.setAttribute('aria-expanded', 'true');
  }

  async function searchAddress(value) {
    const requestId = ++addressRequest;
    try {
      const response = await fetch(`/api/address-search?q=${encodeURIComponent(value)}`);
      const data = await response.json();
      if (requestId !== addressRequest) return;
      renderSuggestions(Array.isArray(data.results) ? data.results : []);
    } catch (_) {
      if (requestId === addressRequest) hideSuggestions();
    }
  }

  function syncAddonCategory(toggle) {
    const key = toggle.dataset.addonToggle;
    const options = root.querySelector(`[data-addon-options="${key}"]`);
    if (!options) return;
    options.hidden = !toggle.checked;
    const radios = [...options.querySelectorAll('[data-addon-choice]')];
    radios.forEach((radio, index) => { radio.required = toggle.checked && index === 0; });
    if (!toggle.checked) radios.forEach((radio) => { radio.checked = false; });
  }

  root.querySelectorAll('[data-addon-toggle]').forEach((toggle) => {
    syncAddonCategory(toggle);
    toggle.addEventListener('change', () => syncAddonCategory(toggle));
  });

  form.addEventListener('click', async (e) => {
    const manual = e.target.closest('[data-use-manual]');
    if (manual) {
      e.preventDefault();
      manualAddress = true;
      clearTimeout(addressTimer);
      ++addressRequest;
      hideSuggestions();
      address?.setAttribute('autocomplete', 'street-address');
      address?.focus();
      manual.textContent = 'USING MANUAL ADDRESS';
      manual.classList.add('is-active');
      return;
    }

    const choice = e.target.closest('[data-address-choice]');
    if (choice && suggestions?._items) {
      e.preventDefault();
      const item = suggestions._items[Number(choice.dataset.addressChoice)];
      if (item?.label && address) {
        manualAddress = false;
        address.value = item.label;
        hideSuggestions();
        loadPropertyMap();
        address.focus();
      }
      return;
    }
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
      const bookingChoice = accept.dataset.accept;
      await postLead({ ...snapshot, stage:'quote_accepted', services:['lawn'], source:membershipIntent ? 'membership_quote' : 'instant_quote', bookingChoice, quote:currentQuote });
      status.textContent = bookingChoice === 'membership' ? 'Membership selected. Storeman will continue the setup from here.' : 'One-off service selected. Storeman will continue the booking from here.';
    }
  });
  form.addEventListener('submit', (e) => e.preventDefault());

  if (photoInput && photoSummary) photoInput.addEventListener('change', () => {
    const n = Math.min(photoInput.files.length, 3); photoSummary.textContent = n ? `${n} photo${n===1?'':'s'} selected` : 'Up to 3 photos';
  });

  address?.addEventListener('input', () => {
    const value = safe(address.value);
    if (mapAddress) mapAddress.textContent = value;
    clearTimeout(addressTimer);
    if (manualAddress) return;
    if (value.length < 3) { hideSuggestions(); return; }
    addressTimer = setTimeout(() => searchAddress(value), 250);
  });
  address?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideSuggestions();
  });
  address?.addEventListener('change', loadPropertyMap);
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.address-field')) hideSuggestions();
  });
})();