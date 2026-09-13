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
        { '@type':'ListItem', position:2, name:'Storeman Lawn Green-Up — included with every standard lawn visit', url:`${BASE}/lawn-garden.html` },
        { '@type':'ListItem', position:3, name:'Hedge Trimming', url:`${BASE}/lawn-garden.html#addons` },
        { '@type':'ListItem', position:4, name:'Weed Treatment', url:`${BASE}/lawn-garden.html#addons` },
        { '@type':'ListItem', position:5, name:'Garden Tidy', url:`${BASE}/lawn-garden.html#addons` },
        { '@type':'ListItem', position:6, name:'Green Waste Removal', url:`${BASE}/lawn-garden.html#addons` },
        { '@type':'ListItem', position:7, name:'Commercial Grounds Care', url:`${BASE}/grounds.html` },
        { '@type':'ListItem', position:8, name:'Lawn Membership', url:`${BASE}/membership.html` }
      ]
    }, 'storeman-service-list-schema');

    const greenCard = [...document.querySelectorAll('.service-card')].find((card) => card.textContent.includes('LAWN') && card.textContent.includes('GREEN-UP'));
    if (greenCard) {
      const copy = greenCard.querySelector('.service-copy p');
      if (copy) copy.textContent = 'Included FREE in every standard Storeman lawn visit — our signature finishing treatment.';
      greenCard.setAttribute('href', '/lawn-garden.html');
    }

    const heroCopy = document.querySelector('.hero-copy > p:not(.eyebrow)');
    if (heroCopy && !heroCopy.textContent.includes('Green-Up')) {
      heroCopy.textContent = 'STOREMAN keeps homes, businesses and managed properties looking sharp with mowing, snipping, edging, hedge trimming, weed treatment, garden tidy-ups and reliable recurring grounds care — with Lawn Green-Up included in every standard lawn visit.';
    }

    const sequenceNote = document.querySelector('.complete-visit-note strong');
    if (sequenceNote) sequenceNote.textContent = 'MOW → SNIP → EDGE → BLOW & TIDY → LAWN GREEN-UP';

    const membershipIntro = document.querySelector('.commercial-plan-intro');
    if (membershipIntro && !membershipIntro.textContent.includes('Green-Up')) {
      membershipIntro.textContent = 'For customers who want lawn care handled automatically. Your visits are scheduled around the seasons, Lawn Green-Up is included with every standard visit, and the annual membership can be paid weekly, fortnightly or monthly.';
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