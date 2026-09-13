import { calculateQuote } from './_pricing.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body = {};
  try { body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); }
  catch (_) { return res.status(400).json({ ok:false, error:'Invalid request body' }); }

  const clean = (value, max = 2000) => String(value || '').replace(/[<>]/g, '').trim().slice(0, max);
  const cleanArray = (value, max = 20) => Array.isArray(value) ? value.slice(0, max).map((v) => clean(v, 200)).filter(Boolean) : [];
  const photos = Array.isArray(body.photos)
    ? body.photos.slice(0, 3).map((photo) => ({
        name: clean(photo?.name, 120) || 'site-photo.jpg',
        type: clean(photo?.type, 80) || 'image/jpeg',
        content: String(photo?.content || '')
      })).filter((photo) => photo.content && photo.content.length < 1400000)
    : [];

  const flags = cleanArray(body.flags, 20);
  const addons = cleanArray(body.addons, 20);
  const stage = clean(body.stage, 80);
  const source = clean(body.source, 80);
  const shouldCalculateOfficialQuote = ['instant_quote_generated','instant_quote_review','quote_accepted'].includes(stage)
    || ['instant_quote','membership_quote'].includes(source);

  let quote = null;
  if (shouldCalculateOfficialQuote) {
    quote = calculateQuote({ flags, addons });
  } else if (body.quote && typeof body.quote === 'object') {
    quote = {
      total: Number(body.quote.total || 0),
      formattedTotal: clean(body.quote.formattedTotal, 80),
      manualReview: Boolean(body.quote.manualReview),
      reviewReasons: cleanArray(body.quote.reviewReasons, 10),
      items: Array.isArray(body.quote.items) ? body.quote.items.slice(0, 20).map((item) => ({
        id: clean(item?.id, 80), label: clean(item?.label, 160), price: Number(item?.price || 0)
      })) : [],
      membership: body.quote.membership && typeof body.quote.membership === 'object' ? {
        visits: Number(body.quote.membership.visits || 0),
        discountPercent: Number(body.quote.membership.discountPercent || 0),
        annual: Number(body.quote.membership.annual || 0),
        weekly: Number(body.quote.membership.weekly || 0),
        fortnightly: Number(body.quote.membership.fortnightly || 0),
        monthly: Number(body.quote.membership.monthly || 0)
      } : null
    };
  }

  const lead = {
    id: clean(body.id, 120) || `stm_${Date.now().toString(36)}`,
    stage,
    source,
    name: clean(body.name, 160),
    business: clean(body.business, 160),
    email: clean(body.email, 200),
    phone: clean(body.phone, 80),
    address: clean(body.address, 300),
    services: cleanArray(body.services, 10),
    frequency: clean(body.frequency, 120),
    notes: clean(body.notes),
    lawnAreaM2: Number(body.lawnAreaM2 || 0),
    propertyType: clean(body.propertyType, 100),
    flags,
    addons,
    bookingChoice: clean(body.bookingChoice, 80),
    quote,
    quoteVerifiedServerSide: shouldCalculateOfficialQuote,
    photoNames: photos.map((photo) => photo.name),
    siteVisitFollowUp: Boolean(body.siteVisitFollowUp),
    receivedAt: new Date().toISOString()
  };

  if (!lead.name || !lead.email || !lead.phone || !lead.address) {
    return res.status(400).json({ ok: false, error: 'Missing required lead details' });
  }

  const notifyEmail = process.env.LEAD_NOTIFY_EMAIL || 'hello@storeman.com.au';
  const resendKey = process.env.RESEND_API_KEY;
  const webhook = process.env.LEADS_WEBHOOK_URL;
  const fromEmail = process.env.LEAD_FROM_EMAIL || 'Storeman Website <onboarding@resend.dev>';
  let notified = false, customerNotified = false, forwarded = false;

  if (webhook) {
    try {
      const r = await fetch(webhook, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(lead) });
      forwarded = r.ok;
    } catch (_) {}
  }

  const serviceLabels = { lawn:'Lawn Mowing', membership:'Lawn Membership', grounds:'Commercial Grounds' };
  const serviceText = lead.services.length ? lead.services.map((s) => serviceLabels[s] || s).join(', ') : 'Not selected yet';
  const stageLabels = {
    details_saved:'New quote lead — details saved',
    quote_requested:'Free quote requested',
    instant_quote_generated:'Instant quote generated',
    instant_quote_review:'Instant quote needs review',
    quote_accepted:'Quote accepted'
  };
  const quoteLines = lead.quote?.items?.map((item) => `<li>${item.label}: $${Number(item.price).toFixed(0)}</li>`).join('') || '';
  const quoteHtml = lead.quote ? `<div style="background:#f7f7f3;border-left:5px solid #ffe000;padding:16px 18px;margin:18px 0"><strong>${lead.quote.manualReview ? 'MANUAL REVIEW' : `QUOTE: ${lead.quote.formattedTotal || `$${lead.quote.total}`}`}</strong>${lead.quoteVerifiedServerSide ? '<div style="font-size:11px;margin-top:5px">Server verified</div>' : ''}${quoteLines ? `<ul>${quoteLines}</ul>` : ''}${lead.quote.reviewReasons?.length ? `<p>Review: ${lead.quote.reviewReasons.join(', ')}</p>` : ''}</div>` : '';

  if (resendKey) {
    const subjectName = lead.business || lead.name;
    const subject = `Storeman: ${stageLabels[lead.stage] || 'New website lead'} — ${subjectName}`;
    const ownerHtml = `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#111"><div style="background:#090909;padding:22px 26px;color:#ffe000;font-weight:900;font-size:24px">STOREMAN</div><div style="padding:26px;border:1px solid #e5e5e5;border-top:0"><h2>${stageLabels[lead.stage] || 'Website lead'}</h2>${quoteHtml}<p><strong>Contact:</strong> ${lead.name}</p>${lead.business ? `<p><strong>Business:</strong> ${lead.business}</p>` : ''}<p><strong>Phone:</strong> ${lead.phone}</p><p><strong>Email:</strong> ${lead.email}</p><p><strong>Address:</strong> ${lead.address}</p><p><strong>Services:</strong> ${serviceText}</p>${lead.propertyType ? `<p><strong>Property:</strong> ${lead.propertyType}</p>` : ''}${lead.flags.length ? `<p><strong>Flags:</strong> ${lead.flags.join(', ')}</p>` : ''}${lead.addons.length ? `<p><strong>Add-ons:</strong> ${lead.addons.join(', ')}</p>` : ''}${lead.bookingChoice ? `<p><strong>Customer selected:</strong> ${lead.bookingChoice}</p>` : ''}${lead.notes ? `<p><strong>Notes:</strong> ${lead.notes}</p>` : ''}${lead.photoNames.length ? `<p><strong>Photos:</strong> ${lead.photoNames.length} attached</p>` : ''}<hr style="border:0;border-top:1px solid #eee;margin:22px 0"><small>Lead ID: ${lead.id}<br>Received: ${lead.receivedAt}<br>Source: ${lead.source || 'website'}</small></div></div>`;

    try {
      const emailBody = { from:fromEmail, to:[notifyEmail], reply_to:lead.email, subject, html:ownerHtml };
      if (photos.length) emailBody.attachments = photos.map((photo) => ({ filename:photo.name, content:photo.content }));
      const r = await fetch('https://api.resend.com/emails', { method:'POST', headers:{ Authorization:`Bearer ${resendKey}`, 'Content-Type':'application/json' }, body:JSON.stringify(emailBody) });
      notified = r.ok;
    } catch (_) {}

    if (['quote_requested','instant_quote_generated','quote_accepted'].includes(lead.stage)) {
      const customerHtml = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#111"><div style="background:#090909;padding:22px 26px;color:#ffe000;font-weight:900;font-size:24px">STOREMAN</div><div style="padding:28px;border:1px solid #e5e5e5;border-top:0"><h2>Thanks ${lead.name}</h2>${lead.quote && !lead.quote.manualReview ? `<div style="background:#090909;color:#fff;padding:22px;margin:20px 0;border-left:7px solid #ffe000"><small>YOUR STOREMAN PRICE</small><div style="font-size:36px;font-weight:900;color:#ffe000;margin-top:6px">${lead.quote.formattedTotal || `$${lead.quote.total}`}</div><div>per visit</div></div>` : '<p>We’ve received your property details and will confirm the next step.</p>'}<p><strong>Property:</strong> ${lead.address}</p><p><strong>Phone:</strong> ${lead.phone}</p><p style="margin-top:24px"><strong>Storeman</strong><br>1300 STOREMAN<br>1300 786 736<br>hello@storeman.com.au</p></div></div>`;
      try {
        const r = await fetch('https://api.resend.com/emails', { method:'POST', headers:{ Authorization:`Bearer ${resendKey}`, 'Content-Type':'application/json' }, body:JSON.stringify({ from:fromEmail, to:[lead.email], reply_to:notifyEmail, subject:'Storeman property quote', html:customerHtml }) });
        customerNotified = r.ok;
      } catch (_) {}
    }
  }

  return res.status(200).json({ ok:true, id:lead.id, quote:lead.quote, quoteVerifiedServerSide:lead.quoteVerifiedServerSide, notified, customerNotified, forwarded, configured:Boolean(resendKey || webhook) });
}
