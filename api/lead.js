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
    modelVersion: clean(body.modelVersion),
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
    siteVisitFollowUp: Boolean(body.siteVisitFollowUp),
    receivedAt: new Date().toISOString()
  };

  if (!lead.name || !lead.business || !lead.email || !lead.phone || !lead.address) {
    return res.status(400).json({ ok: false, error: 'Missing required lead details' });
  }

  const notifyEmail = process.env.LEAD_NOTIFY_EMAIL || 'hello@storeman.com.au';
  const resendKey = process.env.RESEND_API_KEY;
  const webhook = process.env.LEADS_WEBHOOK_URL;
  const fromEmail = process.env.LEAD_FROM_EMAIL || 'Storeman Website <onboarding@resend.dev>';
  let notified = false;
  let customerNotified = false;
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

  const estimateText = lead.estimate || (
    lead.estimateMin && lead.estimateMax
      ? `$${lead.estimateMin.toLocaleString('en-AU')} – $${lead.estimateMax.toLocaleString('en-AU')} + GST`
      : ''
  );

  const stageLabels = {
    details_saved: 'New estimate lead — details saved',
    estimate_completed: 'Instant estimate completed — arrange site visit',
    site_visit_requested: 'Site visit requested'
  };

  if (resendKey) {
    const subject = `Storeman: ${stageLabels[lead.stage] || 'New website lead'} — ${lead.business}`;
    const ownerHtml = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#111">
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
          ${estimateText ? `<p style="font-size:18px"><strong>Estimate:</strong> ${estimateText}</p>` : ''}
          <p><strong>Next action:</strong> ${lead.stage === 'estimate_completed' || lead.siteVisitFollowUp ? 'Contact customer to arrange site visit' : 'Follow up enquiry'}</p>
          <hr style="border:0;border-top:1px solid #eee;margin:22px 0">
          <small>Lead ID: ${lead.id}<br>Received: ${lead.receivedAt}${lead.modelVersion ? `<br>Pricing model: ${lead.modelVersion}` : ''}</small>
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
          from: fromEmail,
          to: [notifyEmail],
          reply_to: lead.email,
          subject,
          html: ownerHtml
        })
      });
      notified = emailResponse.ok;
    } catch (_) {}

    // Once the estimate is completed, send the customer their own copy automatically.
    if (lead.stage === 'estimate_completed' && estimateText) {
      const customerHtml = `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#111">
          <div style="background:#090909;padding:22px 26px;color:#ffe000;font-weight:900;font-size:24px">STOREMAN</div>
          <div style="padding:28px;border:1px solid #e5e5e5;border-top:0">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:1px">YOUR STOREMAN ESTIMATE</p>
            <h2 style="margin:0 0 14px">Thanks ${lead.name}</h2>
            <p style="line-height:1.55">Here is the broad service estimate for <strong>${lead.business}</strong>. Storeman will be in contact to arrange a site visit so we can confirm the scope and provide an accurate fixed quote.</p>
            <div style="background:#090909;color:#fff;padding:22px 24px;margin:22px 0;border-left:7px solid #ffe000">
              <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#ddd">ESTIMATED SERVICE RANGE</div>
              <div style="font-size:32px;font-weight:900;color:#ffe000;margin-top:8px">${estimateText}</div>
            </div>
            <p><strong>Business:</strong> ${lead.business}</p>
            <p><strong>Location:</strong> ${lead.address}</p>
            <p><strong>Services selected:</strong> ${serviceText}</p>
            <p><strong>Frequency:</strong> ${lead.frequency || 'Not sure'}</p>
            <div style="background:#f6f6f6;padding:16px 18px;margin-top:22px;font-size:13px;line-height:1.5">
              <strong>Estimate only.</strong> This is a rough guide based on typical pricing for the services selected. Final pricing depends on the actual scope of work, site size, condition, access, service frequency, building area, fleet size and specific requirements. A site visit will provide a more accurate fixed quote.
            </div>
            <p style="margin-top:22px;line-height:1.55">You don't need to do anything else. <strong>Storeman will contact you to arrange the site visit.</strong></p>
            <p style="margin-top:24px">1300 STOREMAN<br>1300 786 736<br>hello@storeman.com.au</p>
          </div>
        </div>`;

      try {
        const customerResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [lead.email],
            reply_to: notifyEmail,
            subject: `Your Storeman estimate — ${lead.business}`,
            html: customerHtml
          })
        });
        customerNotified = customerResponse.ok;
      } catch (_) {}
    }
  }

  return res.status(200).json({
    ok: true,
    id: lead.id,
    notified,
    customerNotified,
    forwarded,
    configured: Boolean(resendKey || webhook)
  });
}
