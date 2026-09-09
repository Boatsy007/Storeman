(() => {
  const safe = (value) => String(value || '').replace(/[<>]/g, '').trim();

  const selectedServices = (form) =>
    [...form.querySelectorAll('input[name="services"]:checked')].map((input) => input.value);

  async function postLead(payload) {
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Lead service unavailable');
      return await response.json();
    } catch (_) {
      return { ok: false, offline: true };
    }
  }

  function persistLocalLead(lead) {
    try {
      const existing = JSON.parse(localStorage.getItem('storeman-quote-leads') || '[]');
      const next = [lead, ...existing.filter((item) => item.id !== lead.id)].slice(0, 10);
      localStorage.setItem('storeman-quote-leads', JSON.stringify(next));
    } catch (_) {}
  }

  document.querySelectorAll('[data-quote-flow]').forEach((flow) => {
    const form = flow.querySelector('[data-quote-form]');
    if (!form) return;

    const stages = [...flow.querySelectorAll('[data-quote-stage]')];
    const indicators = [...flow.querySelectorAll('[data-quote-step]')];
    const status = flow.querySelector('[data-quote-status]');
    let leadId = '';

    function setStep(step) {
      stages.forEach((stage) => stage.classList.toggle('active', Number(stage.dataset.quoteStage) === step));
      indicators.forEach((indicator) => indicator.classList.toggle('active', Number(indicator.dataset.quoteStep) <= step));
      flow.querySelector('.estimate-panel, .quote-form-panel')?.scrollTo?.({ top: 0, behavior: 'smooth' });
    }

    function validateStage(step) {
      const stage = flow.querySelector(`[data-quote-stage="${step}"]`);
      if (!stage) return true;
      for (const field of stage.querySelectorAll('[required]')) {
        if (!field.checkValidity()) {
          field.reportValidity();
          field.focus();
          return false;
        }
      }
      return true;
    }

    form.addEventListener('click', async (event) => {
      const saveButton = event.target.closest('[data-save-quote-lead]');
      if (saveButton) {
        event.preventDefault();
        if (!validateStage(1)) return;

        const data = new FormData(form);
        leadId = leadId || `stm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        const lead = {
          id: leadId,
          stage: 'details_saved',
          createdAt: new Date().toISOString(),
          name: safe(data.get('name')),
          business: safe(data.get('business')),
          email: safe(data.get('email')),
          phone: safe(data.get('phone')),
          address: safe(data.get('address'))
        };

        saveButton.disabled = true;
        saveButton.textContent = 'SAVING…';
        if (status) status.textContent = '';
        persistLocalLead(lead);
        await postLead(lead);
        saveButton.disabled = false;
        saveButton.innerHTML = 'SAVE &amp; CONTINUE <span>→</span>';
        setStep(2);
        return;
      }

      const submitButton = event.target.closest('[data-request-quote]');
      if (submitButton) {
        event.preventDefault();
        const services = selectedServices(form);
        if (!services.length) {
          if (status) status.textContent = 'Select at least one service to continue.';
          return;
        }

        const data = new FormData(form);
        const payload = {
          id: leadId || `stm_${Date.now().toString(36)}`,
          stage: 'quote_requested',
          updatedAt: new Date().toISOString(),
          name: safe(data.get('name')),
          business: safe(data.get('business')),
          email: safe(data.get('email')),
          phone: safe(data.get('phone')),
          address: safe(data.get('address')),
          services,
          frequency: safe(data.get('frequency')) || 'Not sure',
          siteVisitFollowUp: true
        };

        submitButton.disabled = true;
        submitButton.textContent = 'SENDING…';
        if (status) status.textContent = '';
        persistLocalLead(payload);
        const result = await postLead(payload);
        setStep(3);

        const customerEmail = flow.querySelector('[data-customer-email]');
        if (customerEmail) customerEmail.textContent = payload.email;

        if (status) {
          status.textContent = result.ok === false && result.offline
            ? 'Your request has been saved. Storeman will contact you to arrange your site visit.'
            : 'Request received — Storeman will contact you to arrange your site visit.';
        }
        submitButton.disabled = false;
        submitButton.innerHTML = 'REQUEST MY FREE QUOTE <span>→</span>';
        return;
      }

      const backButton = event.target.closest('[data-quote-back]');
      if (backButton) {
        event.preventDefault();
        setStep(Number(backButton.dataset.quoteBack));
      }
    });

    form.addEventListener('submit', (event) => event.preventDefault());
  });
})();
