/**
 * Tax Document Auto-Import Module
 * Analyzes uploaded tax documents (W-2, 1099) via Claude Vision
 * and auto-fills form fields with extracted data
 */

(function initTaxDocImporter() {
  // ═════════════════════════════════════════════════════════════════
  // INJECT STYLES
  // ═════════════════════════════════════════════════════════════════
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    /* Highlight animation for auto-filled fields */
    @keyframes taxDocHighlight {
      0% {
        border-color: #FFD700;
        box-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
      }
      50% {
        border-color: #FFC700;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
      }
      100% {
        border-color: var(--primary);
        box-shadow: 0 0 0 rgba(255, 215, 0, 0);
      }
    }

    .tax-doc-highlight {
      animation: taxDocHighlight 2s ease-out 1;
    }

    /* Confirmation panel */
    .tax-doc-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
    }

    .tax-doc-modal {
      background: white;
      border-radius: 12px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 24px;
    }

    .tax-doc-modal h3 {
      margin-top: 0;
      color: #1a1a1a;
      font-size: 18px;
      font-weight: 700;
    }

    .tax-doc-modal-subtitle {
      color: #666;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .tax-doc-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 14px;
    }

    .tax-doc-table th,
    .tax-doc-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    .tax-doc-table th {
      background: #f5f5f5;
      font-weight: 600;
      color: #333;
    }

    .tax-doc-table td {
      color: #555;
    }

    .tax-doc-table input[type="checkbox"] {
      margin: 0;
      cursor: pointer;
    }

    .tax-doc-table .field-label {
      font-weight: 500;
      color: #333;
    }

    .tax-doc-table .field-value {
      color: #0066cc;
      font-weight: 600;
    }

    .tax-doc-confidence {
      display: inline-block;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 4px;
      margin-left: 8px;
    }

    .tax-doc-confidence.high {
      background: #c6f6d5;
      color: #22543d;
    }

    .tax-doc-confidence.medium {
      background: #feebc8;
      color: #7c2d12;
    }

    .tax-doc-confidence.low {
      background: #fed7d7;
      color: #742a2a;
    }

    .tax-doc-modal-footer {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .tax-doc-modal-footer button {
      flex: 1;
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tax-doc-btn-apply {
      background: #4299e1;
      color: white;
    }

    .tax-doc-btn-apply:hover {
      background: #3182ce;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
    }

    .tax-doc-btn-cancel {
      background: #e2e8f0;
      color: #2d3748;
    }

    .tax-doc-btn-cancel:hover {
      background: #cbd5e0;
    }

    .tax-doc-toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #48bb78;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-size: 14px;
      font-weight: 600;
      z-index: 10000;
      animation: slideInUp 0.3s ease;
    }

    @keyframes slideInUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .tax-doc-document-type {
      display: inline-block;
      background: #edf2f7;
      color: #2d3748;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 12px;
    }
  `;
  document.head.appendChild(styleSheet);

  // ═════════════════════════════════════════════════════════════════
  // MAIN TaxDocImporter OBJECT
  // ═════════════════════════════════════════════════════════════════

  window.TaxDocImporter = {
    // ─────────────────────────────────────────────────────────────
    // 1. ANALYZE DOCUMENT VIA CLAUDE VISION
    // ─────────────────────────────────────────────────────────────
    async analyzeDocument(fileBase64, fileType, fileName) {
      /**
       * Sends image/PDF to Claude with vision capabilities
       * Returns structured extracted data
       */
      if (!API_BASE) {
        throw new Error('Server not available. Run start.bat first — شغّل start.bat');
      }

      const isImage = fileType.startsWith('image/');
      const isPdf = fileType === 'application/pdf';

      if (!isImage && !isPdf) {
        throw new Error('Only images and PDFs supported — بس الصور و PDF');
      }

      // Build the message for Claude
      const systemPrompt = `You are a tax document analyzer. Your job is to extract ALL data fields from tax documents (W-2, 1099-NEC, 1099-INT, 1099-DIV, 1099-MISC, 1099-OID, 1099-K, etc).

Carefully examine every box and field on the document and extract the values accurately.

CRITICAL: Return ONLY valid JSON. No markdown, no backticks, no explanation, no extra text.

Return this JSON structure:
{
  "documentType": "W-2" | "1099-NEC" | "1099-INT" | "1099-DIV" | "1099-MISC" | "1099-K" | "1099-OID" | "Other",
  "confidence": 0.0 to 1.0 (how confident you are in the extraction),
  "fields": {
    "employerName": "...",
    "employerEIN": "...",
    "employerAddress": "...",
    "wages": 0.00,
    "federalWithheld": 0.00,
    "ssWages": 0.00,
    "ssWithheld": 0.00,
    "medicareWages": 0.00,
    "medicareWithheld": 0.00,
    "stateName": "...",
    "stateWages": 0.00,
    "stateWithheld": 0.00,
    "payerName": "...",
    "payerTIN": "...",
    "payerAddress": "...",
    "amount": 0.00,
    "type": "..."
  }
}`;

      const userMessage = `Extract all tax data from this ${isImage ? 'image' : 'PDF'} (${fileName}). Return ONLY the JSON structure specified.`;

      const messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: userMessage },
            isImage || isPdf
              ? { type: 'image', source: { type: 'base64', media_type: fileType, data: fileBase64 } }
              : null
          ].filter(Boolean)
        }
      ];

      try {
        const response = await fetch(API_BASE + '/api/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages,
            system: systemPrompt,
            max_tokens: 1024
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `API error ${response.status}`);
        }

        const data = await response.json();
        const text = data.content[0].text.trim();

        // Parse JSON response
        let extracted;
        try {
          // Handle potential markdown code blocks
          const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, text];
          extracted = JSON.parse(jsonMatch[1] || text);
        } catch (parseErr) {
          console.error('Failed to parse JSON response:', text);
          throw new Error('Failed to parse extracted data — خطأ في معالجة البيانات');
        }

        return extracted;
      } catch (err) {
        console.error('[TaxDocImporter] Analysis error:', err);
        throw new Error(`Document analysis failed: ${err.message}`);
      }
    },

    // ─────────────────────────────────────────────────────────────
    // 2. MAP EXTRACTED DATA TO FORM FIELDS
    // ─────────────────────────────────────────────────────────────
    mapToFormFields(extractedData) {
      /**
       * Maps extracted document fields to actual form input IDs/classes
       * Returns { selector: value } mapping
       */
      const mapping = {};
      const fields = extractedData.fields || {};
      const docType = extractedData.documentType || '';

      // ─ W-2 MAPPING ─
      if (docType.includes('W-2')) {
        // Find the first W-2 entry (or create it)
        const w2Entry = document.querySelector('.income-entry .w2-employer')?.closest('.income-entry');

        if (w2Entry) {
          mapping[w2Entry.querySelector('.w2-employer')] = fields.employerName || '';
          mapping[w2Entry.querySelector('.w2-wages')] = fields.wages || 0;
          mapping[w2Entry.querySelector('.w2-fed-tax')] = fields.federalWithheld || 0;
          mapping[w2Entry.querySelector('.w2-ss-wages')] = fields.ssWages || 0;
          mapping[w2Entry.querySelector('.w2-medicare')] = fields.medicareWages || 0;
          mapping[w2Entry.querySelector('.w2-state-tax')] = fields.stateWithheld || 0;
          mapping[w2Entry.querySelector('.w2-ein')] = fields.employerEIN || '';
        }
      }

      // ─ 1099-NEC MAPPING ─
      if (docType.includes('1099')) {
        const nec1099Entry = document.querySelector('.income-entry .nec-payer')?.closest('.income-entry');

        if (nec1099Entry) {
          mapping[nec1099Entry.querySelector('.nec-payer')] = fields.payerName || '';
          mapping[nec1099Entry.querySelector('.nec-amount')] = fields.amount || 0;
          mapping[nec1099Entry.querySelector('.nec-ein')] = fields.payerTIN || '';
        }
      }

      return mapping;
    },

    // ─────────────────────────────────────────────────────────────
    // 3. AUTO-FILL FORM FIELDS
    // ─────────────────────────────────────────────────────────────
    autoFillForm(fieldMapping) {
      /**
       * Fills form fields and triggers change events
       * Highlights fields with animation
       * Returns count of fields filled
       */
      let filledCount = 0;

      for (const [element, value] of fieldMapping) {
        if (!element) continue;

        const oldValue = element.value;
        element.value = value;

        // Trigger events so the app recognizes the change
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));

        // Highlight if value changed
        if (oldValue !== String(value)) {
          element.classList.add('tax-doc-highlight');
          filledCount++;
        }
      }

      return filledCount;
    },

    // ─────────────────────────────────────────────────────────────
    // 4. SHOW CONFIRMATION DIALOG
    // ─────────────────────────────────────────────────────────────
    getConfirmationHTML(extractedData, fieldMapping) {
      /**
       * Builds HTML for confirmation modal
       * Shows extracted values with checkboxes for selective application
       */
      const fields = extractedData.fields || {};
      const docType = extractedData.documentType || 'Unknown';
      const confidence = extractedData.confidence || 0;

      let confidenceClass = 'low';
      let confidenceText = 'Low';
      if (confidence >= 0.8) {
        confidenceClass = 'high';
        confidenceText = 'High';
      } else if (confidence >= 0.5) {
        confidenceClass = 'medium';
        confidenceText = 'Medium';
      }

      let tableHtml = `
        <div class="tax-doc-document-type">
          ${docType}
          <span class="tax-doc-confidence ${confidenceClass}">
            ${confidenceText} Confidence ${Math.round(confidence * 100)}%
          </span>
        </div>
        <table class="tax-doc-table">
          <thead>
            <tr>
              <th style="width: 30px;"></th>
              <th>Field</th>
              <th>Extracted Value</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Build table rows
      const fieldLabels = {
        employerName: 'Employer Name — اسم صاحب العمل',
        employerEIN: 'Employer EIN — رقم صاحب العمل',
        employerAddress: 'Employer Address — عنوان صاحب العمل',
        wages: 'Wages (Box 1) — الراتب',
        federalWithheld: 'Federal Tax Withheld (Box 2) — الضريبة الفيدرالية',
        ssWages: 'Social Security Wages (Box 3) — أجور الضمان الاجتماعي',
        ssWithheld: 'SS Tax Withheld (Box 4) — ضريبة الضمان الاجتماعي',
        medicareWages: 'Medicare Wages (Box 5) — أجور الميديكير',
        medicareWithheld: 'Medicare Tax Withheld (Box 6) — ضريبة الميديكير',
        stateName: 'State Name — اسم الولاية',
        stateWages: 'State Wages (Box 16) — أجور الولاية',
        stateWithheld: 'State Tax Withheld (Box 17) — ضريبة الولاية',
        payerName: 'Payer Name — اسم الدافع',
        payerTIN: 'Payer TIN — رقم الدافع',
        payerAddress: 'Payer Address — عنوان الدافع',
        amount: 'Amount — المبلغ',
        type: 'Income Type — نوع الدخل'
      };

      for (const [key, value] of Object.entries(fields)) {
        // Skip empty values
        if (value === '' || value === null || value === 0) continue;

        const label = fieldLabels[key] || key;
        const displayValue = typeof value === 'number' ? value.toFixed(2) : value;

        tableHtml += `
          <tr>
            <td><input type="checkbox" class="tax-doc-field-check" data-field="${key}" checked></td>
            <td><span class="field-label">${label}</span></td>
            <td><span class="field-value">${displayValue}</span></td>
          </tr>
        `;
      }

      tableHtml += `
          </tbody>
        </table>
      `;

      return tableHtml;
    },

    // ─────────────────────────────────────────────────────────────
    // 5. SHOW TOAST NOTIFICATION
    // ─────────────────────────────────────────────────────────────
    showToast(message) {
      /**
       * Display a brief toast notification
       */
      const toast = document.createElement('div');
      toast.className = 'tax-doc-toast';
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    },

    // ─────────────────────────────────────────────────────────────
    // 6. MAIN ENTRY POINT: Process uploaded file
    // ─────────────────────────────────────────────────────────────
    async processUploadedFile(fileBase64, fileType, fileName) {
      /**
       * Main flow: analyze → confirm → auto-fill
       */
      try {
        // Show processing message in chat
        if (window.addMessage) {
          addMessage('system-info', `📄 Analyzing ${fileName}... — جاري تحليل الملف...`);
        }

        // Step 1: Analyze document
        const extractedData = await this.analyzeDocument(fileBase64, fileType, fileName);

        if (!extractedData || !extractedData.documentType) {
          throw new Error('Could not identify document type');
        }

        // Step 2: Map to form fields
        const fieldMapping = this.mapToFormFields(extractedData);

        if (Object.keys(fieldMapping).length === 0) {
          this.showToast('⚠️ No matching form fields found — ما في حقول متطابقة');
          return;
        }

        // Step 3: Show confirmation modal
        const confirmHtml = this.getConfirmationHTML(extractedData, fieldMapping);

        const overlay = document.createElement('div');
        overlay.className = 'tax-doc-modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'tax-doc-modal';
        modal.innerHTML = `
          <h3>✅ Review Extracted Data — تحقق من البيانات المستخرجة</h3>
          <p class="tax-doc-modal-subtitle">
            Select which fields to auto-fill, then click "Apply Selected" below.
            اختر الحقول اللي تريد تعبيها وكليك "تطبيق"
          </p>
          ${confirmHtml}
          <div class="tax-doc-modal-footer">
            <button class="tax-doc-btn-cancel" onclick="this.closest('.tax-doc-modal-overlay').remove()">
              Cancel — إلغاء
            </button>
            <button class="tax-doc-btn-apply" onclick="window.TaxDocImporter._applySelected(event)">
              Apply Selected — تطبيق
            </button>
          </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Store mapping for when user clicks Apply
        window._taxDocFieldMapping = fieldMapping;
      } catch (err) {
        console.error('[TaxDocImporter] Process error:', err);
        this.showToast(`❌ Error: ${err.message}`);
        if (window.addMessage) {
          addMessage('assistant', `⚠️ Could not analyze document — ما قدرت أحلل الملف. ${err.message}`);
        }
      }
    },

    // ─────────────────────────────────────────────────────────────
    // 7. INTERNAL: Apply selected fields
    // ─────────────────────────────────────────────────────────────
    _applySelected(event) {
      /**
       * Called when user clicks "Apply Selected"
       * Only fills fields that were checked
       */
      const modal = event.target.closest('.tax-doc-modal-overlay');
      const checkedBoxes = modal.querySelectorAll('.tax-doc-field-check:checked');

      if (checkedBoxes.length === 0) {
        this.showToast('⚠️ No fields selected — ما اخترت حقول');
        return;
      }

      // Filter mapping to only checked fields
      const selectedMapping = new Map();
      const fieldMapping = window._taxDocFieldMapping || new Map();

      for (const [element, value] of fieldMapping) {
        // Check if this field is checked (by data-field attribute matching)
        const isChecked = Array.from(checkedBoxes).some(
          box => box.dataset.field === element.className?.split(' ')[0]
        );
        if (isChecked) {
          selectedMapping.set(element, value);
        }
      }

      // Apply to form
      const filledCount = this.autoFillForm(selectedMapping);

      // Close modal
      modal.remove();

      // Show success toast
      this.showToast(`✅ ${filledCount} field(s) auto-filled — تم تعبية ${filledCount} حقل`);

      // Notify in chat
      if (window.addMessage) {
        addMessage('assistant',
          `✅ **Auto-fill Complete!** — اكتمل التعبية!\n\n` +
          `I've filled **${filledCount}** field(s) from your document.\n` +
          `Check the highlighted fields and let me know if anything needs adjustment.\n\n` +
          `عبيت **${filledCount}** حقول من الملف. شوف الحقول المضيئة وقول لي إذا بتحتاج تعديلات.`
        );
      }

      // Clean up
      delete window._taxDocFieldMapping;
    }
  };

  // ═════════════════════════════════════════════════════════════════
  // INTEGRATION WITH EXISTING CHAT FILE HANDLER
  // ═════════════════════════════════════════════════════════════════

  // Hook into existing handleChatFiles if it exists
  const originalHandleChatFiles = window.handleChatFiles;
  if (originalHandleChatFiles) {
    window.handleChatFiles = function(inputEl) {
      const files = Array.from(inputEl.files);

      // Check if any files are tax documents (PDFs or images)
      const isTaxDoc = files.some(f => {
        const name = f.name.toLowerCase();
        const isTaxForm = /w-?2|1099|tax/.test(name);
        return isTaxForm && (f.type.startsWith('image/') || f.type === 'application/pdf');
      });

      if (isTaxDoc && files.length === 1) {
        // Tax document detected — process it directly
        const file = files[0];
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1]; // Remove data:image/... prefix
          window.TaxDocImporter.processUploadedFile(base64, file.type, file.name);
        };
        reader.readAsDataURL(file);
      } else {
        // Regular file — use original handler
        originalHandleChatFiles.call(this, inputEl);
      }

      inputEl.value = '';
    };
  }
})();
