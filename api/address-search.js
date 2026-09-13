export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok:false, error:'Method not allowed' });
  }

  const q = String(req.query?.q || '').trim();
  if (q.length < 3) return res.status(200).json({ ok:true, results:[] });

  try {
    const url = new URL('https://photon.komoot.io/api/');
    url.searchParams.set('q', `${q}, Australia`);
    url.searchParams.set('limit', '6');
    url.searchParams.set('lang', 'en');

    const response = await fetch(url, {
      headers: { 'User-Agent': 'StoremanAddressSearch/1.0 (storeman.com.au)' }
    });
    if (!response.ok) throw new Error('Address search unavailable');
    const data = await response.json();

    const results = (data.features || []).map((feature) => {
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

    return res.status(200).json({ ok:true, results });
  } catch (_) {
    return res.status(200).json({ ok:false, results:[] });
  }
}
