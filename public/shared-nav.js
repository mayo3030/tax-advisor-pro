/**
 * Tax Advisor Pro - Shared Navigation Injector
 * Provides consistent bilingual sticky navigation across all pages
 * IIFE: Auto-runs on DOMContentLoaded, injects nav bar, handles language toggle
 */

(function() {
  // ─── CONFIGURATION ───
  const navConfig = {
    links: [
      { href: 'index.html', labelEn: 'Home', labelAr: 'الرئيسية' },
      { href: 'guides.html', labelEn: 'Guides', labelAr: 'الأدلة' },
      { href: 'tax-planner.html', labelEn: 'Tax Planner', labelAr: 'مخطط الضرائب' },
      { href: 'itin-guide.html', labelEn: 'ITIN Guide', labelAr: 'دليل الرقم الضريبي' },
      { href: 'efile.html', labelEn: 'E-File', labelAr: 'التقديم الإلكتروني' },
      { href: 'auth.html', labelEn: 'My Account', labelAr: 'حسابي' }
    ],
    colors: {
      primary: '#0d3b66',
      primaryDark: '#092847',
      accent: '#c9a84c',
      text: '#1a1f36'
    }
  };

  // ─── LANGUAGE STATE ───
  let currentLang = localStorage.getItem('appLanguage') || 'en';

  // ─── UTILITY: Get current page filename ───
  function getCurrentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  // ─── UTILITY: Detect RTL ───
  function isArabic() {
    return currentLang === 'ar';
  }

  // ─── BUILD NAVIGATION HTML ───
  function buildNavHTML() {
    const isRTL = isArabic();
    const currentPage = getCurrentPage();

    // Nav links HTML
    let navLinksHTML = '';
    navConfig.links.forEach(link => {
      const label = isArabic() ? link.labelAr : link.labelEn;
      const isActive = currentPage === link.href;
      const activeClass = isActive ? ' nav-link-active' : '';
      navLinksHTML += `<a href="${link.href}" class="nav-link${activeClass}">${label}</a>`;
    });

    // Hamburger icon SVG
    const hamburgerSVG = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;

    // Language label
    const langLabel = isArabic() ? 'EN' : 'عربي';

    // Build full nav
    const navHTML = `
      <nav class="shared-nav" ${isRTL ? 'dir="rtl"' : 'dir="ltr"'}>
        <div class="shared-nav-container">
          <!-- Logo -->
          <div class="shared-nav-logo">
            <span class="shared-nav-icon">🏛️</span>
            <span class="shared-nav-text">Tax Advisor Pro — مستشار الضرائب</span>
          </div>

          <!-- Desktop Nav Links -->
          <div class="shared-nav-links" id="navLinksContainer">
            ${navLinksHTML}
          </div>

          <!-- Right Section: User Greeting + Tax Year Badge + Language + Mobile Menu -->
          <div class="shared-nav-right">
            <div class="shared-nav-user" id="navUserGreeting" style="display:none"></div>
            <div class="shared-nav-badge">Tax Year 2025</div>
            <button class="shared-nav-lang-toggle" id="langToggleBtn" aria-label="Toggle Language" title="Toggle Language">
              ${langLabel}
            </button>
            <button class="shared-nav-hamburger" id="hamburgerBtn" aria-label="Menu" aria-expanded="false">
              ${hamburgerSVG}
            </button>
          </div>
        </div>

        <!-- Mobile Menu (hidden by default) -->
        <div class="shared-nav-mobile-menu" id="mobileMenu">
          ${navLinksHTML}
          <button class="shared-nav-mobile-lang" id="mobileLangBtn">
            ${isArabic() ? 'English' : 'العربية'}
          </button>
        </div>
      </nav>
    `;

    return navHTML;
  }

  // ─── INJECT NAVIGATION INTO DOM ───
  function injectNav() {
    // Remove any existing navigation elements
    const existingNavs = document.querySelectorAll('.topnav, .topbar, nav.shared-nav');
    existingNavs.forEach(el => {
      if (el !== document.querySelector('nav.shared-nav')) {
        el.remove();
      }
    });

    // Insert nav at top if not already present
    if (!document.querySelector('nav.shared-nav')) {
      const navHTML = buildNavHTML();
      document.body.insertAdjacentHTML('afterbegin', navHTML);
    }

    attachNavEventListeners();
  }

  // ─── ATTACH EVENT LISTENERS ───
  function attachNavEventListeners() {
    // Hamburger menu toggle
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', () => {
        const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
        hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
        mobileMenu.classList.toggle('shared-nav-mobile-menu-open');
      });
    }

    // Close mobile menu when a link is clicked
    const mobileLinks = mobileMenu?.querySelectorAll('a');
    mobileLinks?.forEach(link => {
      link.addEventListener('click', () => {
        hamburgerBtn?.setAttribute('aria-expanded', 'false');
        mobileMenu?.classList.remove('shared-nav-mobile-menu-open');
      });
    });

    // Language toggle buttons
    const langToggleBtn = document.getElementById('langToggleBtn');
    const mobileLangBtn = document.getElementById('mobileLangBtn');

    const handleLanguageToggle = () => {
      currentLang = currentLang === 'en' ? 'ar' : 'en';
      localStorage.setItem('appLanguage', currentLang);

      // Dispatch custom event for other scripts to listen
      window.dispatchEvent(new CustomEvent('languageToggle', { detail: { lang: currentLang } }));

      // Update HTML dir
      document.documentElement.dir = isArabic() ? 'rtl' : 'ltr';
      document.documentElement.lang = currentLang;

      // Rebuild and reinject nav + re-render greeting
      injectNav();
      showUserGreeting();
    };

    langToggleBtn?.addEventListener('click', handleLanguageToggle);
    mobileLangBtn?.addEventListener('click', handleLanguageToggle);
  }

  // ─── USER GREETING ───
  let cachedUserObj = null; // Keep in memory so nav rebuilds don't lose it

  function showUserGreeting() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // Not logged in — update "My Account" link to say "Login"
      const el = document.getElementById('navUserGreeting');
      if (el) el.style.display = 'none';
      return;
    }

    // 1. Check in-memory cache (survives nav rebuilds)
    if (cachedUserObj) {
      renderGreeting(cachedUserObj);
    }

    // 2. Check localStorage cache (survives page reloads)
    if (!cachedUserObj) {
      const stored = localStorage.getItem('taxPro_userData');
      if (stored) {
        try {
          cachedUserObj = JSON.parse(stored);
          renderGreeting(cachedUserObj);
        } catch(e) {}
      }
    }

    // 3. Also try userName from signup flow
    if (!cachedUserObj) {
      const storedName = localStorage.getItem('userName');
      const storedEmail = localStorage.getItem('userEmail');
      if (storedName || storedEmail) {
        const parts = (storedName || '').split(' ');
        cachedUserObj = { firstName: parts[0] || '', lastName: parts[1] || '', email: storedEmail || '' };
        renderGreeting(cachedUserObj);
      }
    }

    // 4. Fetch fresh profile from server (background update)
    const apiBase = (window.location.protocol === 'file:') ? null : window.location.origin;
    if (!apiBase) return;

    fetch(apiBase + '/api/auth/profile', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(r => { if (r.ok) return r.json(); throw new Error('Not logged in'); })
    .then(user => {
      cachedUserObj = user;
      localStorage.setItem('taxPro_userData', JSON.stringify(user));
      renderGreeting(user);
    })
    .catch(() => {
      // Token expired or invalid — clear auth
      localStorage.removeItem('authToken');
      localStorage.removeItem('taxPro_userData');
      cachedUserObj = null;
      const el = document.getElementById('navUserGreeting');
      if (el) el.style.display = 'none';
    });
  }

  function renderGreeting(user) {
    const el = document.getElementById('navUserGreeting');
    if (!el) return;

    const name = user.firstName || user.email?.split('@')[0] || '';
    if (!name) return;

    const greeting = isArabic()
      ? 'أهلاً ' + name + ' 👋'
      : 'Hi ' + name + ' 👋';

    el.innerHTML = `
      <span class="nav-user-name">${greeting}</span>
      <a href="auth.html" class="nav-user-link" title="${isArabic() ? 'حسابي' : 'My Account'}">
        <span class="nav-user-avatar">${name.charAt(0).toUpperCase()}</span>
      </a>
    `;
    el.style.display = 'flex';
  }

  // ─── INITIALIZATION ───
  function init() {
    // Set document language and direction
    document.documentElement.lang = currentLang;
    document.documentElement.dir = isArabic() ? 'rtl' : 'ltr';

    // Inject nav
    injectNav();

    // Show user greeting if logged in
    showUserGreeting();

    // Re-render greeting on language change
    window.addEventListener('languageToggle', showUserGreeting);
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose language state to global scope for other scripts
  window.appLang = {
    get current() { return currentLang; },
    set current(lang) {
      if (lang === 'en' || lang === 'ar') {
        currentLang = lang;
        localStorage.setItem('appLanguage', currentLang);
      }
    },
    isArabic: () => isArabic()
  };
})();
