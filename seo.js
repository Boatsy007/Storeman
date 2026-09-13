(() => {
  const BASE = 'https://storeman.com.au';
  const path = location.pathname === '/index.html' ? '/' : location.pathname;
  const url = `${BASE}${path}`;
  const title = document.title || 'Storeman | Complete Exterior Care';
  const description = document.querySelector('meta[name="description"]')?.content || 'Professional lawn mowing and grounds care for residential and commercial properties across the Gold Coast and South East Queensland.';
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

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE}/#organization`,
    name: 'Storeman',
    alternateName: 'Storeman Complete Exterior Care',
    url: BASE,
    logo: `${BASE}/assets/storemanlogo.jpg`,
    image: `${BASE}/assets/mowing.jpg`,
    telephone: '+61 1300 786 736',
    email: 'hello@storeman.com.au',
    description: 'Professional lawn mowing and grounds care for residential and commercial properties across the Gold Coast and South East Queensland.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+61 1300 786 736',
      contactType: 'customer service',
      areaServed: 'South East Queensland',
      availableLanguage: 'English'
    }
  };
  addJsonLd(organization, 'storeman-organization-schema');

  if (path === '/') {
    addJsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${BASE}/#website`,
      url: BASE,
      name: 'Storeman',
      publisher: { '@id': `${BASE}/#organization` }
    }, 'storeman-website-schema');

    // Give Lawn Membership a dedicated page while keeping the homepage summary.
    document.querySelectorAll('a[href="#membership"]').forEach((link) => {
      if (link.closest('.desktop-nav') || link.closest('.footer-nav') || link.closest('.service-card')) {
        link.setAttribute('href', '/membership.html');
      }
    });

    const membershipSection = document.getElementById('membership');
    if (membershipSection && !membershipSection.querySelector('.membership-home-actions')) {
      const actions = document.createElement('div');
      actions.className = 'membership-home-actions';
      actions.innerHTML = '<a class="button button-white" href="/membership.html">VIEW MEMBERSHIP <span>→</span></a><button class="button button-yellow membership-join-placeholder" type="button" aria-label="Become a Storeman Lawn Member">BECOME A MEMBER <span>→</span></button>';
      membershipSection.querySelector('.container')?.appendChild(actions);

      const style = document.createElement('style');
      style.textContent = `.membership-home-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:26px}.membership-home-actions .button{min-width:190px;justify-content:center}.membership-join-placeholder{cursor:default}@media(max-width:680px){.membership-home-actions{display:grid;grid-template-columns:1fr}.membership-home-actions .button{width:100%}}`;
      document.head.appendChild(style);
    }
  }

  const serviceMap = [
    ['commercial-sweeping', 'Mechanical Sweeping', 'Mechanical Sweeping'],
    ['sweeping.html', 'Mechanical Sweeping', 'Mechanical Sweeping'],
    ['grounds-maintenance', 'Commercial Grounds Maintenance', 'Grounds Maintenance'],
    ['grounds.html', 'Commercial Grounds Maintenance', 'Grounds Maintenance'],
    ['lawn-garden-maintenance', 'Residential & Commercial Lawn Mowing and Garden Maintenance', 'Lawn & Garden'],
    ['lawn-garden.html', 'Residential & Commercial Lawn Mowing and Garden Maintenance', 'Lawn & Garden'],
    ['membership.html', 'Storeman Lawn Membership', 'Lawn Membership']
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
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${url}#service`,
      name: locationName ? `${serviceMatch[1]} ${locationName}` : serviceMatch[1],
      serviceType: serviceMatch[1],
      provider: { '@id': `${BASE}/#organization` },
      areaServed: locationName
        ? { '@type': 'Place', name: locationName }
        : { '@type': 'AdministrativeArea', name: 'South East Queensland' },
      url,
      description
    }, 'storeman-service-schema');
  }

  let suburbName = '';
  if (path.includes('commercial-property-services-')) {
    const slug = path.match(/commercial-property-services-([^/.]+(?:-[^/.]+)*)\.html$/)?.[1] || '';
    suburbName = slug.split('-').map(word => word ? word[0].toUpperCase() + word.slice(1) : '').join(' ');

    addJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${url}#service`,
      name: `Commercial Property Maintenance ${suburbName}`,
      serviceType: 'Commercial Property Maintenance',
      provider: { '@id': `${BASE}/#organization` },
      areaServed: { '@type': 'Place', name: suburbName },
      url,
      description
    }, 'storeman-location-service-schema');
  }

  const addBreadcrumbs = (items) => {
    addJsonLd({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.item
      }))
    }, 'storeman-breadcrumb-schema');
  };

  if (path !== '/') {
    const cleanTitle = title.replace(/\s*\|\s*Storeman.*$/i, '');

    if (path.includes('commercial-property-services-') && suburbName) {
      addBreadcrumbs([
        { name: 'Home', item: BASE },
        { name: 'Service Areas', item: `${BASE}/areas.html` },
        { name: suburbName, item: url }
      ]);
    } else if (serviceMatch && locationName) {
      const corePath = serviceMatch[0].startsWith('commercial-sweeping')
        ? '/sweeping.html'
        : serviceMatch[0].startsWith('grounds-maintenance')
          ? '/grounds.html'
          : '/lawn-garden.html';
      addBreadcrumbs([
        { name: 'Home', item: BASE },
        { name: 'Services', item: `${BASE}/#services` },
        { name: serviceMatch[2], item: `${BASE}${corePath}` },
        { name: locationName, item: url }
      ]);
    } else if (serviceMatch) {
      addBreadcrumbs([
        { name: 'Home', item: BASE },
        { name: 'Services', item: `${BASE}/#services` },
        { name: serviceMatch[2], item: url }
      ]);
    } else if (path === '/areas.html') {
      addBreadcrumbs([
        { name: 'Home', item: BASE },
        { name: 'Service Areas', item: url }
      ]);
    } else {
      addBreadcrumbs([
        { name: 'Home', item: BASE },
        { name: cleanTitle, item: url }
      ]);
    }
  }
})();
