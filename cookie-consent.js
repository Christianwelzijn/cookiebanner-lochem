(function () {
  'use strict';

  var CONFIG = {
    gaMeasurementId: 'G-4V6040099G',
    privacyUrl: 'https://www.doemeeinlochem.nl/voorwaarden',
    consentDurationDays: 180,
    storageKey: 'cookie_consent_v1'
  };

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });

  var gaLoaded = false;
  function loadGoogleAnalytics() {
    if (gaLoaded) return;
    if (!CONFIG.gaMeasurementId || CONFIG.gaMeasurementId.indexOf('XXXX') !== -1) {
      return;
    }
    gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.gaMeasurementId;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', CONFIG.gaMeasurementId, { anonymize_ip: true });
  }

  function updateConsent(granted) {
    gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied'
    });
    if (granted) loadGoogleAnalytics();
  }

  function saveChoice(status) {
    var record = { status: status, ts: Date.now() };
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(record)); } catch (e) {}
  }

  function getChoice() {
    try {
      var raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return null;
      var record = JSON.parse(raw);
      var maxAge = CONFIG.consentDurationDays * 24 * 60 * 60 * 1000;
      if (Date.now() - record.ts > maxAge) return null;
      return record.status;
    } catch (e) {
      return null;
    }
  }

  var styleEl, bannerEl, settingsBtnEl;

  function injectStyles() {
    if (styleEl) return;
    styleEl = document.createElement('style');
    styleEl.textContent = [
      ':root{',
      '  --cc-bg:#0f2a4a;',
      '  --cc-text:#f9fafb;',
      '  --cc-muted:#c7d4e3;',
      '  --cc-accent:#e2572b;',
      '  --cc-accent-text:#ffffff;',
      '  --cc-border:#274a70;',
      '}',
      '.cc-banner{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;',
      '  background:var(--cc-bg);color:var(--cc-text);padding:16px 20px;',
      '  box-shadow:0 -2px 10px rgba(0,0,0,.2);',
      '  font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;',
      '  display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;justify-content:space-between;}',
      '.cc-text{flex:1 1 320px;color:var(--cc-muted);margin:0;}',
      '.cc-text a{color:var(--cc-text);text-decoration:underline;}',
      '.cc-actions{display:flex;gap:10px;flex-wrap:wrap;}',
      '.cc-btn{border:1px solid var(--cc-border);background:transparent;color:var(--cc-text);',
      '  padding:9px 16px;border-radius:6px;font-size:14px;cursor:pointer;}',
      '.cc-btn:hover{border-color:var(--cc-muted);}',
      '.cc-btn-accept{background:var(--cc-accent);border-color:var(--cc-accent);color:var(--cc-accent-text);font-weight:600;}',
      '.cc-btn-accept:hover{filter:brightness(1.08);}',
      '.cc-settings-btn{position:fixed;left:16px;bottom:16px;z-index:2147483000;',
      '  width:40px;height:40px;border-radius:50%;background:var(--cc-bg);color:var(--cc-text);',
      '  border:1px solid var(--cc-border);cursor:pointer;font-size:18px;display:flex;',
      '  align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.2);}',
      '@media (max-width:480px){.cc-actions{width:100%;}.cc-btn{flex:1 1 auto;}}'
    ].join('\n');
    document.head.appendChild(styleEl);
  }

  function removeBanner() {
    if (bannerEl && bannerEl.parentNode) bannerEl.parentNode.removeChild(bannerEl);
    bannerEl = null;
  }

  function showSettingsButton() {
    if (settingsBtnEl) return;
    settingsBtnEl = document.createElement('button');
    settingsBtnEl.type = 'button';
    settingsBtnEl.className = 'cc-settings-btn';
    settingsBtnEl.setAttribute('aria-label', 'Cookie-instellingen wijzigen');
    settingsBtnEl.title = 'Cookie-instellingen';
    settingsBtnEl.textContent = '\uD83C\uDF6A';
    settingsBtnEl.addEventListener('click', function () {
      showBanner();
    });
    document.body.appendChild(settingsBtnEl);
  }

  function showBanner() {
    if (bannerEl) return;
    injectStyles();

    bannerEl = document.createElement('div');
    bannerEl.className = 'cc-banner';
    bannerEl.setAttribute('role', 'dialog');
    bannerEl.setAttribute('aria-live', 'polite');
    bannerEl.setAttribute('aria-label', 'Cookiemelding');

    bannerEl.innerHTML =
      '<p class="cc-text">' +
      'Doe Mee in Lochem gebruikt Google Analytics om te zien hoe bezoekers deze website gebruiken. ' +
      'Dit gebeurt alleen als je hiervoor toestemming geeft. ' +
      'Benieuwd hoe we omgaan met jouw privacy? Lees onze <a href="' + CONFIG.privacyUrl + '">voorwaarden en privacyverklaring</a>.' +
      '</p>' +
      '<div class="cc-actions">' +
      '<button type="button" class="cc-btn cc-btn-reject" data-cc="reject">Weigeren</button>' +
      '<button type="button" class="cc-btn cc-btn-accept" data-cc="accept">Accepteren</button>' +
      '</div>';

    document.body.appendChild(bannerEl);

    bannerEl.querySelector('[data-cc="accept"]').addEventListener('click', function () {
      saveChoice('accepted');
      updateConsent(true);
      removeBanner();
      showSettingsButton();
    });
    bannerEl.querySelector('[data-cc="reject"]').addEventListener('click', function () {
      saveChoice('rejected');
      updateConsent(false);
      removeBanner();
      showSettingsButton();
    });
  }

  function init() {
    var choice = getChoice();
    if (choice === 'accepted') {
      updateConsent(true);
      showSettingsButton();
    } else if (choice === 'rejected') {
      showSettingsButton();
    } else {
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
