import { calculateQuote } from './_pricing.js';
import { honeypotTriggered, rateLimit } from './_security.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok:false, error:'Method not allowed' });
  }

  const limited = rateLimit(req, { key:'quote', limit:30, windowMs:5 * 60 * 1000 });
  if (!limited.ok) {
    res.setHeader('Retry-After', String(limited.retryAfterSeconds));
    return res.status(429).json({ ok:false, error:'Too many quote requests. Please try again shortly.' });
  }

  let body = {};
  try { body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); }
  catch (_) { return res.status(400).json({ ok:false, error:'Invalid request body' }); }

  if (honeypotTriggered(body)) {
    return res.status(200).json({ ok:true, quote:null });
  }

  const cleanArray = (value, max = 20) => Array.isArray(value)
    ? value.slice(0, max).map((v) => String(v || '').trim().slice(0, 100)).filter(Boolean)
    : [];

  const input = {
    flags: cleanArray(body.flags, 20),
    addons: cleanArray(body.addons, 20)
  };

  const quote = calculateQuote(input);
  return res.status(200).json({ ok:true, quote });
}
