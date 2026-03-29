// ═══════════════════════════════════════════════════════════════════════════
// PRIOR YEAR DATA IMPORT MODULE — استيراد بيانات السنة الماضية
// Self-contained IIFE that manages importing prior year tax data
// ═══════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ─────────────────────── GLOBAL OBJECT ───────────────────────

  window.PriorYearImport = {
    currentSessions: [],
    selectedSession: null,
    currentSessionData: null,

    // ─────────────────────── API CALLS ───────────────────────

    /**
     * Load user's past tax sessions from the server
     */
    loadPriorSessions: async function() {
      try {
        const response = await fetch('/api/auth/sessions', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          throw new Error(`Failed to load sessions: ${response.statusText}`);
        }

        const data = await response.json();
        this.currentSessions = data.sessions || [];
        return this.currentSessions;
      } catch (error) {
        console.error('Error loading prior sessions:', error);
        return [];
      }
    },

    /**
     * Load tax data for a specific session
     * @param {string} sessionId - The ID of the session to load
     */
    loadSessionData: async function(sessionId) {
      try {
        const response = await fetch(`/api/tax-data/${sessionId}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          throw new Error(`Failed to load session data: ${response.statusText}`);
        }

        const data = await response.json();
        this.currentSessionData = data;
        this.selectedSession = sessionId;
        return data;
      } catch (error) {
        console.error('Error loading session data:', error);
        return null;
      }
    },

    // ─────────────────────── DATA EXTRACTION ───────────────────────

    /**
     * Get list of importable field categories from prior year data
     * @param {object} priorData - The prior year tax data
     * @returns {array} Array of importable field objects with checkboxes
     */
    getImportableFields: function(priorData) {
      const importable = [];

      // Personal Information
      if (priorData.personal) {
        importable.push({
          category: 'Personal Information — المعلومات الشخصية',
          icon: '👤',
          fields: ['firstName', 'lastName', 'ssn', 'dateOfBirth'],
          checked: true,
          data: {
            firstName: priorData.personal.firstName,
            lastName: priorData.personal.lastName,
            ssn: priorData.personal.ssn,
            dateOfBirth: priorData.personal.dateOfBirth
          }
        });
      }

      // Address Information
      if (priorData.personal?.address) {
        importable.push({
          category: 'Address — العنوان',
          icon: '🏠',
          fields: ['street', 'city', 'state', 'zipCode'],
          checked: true,
          data: priorData.personal.address
        });
      }

      // Filing Status
      if (priorData.filingStatus) {
        importable.push({
          category: 'Filing Status — حالة الإقرار',
          icon: '📄',
          fields: ['status'],
          checked: true,
          data: { status: priorData.filingStatus }
        });
      }

      // Employer Information (names only, not income)
      if (priorData.w2s && priorData.w2s.length > 0) {
        const employerNames = priorData.w2s.map(w2 => w2.employerName).filter(Boolean);
        if (employerNames.length > 0) {
          importable.push({
            category: 'Employer Names (W-2) — أسماء أصحاب العمل',
            icon: '🏢',
            fields: employerNames,
            checked: true,
            data: { employers: employerNames }
          });
        }
      }

      // Self-Employment Business Names (1099 sources, no amounts)
      if (priorData.nec1099s && priorData.nec1099s.length > 0) {
        const businessNames = priorData.nec1099s
          .map(form => form.businessName)
          .filter(Boolean);
        if (businessNames.length > 0) {
          importable.push({
            category: 'Self-Employment Business Names (1099) — أسماء الأعمال الحرة',
            icon: '💼',
            fields: businessNames,
            checked: true,
            data: { businesses: businessNames }
          });
        }
      }

      // Deduction Types (not amounts)
      if (priorData.deductions) {
        const deductionTypes = Object.keys(priorData.deductions).filter(
          key => priorData.deductions[key]
        );
        if (deductionTypes.length > 0) {
          importable.push({
            category: 'Deduction Types (names only) — أنواع الخصومات',
            icon: '💰',
            fields: deductionTypes,
            checked: true,
            data: { deductionTypes }
          });
        }
      }

      return importable;
    },

    // ─────────────────────── FORM FILLING ───────────────────────

    /**
     * Map and import prior data to current form fields
     * @param {object} priorData - The prior year tax data
     * @param {array} selectedCategories - Categories user selected to import
     */
    importToCurrentForm: function(priorData, selectedCategories) {
      try {
        const importableForms = this.getImportableFields(priorData);

        // Filter to only selected categories
        const toImport = importableForms.filter(item =>
          selectedCategories.includes(item.category)
        );

        let importedCount = 0;

        // Personal Information
        const personalItem = toImport.find(item =>
          item.category.includes('Personal Information')
        );
        if (personalItem && personalItem.data) {
          const { firstName, lastName, ssn, dateOfBirth } = personalItem.data;

          const firstNameInput = document.getElementById('firstName');
          const lastNameInput = document.getElementById('lastName');
          const ssnInput = document.getElementById('ssn');
          const dobInput = document.getElementById('dateOfBirth');

          if (firstNameInput && firstName) {
            firstNameInput.value = firstName;
            firstNameInput.dispatchEvent(new Event('change', { bubbles: true }));
            importedCount++;
          }
          if (lastNameInput && lastName) {
            lastNameInput.value = lastName;
            lastNameInput.dispatchEvent(new Event('change', { bubbles: true }));
            importedCount++;
          }
          if (ssnInput && ssn) {
            ssnInput.value = ssn;
            ssnInput.dispatchEvent(new Event('change', { bubbles: true }));
            importedCount++;
          }
          if (dobInput && dateOfBirth) {
            dobInput.value = dateOfBirth;
            dobInput.dispatchEvent(new Event('change', { bubbles: true }));
            importedCount++;
          }
        }

        // Address Information
        const addressItem = toImport.find(item => item.category.includes('Address'));
        if (addressItem && addressItem.data) {
          const { street, city, state, zipCode } = addressItem.data;

          const streetInput = document.getElementById('street');
          const cityInput = document.getElementById('city');
          const stateInput = document.getElementById('state');
          const zipInput = document.getElementById('zipCode');

          if (streetInput && street) {
            streetInput.value = street;
            streetInput.dispatchEvent(new Event('change', { bubbles: true }));
            importedCount++;
          }
          if (cityInput && city) {
            cityInput.value = city;
            cityInput.dispatchEvent(new Event('change', { bubbles: true }));
            importedCount++;
          }
          if (stateInput && state) {
            stateInput.value = state;
            stateInput.dispatchEvent(new Event('change', { bubbles: true }));
            importedCount++;
          }
          if (zipInput && zipCode) {
            zipInput.value = zipCode;
            zipInput.dispatchEvent(new Event('change', { bubbles: true }));
            importedCount++;
          }
        }

        // Filing Status
        const filingItem = toImport.find(item =>
          item.category.includes('Filing Status')
        );
        if (filingItem && filingItem.data?.status) {
          const statusSelect = document.getElementById('filingStatus');
          if (statusSelect) {
            statusSelect.value = filingItem.data.status;
            statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
            importedCount++;
          }
        }

        // Employer Names
        const employerItem = toImport.find(item =>
          item.category.includes('Employer Names')
        );
        if (employerItem && employerItem.data?.employers) {
          employerItem.data.employers.forEach(employer => {
            // Add employer placeholder or pre-fill if form exists
            const w2Section = document.getElementById('w2sSection');
            if (w2Section) {
              importedCount++;
            }
          });
        }

        // Deduction Types
        const deductionItem = toImport.find(item =>
          item.category.includes('Deduction Types')
        );
        if (deductionItem && deductionItem.data?.deductionTypes) {
          deductionItem.data.deductionTypes.forEach(dedType => {
            const dedCheckbox = document.querySelector(
              `input[name="deduction_${dedType}"]`
            );
            if (dedCheckbox) {
              dedCheckbox.checked = true;
              dedCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
              importedCount++;
            }
          });
        }

        return {
          success: true,
          importedCount,
          message: `✅ Imported ${importedCount} fields from prior year — تم استيراد ${importedCount} بيانات`
        };
      } catch (error) {
        console.error('Error importing data:', error);
        return {
          success: false,
          importedCount: 0,
          message: `⚠️ Error importing data: ${error.message}`
        };
      }
    },

    // ─────────────────────── UI MANAGEMENT ───────────────────────

    /**
     * Display modal with prior year sessions to import
     * @param {array} sessions - Array of prior sessions
     */
    showImportModal: function(sessions) {
      if (!sessions || sessions.length === 0) {
        alert('No prior sessions found — لم نجد سنوات سابقة');
        return;
      }

      // Create modal container
      const modal = document.createElement('div');
      modal.id = 'priorYearModal';
      modal.className = 'prior-year-modal-overlay';

      const modalContent = document.createElement('div');
      modalContent.className = 'prior-year-modal';

      // Header
      const header = document.createElement('div');
      header.className = 'prior-year-modal-header';
      header.innerHTML = `
        <h2>📂 Import Prior Year Data — استيراد بيانات السنة الماضية</h2>
        <button class="prior-year-modal-close" onclick="document.getElementById('priorYearModal')?.remove()">✕</button>
      `;

      // Sessions list
      const sessionsList = document.createElement('div');
      sessionsList.className = 'prior-year-sessions-list';

      sessions.forEach(session => {
        const sessionItem = document.createElement('div');
        sessionItem.className = 'prior-year-session-item';
        sessionItem.innerHTML = `
          <div class="session-info">
            <div class="session-year">📅 ${session.year || 'Unknown Year'}</div>
            <div class="session-date">${new Date(session.createdAt).toLocaleDateString('en-US')}</div>
          </div>
          <button class="btn btn-secondary prior-year-import-btn" data-session-id="${session.id}">
            📥 Import
          </button>
        `;

        sessionItem.querySelector('.prior-year-import-btn').addEventListener(
          'click',
          (e) => this.handleSessionSelect(e, session)
        );

        sessionsList.appendChild(sessionItem);
      });

      // Preview section (initially hidden)
      const previewSection = document.createElement('div');
      previewSection.className = 'prior-year-preview-section';
      previewSection.style.display = 'none';
      previewSection.innerHTML = `
        <h3>📋 Preview — معاينة</h3>
        <div class="prior-year-preview-fields"></div>
        <div style="margin-top: 16px; display: flex; gap: 8px;">
          <button class="btn btn-primary" id="confirmImportBtn">
            ✅ Import Selected — استيراد المختار
          </button>
          <button class="btn btn-secondary" onclick="document.querySelector('.prior-year-preview-section').style.display='none';document.querySelector('.prior-year-sessions-list').style.display='block'">
            ← Back
          </button>
        </div>
      `;

      // Assemble modal
      modalContent.appendChild(header);
      modalContent.appendChild(sessionsList);
      modalContent.appendChild(previewSection);
      modal.appendChild(modalContent);

      // Inject CSS if not already present
      if (!document.getElementById('prior-year-styles')) {
        this.injectStyles();
      }

      // Add to DOM and show
      document.body.appendChild(modal);
      setTimeout(() => modal.classList.add('visible'), 10);
    },

    /**
     * Handle session selection and show preview
     */
    handleSessionSelect: async function(event, session) {
      event.preventDefault();

      const sessionData = await this.loadSessionData(session.id);
      if (!sessionData) {
        alert('Failed to load session data — فشل تحميل البيانات');
        return;
      }

      const importable = this.getImportableFields(sessionData);
      const modal = document.getElementById('priorYearModal');

      // Hide sessions list, show preview
      modal.querySelector('.prior-year-sessions-list').style.display = 'none';
      const previewSection = modal.querySelector('.prior-year-preview-section');
      previewSection.style.display = 'block';

      // Build preview with checkboxes
      const previewFields = modal.querySelector('.prior-year-preview-fields');
      previewFields.innerHTML = '';

      importable.forEach(item => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'prior-year-category';
        categoryDiv.innerHTML = `
          <label class="prior-year-category-label">
            <input type="checkbox" class="prior-year-category-checkbox"
                   data-category="${item.category}"
                   ${item.checked ? 'checked' : ''}>
            <span>${item.icon} ${item.category}</span>
          </label>
          <div class="prior-year-field-list">
            ${item.fields
              .filter(f => f && item.data[f] !== undefined && item.data[f] !== null)
              .map(f => `<div class="prior-year-field-item">• ${item.data[f]}</div>`)
              .join('')}
          </div>
        `;
        previewFields.appendChild(categoryDiv);
      });

      // Confirm button
      const confirmBtn = modal.querySelector('#confirmImportBtn');
      confirmBtn.onclick = () => {
        const selectedCategories = Array.from(
          modal.querySelectorAll('.prior-year-category-checkbox:checked')
        ).map(checkbox => checkbox.dataset.category);

        const result = this.importToCurrentForm(sessionData, selectedCategories);
        alert(result.message);

        if (result.success) {
          modal.remove();
          // Trigger form refresh
          if (window.saveProgress) window.saveProgress();
        }
      };
    },

    // ─────────────────────── STYLING ───────────────────────

    /**
     * Inject CSS styles for the modal
     */
    injectStyles: function() {
      const style = document.createElement('style');
      style.id = 'prior-year-styles';
      style.textContent = `
        /* ── Prior Year Modal Overlay ── */
        .prior-year-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .prior-year-modal-overlay.visible {
          opacity: 1;
        }

        /* ── Modal Container ── */
        .prior-year-modal {
          background: var(--surface, #ffffff);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* ── Modal Header ── */
        .prior-year-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border, #e0e0e0);
        }

        .prior-year-modal-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--primary, #092847);
        }

        .prior-year-modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-muted, #999);
          transition: color 0.18s;
        }

        .prior-year-modal-close:hover {
          color: var(--primary, #092847);
        }

        /* ── Sessions List ── */
        .prior-year-sessions-list {
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .prior-year-session-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--bg-light, #f5f5f5);
          border-radius: 8px;
          border: 1px solid var(--border, #e0e0e0);
          transition: all 0.18s;
        }

        .prior-year-session-item:hover {
          background: var(--info-light, #e8f4f8);
          border-color: var(--primary, #092847);
        }

        .session-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .session-year {
          font-weight: 700;
          font-size: 14px;
          color: var(--primary, #092847);
        }

        .session-date {
          font-size: 12px;
          color: var(--text-muted, #999);
        }

        .prior-year-import-btn {
          padding: 6px 12px;
          font-size: 13px;
          white-space: nowrap;
        }

        /* ── Preview Section ── */
        .prior-year-preview-section {
          padding: 16px 24px;
        }

        .prior-year-preview-section h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 700;
          color: var(--primary, #092847);
        }

        .prior-year-preview-fields {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
          margin-bottom: 16px;
        }

        /* ── Category ── */
        .prior-year-category {
          padding: 12px 16px;
          background: var(--bg-light, #f5f5f5);
          border-radius: 8px;
          border: 1px solid var(--border, #e0e0e0);
        }

        .prior-year-category-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          color: var(--primary, #092847);
          margin-bottom: 8px;
        }

        .prior-year-category-checkbox {
          cursor: pointer;
          width: 18px;
          height: 18px;
        }

        .prior-year-field-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-left: 26px;
        }

        .prior-year-field-item {
          font-size: 12px;
          color: var(--text-muted, #666);
          word-break: break-word;
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .prior-year-modal {
            width: 95%;
            max-height: 90vh;
          }

          .prior-year-modal-header {
            padding: 16px 20px;
          }

          .prior-year-modal-header h2 {
            font-size: 16px;
          }

          .prior-year-sessions-list,
          .prior-year-preview-section {
            padding: 12px 20px;
          }
        }
      `;

      document.head.appendChild(style);
    }
  };
})();
