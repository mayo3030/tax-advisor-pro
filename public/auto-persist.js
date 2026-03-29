/**
 * ═══════════════════════════════════════════════════════════════════
 *  AUTO-PERSIST — Save Everything, Lose Nothing
 *  حفظ تلقائي — لا تفقد أي شيء
 * ═══════════════════════════════════════════════════════════════════
 *
 *  This module ensures ALL user data is saved to their account
 *  automatically on every change. If anything goes wrong (crash,
 *  connection loss, browser close), the user comes back exactly
 *  where they left off.
 *
 *  Usage: <script src="auto-persist.js"></script> at end of <body>
 * ═══════════════════════════════════════════════════════════════════
 */
(function() {
  'use strict';

  // ═══════════════════════════════════════════
  // CONFIG
  // ═══════════════════════════════════════════
  const DEBOUNCE_MS = 2000;       // Save 2 seconds after last change
  const HEARTBEAT_MS = 30000;     // Heartbeat save every 30 seconds
  const OFFLINE_QUEUE_KEY = 'taxPro_offlineQueue';
  const AUTH_TOKEN_KEY = 'authToken';
  const USER_DATA_KEY = 'taxPro_userData';
  const SESSION_ID_KEY = 'taxSessionId';
  const STATE_BACKUP_KEY = 'taxPro_stateBackup';

  // ═══════════════════════════════════════════
  // DETECT API BASE
  // ═══════════════════════════════════════════
  function getApiBase() {
    if (typeof API_BASE !== 'undefined' && API_BASE) return API_BASE;
    const loc = window.location;
    if (loc.protocol === 'file:') return null;
    return loc.origin;
  }

  // ═══════════════════════════════════════════
  // AUTH HELPERS
  // ═══════════════════════════════════════════
  function getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function authHeaders() {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    };
  }

  // ═══════════════════════════════════════════
  // OFFLINE QUEUE — saves data when server is unreachable
  // ═══════════════════════════════════════════
  const offlineQueue = {
    get() {
      try {
        return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
      } catch { return []; }
    },
    add(type, payload) {
      const queue = this.get();
      queue.push({ type, payload, timestamp: Date.now() });
      // Keep only last 50 items to prevent storage bloat
      while (queue.length > 50) queue.shift();
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    },
    clear() {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
    },
    async flush() {
      const queue = this.get();
      if (!queue.length) return;
      const apiBase = getApiBase();
      if (!apiBase) return;

      let successCount = 0;
      for (const item of queue) {
        try {
          if (item.type === 'taxData') {
            await fetch(apiBase + '/api/tax-data', {
              method: 'POST',
              headers: authHeaders(),
              body: JSON.stringify(item.payload)
            });
          } else if (item.type === 'userState') {
            await fetch(apiBase + '/api/user-state', {
              method: 'POST',
              headers: authHeaders(),
              body: JSON.stringify(item.payload)
            });
          } else if (item.type === 'userTaxData') {
            await fetch(apiBase + '/api/user-tax-data', {
              method: 'POST',
              headers: authHeaders(),
              body: JSON.stringify(item.payload)
            });
          }
          successCount++;
        } catch (e) {
          // If flush fails, stop — we'll retry later
          break;
        }
      }
      if (successCount === queue.length) {
        this.clear();
      } else if (successCount > 0) {
        // Remove successfully synced items
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue.slice(successCount)));
      }
    }
  };

  // ═══════════════════════════════════════════
  // LOCAL STATE BACKUP — survives browser crash
  // ═══════════════════════════════════════════
  function backupStateLocally() {
    try {
      const backup = {
        sessionId: localStorage.getItem(SESSION_ID_KEY),
        timestamp: Date.now(),
        page: window.location.pathname.split('/').pop() || 'index.html'
      };

      // On the main tax form page, capture the full state
      if (typeof collectAllFormData === 'function') {
        backup.taxData = collectAllFormData();
      }
      if (typeof state !== 'undefined') {
        backup.currentStep = state.currentStep;
        backup.filingStatus = state.filingStatus;
        backup.deductionType = state.deductionType;
        backup.selectedCredits = state.selectedCredits;
      }

      localStorage.setItem(STATE_BACKUP_KEY, JSON.stringify(backup));
    } catch (e) {
      // localStorage might be full — silently fail
    }
  }

  function getLocalBackup() {
    try {
      const raw = localStorage.getItem(STATE_BACKUP_KEY);
      if (!raw) return null;
      const backup = JSON.parse(raw);
      // Only use backups less than 24 hours old
      if (Date.now() - backup.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(STATE_BACKUP_KEY);
        return null;
      }
      return backup;
    } catch { return null; }
  }

  // ═══════════════════════════════════════════
  // SAVE — Debounced auto-save to server
  // ═══════════════════════════════════════════
  let saveTimer = null;
  let isSaving = false;
  let saveIndicator = null;

  function showSaveStatus(status) {
    // Create indicator if it doesn't exist
    if (!saveIndicator) {
      saveIndicator = document.createElement('div');
      saveIndicator.id = 'autoPersistIndicator';
      saveIndicator.style.cssText = `
        position: fixed; top: 70px; right: 16px; z-index: 9999;
        padding: 6px 14px; border-radius: 20px; font-size: 12px;
        font-weight: 600; transition: all 0.3s ease;
        pointer-events: none; opacity: 0; transform: translateY(-10px);
        font-family: 'Plus Jakarta Sans', 'Noto Sans Arabic', Arial, sans-serif;
      `;
      document.body.appendChild(saveIndicator);
    }

    if (status === 'saving') {
      saveIndicator.textContent = '⏳ Saving... — جاري الحفظ';
      saveIndicator.style.background = '#fff8e1';
      saveIndicator.style.color = '#b08f3a';
      saveIndicator.style.border = '1px solid #dab95e';
    } else if (status === 'saved') {
      saveIndicator.textContent = '✅ Saved — تم الحفظ';
      saveIndicator.style.background = '#e8f5ef';
      saveIndicator.style.color = '#0f5132';
      saveIndicator.style.border = '1px solid #a3d9b1';
    } else if (status === 'offline') {
      saveIndicator.textContent = '📴 Saved locally — محفوظ محلياً';
      saveIndicator.style.background = '#fde8e5';
      saveIndicator.style.color = '#b03a2e';
      saveIndicator.style.border = '1px solid #e0a9a4';
    } else if (status === 'error') {
      saveIndicator.textContent = '⚠️ Save failed — فشل الحفظ';
      saveIndicator.style.background = '#fde8e5';
      saveIndicator.style.color = '#b03a2e';
      saveIndicator.style.border = '1px solid #e0a9a4';
    }

    saveIndicator.style.opacity = '1';
    saveIndicator.style.transform = 'translateY(0)';

    // Hide after 3 seconds (except saving)
    if (status !== 'saving') {
      setTimeout(() => {
        if (saveIndicator) {
          saveIndicator.style.opacity = '0';
          saveIndicator.style.transform = 'translateY(-10px)';
        }
      }, 3000);
    }
  }

  async function doSave() {
    if (isSaving) return;
    isSaving = true;

    const apiBase = getApiBase();
    const sessionId = localStorage.getItem(SESSION_ID_KEY);

    // Always backup locally first (crash protection)
    backupStateLocally();

    // Collect current state
    let taxData = null;
    let currentState = null;

    if (typeof collectAllFormData === 'function') {
      taxData = collectAllFormData();
    }

    if (typeof state !== 'undefined') {
      currentState = {
        sessionId: sessionId,
        currentStep: state.currentStep || 0,
        filingStatus: state.filingStatus || '',
        deductionType: state.deductionType || 'standard',
        selectedCredits: state.selectedCredits || {},
        lastPage: window.location.pathname.split('/').pop() || 'index.html'
      };
    }

    // If no API, save to offline queue
    if (!apiBase) {
      if (taxData) offlineQueue.add('taxData', { sessionId, data: taxData });
      if (currentState && isLoggedIn()) offlineQueue.add('userState', currentState);
      showSaveStatus('offline');
      isSaving = false;
      return;
    }

    showSaveStatus('saving');

    try {
      const promises = [];

      // Save tax data (works without auth too)
      if (taxData && sessionId) {
        if (isLoggedIn()) {
          // Authenticated save — links to user account
          promises.push(
            fetch(apiBase + '/api/user-tax-data', {
              method: 'POST',
              headers: authHeaders(),
              body: JSON.stringify({ sessionId, data: taxData })
            })
          );
        } else {
          // Anonymous save — just saves data
          promises.push(
            fetch(apiBase + '/api/tax-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId, data: taxData })
            })
          );
        }
      }

      // Save full user state (auth required)
      if (currentState && isLoggedIn()) {
        promises.push(
          fetch(apiBase + '/api/user-state', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(currentState)
          })
        );
      }

      if (promises.length > 0) {
        const results = await Promise.allSettled(promises);
        const allOk = results.every(r => r.status === 'fulfilled' && r.value.ok);
        if (allOk) {
          showSaveStatus('saved');
          // Flush any offline queue if server is back
          offlineQueue.flush();
        } else {
          // Partial failure — queue for retry
          if (taxData) offlineQueue.add('taxData', { sessionId, data: taxData });
          showSaveStatus('error');
        }
      }
    } catch (e) {
      // Network error — save to offline queue
      if (taxData) offlineQueue.add('taxData', { sessionId, data: taxData });
      if (currentState && isLoggedIn()) offlineQueue.add('userState', currentState);
      showSaveStatus('offline');
    }

    isSaving = false;
  }

  function triggerSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(doSave, DEBOUNCE_MS);
  }

  // ═══════════════════════════════════════════
  // RESTORE — Full state recovery on page load
  // ═══════════════════════════════════════════
  async function restoreFullState() {
    const apiBase = getApiBase();
    if (!apiBase || !isLoggedIn()) {
      // Try local backup for non-logged-in users
      const backup = getLocalBackup();
      if (backup && backup.taxData && typeof autoFillForm === 'function') {
        autoFillForm(backup.taxData);
        if (typeof state !== 'undefined' && backup.currentStep) {
          state.filingStatus = backup.filingStatus || '';
          state.deductionType = backup.deductionType || 'standard';
          state.selectedCredits = backup.selectedCredits || {};
          if (typeof goToStep === 'function' && backup.currentStep > 0) {
            goToStep(backup.currentStep);
          }
        }
        showRestoreBanner(backup.timestamp);
      }
      return;
    }

    try {
      const resp = await fetch(apiBase + '/api/user-state', {
        headers: authHeaders()
      });

      if (!resp.ok) return;
      const result = await resp.json();

      if (!result.exists) {
        // New user — link their current anonymous session to their account
        const sessionId = localStorage.getItem(SESSION_ID_KEY);
        if (sessionId) {
          fetch(apiBase + '/api/auth/link-session', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ sessionId })
          }).catch(() => {});
        }
        return;
      }

      // Restore session ID
      if (result.state.sessionId) {
        localStorage.setItem(SESSION_ID_KEY, result.state.sessionId);
        // Update the global sessionId variable if it exists
        if (typeof window.sessionId !== 'undefined') {
          window.sessionId = result.state.sessionId;
        }
        // Also try to set the module-level sessionId
        try { sessionId = result.state.sessionId; } catch(e) {}
      }

      // Restore tax form data
      if (result.taxData && typeof autoFillForm === 'function') {
        autoFillForm(result.taxData);
      }

      // Restore state (step, filing status, deductions, credits)
      if (typeof state !== 'undefined') {
        if (result.state.filingStatus) {
          state.filingStatus = result.state.filingStatus;
          // Click the matching filing status option
          const statusOptions = document.querySelectorAll('.filing-status-option, [data-status]');
          statusOptions.forEach(opt => {
            const val = opt.dataset?.status || opt.dataset?.value;
            if (val === result.state.filingStatus) {
              opt.classList.add('selected');
            }
          });
        }

        if (result.state.deductionType) {
          state.deductionType = result.state.deductionType;
          // Select the matching deduction type
          const dedOptions = document.querySelectorAll('[data-deduction-type], .deduction-option');
          dedOptions.forEach(opt => {
            if (opt.dataset?.deductionType === result.state.deductionType) {
              opt.classList.add('selected');
            }
          });
        }

        if (result.state.selectedCredits) {
          state.selectedCredits = result.state.selectedCredits;
          // Re-select credit checkboxes
          const creditsGrid = document.querySelectorAll('#creditsGrid .deduction-item');
          const creditKeys = ['childTax', 'eitc', 'education', 'childCare', 'saverCredit', 'energyCredit'];
          creditKeys.forEach((key, i) => {
            if (result.state.selectedCredits[key] && creditsGrid[i]) {
              creditsGrid[i].classList.add('selected');
            }
          });
        }

        // Navigate to the step they were on
        if (result.state.currentStep > 0 && typeof goToStep === 'function') {
          // Small delay to let form fill complete
          setTimeout(() => {
            state.currentStep = result.state.currentStep;
            goToStep(result.state.currentStep);
          }, 500);
        }
      }

      // Restore chat history
      if (result.chatHistory && result.chatHistory.length > 0 && typeof addMessage === 'function') {
        // Only restore if the chat is empty (avoid duplicates)
        const chatContainer = document.getElementById('chatMessages');
        if (chatContainer && chatContainer.children.length <= 1) {
          result.chatHistory.forEach(msg => {
            addMessage(msg.role, msg.content);
          });
          // Update the chatHistory array if it exists
          if (typeof chatHistory !== 'undefined' && Array.isArray(chatHistory)) {
            result.chatHistory.forEach(msg => {
              chatHistory.push({ role: msg.role, content: msg.content });
            });
          }
        }
      }

      showRestoreBanner(result.state.updatedAt);

    } catch (e) {
      console.warn('[AutoPersist] Restore failed, trying local backup:', e.message);
      // Fall back to local backup
      const backup = getLocalBackup();
      if (backup && backup.taxData && typeof autoFillForm === 'function') {
        autoFillForm(backup.taxData);
      }
    }
  }

  function showRestoreBanner(timestamp) {
    const banner = document.createElement('div');
    banner.id = 'restoreBanner';

    let timeStr = '';
    if (timestamp) {
      const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMin = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMin < 1) timeStr = 'just now — الآن';
      else if (diffMin < 60) timeStr = diffMin + ' min ago — قبل ' + diffMin + ' دقيقة';
      else if (diffHrs < 24) timeStr = diffHrs + ' hours ago — قبل ' + diffHrs + ' ساعة';
      else timeStr = diffDays + ' days ago — قبل ' + diffDays + ' يوم';
    }

    banner.style.cssText = `
      position: fixed; top: 70px; left: 50%; transform: translateX(-50%);
      z-index: 9999; padding: 12px 24px; border-radius: 12px;
      background: linear-gradient(135deg, #e8f5ef, #d4edda);
      border: 1px solid #a3d9b1; color: #0f5132;
      font-size: 14px; font-weight: 600; text-align: center;
      box-shadow: 0 4px 20px rgba(15,81,50,0.15);
      font-family: 'Plus Jakarta Sans', 'Noto Sans Arabic', Arial, sans-serif;
      animation: slideDown 0.4s ease;
      max-width: 90vw;
    `;
    banner.innerHTML = `
      ✅ Welcome back! Your progress was restored.
      <br><span style="font-size:12px;opacity:0.8">أهلاً بعودتك! تم استعادة تقدمك</span>
      ${timeStr ? '<br><span style="font-size:11px;opacity:0.6">Last saved: ' + timeStr + '</span>' : ''}
      <span onclick="this.parentElement.remove()" style="margin-right:12px;cursor:pointer;opacity:0.5;float:right">✕</span>
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = '@keyframes slideDown { from { opacity:0; transform:translateX(-50%) translateY(-20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }';
    document.head.appendChild(style);

    document.body.appendChild(banner);

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      if (banner.parentElement) {
        banner.style.opacity = '0';
        banner.style.transform = 'translateX(-50%) translateY(-20px)';
        banner.style.transition = 'all 0.3s ease';
        setTimeout(() => banner.remove(), 300);
      }
    }, 8000);
  }

  // ═══════════════════════════════════════════
  // BEFORE UNLOAD — Emergency save
  // ═══════════════════════════════════════════
  function emergencySave() {
    backupStateLocally();

    // Try a synchronous save via sendBeacon
    const apiBase = getApiBase();
    const sessionId = localStorage.getItem(SESSION_ID_KEY);

    if (apiBase && sessionId && typeof collectAllFormData === 'function') {
      const taxData = collectAllFormData();
      const blob = new Blob([JSON.stringify({ sessionId, data: taxData })], { type: 'application/json' });
      navigator.sendBeacon(apiBase + '/api/tax-data', blob);
    }
  }

  // ═══════════════════════════════════════════
  // INIT — Wire everything up
  // ═══════════════════════════════════════════
  function init() {
    // 1. Listen for ALL form changes
    document.addEventListener('input', (e) => {
      if (e.target.matches('input, textarea, select')) {
        triggerSave();
      }
    }, true);

    document.addEventListener('change', (e) => {
      if (e.target.matches('input, textarea, select')) {
        triggerSave();
      }
    }, true);

    // 2. Listen for click on option selectors (filing status, deductions, credits)
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.filing-status-option, .deduction-item, .deduction-option, [data-status], [data-deduction-type]');
      if (target) {
        // Delay to let the click handler update state first
        setTimeout(triggerSave, 100);
      }
    }, true);

    // 3. Listen for step navigation
    const originalGoToStep = window.goToStep;
    if (typeof originalGoToStep === 'function') {
      window.goToStep = function(n) {
        originalGoToStep(n);
        triggerSave();
      };
    }

    // 4. Heartbeat save
    setInterval(() => {
      if (typeof state !== 'undefined' && state.currentStep > 0) {
        doSave();
      }
    }, HEARTBEAT_MS);

    // 5. Save before page unload
    window.addEventListener('beforeunload', emergencySave);
    window.addEventListener('pagehide', emergencySave);

    // 6. Restore state on load
    // Small delay to let the page's own scripts initialize first
    setTimeout(restoreFullState, 800);

    // 7. Flush offline queue when back online
    window.addEventListener('online', () => {
      offlineQueue.flush();
    });

    // 8. Try flushing offline queue on load
    if (navigator.onLine) {
      setTimeout(() => offlineQueue.flush(), 2000);
    }

    // 9. Save when visibility changes (user switches tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        emergencySave();
      } else if (document.visibilityState === 'visible') {
        // Flush queue when tab becomes visible again
        if (navigator.onLine) offlineQueue.flush();
      }
    });

    console.log('[AutoPersist] Initialized — auto-save active');
  }

  // ═══════════════════════════════════════════
  // EXPOSE GLOBAL API
  // ═══════════════════════════════════════════
  window.AutoPersist = {
    save: doSave,
    restore: restoreFullState,
    triggerSave: triggerSave,
    getOfflineQueue: () => offlineQueue.get(),
    flushQueue: () => offlineQueue.flush(),
    isLoggedIn: isLoggedIn
  };

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
