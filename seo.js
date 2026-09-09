(() => {
  const BASE = 'https://storeman.com.au';
  const path = location.pathname === '/index.html' ? '/' : location.pathname;
  const url = `${BASE}${path}`;
  const title = document.title || 'Storeman | External Property Solutions';
  const description = document.querySelector('meta[name="description"]')?.content || 'Commercial exterior property services across South East Queensland.';
  const heroImage = document.querySelector('main img, .hero img, .loc-hero-image img, .service-hero-image img, .contact-hero-image img')?.getAttribute('src') || '/assets/hero.jpg';
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

  const business = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BASE}/#business`,
    name: 'Storeman',
    alternateName: 'Storeman External Property Solutions',
    url: BASE,
    logo: `${BASE}/assets/storemanlogo.jpg`,
    image: `${BASE}/assets/hero.jpg`,
    telephone: '+61 1300 786 736',
    email: 'hello@storeman.com.au',
    description: 'Commercial exterior property services including mechanical sweeping, grounds maintenance, lawn and garden maintenance, exterior cleaning and fleet washing across South East Queensland.',
    areaServed: [
      { '@type': 'City', name: 'Gold Coast' },
      { '@type': 'City', name: 'Brisbane' },
      { '@type': 'AdministrativeArea', name: 'Logan' },
      { '@type': 'Place', name: 'Yatala' },
      { '@type': 'AdministrativeArea', name: 'South East Queensland' }
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+61 1300 786 736',
      contactType: 'customer service',
      areaServed: 'AU',
      availableLanguage: 'English'
    }
  };
  addJsonLd(business, 'storeman-business-schema');

  const serviceMap = [
    ['commercial-sweeping', 'Mechanical Sweeping'],
    ['sweeping.html', 'Mechanical Sweeping'],
    ['grounds-maintenance', 'Grounds Maintenance'],
    ['grounds.html', 'Grounds Maintenance'],
    ['lawn-garden-maintenance', 'Lawn & Garden Maintenance'],
    ['lawn-garden.html', 'Lawn & Garden Maintenance'],
    ['commercial-pressure-washing', 'Commercial Pressure Washing'],
    ['pressure-washing.html', 'Commercial Pressure Washing'],
    ['fleet-washing', 'Fleet & Vehicle Washing']
  ];
  const match = serviceMap.find(([needle]) => path.includes(needle));
  if (match) {
    const locationName = (path.match(/-(gold-coast|brisbane|logan|yatala)\.html$/)?.[1] || '')
      .replace('gold-coast', 'Gold Coast').replace('brisbane', 'Brisbane').replace('logan', 'Logan').replace('yatala', 'Yatala');
    addJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${url}#service`,
      name: locationName ? `${match[1]} ${locationName}` : match[1],
      serviceType: match[1],
      provider: { '@id': `${BASE}/#business` },
      areaServed: locationName ? { '@type': 'Place', name: locationName } : { '@type': 'AdministrativeArea', name: 'South East Queensland' },
      url,
      description
    }, 'storeman-service-schema');
  }

  if (path.includes('commercial-property-services-')) {
    const slug = path.match(/commercial-property-services-([^/.]+(?:-[^/.]+)*)\.html$/)?.[1] || '';
    const place = slug.split('-').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ');
    addJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${url}#service`,
      name: `Commercial Property Services ${place}`,
      serviceType: 'Commercial Exterior Property Services',
      provider: { '@id': `${BASE}/#business` },
      areaServed: { '@type': 'Place', name: place },
      url,
      description
    }, 'storeman-location-service-schema');
  }

  if (path !== '/') {
    const cleanTitle = title.replace(/\s*\|\s*Storeman.*$/i, '');
    addJsonLd({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
        { '@type': 'ListItem', position: 2, name: cleanTitle, item: url }
      ]
    }, 'storeman-breadcrumb-schema');
  }
})();
