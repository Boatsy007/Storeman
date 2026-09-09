(() => {
  // Launch pricing model v2. These are intentionally broad market-calibrated
  // starter bands. Replace them with Storeman job data as real quotes build up.
  const MODEL_VERSION = 'market-v2-2026-09';
  const SERVICE_BANDS = {
    sweeping: { min: 500, max: 1500, uncertainty: 1 },
    grounds: { min: 350, max: 1200, uncertainty: 1 },
    lawn: { min: 300, max: 1000, uncertainty: 1 },
    pressure: { min: 500, max: 2500, uncertainty: 1.18 },
    fleet: { min: 400, max: 2000, uncertainty: 1.18 }
  };

  const FREQUENCY_FACTORS = {
    'One-off': 1,
    Weekly: 0.8,
    Fortnightly: 0.85,
    Monthly: 0.93,
    'Not sure': 1
  };

  // Bundled services share travel/setup. The customer only sees one combined range.
  const BUNDLE_WEIGHTS = [1, 0.75, 0.65, 0.58, 0.55];

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
    // Rank selected services by midpoint so the largest likely scope carries the
    // full visit cost and additional services receive the bundle efficiencies.
    const selected = services
      .map((service) => ({ service, ...SERVICE_BANDS[service] }))
      .filter((item) => Number.isFinite(item.min) && Number.isFinite(item.max))
      .sort((a, b) => ((b.min + b.max) / 2) - ((a.min + a.max) / 2));

    let min = 0;
    let max = 0;

    selected.forEach((item, index) => {
      const weight = BUNDLE_WEIGHTS[Math.min(index, BUNDLE_WEIGHTS.length - 1)];
      min += item.min * weight;
      max += item.max * weight * item.uncertainty;
    });

    const factor = FREQUENCY_FACTORS[frequency] ?? 1;
    min = roundTo50(min * factor);
    max = roundTo50(max * factor);

    // Keep a genuinely useful gap. Exterior/fleet work carries more uncertainty
    // because building area, height, condition and fleet size are unknown online.
    const hasHighUncertaintyService = services.includes('pressure') || services.includes('fleet');
    const minimumSpread = hasHighUncertaintyService ? 2.0 : 1.65;
    max = Math.max(max, roundTo50(min * minimumSpread));

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
          modelVersion: MODEL_VERSION,
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
          modelVersion: MODEL_VERSION,
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
        modelVersion: MODEL_VERSION,
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
