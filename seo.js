(() => {
  const BASE = 'https://storeman.com.au';
  const path = location.pathname === '/index.html' ? '/' : location.pathname;
  const url = `${BASE}${path}`;
  const title = document.title || 'Storeman | Complete Exterior Care';
  const description = document.querySelector('meta[name="description"]')?.content || 'Professional lawn mowing and grounds care with Storeman Lawn Green-Up included in every standard lawn visit across South East Queensland.';
  const heroImage = document.querySelector('main img, .hero img, .loc-hero-image img, .service-hero-image img, .contact-hero-image img')?.getAttribute('src') || '/assets/mowing.jpg';
  const absoluteImage = heroImage.startsWith('http') ? heroImage : `${BASE}${heroImage.startsWith('/') ? '' : '/'}${heroImage}`;

  const upsertMeta = (attr, key, content) => {
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const upsertLink = (rel, href) => {
    let el = document.head.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
  };

  const addJsonLd = (data, id) => {
    if (document.getElementById(id)) return;
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    el.textContent = JSON.stringify(data);
    document.head.appendChild(el);
  };

  upsertLink('canonical', url);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:site_name', 'Storeman');
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:url', url);
  upsertMeta('property', 'og:image', absoluteImage);
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', absoluteImage);

  const serviceAreas = [
    { '@type':'AdministrativeArea', name:'Gold Coast' },
    { '@type':'AdministrativeArea', name:'Brisbane' },
    { '@type':'AdministrativeArea', name:'Logan' },
    { '@type':'Place', name:'Yatala' },
    { '@type':'AdministrativeArea', name:'South East Queensland' }
  ];

  addJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE}/#organization`,
    name: 'Storeman',
    alternateName: 'Storeman Complete Exterior Care',
    url: BASE,
    logo: `${BASE}/assets/storemanlogo.jpg`,
    image: `${BASE}/assets/mowing.jpg`,
    telephone: '1300 786 736',
    email: 'hello@storeman.com.au',
    description: 'Professional residential and commercial lawn mowing and grounds care, with Storeman Lawn Green-Up included in every standard lawn visit across South East Queensland.',
    areaServed: serviceAreas,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '1300 786 736',
      contactType: 'customer service',
      areaServed: serviceAreas,
      availableLanguage: ['English']
    }
  }, 'storeman-organization-schema');

  addJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { '@id': `${BASE}/#website` },
    about: { '@id': `${BASE}/#organization` },
    primaryImageOfPage: { '@type':'ImageObject', url:absoluteImage }
  }, 'storeman-webpage-schema');

  if (path === '/') {
    addJsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${BASE}/#website`,
      url: BASE,
      name: 'Storeman',
      publisher: { '@id': `${BASE}/#organization` }
    }, 'storeman-website-schema');

    addJsonLd({
      '@context':'https://schema.org',
      '@type':'ItemList',
      name:'Storeman services',
      itemListElement:[
        { '@type':'ListItem', position:1, name:'Lawn Mowing', url:`${BASE}/lawn-garden.html` },
        { '@type':'ListItem', position:2, name:'The Storeman Finish — Lawn Green-Up included with every standard lawn visit', url:`${BASE}/lawn-garden.html` },
        { '@type':'ListItem', position:3, name:'Hedge Trimming', url:`${BASE}/lawn-garden.html#addons` },
        { '@type':'ListItem', position:4, name:'Weed Treatment', url:`${BASE}/lawn-garden.html#addons` },
        { '@type':'ListItem', position:5, name:'Garden Tidy', url:`${BASE}/lawn-garden.html#addons` },
        { '@type':'ListItem', position:6, name:'Green Waste Removal', url:`${BASE}/lawn-garden.html#addons` },
        { '@type':'ListItem', position:7, name:'Commercial Grounds Care', url:`${BASE}/grounds.html` },
        { '@type':'ListItem', position:8, name:'Lawn Membership', url:`${BASE}/membership.html` }
      ]
    }, 'storeman-service-list-schema');

    const heroCopy = document.querySelector('.hero-copy');
    if (heroCopy && !heroCopy.querySelector('.greenup-hero-badge')) {
      const badge = document.createElement('div');
      badge.className = 'greenup-hero-badge';
      badge.innerHTML = '<span>✓ INCLUDED FREE</span><strong>THE STOREMAN FINISH</strong><small>LAWN GREEN-UP WITH EVERY STANDARD VISIT</small>';
      const heroActions = heroCopy.querySelector('.hero-actions');
      if (heroActions) heroCopy.insertBefore(badge, heroActions);
    }

    const heroText = document.querySelector('.hero-copy > p:not(.eyebrow)');
    if (heroText) {
      heroText.textContent = 'Professional mowing and grounds care for homes, businesses and managed properties — plus our signature Lawn Green-Up finish included with every standard lawn visit.';
    }

    const hero = document.querySelector('.hero');
    if (hero && !document.querySelector('.storeman-finish-band')) {
      const band = document.createElement('section');
      band.className = 'storeman-finish-band';
      band.setAttribute('aria-label', 'The Storeman Finish');
      band.innerHTML = `<div class="storeman-finish-inner"><div class="storeman-finish-kicker">THE DIFFERENCE YOU CAN SEE</div><div class="storeman-finish-grid"><div class="storeman-finish-copy"><div class="storeman-finish-free">✓ INCLUDED FREE</div><h2>THE STOREMAN<br><span>FINISH.</span></h2><h3>WE DON'T JUST CUT IT.<br>WE FINISH IT GREEN.</h3><p>Every standard Storeman lawn visit finishes with Lawn Green-Up where suitable — included at <strong>$0 extra</strong>.</p><a href="/quote.html" class="storeman-finish-cta">GET MY FREE INSTANT QUOTE →</a></div><div class="storeman-finish-flow"><div><b>01</b><strong>MOW</strong></div><div><b>02</b><strong>SNIP</strong></div><div><b>03</b><strong>EDGE</strong></div><div><b>04</b><strong>BLOW + TIDY</strong></div><div class="finish-final"><b>05</b><strong>GREEN-UP</strong><span>$0 EXTRA</span></div></div></div></div>`;
      hero.insertAdjacentElement('afterend', band);
    }

    const sequence = document.querySelector('.visit-sequence');
    if (sequence && !sequence.querySelector('.visit-step-greenup')) {
      const step = document.createElement('article');
      step.className = 'visit-step visit-step-greenup';
      step.innerHTML = '<div class="visit-step-media greenup-media"><div class="greenup-media-mark">GREEN<br>FINISH</div></div><div class="visit-step-body"><span class="visit-step-no">05</span><h3>LAWN GREEN-UP</h3><p>Our signature finishing treatment is included with every standard lawn visit where suitable.</p><strong class="included-pill">INCLUDED FREE</strong></div>';
      sequence.appendChild(step);
    }

    const sequenceHeading = document.querySelector('#complete-service-title');
    if (sequenceHeading) sequenceHeading.innerHTML = 'CUT. CLEAN.<br><span>FINISHED GREEN.</span>';
    const sequenceIntro = document.querySelector('.complete-visit-intro');
    if (sequenceIntro) sequenceIntro.textContent = 'The Storeman Standard does more than cut the grass. Every standard visit follows the full five-step finish, ending with Lawn Green-Up where suitable — included at no extra charge.';
    const sequenceNote = document.querySelector('.complete-visit-note strong');
    if (sequenceNote) sequenceNote.textContent = 'MOW → SNIP → EDGE → BLOW & TIDY → LAWN GREEN-UP';
    const sequenceTag = document.querySelector('.complete-visit-note span');
    if (sequenceTag) sequenceTag.textContent = 'THE STOREMAN FINISH · INCLUDED FREE';

    const greenCard = [...document.querySelectorAll('.service-card')].find((card) => card.textContent.includes('LAWN') && card.textContent.includes('GREEN-UP'));
    if (greenCard) {
      greenCard.classList.add('signature-service-card');
      greenCard.setAttribute('href', '/lawn-garden.html');
      const titleEl = greenCard.querySelector('h3');
      const copy = greenCard.querySelector('.service-copy p');
      if (titleEl) titleEl.innerHTML = 'THE STOREMAN<br>FINISH';
      if (copy) copy.textContent = 'Lawn Green-Up included FREE with every standard Storeman lawn visit.';
      if (!greenCard.querySelector('.service-free-badge')) {
        const free = document.createElement('span');
        free.className = 'service-free-badge';
        free.textContent = '✓ INCLUDED FREE';
        greenCard.querySelector('.service-copy')?.prepend(free);
      }
    }

    const membershipIntro = document.querySelector('.commercial-plan-intro');
    if (membershipIntro) {
      membershipIntro.textContent = 'For customers who want lawn care handled automatically. Every scheduled standard visit includes The Storeman Finish — Lawn Green-Up at no extra charge — with the annual membership payable weekly, fortnightly or monthly.';
    }

    const faqList = document.querySelector('.faq-list');
    if (faqList && !faqList.querySelector('[data-greenup-faq]')) {
      const faq = document.createElement('details');
      faq.setAttribute('data-greenup-faq', 'true');
      faq.innerHTML = '<summary>What is The Storeman Finish?<span>+</span></summary><p>The Storeman Finish is our signature final step: Lawn Green-Up applied where suitable after the standard mow, snip, edge, blow and tidy. It is included with every standard lawn visit at no extra charge.</p>';
      faqList.prepend(faq);
    }

    const snipImage = document.querySelector('.visit-step:nth-child(2) img');
    if (snipImage) snipImage.addEventListener('error', () => { snipImage.src = '/assets/mowing.jpg'; }, { once:true });

    if (!document.getElementById('storeman-finish-marketing-style')) {
      const style = document.createElement('style');
      style.id = 'storeman-finish-marketing-style';
      style.textContent = `
        .greenup-hero-badge{margin:20px 0 22px;padding:14px 16px;border:2px solid #ffe000;background:rgba(255,224,0,.08);display:grid;grid-template-columns:auto 1fr;gap:4px 12px;max-width:560px}.greenup-hero-badge span{grid-row:1/3;background:#ffe000;color:#111;padding:9px 10px;font-family:"Archivo Black",sans-serif;font-size:10px;align-self:stretch;display:grid;place-items:center}.greenup-hero-badge strong{color:#ffe000;font-family:"Archivo Black",sans-serif;font-size:18px;line-height:1}.greenup-hero-badge small{color:#fff;font-size:10px;font-weight:900;letter-spacing:.7px}
        .storeman-finish-band{background:#ffe000;color:#111;border-top:5px solid #111;border-bottom:5px solid #111}.storeman-finish-inner{max-width:1500px;margin:0 auto;padding:54px 28px}.storeman-finish-kicker{font-family:"Archivo Black",sans-serif;font-size:12px;letter-spacing:3px;margin-bottom:22px}.storeman-finish-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:48px;align-items:end}.storeman-finish-free{display:inline-block;background:#111;color:#ffe000;padding:9px 12px;font-family:"Archivo Black",sans-serif;font-size:11px;margin-bottom:18px}.storeman-finish-copy h2{margin:0;font-family:"Archivo Black",sans-serif;font-size:clamp(54px,7vw,108px);line-height:.78;letter-spacing:-5px}.storeman-finish-copy h2 span{color:#fff;text-shadow:4px 4px 0 #111;-webkit-text-stroke:2px #111}.storeman-finish-copy h3{font-family:"Archivo Black",sans-serif;font-size:clamp(24px,2.4vw,38px);line-height:.98;margin:28px 0 12px}.storeman-finish-copy p{max-width:620px;font-size:16px;line-height:1.55;margin:0 0 22px}.storeman-finish-cta{display:inline-flex;background:#111;color:#ffe000;text-decoration:none;padding:16px 20px;font-family:"Archivo Black",sans-serif;font-size:12px}.storeman-finish-flow{display:grid;grid-template-columns:repeat(5,1fr);border:3px solid #111}.storeman-finish-flow>div{min-height:126px;background:#fff;padding:16px;border-right:2px solid #111;display:flex;flex-direction:column;justify-content:space-between}.storeman-finish-flow>div:last-child{border-right:0}.storeman-finish-flow b{font-family:"Archivo Black",sans-serif;font-size:10px}.storeman-finish-flow strong{font-family:"Archivo Black",sans-serif;font-size:15px;line-height:1}.storeman-finish-flow .finish-final{background:#111;color:#ffe000}.storeman-finish-flow .finish-final span{font-family:"Archivo Black",sans-serif;font-size:10px;border:1px solid #ffe000;padding:5px 6px;align-self:flex-start}
        .visit-step-greenup{border-color:#ffe000!important}.visit-step-greenup .visit-step-body{background:#ffe000!important;color:#111!important}.visit-step-greenup .visit-step-no,.visit-step-greenup h3,.visit-step-greenup p{color:#111!important}.greenup-media{background:#111!important;display:grid!important;place-items:center!important}.greenup-media-mark{font-family:"Archivo Black",sans-serif;font-size:clamp(30px,4vw,56px);line-height:.82;color:#ffe000;text-align:center;transform:rotate(-4deg)}.included-pill{display:inline-block;margin-top:10px;background:#111;color:#ffe000;padding:7px 9px;font-family:"Archivo Black",sans-serif;font-size:9px}
        .signature-service-card{outline:4px solid #ffe000;outline-offset:-4px;position:relative}.signature-service-card .service-copy{background:#111!important;color:#fff!important}.signature-service-card .service-copy p,.signature-service-card h3{color:#fff!important}.signature-service-card .arrow{color:#ffe000!important}.service-free-badge{display:inline-block;background:#ffe000;color:#111;padding:7px 9px;font-family:"Archivo Black",sans-serif;font-size:9px;margin-bottom:12px}
        @media(max-width:900px){.storeman-finish-grid{grid-template-columns:1fr}.storeman-finish-flow{grid-template-columns:1fr 1fr}.storeman-finish-flow>div{min-height:90px;border-bottom:2px solid #111}.storeman-finish-flow>div:nth-child(2n){border-right:0}.storeman-finish-flow>div:last-child{grid-column:1/-1;border-bottom:0}.storeman-finish-copy h2{letter-spacing:-3px}}
        @media(max-width:680px){.greenup-hero-badge{grid-template-columns:1fr;padding:10px;margin:18px 0}.greenup-hero-badge span{grid-row:auto;padding:8px}.greenup-hero-badge strong{font-size:17px}.greenup-hero-badge small{font-size:9px;line-height:1.3}.storeman-finish-inner{padding:38px 26px}.storeman-finish-grid{gap:28px}.storeman-finish-copy h2{font-size:58px;line-height:.82;letter-spacing:-3.5px}.storeman-finish-copy h3{font-size:25px;margin-top:22px}.storeman-finish-copy p{font-size:14px}.storeman-finish-cta{width:100%;justify-content:center}.storeman-finish-flow{grid-template-columns:1fr}.storeman-finish-flow>div,.storeman-finish-flow>div:nth-child(2n){border-right:0;border-bottom:2px solid #111;min-height:74px;display:grid;grid-template-columns:38px 1fr;align-items:center;gap:10px}.storeman-finish-flow .finish-final{grid-column:auto;grid-template-columns:38px 1fr auto}.storeman-finish-flow .finish-final span{align-self:center}.visit-step-greenup .greenup-media{min-height:190px}}
      `;
      document.head.appendChild(style);
    }
  }

  const serviceMap = [
    ['grounds.html', 'Commercial Grounds Care', 'Commercial Grounds'],
    ['lawn-garden-maintenance', 'Lawn Mowing & Grounds Care with Lawn Green-Up Included', 'Lawn & Grounds Care'],
    ['lawn-garden.html', 'Lawn Mowing & Grounds Care with Lawn Green-Up Included', 'Lawn & Grounds Care'],
    ['membership.html', 'Storeman Lawn Membership with Lawn Green-Up Included', 'Lawn Membership']
  ];
  const serviceMatch = serviceMap.find(([needle]) => path.includes(needle));
  const locationMatch = path.match(/-(gold-coast|brisbane|logan|yatala)\.html$/);
  const locationName = (locationMatch?.[1] || '')
    .replace('gold-coast', 'Gold Coast')
    .replace('brisbane', 'Brisbane')
    .replace('logan', 'Logan')
    .replace('yatala', 'Yatala');

  if (serviceMatch) {
    addJsonLd({
      '@context':'https://schema.org',
      '@type':'Service',
      '@id':`${url}#service`,
      name: locationName ? `${serviceMatch[1]} ${locationName}` : serviceMatch[1],
      serviceType:serviceMatch[1],
      provider:{ '@id':`${BASE}/#organization` },
      areaServed:locationName ? { '@type':'Place', name:locationName } : serviceAreas,
      url,
      description
    }, 'storeman-service-schema');
  }

  const details = [...document.querySelectorAll('details')]
    .map((detail) => ({
      question: detail.querySelector('summary')?.cloneNode(true),
      answer: detail.querySelector('p')?.textContent?.trim() || ''
    }))
    .map(({question, answer}) => {
      question?.querySelectorAll('span').forEach((node) => node.remove());
      return { question: question?.textContent?.trim() || '', answer };
    })
    .filter((item) => item.question && item.answer);

  if (details.length) {
    addJsonLd({
      '@context':'https://schema.org',
      '@type':'FAQPage',
      mainEntity:details.map((item) => ({
        '@type':'Question',
        name:item.question,
        acceptedAnswer:{ '@type':'Answer', text:item.answer }
      }))
    }, 'storeman-faq-schema');
  }

  const addBreadcrumbs = (items) => addJsonLd({
    '@context':'https://schema.org',
    '@type':'BreadcrumbList',
    itemListElement:items.map((item,index) => ({ '@type':'ListItem', position:index+1, name:item.name, item:item.item }))
  }, 'storeman-breadcrumb-schema');

  if (path !== '/') {
    const cleanTitle = title.replace(/\s*\|\s*Storeman.*$/i, '');
    if (serviceMatch && locationName) {
      addBreadcrumbs([
        { name:'Home', item:BASE },
        { name:'Service Areas', item:`${BASE}/areas.html` },
        { name:serviceMatch[2], item:`${BASE}/lawn-garden.html` },
        { name:locationName, item:url }
      ]);
    } else if (serviceMatch) {
      addBreadcrumbs([
        { name:'Home', item:BASE },
        { name:'Services', item:`${BASE}/#services` },
        { name:serviceMatch[2], item:url }
      ]);
    } else if (path === '/areas.html') {
      addBreadcrumbs([{ name:'Home', item:BASE }, { name:'Service Areas', item:url }]);
    } else {
      addBreadcrumbs([{ name:'Home', item:BASE }, { name:cleanTitle, item:url }]);
    }
  }

  if (path === '/' && !document.getElementById('storeman-service-grid-style')) {
    const style = document.createElement('style');
    style.id = 'storeman-service-grid-style';
    style.textContent = `.storeman-full-services{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:14px!important}.storeman-full-services .service-card{min-width:0}.storeman-full-services .service-image{height:175px}.storeman-full-services .service-copy{min-height:205px}.storeman-full-services .service-title h3{font-size:24px}@media(max-width:1050px){.storeman-full-services{grid-template-columns:repeat(2,minmax(0,1fr))!important}}@media(max-width:680px){.storeman-full-services{grid-template-columns:1fr!important}.storeman-full-services .service-image{height:210px}.storeman-full-services .service-copy{min-height:0}}.membership-home-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:26px}.membership-home-actions .button{min-width:190px;justify-content:center}@media(max-width:680px){.membership-home-actions{display:grid;grid-template-columns:1fr}.membership-home-actions .button{width:100%}}`;
    document.head.appendChild(style);
  }
})();