function normalise(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/\b(street)\b/g, 'st')
    .replace(/\b(road)\b/g, 'rd')
    .replace(/\b(drive)\b/g, 'dr')
    .replace(/\b(avenue)\b/g, 'ave')
    .replace(/\b(court)\b/g, 'ct')
    .replace(/\b(place)\b/g, 'pl')
    .replace(/\b(crescent)\b/g, 'cres')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function queryParts(q = '') {
  const n = normalise(q);
  const tokens = n.split(/\s+/).filter(Boolean);
  const house = tokens.find((t) => /^\d+[a-z]?$/.test(t)) || '';
  const roadTypes = new Set(['st','rd','dr','ave','ct','pl','cres']);
  const houseIndex = house ? tokens.indexOf(house) : -1;
  const typeIndex = tokens.findIndex((t, i) => i > houseIndex && roadTypes.has(t));
  const streetPhrase = typeIndex > houseIndex
    ? tokens.slice(houseIndex + 1, typeIndex + 1).join(' ')
    : tokens.slice(houseIndex + 1, Math.min(tokens.length, houseIndex + 3)).join(' ');
  const localityTokens = typeIndex >= 0 ? tokens.slice(typeIndex + 1) : [];
  return { n, tokens, house, streetPhrase, localityTokens };
}

function scoreResult(label, q) {
  const l = normalise(label);
  const { house, streetPhrase, localityTokens } = queryParts(q);
  if (streetPhrase && !l.includes(streetPhrase)) return -999;
  let score = 0;
  if (house) {
    if (new RegExp(`(^|\\s)${house}(\\s|$)`).test(l)) score += 8;
    else score -= 2;
  }
  if (streetPhrase && l.includes(streetPhrase)) score += 12;
  localityTokens.forEach((token) => {
    if (token.length >= 3 && l.includes(token)) score += 3;
  });
  if (l.includes('upper coomera')) score += 3;
  if (l.includes('queensland') || l.includes('qld')) score += 1;
  if (l.includes('australia')) score += 1;
  return score;
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = normalise(item.label);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function photonSearch(q) {
  const url = new URL('https://photon.komoot.io/api/');
  url.searchParams.set('q', `${q}, Queensland, Australia`);
  url.searchParams.set('limit', '12');
  url.searchParams.set('lang', 'en');
  const response = await fetch(url, { headers: { 'User-Agent': 'StoremanAddressSearch/1.2 (storeman.com.au)' } });
  if (!response.ok) return [];
  const data = await response.json();
  return (data.features || []).map((feature) => {
    const p = feature.properties || {};
    const parts = [
      [p.housenumber, p.street].filter(Boolean).join(' '),
      p.suburb || p.district || p.city,
      p.state,
      p.postcode,
      p.country
    ].filter(Boolean);
    return {
      label: parts.join(', '),
      lat: feature.geometry?.coordinates?.[1] ?? null,
      lon: feature.geometry?.coordinates?.[0] ?? null
    };
  }).filter((item) => /Australia/i.test(item.label));
}

async function nominatimSearch(q) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', `${q}, Queensland, Australia`);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('countrycodes', 'au');
  url.searchParams.set('limit', '12');
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'StoremanAddressSearch/1.2 (storeman.com.au; hello@storeman.com.au)',
      'Accept-Language': 'en-AU,en'
    }
  });
  if (!response.ok) return [];
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map((item) => ({
    label: item.display_name,
    lat: item.lat ? Number(item.lat) : null,
    lon: item.lon ? Number(item.lon) : null
  }));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok:false, error:'Method not allowed' });
  }

  const q = String(req.query?.q || '').trim();
  if (q.length < 3) return res.status(200).json({ ok:true, results:[] });

  try {
    const settled = await Promise.allSettled([photonSearch(q), nominatimSearch(q)]);
    const combined = settled.flatMap((r) => r.status === 'fulfilled' ? r.value : []);
    const ranked = dedupe(combined)
      .map((item) => ({ ...item, _score: scoreResult(item.label, q) }))
      .filter((item) => item._score > 0)
      .sort((a,b) => b._score - a._score)
      .slice(0,6)
      .map(({ _score, ...item }) => item);

    return res.status(200).json({ ok:true, results:ranked });
  } catch (_) {
    return res.status(200).json({ ok:false, results:[] });
  }
}
