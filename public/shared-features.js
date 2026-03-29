/**
 * Shared Features IIFE - QoL enhancements for all pages
 * Features: Back-to-top button, keyboard shortcuts, auto-save, transitions, network status, read time
 * Language: English / العربية (Arabic)
 */

(function() {
  'use strict';

  // ==================== CONSTANTS & CONFIG ====================
  const CONFIG = {
    scrollThreshold: 300,
    debounceDelay: 2000,
    fadeInDuration: 300,
    readTimeWordsPerMinute: 200,
  };

  // Toast messages (English / Arabic)
  const MESSAGES = {
    saving: { en: 'Saving...', ar: 'جاري الحفظ...' },
    saved: { en: 'Saved ✓', ar: 'تم الحفظ ✓' },
    offline: { en: 'You are offline', ar: 'أنت غير متصل' },
    online: { en: 'Back online', ar: 'عاد الاتصال' },
    shortcuts: { en: 'Keyboard Shortcuts', ar: 'اختصارات لوحة المفاتيح' },
    darkMode: { en: 'Dark mode toggled', ar: 'تم تبديل الوضع الليلي' },
    readTime: { en: 'min read', ar: 'دقيقة قراءة' },
  };

  const SHORTCUTS = {
    h: { label: 'Home', url: '/index.html', en: 'Home', ar: 'الرئيسية' },
    g: { label: 'Guides', url: '/guides.html', en: 'Guides', ar: 'الأدلة' },
    p: { label: 'Tax Planner', url: '/tax-planner.html', en: 'Tax Planner', ar: 'مخطط الضرائب' },
    e: { label: 'E-File', url: '/efile.html', en: 'E-File', ar: 'الملف الإلكتروني' },
    t: { label: 'Toggle Dark Mode', url: null, en: 'Toggle Dark Mode', ar: 'تبديل الوضع الليلي' },
  };

  let saveTimeout;
  let isOnline = navigator.onLine;

  // ==================== STYLES ====================
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Back to Top Button */
      .back-to-top {
        position: fixed;
        bottom: 90px;
        right: 24px;
        width: 48px;
        height: 48px;
        background: #c9a84c;
        color: #fff;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        z-index: 999;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
      }

      .back-to-top:hover {
        background: #b5964a;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transform: translateY(-3px);
      }

      .back-to-top.visible {
        display: flex;
      }

      /* Toast Notification */
      .toast {
        position: fixed;
        top: 20px;
        right: 24px;
        background: #333;
        color: #fff;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      .toast.success {
        background: #4caf50;
      }

      .toast.info {
        background: #2196f3;
      }

      .toast.offline {
        background: #f44336;
        bottom: 24px;
        right: 24px;
        top: auto;
        animation: slideUp 0.3s ease;
      }

      @keyframes slideIn {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Network Status Banner */
      .network-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #f44336;
        color: #fff;
        padding: 12px;
        text-align: center;
        font-size: 14px;
        z-index: 998;
        animation: slideDown 0.3s ease;
      }

      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-100%); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Page Fade-In Animation */
      .app-container, main, .content {
        animation: fadeIn ${CONFIG.fadeInDuration}ms ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      /* Shortcuts Help Overlay */
      .shortcuts-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
      }

      .shortcuts-overlay.visible {
        display: flex;
      }

      .shortcuts-dialog {
        background: #fff;
        padding: 32px;
        border-radius: 12px;
        max-width: 500px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      }

      .shortcuts-dialog h2 {
        margin-top: 0;
        color: #333;
      }

      .shortcut-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
        font-size: 14px;
      }

      .shortcut-item:last-child {
        border-bottom: none;
      }

      .shortcut-key {
        font-family: monospace;
        background: #f5f5f5;
        padding: 2px 8px;
        border-radius: 4px;
        color: #c9a84c;
        font-weight: bold;
      }

      .close-shortcuts {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
      }

      .close-shortcuts:hover {
        color: #333;
      }

      /* Read Time Badge */
      .read-time-badge {
        display: inline-block;
        font-size: 13px;
        color: #666;
        margin-top: 8px;
      }

      /* Dark Mode Styles */
      html[data-theme="dark"] {
        background: #1e1e1e;
        color: #e0e0e0;
      }

      html[data-theme="dark"] .shortcuts-dialog {
        background: #2a2a2a;
        color: #e0e0e0;
      }

      html[data-theme="dark"] .shortcuts-dialog h2 {
        color: #e0e0e0;
      }

      html[data-theme="dark"] .shortcut-item {
        border-bottom-color: #444;
      }

      html[data-theme="dark"] .shortcut-key {
        background: #333;
        color: #c9a84c;
      }

      html[data-theme="dark"] .toast {
        background: #444;
      }
    `;
    document.head.appendChild(style);
  }

  // ==================== BACK TO TOP BUTTON ====================
  function initBackToTop() {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.setAttribute('aria-label', 'Back to top');
    button.innerHTML = '↑';
    document.body.appendChild(button);

    window.addEventListener('scroll', () => {
      button.classList.toggle('visible', window.scrollY > CONFIG.scrollThreshold);
    });

    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==================== TOAST NOTIFICATIONS ====================
  function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, duration);
  }

  // ==================== AUTO-SAVE INDICATOR ====================
  function initAutoSave() {
    const saveIndicator = document.createElement('div');
    saveIndicator.className = 'toast info';
    saveIndicator.style.display = 'none';
    saveIndicator.textContent = MESSAGES.saving.en;
    document.body.appendChild(saveIndicator);

    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        clearTimeout(saveTimeout);
        saveIndicator.style.display = 'block';
        saveIndicator.textContent = MESSAGES.saving.en;

        saveTimeout = setTimeout(() => {
          saveIndicator.textContent = MESSAGES.saved.en;
          setTimeout(() => {
            saveIndicator.style.display = 'none';
          }, 1500);
        }, CONFIG.debounceDelay);
      }
    });

    document.addEventListener('change', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
        clearTimeout(saveTimeout);
        saveIndicator.style.display = 'block';
        saveIndicator.textContent = MESSAGES.saving.en;

        saveTimeout = setTimeout(() => {
          saveIndicator.textContent = MESSAGES.saved.en;
          setTimeout(() => {
            saveIndicator.style.display = 'none';
          }, 1500);
        }, CONFIG.debounceDelay);
      }
    });
  }

  // ==================== KEYBOARD SHORTCUTS ====================
  function initKeyboardShortcuts() {
    const helpOverlay = document.createElement('div');
    helpOverlay.className = 'shortcuts-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'shortcuts-dialog';

    let dialogHTML = `
      <button class="close-shortcuts" aria-label="Close">×</button>
      <h2>${MESSAGES.shortcuts.en}</h2>
    `;

    Object.entries(SHORTCUTS).forEach(([key, shortcut]) => {
      dialogHTML += `
        <div class="shortcut-item">
          <span>${shortcut.en} / ${shortcut.ar}</span>
          <span class="shortcut-key">Alt+${key.toUpperCase()}</span>
        </div>
      `;
    });

    dialogHTML += `
      <div class="shortcut-item">
        <span>${MESSAGES.shortcuts.en}</span>
        <span class="shortcut-key">?</span>
      </div>
    `;

    dialog.innerHTML = dialogHTML;
    helpOverlay.appendChild(dialog);
    document.body.appendChild(helpOverlay);

    // Close button & overlay click
    helpOverlay.querySelector('.close-shortcuts').addEventListener('click', () => {
      helpOverlay.classList.remove('visible');
    });

    helpOverlay.addEventListener('click', (e) => {
      if (e.target === helpOverlay) {
        helpOverlay.classList.remove('visible');
      }
    });

    // Keyboard event listener
    document.addEventListener('keydown', (e) => {
      const isInputFocused = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);

      // Alt+H, Alt+G, Alt+P, Alt+E
      if (e.altKey && !isInputFocused) {
        const key = e.key.toLowerCase();
        if (key === 'h' || key === 'g' || key === 'p' || key === 'e') {
          e.preventDefault();
          const shortcut = SHORTCUTS[key];
          showToast(`${shortcut.en} / ${shortcut.ar}`, 'info', 1500);
          setTimeout(() => {
            window.location.href = shortcut.url;
          }, 300);
          return;
        }

        // Alt+T for dark mode toggle
        if (key === 't') {
          e.preventDefault();
          toggleDarkMode();
          return;
        }
      }

      // ? for help (only if no input focused)
      if (e.key === '?' && !isInputFocused) {
        e.preventDefault();
        helpOverlay.classList.toggle('visible');
      }
    });
  }

  // ==================== DARK MODE TOGGLE ====================
  function toggleDarkMode() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';

    if (isDark) {
      html.removeAttribute('data-theme');
      localStorage.removeItem('theme');
    } else {
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }

    showToast(MESSAGES.darkMode.en, 'info', 1500);
  }

  // Load saved dark mode preference
  function initDarkModePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  // ==================== NETWORK STATUS ====================
  function initNetworkStatus() {
    function showNetworkBanner() {
      let banner = document.getElementById('network-banner');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'network-banner';
        banner.className = 'network-banner';
        document.body.insertBefore(banner, document.body.firstChild);
      }
      banner.textContent = MESSAGES.offline.en;
      banner.style.display = 'block';
    }

    function hideNetworkBanner() {
      const banner = document.getElementById('network-banner');
      if (banner) {
        banner.style.display = 'none';
      }
      showToast(MESSAGES.online.en, 'success', 2000);
    }

    window.addEventListener('offline', () => {
      isOnline = false;
      showNetworkBanner();
    });

    window.addEventListener('online', () => {
      isOnline = true;
      hideNetworkBanner();
    });
  }

  // ==================== READ TIME ESTIMATION ====================
  function initReadTimeEstimate() {
    // Only show for guide pages
    if (!window.location.pathname.includes('guide')) {
      return;
    }

    const main = document.querySelector('main') || document.querySelector('.content') || document.body;
    const text = main.innerText || main.textContent || '';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / CONFIG.readTimeWordsPerMinute);

    if (minutes > 0) {
      const badge = document.createElement('div');
      badge.className = 'read-time-badge';
      badge.textContent = `~${minutes} ${MESSAGES.readTime.en} / ~${minutes} ${MESSAGES.readTime.ar}`;

      const heading = document.querySelector('h1');
      if (heading) {
        heading.parentNode.insertBefore(badge, heading.nextSibling);
      } else {
        main.insertBefore(badge, main.firstChild);
      }
    }
  }

  // ==================== INITIALIZE ALL FEATURES ====================
  function init() {
    injectStyles();
    initDarkModePreference();
    initBackToTop();
    initAutoSave();
    initKeyboardShortcuts();
    initNetworkStatus();
    initReadTimeEstimate();
  }

  // Run on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
