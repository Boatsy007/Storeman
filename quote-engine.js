(() => {
  const CONFIG = {
    currency: 'AUD',
    membershipVisits: 19,
    membershipDiscount: 0.10,
    baseService: {
      id: 'mow_snip_blow',
      label: 'Mow + Snip + Blow',
      tiers: [
        { maxM2: 300, price: 100, label: 'Standard lawn' },
        { maxM2: 450, price: 120, label: 'Medium lawn' },
        { maxM2: 600, price: 150, label: 'Large lawn' },
        { maxM2: 800, price: 190, label: 'Extra-large lawn' }
      ]
    },
    adjustments: {
      cornerBlock: { label: 'Corner block', price: 20 },
      difficultAccess: { label: 'Restricted access', price: 25 },
      steepSlope: { label: 'Steep / difficult slope', price: 30 },
      overgrown: { label: 'Overgrown first service', price: 60 }
    },
    addons: {
      hedgeSmall: { label: 'Small hedge trim', price: 40 },
      hedgeMedium: { label: 'Medium hedge trim', price: 70 },
      hedgeLarge: { label: 'Large hedge trim', price: 120 },
      weedTreatment: { label: 'Weed treatment', price: 35 },
      gardenTidy: { label: 'Garden tidy-up', price: 60 },
      greenWaste: { label: 'Green waste removal', price: 40 },
      colourGuard: {
        label: 'Lawn Green-Up — ColourGuard PLUS',
        areaTiers: [
          { maxM2: 200, price: 69 },
          { maxM2: 350, price: 89 },
          { maxM2: 500, price: 109 },
          { maxM2: 650, price: 139 },
          { maxM2: 800, price: 169 }
        ]
      }
    },
    manualReview: {
      lawnOverM2: 800,
      flags: ['acreage', 'unsafeAccess']
    }
  };

  const money = (value) => new Intl.NumberFormat('en-AU', {
    style: 'currency', currency: CONFIG.currency, maximumFractionDigits: 0
  }).format(value || 0);

  function tierPrice(tiers, area) {
    const a = Number(area || 0);
    const tier = tiers.find((item) => a <= item.maxM2) || null;
    return tier;
  }

  function calculate(input = {}) {
    const area = Math.max(0, Number(input.lawnAreaM2 || 0));
    const flags = Array.isArray(input.flags) ? input.flags : [];
    const selectedAddons = Array.isArray(input.addons) ? input.addons : [];
    const reviewReasons = [];

    if (!area) reviewReasons.push('Lawn area needs confirmation');
    if (area > CONFIG.manualReview.lawnOverM2) reviewReasons.push(`Lawn area is over ${CONFIG.manualReview.lawnOverM2} m²`);
    CONFIG.manualReview.flags.forEach((flag) => {
      if (flags.includes(flag)) reviewReasons.push(flag === 'acreage' ? 'Acreage / non-standard property' : 'Access requires review');
    });

    const baseTier = tierPrice(CONFIG.baseService.tiers, area || 1);
    const items = [];
    if (baseTier) items.push({ id: CONFIG.baseService.id, label: CONFIG.baseService.label, price: baseTier.price });

    Object.entries(CONFIG.adjustments).forEach(([id, adjustment]) => {
      if (flags.includes(id)) items.push({ id, label: adjustment.label, price: adjustment.price });
    });

    selectedAddons.forEach((id) => {
      const addon = CONFIG.addons[id];
      if (!addon) return;
      if (addon.areaTiers) {
        const tier = tierPrice(addon.areaTiers, area || 1);
        if (tier) items.push({ id, label: addon.label, price: tier.price });
        else reviewReasons.push(`${addon.label} requires review for this lawn size`);
      } else {
        items.push({ id, label: addon.label, price: addon.price });
      }
    });

    const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const membershipAnnual = Math.round(total * CONFIG.membershipVisits * (1 - CONFIG.membershipDiscount) * 100) / 100;

    return {
      area,
      baseTier: baseTier?.label || '',
      items,
      total,
      formattedTotal: money(total),
      manualReview: reviewReasons.length > 0,
      reviewReasons,
      membership: {
        visits: CONFIG.membershipVisits,
        discountPercent: Math.round(CONFIG.membershipDiscount * 100),
        annual: membershipAnnual,
        weekly: Math.round((membershipAnnual / 52) * 100) / 100,
        fortnightly: Math.round((membershipAnnual / 26) * 100) / 100,
        monthly: Math.round((membershipAnnual / 12) * 100) / 100
      }
    };
  }

  window.StoremanQuoteEngine = { CONFIG, calculate, money };
})();
