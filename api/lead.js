export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const clean = (value) => String(value || '').replace(/[<>]/g, '').trim().slice(0, 500);

  const lead = {
    id: clean(body.id) || `stm_${Date.now().toString(36)}`,
    stage: clean(body.stage),
    name: clean(body.name),
    business: clean(body.business),
    email: clean(body.email),
    phone: clean(body.phone),
    address: clean(body.address),
    services: Array.isArray(body.services) ? body.services.map(clean).slice(0, 10) : [],
    frequency: clean(body.frequency),
    estimateMin: Number(body.estimateMin) || null,
    estimateMax: Number(body.estimateMax) || null,
    estimate: clean(body.estimate),
    siteVisitRequested: Boolean(body.siteVisitRequested),
    receivedAt: new Date().toISOString()
  };

  if (!lead.name || !lead.business || !lead.email || !lead.phone || !lead.address) {
    return res.status(400).json({ ok: false, error: 'Missing required lead details' });
  }

  const notifyEmail = process.env.LEAD_NOTIFY_EMAIL || 'hello@storeman.com.au';
  const resendKey = process.env.RESEND_API_KEY;
  const webhook = process.env.LEADS_WEBHOOK_URL;
  let notified = false;
  let forwarded = false;

  if (webhook) {
    try {
      const webhookResponse = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
      forwarded = webhookResponse.ok;
    } catch (_) {}
  }

  if (resendKey) {
    const serviceLabels = {
      sweeping: 'Mechanical Sweeping',
      grounds: 'Grounds Maintenance',
      lawn: 'Lawn & Garden',
      pressure: 'Pressure Washing',
      fleet: 'Fleet Washing'
    };

    const serviceText = lead.services.length
      ? lead.services.map((service) => serviceLabels[service] || service).join(', ')
      : 'Not selected yet';

    const stageLabels = {
      details_saved: 'New estimate lead — details saved',
      estimate_completed: 'Instant estimate completed',
      site_visit_requested: 'Site visit requested'
    };

    const subject = `Storeman: ${stageLabels[lead.stage] || 'New website lead'} — ${lead.business}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#111">
        <div style="background:#090909;padding:22px 26px;color:#ffe000;font-weight:900;font-size:24px">STOREMAN</div>
        <div style="padding:26px;border:1px solid #e5e5e5;border-top:0">
          <h2 style="margin:0 0 18px">${stageLabels[lead.stage] || 'Website lead'}</h2>
          <p><strong>Business:</strong> ${lead.business}</p>
          <p><strong>Contact:</strong> ${lead.name}</p>
          <p><strong>Phone:</strong> ${lead.phone}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Address:</strong> ${lead.address}</p>
          <p><strong>Services:</strong> ${serviceText}</p>
          <p><strong>Frequency:</strong> ${lead.frequency || 'Not selected yet'}</p>
          ${lead.estimateMin && lead.estimateMax ? `<p><strong>Estimate:</strong> $${lead.estimateMin.toLocaleString('en-AU')} – $${lead.estimateMax.toLocaleString('en-AU')} + GST</p>` : ''}
          ${lead.estimate ? `<p><strong>Estimate:</strong> ${lead.estimate}</p>` : ''}
          <p><strong>Site visit:</strong> ${lead.siteVisitRequested ? 'REQUESTED' : 'Not requested yet'}</p>
          <hr style="border:0;border-top:1px solid #eee;margin:22px 0">
          <small>Lead ID: ${lead.id}<br>Received: ${lead.receivedAt}</small>
        </div>
      </div>`;

    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.LEAD_FROM_EMAIL || 'Storeman Website <onboarding@resend.dev>',
          to: [notifyEmail],
          reply_to: lead.email,
          subject,
          html
        })
      });
      notified = emailResponse.ok;
    } catch (_) {}
  }

  return res.status(200).json({
    ok: true,
    id: lead.id,
    notified,
    forwarded,
    configured: Boolean(resendKey || webhook)
  });
}
