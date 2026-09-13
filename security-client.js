(() => {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    try {
      const url = typeof input === 'string' ? input : input?.url || '';
      const protectedEndpoint = url.startsWith('/api/lead') || url.startsWith('/api/quote');
      if (protectedEndpoint && init?.body && typeof init.body === 'string') {
        const payload = JSON.parse(init.body);
        const trap = document.querySelector('input[name="website"]');
        payload.website = trap?.value || '';
        init = { ...init, body: JSON.stringify(payload) };
      }
    } catch (_) {}
    return originalFetch(input, init);
  };
})();
