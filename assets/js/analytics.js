(() => {
  const id = 'G-N8CKW08FSY';
  const key = 'amse-analytics-v1';
  const duration = 180 * 86400000;
  const banner = document.getElementById('cookie-banner');
  let loaded = false;
  function readChoice() {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value && Date.now() - value.time < duration && ['accepted', 'rejected'].includes(value.choice) ? value.choice : null;
    } catch { return null; }
  }
  function activate() {
    if (loaded) return;
    loaded = true;
    window['ga-disable-' + id] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', id, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: 15552000,
      cookie_update: false,
      page_location: location.origin + location.pathname,
      page_referrer: document.referrer.split('?')[0].split('#')[0]
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(script);
  }
  function clearCookies() {
    const parts = location.hostname.split('.');
    const domains = [''];
    for (let i = 0; i < parts.length - 1; i++) domains.push(parts.slice(i).join('.'), '.' + parts.slice(i).join('.'));
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name !== '_ga' && !name.startsWith('_ga_')) return;
      domains.forEach(domain => { document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '') + '; SameSite=Lax'; });
    });
  }
  function choose(choice) {
    try { localStorage.setItem(key, JSON.stringify({ choice, time: Date.now() })); } catch { /* La elección rige durante esta visita. */ }
    banner.hidden = true;
    if (choice === 'accepted') activate();
    else {
      window['ga-disable-' + id] = true;
      clearCookies();
      if (loaded) location.reload();
    }
  }
  document.querySelectorAll('[data-cookie-choice]').forEach(button => button.addEventListener('click', () => choose(button.dataset.cookieChoice)));
  document.querySelectorAll('[data-cookie-settings]').forEach(button => button.addEventListener('click', () => {
    banner.hidden = false;
    banner.querySelector('button').focus();
  }));
  if (readChoice() === 'accepted') activate();
  else {
    clearCookies();
    banner.hidden = readChoice() === 'rejected';
  }
})();
