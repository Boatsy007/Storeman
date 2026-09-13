const buckets = new Map();

function now() { return Date.now(); }

export function getClientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || String(req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown');
}

export function rateLimit(req, { key = 'default', limit = 20, windowMs = 5 * 60 * 1000 } = {}) {
  const ip = getClientIp(req);
  const bucketKey = `${key}:${ip}`;
  const cutoff = now() - windowMs;
  const existing = (buckets.get(bucketKey) || []).filter((ts) => ts > cutoff);
  if (existing.length >= limit) {
    buckets.set(bucketKey, existing);
    return { ok:false, retryAfterSeconds:Math.max(1, Math.ceil((existing[0] + windowMs - now()) / 1000)) };
  }
  existing.push(now());
  buckets.set(bucketKey, existing);

  if (buckets.size > 5000) {
    for (const [k, timestamps] of buckets.entries()) {
      if (!timestamps.some((ts) => ts > cutoff)) buckets.delete(k);
      if (buckets.size <= 4000) break;
    }
  }
  return { ok:true };
}

export function honeypotTriggered(body = {}) {
  return Boolean(String(body.website || body.companyWebsite || '').trim());
}

export function validatePhotos(value) {
  if (!Array.isArray(value)) return { ok:true, photos:[] };
  if (value.length > 3) return { ok:false, error:'Too many photos' };
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  const photos = [];
  for (const photo of value) {
    const type = String(photo?.type || '').toLowerCase();
    const content = String(photo?.content || '');
    const name = String(photo?.name || 'site-photo.jpg').slice(0, 120);
    if (!allowedTypes.has(type)) return { ok:false, error:'Unsupported photo type' };
    if (!/^[A-Za-z0-9+/=]+$/.test(content)) return { ok:false, error:'Invalid photo data' };
    if (content.length < 100 || content.length > 1400000) return { ok:false, error:'Photo size not allowed' };
    photos.push({ name, type, content });
  }
  return { ok:true, photos };
}
