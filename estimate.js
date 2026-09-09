(() => {
  const SERVICE_BANDS = {
    sweeping: { min: 450, max: 950 },
    grounds: { min: 450, max: 1200 },
    lawn: { min: 350, max: 950 },
    pressure: { min: 650, max: 1900 },
    fleet: { min: 500, max: 1900 }
  };

  const FREQUENCY_FACTORS = {
    'One-off': 1,
    Weekly: 0.82,
    Fortnightly: 0.86,
    Monthly: 0.9,
    'Not sure': 1
  };

  const money = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0
  });

  function roundTo50(value) {
    return Math.max(50, Math.round(value / 50) * 50);
  }

  function safe(value) {
    return String(value || '').replace(/[<>]/g, '').trim();
  }

  function selectedServices(form) {
    return [...form.querySelectorAll('input[name="services"]:checked')].map((input) => input.value);
  }

  function calculateEstimate(services, frequency) {
    let min = 0;
    let max = 0;

    services.forEach((service) => {
      const band = SERVICE_BANDS[service];
      if (!band) return;
      min += band.min;
      max += band.max;
    });

    const factor = FREQUENCY_FACTORS[frequency] ?? 1;
    const bundleFactor = services.length >= 4 ? 0.78 : services.length === 3 ? 0.84 : services.length === 2 ? 0.9 : 1;

    min = roundTo50(min * factor * bundleFactor);
    max = roundTo50(max * factor * Math.min(1, bundleFactor + 0.08));

    // Deliberately broad because we do not yet know site size, condition, access,
    // building area, fleet size or the final scope of work.
    max = Math.max(max, roundTo50(min * 1.65));

    return { min, max };
  }

  async function postLead(payload) {
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Lead service unavailable');
      return await response.json();
    } catch (error) {
      return { ok: false, offline: true };
    }
  }

  function persistLocalLead(lead) {
    try {
      const existing = JSON.parse(localStorage.getItem('storeman-estimate-leads') || '[]');
      const next = [lead, ...existing.filter((item) => item.id !== lead.id)].slice(0, 10);
      localStorage.setItem('storeman-estimate-leads', JSON.stringify(next));
    } catch (_) {}
  }

  document.querySelectorAll('[data-estimator]').forEach((estimator) => {
    const form = estimator.querySelector('[data-estimate-form]');
    if (!form) return;

    const stages = [...estimator.querySelectorAll('[data-estimate-stage]')];
    const indicators = [...estimator.querySelectorAll('[data-estimate-step]')];
    const status = estimator.querySelector('[data-estimate-status]');
    const resultPrice = estimator.querySelector('[data-estimate-price]');
    const resultSummary = estimator.querySelector('[data-estimate-summary]');
    let step = 1;
    let leadId = '';

    function setStep(nextStep) {
      step = nextStep;
      stages.forEach((stage) => stage.classList.toggle('active', Number(stage.dataset.estimateStage) === nextStep));
      indicators.forEach((indicator) => indicator.classList.toggle('active', Number(indicator.dataset.estimateStep) <= nextStep));
      estimator.querySelector('.estimate-panel, .quote-form-panel')?.scrollTo?.({ top: 0, behavior: 'smooth' });
    }

    function validateStage(stageNumber) {
      const stage = estimator.querySelector(`[data-estimate-stage="${stageNumber}"]`);
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
      const saveButton = event.target.closest('[data-save-lead]');
      if (saveButton) {
        event.preventDefault();
        if (!validateStage(1)) return;

        saveButton.disabled = true;
        saveButton.textContent = 'SAVING…';
        if (status) status.textContent = '';

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

        persistLocalLead(lead);
        const result = await postLead(lead);
        if (status) {
          status.textContent = result.ok === false && result.offline
            ? 'Details saved. Continue to your services.'
            : 'Details saved — continue to your services.';
        }

        saveButton.disabled = false;
        saveButton.innerHTML = 'SAVE &amp; CONTINUE <span>→</span>';
        setStep(2);
        return;
      }

      const estimateButton = event.target.closest('[data-calculate-estimate]');
      if (estimateButton) {
        event.preventDefault();
        const services = selectedServices(form);
        if (!services.length) {
          if (status) status.textContent = 'Select at least one service to continue.';
          return;
        }

        const data = new FormData(form);
        const frequency = safe(data.get('frequency')) || 'Not sure';
        const estimate = calculateEstimate(services, frequency);

        if (resultPrice) resultPrice.textContent = `${money.format(estimate.min)} – ${money.format(estimate.max)} + GST`;
        if (resultSummary) {
          resultSummary.textContent = `Based on ${services.length} selected service${services.length > 1 ? 's' : ''} and a ${frequency.toLowerCase()} service preference.`;
        }

        const updatedLead = {
          id: leadId || `stm_${Date.now().toString(36)}`,
          stage: 'estimate_completed',
          updatedAt: new Date().toISOString(),
          name: safe(data.get('name')),
          business: safe(data.get('business')),
          email: safe(data.get('email')),
          phone: safe(data.get('phone')),
          address: safe(data.get('address')),
          services,
          frequency,
          estimateMin: estimate.min,
          estimateMax: estimate.max
        };

        persistLocalLead(updatedLead);
        postLead(updatedLead);
        if (status) status.textContent = '';
        setStep(3);
        return;
      }

      const backButton = event.target.closest('[data-estimate-back]');
      if (backButton) {
        event.preventDefault();
        setStep(Number(backButton.dataset.estimateBack));
      }
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const services = selectedServices(form);
      const frequency = safe(data.get('frequency')) || 'Not sure';
      const estimateText = resultPrice?.textContent || '';

      const payload = {
        id: leadId || `stm_${Date.now().toString(36)}`,
        stage: 'site_visit_requested',
        updatedAt: new Date().toISOString(),
        name: safe(data.get('name')),
        business: safe(data.get('business')),
        email: safe(data.get('email')),
        phone: safe(data.get('phone')),
        address: safe(data.get('address')),
        services,
        frequency,
        estimate: estimateText,
        siteVisitRequested: true
      };

      persistLocalLead(payload);
      await postLead(payload);

      const success = estimator.querySelector('[data-estimate-success]');
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      const submit = form.querySelector('[data-site-visit]');
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'SITE VISIT REQUESTED ✓';
      }
    });
  });
})();
