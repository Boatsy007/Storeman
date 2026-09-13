(() => {
  const CONFIG = {
    currency: 'AUD',
    membershipVisits: 19,
    membershipDiscount: 0.10,
    baseService: { id:'mow_snip_edge_blow', label:'Mow + Snip + Edge + Blow & Tidy', price:100, recurring:true },
    adjustments: {
      cornerBlock: { label:'Corner block', price:20, recurring:true },
      difficultAccess: { label:'Restricted access', price:20, recurring:true },
      steepSlope: { label:'Steep / difficult slope', price:50, recurring:true },
      overgrown: { label:'Overgrown first service', price:50, recurring:false }
    },
    addons: {
      hedgeSmall: { label:'Small hedge trim — up to 2m long × 1m wide', price:40 },
      hedgeMedium: { label:'Medium hedge trim — up to 4m long × 2m wide', price:60 },
      hedgeLarge: { label:'Large hedge trim', manualReview:true, reason:'Large hedge requires a site quote' },
      colourGuardSmall: { label:'Lawn Green-Up — small lawn', price:25 },
      colourGuardMedium: { label:'Lawn Green-Up — medium lawn', price:50 },
      colourGuardLarge: { label:'Lawn Green-Up — large lawn', price:75, fromPrice:true },
      weedSmall: { label:'Weed treatment — small', price:5 },
      weedMedium: { label:'Weed treatment — medium', price:15 },
      weedLarge: { label:'Weed treatment — large', price:30, fromPrice:true },
      gardenSmall: { label:'Garden tidy — small', price:40 },
      gardenMedium: { label:'Garden tidy — medium', price:80 },
      gardenLarge: { label:'Garden tidy — large', price:100, fromPrice:true },
      greenWasteStandard: { label:'Standard green waste removal', price:0 },
      greenWasteMedium: { label:'Green waste removal — medium', price:50 },
      greenWasteLarge: { label:'Green waste removal — large', price:100 }
    },
    manualReview: { flags:['largeProperty','acreage','unsafeAccess'] }
  };

  const money = (value) => new Intl.NumberFormat('en-AU', { style:'currency', currency:CONFIG.currency, maximumFractionDigits:0 }).format(value || 0);

  function calculate(input = {}) {
    const flags = Array.isArray(input.flags) ? input.flags : [];
    const selectedAddons = Array.isArray(input.addons) ? input.addons : [];
    const reviewReasons = [];

    CONFIG.manualReview.flags.forEach((flag) => {
      if (!flags.includes(flag)) return;
      if (flag === 'largeProperty') reviewReasons.push('Large property requires a site quote');
      else if (flag === 'acreage') reviewReasons.push('Acreage / very large property requires a site quote');
      else reviewReasons.push('Access requires review');
    });

    const items = [{ id:CONFIG.baseService.id, label:CONFIG.baseService.label, price:CONFIG.baseService.price, recurring:true }];

    Object.entries(CONFIG.adjustments).forEach(([id, adjustment]) => {
      if (flags.includes(id)) items.push({ id, label:adjustment.label, price:adjustment.price, recurring:Boolean(adjustment.recurring) });
    });

    selectedAddons.forEach((id) => {
      const addon = CONFIG.addons[id];
      if (!addon) return;
      if (addon.manualReview) {
        reviewReasons.push(addon.reason || `${addon.label} requires a site quote`);
        return;
      }
      items.push({ id, label:addon.label, price:addon.price, fromPrice:Boolean(addon.fromPrice), recurring:false });
    });

    const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const recurringVisitPrice = items.filter((item) => item.recurring).reduce((sum, item) => sum + Number(item.price || 0), 0);
    const membershipAnnual = Math.round(recurringVisitPrice * CONFIG.membershipVisits * (1 - CONFIG.membershipDiscount) * 100) / 100;

    return {
      items,
      total,
      formattedTotal: money(total),
      manualReview: reviewReasons.length > 0,
      reviewReasons,
      membership: {
        visits:CONFIG.membershipVisits,
        discountPercent:Math.round(CONFIG.membershipDiscount * 100),
        recurringVisitPrice,
        annual:membershipAnnual,
        weekly:Math.round((membershipAnnual / 52) * 100) / 100,
        fortnightly:Math.round((membershipAnnual / 26) * 100) / 100,
        monthly:Math.round((membershipAnnual / 12) * 100) / 100
      }
    };
  }

  window.StoremanQuoteEngine = { CONFIG, calculate, money };
})();