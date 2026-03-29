/**
 * Tax Advisor Pro - Interactive Guide System
 * Enhances guide pages with calculators, visual explainers, and interactive elements
 * Self-contained IIFE with auto-detection and injection of interactive widgets
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    theme: {
      primary: '#1a3a52',      // Navy
      accent: '#d4af37',       // Gold
      light: '#f5f7fa',
      border: '#e0e0e0',
      success: '#4caf50',
      warning: '#ff9800',
      danger: '#f44336'
    },
    difficulty: {
      easy: { color: '#4caf50', label: 'Easy', emoji: '🟢' },
      medium: { color: '#ff9800', label: 'Medium', emoji: '🟡' },
      advanced: { color: '#f44336', label: 'Advanced', emoji: '🔴' }
    },
    readingSpeedWPM: 200,
    language: detectLanguage()
  };

  // Simple explanations for core concepts (English & Arabic)
  const SIMPLE_EXPLANATIONS = {
    taxes: {
      en: 'Taxes are money you give to the government. They use it to pay for things everyone uses, like roads, schools, and fire departments. It\'s like a team contribution fund!',
      ar: 'الضرائب هي الأموال التي تعطيها للحكومة. تستخدمها لدفع ثمن الأشياء التي يستخدمها الجميع، مثل الطرق والمدارس والإطفاء. إنه مثل صندوق مساهمة الفريق!'
    },
    brackets: {
      en: 'Think of tax brackets like stairs. You don\'t pay the same rate on all your money. As you earn more, only the NEW money you earn gets taxed at a higher rate. Your first $10,000 stays at 10%, then your next $20,000 is at 12%, etc.',
      ar: 'تخيل الفئات الضريبية مثل السلالم. لا تدفع نفس المعدل على كل أموالك. عندما تكسب أكثر، فقط الأموال الجديدة التي تكسبها يتم فرض ضريبة عليها بمعدل أعلى.'
    },
    deductions: {
      en: 'Deductions are like discounts on your taxable income. If you have $50,000 in income but $5,000 in deductions, you only pay taxes on $45,000. Less taxable income = less taxes!',
      ar: 'الخصومات تشبه الخصومات على دخلك الخاضع للضريبة. إذا كان لديك 50,000 دولار من الدخل لكن 5000 دولار من الخصومات، فأنت تدفع الضرائب على 45,000 دولار فقط.'
    },
    credits: {
      en: 'Credits are like coupons for your taxes. A $1,000 credit means you pay $1,000 less tax. Much better than a deduction!',
      ar: 'الائتمانات تشبه القسائم الخاصة بك الضريبية. يعني ائتمان بقيمة 1000 دولار أنك تدفع 1000 دولار أقل من الضريبة.'
    },
    w2: {
      en: 'A W-2 form is your job\'s report card. It shows how much you earned and how much tax your employer already took from your paychecks.',
      ar: 'نموذج W-2 هو بطاقة تقرير وظيفتك. يوضح المبلغ الذي كسبته والمبلغ الذي اقتطعت الضريبة من رواتبك.'
    },
    w1099: {
      en: 'A 1099 form is like a W-2 but for freelance work or side gigs. It shows income from your own business. You\'ll need to report it on your taxes.',
      ar: 'نموذج 1099 يشبه W-2 ولكن لعمل حر أو جانبي. يوضح الدخل من عملك الخاص.'
    },
    filing_status: {
      en: 'Your filing status is your tax "category" — Single, Married, Head of Household, etc. It affects your tax brackets and deductions. Different statuses have different rules and benefits!',
      ar: 'حالة التقديم الخاصة بك هي "فئتك" الضريبية. تؤثر على فئاتك الضريبية والخصومات.'
    },
    refund: {
      en: 'If you overpaid taxes during the year, the IRS gives the extra money back to you. It\'s like if you gave the store too much cash — they give back change!',
      ar: 'إذا دفعت ضرائب زائدة خلال السنة، تعيد لك دائرة الإيرادات الأموال الإضافية.'
    },
    itin: {
      en: 'An ITIN is a tax number for people who don\'t have a Social Security Number. It lets you file taxes and report income to the IRS legally.',
      ar: 'ITIN هو رقم ضريبي للأشخاص الذين لا يملكون رقم الضمان الاجتماعي.'
    },
    standard_itemized: {
      en: 'Two ways to reduce your taxable income: Standard Deduction is quick (same amount for everyone in your category), or Itemized (add up all your expenses — better if you have big expenses like mortgage interest).',
      ar: 'طريقتان لتقليل دخلك الخاضع للضريبة: الخصم القياسي سريع، أو التفصيلي (أضف نفقاتك — أفضل إذا كان لديك نفقات كبيرة).'
    }
  };

  // 2025 Tax Bracket Data (single filer)
  const TAX_BRACKETS_2025 = [
    { min: 0, max: 11925, rate: 0.10, label: '10%' },
    { min: 11925, max: 48475, rate: 0.12, label: '12%' },
    { min: 48475, max: 103350, rate: 0.22, label: '22%' },
    { min: 103350, max: 197300, rate: 0.24, label: '24%' },
    { min: 197300, max: 250525, rate: 0.32, label: '32%' },
    { min: 250525, max: 626350, rate: 0.35, label: '35%' },
    { min: 626350, max: Infinity, rate: 0.37, label: '37%' }
  ];

  const STANDARD_DEDUCTIONS_2025 = {
    single: 15000,
    married_filing_jointly: 30000,
    married_filing_separately: 15000,
    head_of_household: 22500
  };

  const BRACKET_COLORS = [
    '#e8f5e9', '#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a',
    '#4caf50', '#43a047', '#388e3c'
  ];

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  function detectLanguage() {
    const html = document.documentElement.lang || 'en';
    return html.startsWith('ar') ? 'ar' : 'en';
  }

  function t(key) {
    return CONFIG.language === 'ar' ? key.ar : key.en;
  }

  function createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Interactive Guide Styles */
      .tax-interactive {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }

      /* Difficulty Badges */
      .difficulty-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        margin-left: 8px;
      }

      .difficulty-easy { background-color: rgba(76, 175, 80, 0.1); color: #2e7d32; }
      .difficulty-medium { background-color: rgba(255, 152, 0, 0.1); color: #e65100; }
      .difficulty-advanced { background-color: rgba(244, 67, 54, 0.1); color: #b71c1c; }

      /* Reading Time */
      .reading-time {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #666;
        font-size: 13px;
        margin-left: 12px;
      }

      /* Simple Explanation Toggle */
      .eli5-toggle {
        display: inline-block;
        margin-left: 12px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .eli5-toggle:hover {
        background-color: rgba(212, 175, 55, 0.1);
      }

      .eli5-toggle.active {
        background-color: rgba(212, 175, 55, 0.2);
      }

      /* Simple Explanation Box */
      .eli5-explanation {
        margin-top: 16px;
        padding: 16px;
        background-color: rgba(212, 175, 55, 0.08);
        border-left: 4px solid #d4af37;
        border-radius: 4px;
        line-height: 1.6;
        color: #333;
        display: none;
        animation: slideDown 0.3s ease-out;
      }

      .eli5-explanation.show {
        display: block;
      }

      .eli5-label {
        font-weight: 600;
        color: #d4af37;
        margin-bottom: 8px;
        font-size: 13px;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Calculator Widget */
      .calculator-widget {
        margin: 24px 0;
        padding: 20px;
        background: #f9fafb;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        border-left: 4px solid #d4af37;
      }

      .calculator-widget h4 {
        margin: 0 0 16px 0;
        color: #1a3a52;
        font-size: 16px;
        font-weight: 600;
      }

      .calculator-form {
        display: grid;
        gap: 16px;
      }

      .form-group {
        display: grid;
        gap: 6px;
      }

      .form-group label {
        font-size: 13px;
        font-weight: 600;
        color: #333;
      }

      .form-group input,
      .form-group select {
        padding: 10px 12px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
        font-family: inherit;
        transition: border-color 0.2s;
      }

      .form-group input:focus,
      .form-group select:focus {
        outline: none;
        border-color: #d4af37;
        box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
      }

      .calculator-button {
        padding: 12px 20px;
        background-color: #1a3a52;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .calculator-button:hover {
        background-color: #0f2636;
      }

      .calculator-result {
        margin-top: 16px;
        padding: 16px;
        background-color: white;
        border: 1px solid #d4af37;
        border-radius: 4px;
        display: none;
      }

      .calculator-result.show {
        display: block;
        animation: slideDown 0.3s ease-out;
      }

      .result-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
        font-size: 14px;
      }

      .result-row:last-child {
        border-bottom: none;
      }

      .result-row.highlight {
        background-color: rgba(212, 175, 55, 0.1);
        padding: 12px 8px;
        margin: 0 -8px;
        font-weight: 600;
        color: #1a3a52;
      }

      .result-label {
        color: #666;
      }

      .result-value {
        font-weight: 600;
        color: #1a3a52;
      }

      /* Tax Bracket Diagram */
      .bracket-diagram {
        margin: 24px 0;
        padding: 20px;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
      }

      .bracket-bars {
        display: flex;
        height: 40px;
        gap: 2px;
        margin: 16px 0;
        border-radius: 4px;
        overflow: hidden;
      }

      .bracket-bar {
        flex: 1;
        position: relative;
        cursor: pointer;
        transition: all 0.2s;
      }

      .bracket-bar:hover {
        opacity: 0.8;
        transform: scaleY(1.1);
      }

      .bracket-tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(26, 58, 82, 0.95);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s;
        margin-bottom: 8px;
        z-index: 10;
      }

      .bracket-bar:hover .bracket-tooltip {
        opacity: 1;
      }

      .income-marker {
        position: absolute;
        top: 0;
        width: 3px;
        height: 100%;
        background: #d4af37;
        box-shadow: 0 0 4px rgba(212, 175, 55, 0.5);
      }

      .bracket-legend {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
        margin-top: 16px;
        font-size: 13px;
      }

      .bracket-legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .bracket-legend-color {
        width: 20px;
        height: 20px;
        border-radius: 3px;
      }

      /* Flowchart Styles */
      .flowchart-container {
        margin: 24px 0;
        padding: 20px;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: auto;
      }

      .flowchart {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        min-width: max-content;
      }

      .flowchart-box {
        padding: 16px 20px;
        background: #f9fafb;
        border: 2px solid #1a3a52;
        border-radius: 6px;
        text-align: center;
        min-width: 200px;
        font-size: 14px;
        font-weight: 500;
      }

      .flowchart-box.question {
        background: #e3f2fd;
        border-color: #1a3a52;
      }

      .flowchart-box.answer {
        background: rgba(76, 175, 80, 0.1);
        border: 2px solid #4caf50;
        color: #2e7d32;
        font-weight: 600;
      }

      .flowchart-box.answer.error {
        background: rgba(244, 67, 54, 0.1);
        border-color: #f44336;
        color: #b71c1c;
      }

      .flowchart-buttons {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin: 12px 0;
      }

      .flowchart-btn {
        padding: 8px 16px;
        background: white;
        border: 2px solid #d4af37;
        color: #1a3a52;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        font-size: 13px;
        transition: all 0.2s;
      }

      .flowchart-btn:hover {
        background: rgba(212, 175, 55, 0.1);
      }

      .flowchart-btn.active {
        background: #d4af37;
        color: white;
      }

      .flowchart-arrow {
        width: 2px;
        height: 20px;
        background: #d4af37;
        position: relative;
      }

      .flowchart-arrow::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 6px solid #d4af37;
      }

      /* Reset Button */
      .flowchart-reset {
        padding: 8px 12px;
        background: #e0e0e0;
        border: 1px solid #999;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        margin-top: 16px;
      }

      .flowchart-reset:hover {
        background: #d0d0d0;
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        .calculator-form {
          grid-template-columns: 1fr;
        }

        .bracket-legend {
          grid-template-columns: 1fr;
        }

        .flowchart {
          min-width: auto;
        }

        .flowchart-box {
          min-width: 150px;
          font-size: 13px;
          padding: 12px 16px;
        }
      }

      /* Bilingual Support */
      [dir="rtl"] .difficulty-badge {
        margin-left: 0;
        margin-right: 8px;
      }

      [dir="rtl"] .eli5-toggle {
        margin-left: 0;
        margin-right: 12px;
      }

      [dir="rtl"] .eli5-explanation {
        border-left: none;
        border-right: 4px solid #d4af37;
        text-align: right;
      }

      [dir="rtl"] .calculator-widget {
        border-left: none;
        border-right: 4px solid #d4af37;
      }

      [dir="rtl"] .result-row {
        flex-direction: row-reverse;
      }
    `;
    document.head.appendChild(style);
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function calculateReadingTime(element) {
    const text = element.innerText || element.textContent;
    const wordCount = text.trim().split(/\s+/).length;
    return Math.ceil(wordCount / CONFIG.readingSpeedWPM);
  }

  function getDifficultyForTopic(text) {
    const lower = text.toLowerCase();
    if (lower.includes('advanced') || lower.includes('complex')) return 'advanced';
    if (lower.includes('bracket') || lower.includes('credit') || lower.includes('deduction')) return 'medium';
    return 'easy';
  }

  // ============================================================================
  // HEADER ENHANCEMENTS
  // ============================================================================

  function enhanceHeaders() {
    const headings = document.querySelectorAll('h2, h3');

    headings.forEach(heading => {
      if (heading.classList.contains('tax-interactive-enhanced')) return;
      heading.classList.add('tax-interactive-enhanced');

      // Add difficulty badge
      const difficulty = getDifficultyForTopic(heading.textContent);
      const badge = document.createElement('span');
      badge.className = `difficulty-badge difficulty-${difficulty}`;
      badge.textContent = `${CONFIG.difficulty[difficulty].emoji} ${CONFIG.difficulty[difficulty].label}`;
      heading.appendChild(badge);

      // Add reading time (for h2 only)
      if (heading.tagName === 'H2') {
        const parent = heading.closest('section') || heading.parentElement;
        if (parent) {
          const time = calculateReadingTime(parent);
          const readingTime = document.createElement('span');
          readingTime.className = 'reading-time';
          readingTime.textContent = `⏱️ ${time} min read`;
          heading.appendChild(readingTime);
        }
      }

      // Add ELI5 toggle
      const eli5Toggle = document.createElement('button');
      eli5Toggle.className = 'eli5-toggle';
      eli5Toggle.textContent = '🧒';
      eli5Toggle.title = 'Explain like I\'m 5';
      eli5Toggle.setAttribute('aria-label', 'Show simple explanation');
      heading.appendChild(eli5Toggle);

      // ELI5 toggle handler
      eli5Toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const existingExplanation = heading.nextElementSibling?.classList.contains('eli5-explanation');

        if (existingExplanation) {
          heading.nextElementSibling.classList.toggle('show');
          eli5Toggle.classList.toggle('active');
        }
      });
    });
  }

  // ============================================================================
  // SIMPLE EXPLANATION INJECTION
  // ============================================================================

  function injectSimpleExplanations() {
    const headings = document.querySelectorAll('h2, h3');

    headings.forEach(heading => {
      const text = heading.textContent.toLowerCase();
      let explanationKey = null;

      // Match heading text to explanation
      if (text.includes('what are taxes') || text.includes('why do we pay')) {
        explanationKey = 'taxes';
      } else if (text.includes('bracket')) {
        explanationKey = 'brackets';
      } else if (text.includes('deduction')) {
        explanationKey = 'deductions';
      } else if (text.includes('credit')) {
        explanationKey = 'credits';
      } else if (text.includes('w-2') || text.includes('w2')) {
        explanationKey = 'w2';
      } else if (text.includes('1099')) {
        explanationKey = 'w1099';
      } else if (text.includes('filing status')) {
        explanationKey = 'filing_status';
      } else if (text.includes('refund')) {
        explanationKey = 'refund';
      } else if (text.includes('itin')) {
        explanationKey = 'itin';
      } else if (text.includes('standard') && text.includes('itemized')) {
        explanationKey = 'standard_itemized';
      }

      // Inject explanation if found
      if (explanationKey && SIMPLE_EXPLANATIONS[explanationKey]) {
        const explanation = document.createElement('div');
        explanation.className = 'eli5-explanation';
        explanation.innerHTML = `
          <div class="eli5-label">🧒 ${CONFIG.language === 'ar' ? 'شرح بسيط' : 'Explain Simply'}</div>
          <p>${t(SIMPLE_EXPLANATIONS[explanationKey])}</p>
        `;

        const nextElement = heading.nextElementSibling;
        if (nextElement) {
          nextElement.insertAdjacentElement('afterend', explanation);
        } else {
          heading.parentElement.appendChild(explanation);
        }

        // Add active state to toggle
        const toggle = heading.querySelector('.eli5-toggle');
        if (toggle) {
          toggle.addEventListener('click', () => {
            explanation.classList.toggle('show');
            toggle.classList.toggle('active');
          });
        }
      }
    });
  }

  // ============================================================================
  // CALCULATOR INJECTION
  // ============================================================================

  function injectCalculators() {
    const headings = document.querySelectorAll('h2, h3');

    headings.forEach(heading => {
      const text = heading.textContent.toLowerCase();

      if (text.includes('bracket') && !heading.classList.contains('calculator-injected')) {
        heading.classList.add('calculator-injected');
        const calculator = createBracketCalculator();
        heading.parentElement.appendChild(calculator);
      }

      if ((text.includes('standard') && text.includes('itemized')) &&
          !heading.classList.contains('calculator-injected')) {
        heading.classList.add('calculator-injected');
        const calculator = createDeductionCalculator();
        heading.parentElement.appendChild(calculator);
      }

      if (text.includes('filing status') && !heading.classList.contains('calculator-injected')) {
        heading.classList.add('calculator-injected');
        const calculator = createFilingStatusCalculator();
        heading.parentElement.appendChild(calculator);
      }

      if (text.includes('credit') && !heading.classList.contains('calculator-injected')) {
        heading.classList.add('calculator-injected');
        const calculator = createCreditCalculator();
        heading.parentElement.appendChild(calculator);
      }
    });
  }

  function createBracketCalculator() {
    const container = document.createElement('div');
    container.className = 'calculator-widget tax-interactive';
    container.innerHTML = `
      <h4>💰 ${CONFIG.language === 'ar' ? 'احسب فئتك الضريبية' : 'See Your Tax Bracket'}</h4>
      <div class="calculator-form">
        <div class="form-group">
          <label for="bracket-income">${CONFIG.language === 'ar' ? 'الدخل السنوي' : 'Annual Income'}</label>
          <input type="number" id="bracket-income" placeholder="50000" min="0" step="1000">
        </div>
        <div class="form-group">
          <label for="bracket-status">${CONFIG.language === 'ar' ? 'حالة التقديم' : 'Filing Status'}</label>
          <select id="bracket-status">
            <option value="single">${CONFIG.language === 'ar' ? 'أعزب' : 'Single'}</option>
            <option value="married_filing_jointly">${CONFIG.language === 'ar' ? 'متزوج يقدم بشكل مشترك' : 'Married Filing Jointly'}</option>
            <option value="head_of_household">${CONFIG.language === 'ar' ? 'رب الأسرة' : 'Head of Household'}</option>
          </select>
        </div>
        <button class="calculator-button" id="bracket-calc-btn">
          ${CONFIG.language === 'ar' ? 'احسب' : 'Calculate'}
        </button>
      </div>
      <div class="calculator-result" id="bracket-result"></div>
    `;

    container.querySelector('#bracket-calc-btn').addEventListener('click', () => {
      const income = parseFloat(container.querySelector('#bracket-income').value);
      const status = container.querySelector('#bracket-status').value;

      if (isNaN(income) || income < 0) {
        alert(CONFIG.language === 'ar' ? 'يرجى إدخال دخل صحيح' : 'Please enter a valid income');
        return;
      }

      const bracket = TAX_BRACKETS_2025.find(b => income >= b.min && income < b.max);
      const result = container.querySelector('#bracket-result');

      if (bracket) {
        const taxableIncome = income - STANDARD_DEDUCTIONS_2025[status];
        const tax = calculateProgressiveTax(taxableIncome, status);
        const effectiveRate = (tax / income * 100).toFixed(2);

        result.innerHTML = `
          <div class="result-row">
            <span class="result-label">${CONFIG.language === 'ar' ? 'الدخل' : 'Income'}</span>
            <span class="result-value">${formatCurrency(income)}</span>
          </div>
          <div class="result-row">
            <span class="result-label">${CONFIG.language === 'ar' ? 'الخصم القياسي' : 'Standard Deduction'}</span>
            <span class="result-value">${formatCurrency(STANDARD_DEDUCTIONS_2025[status])}</span>
          </div>
          <div class="result-row">
            <span class="result-label">${CONFIG.language === 'ar' ? 'الدخل الخاضع للضريبة' : 'Taxable Income'}</span>
            <span class="result-value">${formatCurrency(Math.max(0, taxableIncome))}</span>
          </div>
          <div class="result-row highlight">
            <span class="result-label">${CONFIG.language === 'ar' ? 'الفئة الضريبية' : 'Tax Bracket'}</span>
            <span class="result-value">${bracket.label}</span>
          </div>
          <div class="result-row highlight">
            <span class="result-label">${CONFIG.language === 'ar' ? 'الضريبة المقدرة' : 'Estimated Tax'}</span>
            <span class="result-value">${formatCurrency(tax)}</span>
          </div>
          <div class="result-row">
            <span class="result-label">${CONFIG.language === 'ar' ? 'المعدل الفعلي' : 'Effective Rate'}</span>
            <span class="result-value">${effectiveRate}%</span>
          </div>
        `;
        result.classList.add('show');
      }
    });

    return container;
  }

  function createDeductionCalculator() {
    const container = document.createElement('div');
    container.className = 'calculator-widget tax-interactive';
    container.innerHTML = `
      <h4>🤔 ${CONFIG.language === 'ar' ? 'أيهما أفضل لك؟' : 'Which is Better for You?'}</h4>
      <div class="calculator-form">
        <div class="form-group">
          <label for="deduct-income">${CONFIG.language === 'ar' ? 'الدخل السنوي' : 'Annual Income'}</label>
          <input type="number" id="deduct-income" placeholder="60000" min="0" step="1000">
        </div>
        <div class="form-group">
          <label for="deduct-itemized">${CONFIG.language === 'ar' ? 'الخصومات المفصلة (الرهن العقاري والفائدة والضرائب المحلية)' : 'Itemized Deductions (mortgage, charity, state taxes)'}</label>
          <input type="number" id="deduct-itemized" placeholder="15000" min="0" step="500">
        </div>
        <div class="form-group">
          <label for="deduct-status">${CONFIG.language === 'ar' ? 'حالة التقديم' : 'Filing Status'}</label>
          <select id="deduct-status">
            <option value="single">${CONFIG.language === 'ar' ? 'أعزب' : 'Single'}</option>
            <option value="married_filing_jointly">${CONFIG.language === 'ar' ? 'متزوج يقدم بشكل مشترك' : 'Married Filing Jointly'}</option>
            <option value="head_of_household">${CONFIG.language === 'ar' ? 'رب الأسرة' : 'Head of Household'}</option>
          </select>
        </div>
        <button class="calculator-button" id="deduct-calc-btn">
          ${CONFIG.language === 'ar' ? 'قارن' : 'Compare'}
        </button>
      </div>
      <div class="calculator-result" id="deduct-result"></div>
    `;

    container.querySelector('#deduct-calc-btn').addEventListener('click', () => {
      const income = parseFloat(container.querySelector('#deduct-income').value);
      const itemized = parseFloat(container.querySelector('#deduct-itemized').value);
      const status = container.querySelector('#deduct-status').value;

      if (isNaN(income) || income < 0) {
        alert(CONFIG.language === 'ar' ? 'يرجى إدخال دخل صحيح' : 'Please enter a valid income');
        return;
      }

      const standard = STANDARD_DEDUCTIONS_2025[status];
      const winner = itemized > standard ? 'itemized' : 'standard';
      const savings = Math.abs(itemized - standard);

      const result = container.querySelector('#deduct-result');
      result.innerHTML = `
        <div class="result-row">
          <span class="result-label">${CONFIG.language === 'ar' ? 'الخصم القياسي' : 'Standard Deduction'}</span>
          <span class="result-value">${formatCurrency(standard)}</span>
        </div>
        <div class="result-row">
          <span class="result-label">${CONFIG.language === 'ar' ? 'الخصومات المفصلة' : 'Itemized Deductions'}</span>
          <span class="result-value">${formatCurrency(itemized)}</span>
        </div>
        <div class="result-row highlight ${winner === 'standard' ? '' : ''}">
          <span class="result-label">🏆 ${CONFIG.language === 'ar' ? 'الخيار الأفضل' : 'Better Option'}</span>
          <span class="result-value">${winner === 'standard' ? (CONFIG.language === 'ar' ? 'الخصم القياسي' : 'Standard') : (CONFIG.language === 'ar' ? 'تفصيلي' : 'Itemized')}</span>
        </div>
        <div class="result-row">
          <span class="result-label">${CONFIG.language === 'ar' ? 'توفير' : 'Savings'}</span>
          <span class="result-value">${formatCurrency(savings)}</span>
        </div>
      `;
      result.classList.add('show');
    });

    return container;
  }

  function createFilingStatusCalculator() {
    const container = document.createElement('div');
    container.className = 'calculator-widget tax-interactive';
    container.innerHTML = `
      <h4>👥 ${CONFIG.language === 'ar' ? 'أي حالة توفر لك أكثر؟' : 'Which Status Saves You More?'}</h4>
      <div class="calculator-form">
        <div class="form-group">
          <label for="status-income">${CONFIG.language === 'ar' ? 'إجمالي الدخل السنوي' : 'Total Annual Income'}</label>
          <input type="number" id="status-income" placeholder="80000" min="0" step="1000">
        </div>
        <button class="calculator-button" id="status-calc-btn">
          ${CONFIG.language === 'ar' ? 'قارن الحالات' : 'Compare Statuses'}
        </button>
      </div>
      <div class="calculator-result" id="status-result"></div>
    `;

    container.querySelector('#status-calc-btn').addEventListener('click', () => {
      const income = parseFloat(container.querySelector('#status-income').value);

      if (isNaN(income) || income < 0) {
        alert(CONFIG.language === 'ar' ? 'يرجى إدخال دخل صحيح' : 'Please enter a valid income');
        return;
      }

      const statuses = ['single', 'married_filing_jointly', 'head_of_household'];
      const comparisons = statuses.map(status => ({
        status,
        deduction: STANDARD_DEDUCTIONS_2025[status],
        tax: calculateProgressiveTax(income - STANDARD_DEDUCTIONS_2025[status], status)
      }));

      const best = comparisons.reduce((min, curr) => curr.tax < min.tax ? curr : min);

      const result = container.querySelector('#status-result');
      result.innerHTML = comparisons.map(comp => `
        <div class="result-row ${comp.status === best.status ? 'highlight' : ''}">
          <span class="result-label">${getStatusLabel(comp.status)}</span>
          <span class="result-value">${formatCurrency(comp.tax)}${comp.status === best.status ? ' 🏆' : ''}</span>
        </div>
      `).join('') + `
        <div class="result-row" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #ddd;">
          <span class="result-label">${CONFIG.language === 'ar' ? 'توفير مقارنة بالأسوأ' : 'Savings vs Worst'}</span>
          <span class="result-value">${formatCurrency(Math.max(...comparisons.map(c => c.tax)) - best.tax)}</span>
        </div>
      `;
      result.classList.add('show');
    });

    return container;
  }

  function createCreditCalculator() {
    const container = document.createElement('div');
    container.className = 'calculator-widget tax-interactive';
    container.innerHTML = `
      <h4>🎁 ${CONFIG.language === 'ar' ? 'كم يمكنك أن توفر؟' : 'How Much Could You Save?'}</h4>
      <div class="calculator-form">
        <div class="form-group">
          <label for="credit-income">${CONFIG.language === 'ar' ? 'الدخل السنوي' : 'Annual Income'}</label>
          <input type="number" id="credit-income" placeholder="50000" min="0" step="1000">
        </div>
        <div class="form-group">
          <label for="credit-dependents">${CONFIG.language === 'ar' ? 'عدد الأشخاص الذين تعول' : 'Number of Dependents'}</label>
          <input type="number" id="credit-dependents" placeholder="2" min="0" max="10" step="1">
        </div>
        <div class="form-group">
          <label for="credit-filing-status">${CONFIG.language === 'ar' ? 'حالة التقديم' : 'Filing Status'}</label>
          <select id="credit-filing-status">
            <option value="single">${CONFIG.language === 'ar' ? 'أعزب' : 'Single'}</option>
            <option value="married_filing_jointly">${CONFIG.language === 'ar' ? 'متزوج يقدم بشكل مشترك' : 'Married Filing Jointly'}</option>
            <option value="head_of_household">${CONFIG.language === 'ar' ? 'رب الأسرة' : 'Head of Household'}</option>
          </select>
        </div>
        <button class="calculator-button" id="credit-calc-btn">
          ${CONFIG.language === 'ar' ? 'احسب الاعتمادات' : 'Calculate Credits'}
        </button>
      </div>
      <div class="calculator-result" id="credit-result"></div>
    `;

    container.querySelector('#credit-calc-btn').addEventListener('click', () => {
      const income = parseFloat(container.querySelector('#credit-income').value);
      const dependents = parseInt(container.querySelector('#credit-dependents').value);
      const status = container.querySelector('#credit-filing-status').value;

      if (isNaN(income) || income < 0) {
        alert(CONFIG.language === 'ar' ? 'يرجى إدخال دخل صحيح' : 'Please enter a valid income');
        return;
      }

      // Child Tax Credit: $2,000 per child under 17
      const childTaxCredit = dependents * 2000;

      // EITC (simplified): varies by income and dependent count
      let eitc = 0;
      if (income < 60000) {
        if (dependents === 0) eitc = Math.min(income * 0.0765, 560);
        else if (dependents === 1) eitc = Math.min(income * 0.34, 3733);
        else if (dependents >= 2) eitc = Math.min(income * 0.40, 6164);
      }

      const totalCredits = childTaxCredit + eitc;

      const result = container.querySelector('#credit-result');
      result.innerHTML = `
        <div class="result-row">
          <span class="result-label">${CONFIG.language === 'ar' ? 'الدخل' : 'Income'}</span>
          <span class="result-value">${formatCurrency(income)}</span>
        </div>
        <div class="result-row">
          <span class="result-label">${CONFIG.language === 'ar' ? 'ائتمان ضريبة الأطفال' : 'Child Tax Credit'}</span>
          <span class="result-value">${formatCurrency(childTaxCredit)}</span>
        </div>
        <div class="result-row">
          <span class="result-label">${CONFIG.language === 'ar' ? 'الائتمان المكتسب من الدخل' : 'EITC'}</span>
          <span class="result-value">${formatCurrency(eitc)}</span>
        </div>
        <div class="result-row highlight">
          <span class="result-label">💰 ${CONFIG.language === 'ar' ? 'إجمالي الاعتمادات' : 'Total Credits'}</span>
          <span class="result-value">${formatCurrency(totalCredits)}</span>
        </div>
      `;
      result.classList.add('show');
    });

    return container;
  }

  function calculateProgressiveTax(taxableIncome, status) {
    // Simplified progressive tax calculation
    let tax = 0;
    const brackets = TAX_BRACKETS_2025;

    brackets.forEach(bracket => {
      if (taxableIncome > bracket.min) {
        const taxableInThisBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
        tax += taxableInThisBracket * bracket.rate;
      }
    });

    return Math.max(0, tax);
  }

  function getStatusLabel(status) {
    const labels = {
      single: CONFIG.language === 'ar' ? 'أعزب' : 'Single',
      married_filing_jointly: CONFIG.language === 'ar' ? 'متزوج يقدم بشكل مشترك' : 'Married Filing Jointly',
      head_of_household: CONFIG.language === 'ar' ? 'رب الأسرة' : 'Head of Household'
    };
    return labels[status] || status;
  }

  // ============================================================================
  // TAX BRACKET DIAGRAM
  // ============================================================================

  function injectBracketDiagram() {
    const headings = document.querySelectorAll('h2, h3');

    headings.forEach(heading => {
      if (heading.textContent.toLowerCase().includes('bracket') &&
          !heading.parentElement.querySelector('.bracket-diagram')) {
        const diagram = createBracketDiagram();
        heading.parentElement.appendChild(diagram);
      }
    });
  }

  function createBracketDiagram() {
    const container = document.createElement('div');
    container.className = 'bracket-diagram tax-interactive';
    container.innerHTML = `
      <h4>📊 ${CONFIG.language === 'ar' ? 'الفئات الضريبية 2025 (أعزب)' : 'Tax Brackets 2025 (Single Filer)'}</h4>
      <div class="bracket-bars" id="bracket-bars"></div>
      <div class="bracket-legend" id="bracket-legend"></div>
    `;

    const barsContainer = container.querySelector('#bracket-bars');
    const legendContainer = container.querySelector('#bracket-legend');

    TAX_BRACKETS_2025.forEach((bracket, index) => {
      const bar = document.createElement('div');
      bar.className = 'bracket-bar';
      bar.style.backgroundColor = BRACKET_COLORS[index];

      const range = bracket.max === Infinity ? `$${bracket.min.toLocaleString()}+` :
                    `$${bracket.min.toLocaleString()}-$${bracket.max.toLocaleString()}`;

      bar.innerHTML = `
        <div class="bracket-tooltip">
          ${range}<br>${bracket.label}
        </div>
      `;

      barsContainer.appendChild(bar);

      // Add to legend
      const legendItem = document.createElement('div');
      legendItem.className = 'bracket-legend-item';
      legendItem.innerHTML = `
        <div class="bracket-legend-color" style="background-color: ${BRACKET_COLORS[index]}"></div>
        <span>${range}: ${bracket.label}</span>
      `;
      legendContainer.appendChild(legendItem);
    });

    return container;
  }

  // ============================================================================
  // FLOWCHARTS
  // ============================================================================

  function injectFlowcharts() {
    const pageContent = document.body.textContent.toLowerCase();

    // Detect page type from URL or content
    const url = window.location.pathname.toLowerCase();

    if (url.includes('itin') || pageContent.includes('itin') || pageContent.includes('resident alien')) {
      injectFlowchart('alienStatus', 'AlienStatusFlowchart');
    }

    if (url.includes('filing') || pageContent.includes('which filing status')) {
      injectFlowchart('filingStatus', 'FilingStatusFlowchart');
    }

    if (pageContent.includes('do i need to file') || pageContent.includes('filing requirement')) {
      injectFlowchart('mustFile', 'MustFileFlowchart');
    }

    if (pageContent.includes('standard') && pageContent.includes('itemized')) {
      injectFlowchart('deductionChoice', 'DeductionChoiceFlowchart');
    }
  }

  function injectFlowchart(type, className) {
    const headings = document.querySelectorAll('h2, h3');
    let targetHeading = null;

    headings.forEach(heading => {
      const text = heading.textContent.toLowerCase();

      if ((type === 'alienStatus' && (text.includes('alien') || text.includes('resident'))) ||
          (type === 'filingStatus' && text.includes('filing status')) ||
          (type === 'mustFile' && (text.includes('do i need') || text.includes('requirement'))) ||
          (type === 'deductionChoice' && text.includes('standard') && text.includes('itemized'))) {
        targetHeading = heading;
      }
    });

    if (targetHeading && !targetHeading.parentElement.querySelector('.flowchart-container')) {
      const flowchart = createFlowchart(type);
      targetHeading.parentElement.appendChild(flowchart);
    }
  }

  function createFlowchart(type) {
    const container = document.createElement('div');
    container.className = 'flowchart-container tax-interactive';

    let flowchartHTML = '';
    let steps = [];

    if (type === 'alienStatus') {
      steps = [
        { id: 'q1', type: 'question', text: CONFIG.language === 'ar' ? 'هل أنت مواطن أمريكي أو حامل بطاقة خضراء؟' : 'Are you a US citizen or green card holder?', yes: 'resident', no: 'q2' },
        { id: 'q2', type: 'question', text: CONFIG.language === 'ar' ? 'هل لديك رقم ITIN أو تعمل في الولايات المتحدة؟' : 'Do you have an ITIN or work in the US?', yes: 'resident', no: 'nonresident' },
        { id: 'resident', type: 'answer', text: CONFIG.language === 'ar' ? 'أنت مقيم لأغراض ضريبية' : 'You are a Resident for Tax Purposes', isAnswer: true },
        { id: 'nonresident', type: 'answer', text: CONFIG.language === 'ar' ? 'قد تكون مقيماً غير مقيم - استشر محاسباً' : 'You may be a Nonresident - consult a CPA', isAnswer: true }
      ];
    } else if (type === 'filingStatus') {
      steps = [
        { id: 'q1', type: 'question', text: CONFIG.language === 'ar' ? 'هل أنت متزوج في 31 ديسمبر؟' : 'Are you married on Dec 31?', yes: 'q2', no: 'q3' },
        { id: 'q2', type: 'question', text: CONFIG.language === 'ar' ? 'هل تعيش مع زوجتك وتقدم إقرار مشترك؟' : 'Do you live together and file jointly?', yes: 'mfj', no: 'mfs' },
        { id: 'q3', type: 'question', text: CONFIG.language === 'ar' ? 'هل أنت رب أسرة (دعم أحد الوالدين/الطفل)؟' : 'Are you supporting parent/child?', yes: 'hoh', no: 'single' },
        { id: 'mfj', type: 'answer', text: CONFIG.language === 'ar' ? 'متزوج يقدم بشكل مشترك' : 'Married Filing Jointly', isAnswer: true },
        { id: 'mfs', type: 'answer', text: CONFIG.language === 'ar' ? 'متزوج يقدم بشكل منفصل' : 'Married Filing Separately', isAnswer: true },
        { id: 'hoh', type: 'answer', text: CONFIG.language === 'ar' ? 'رب الأسرة' : 'Head of Household', isAnswer: true },
        { id: 'single', type: 'answer', text: CONFIG.language === 'ar' ? 'أعزب' : 'Single', isAnswer: true }
      ];
    } else if (type === 'mustFile') {
      steps = [
        { id: 'q1', type: 'question', text: CONFIG.language === 'ar' ? 'هل دخلك فوق الخصم القياسي؟' : 'Is your income above standard deduction?', yes: 'yes', no: 'q2' },
        { id: 'q2', type: 'question', text: CONFIG.language === 'ar' ? 'هل لديك دخل 1099 من العمل الحر؟' : 'Do you have 1099 self-employment income?', yes: 'yes', no: 'q3' },
        { id: 'q3', type: 'question', text: CONFIG.language === 'ar' ? 'هل دفعت الضرائب الفيدرالية التي قد تستحق استرجاعاً؟' : 'Did you pay federal taxes that might be refunded?', yes: 'yes', no: 'no' },
        { id: 'yes', type: 'answer', text: CONFIG.language === 'ar' ? 'نعم، يجب عليك تقديم إقرار' : 'Yes, You Must File', isAnswer: true },
        { id: 'no', type: 'answer', text: CONFIG.language === 'ar' ? 'ربما لا تضطر للتقديم، لكن قد تستفيد من ذلك' : 'You May Not Need to File, But Might Benefit', isAnswer: false }
      ];
    } else if (type === 'deductionChoice') {
      steps = [
        { id: 'q1', type: 'question', text: CONFIG.language === 'ar' ? 'هل تملك منزلاً برهن عقاري أو نفقات ضريبية عالية؟' : 'Do you own a home with mortgage/high taxes?', yes: 'q2', no: 'standard' },
        { id: 'q2', type: 'question', text: CONFIG.language === 'ar' ? 'هل خصوماتك تتجاوز الخصم القياسي؟' : 'Do your deductions exceed standard deduction?', yes: 'itemized', no: 'standard' },
        { id: 'itemized', type: 'answer', text: CONFIG.language === 'ar' ? 'استخدم الخصومات المفصلة' : 'Use Itemized Deductions', isAnswer: true },
        { id: 'standard', type: 'answer', text: CONFIG.language === 'ar' ? 'استخدم الخصم القياسي' : 'Use Standard Deduction', isAnswer: true }
      ];
    }

    // Build flowchart HTML
    const flowchartDiv = document.createElement('div');
    flowchartDiv.className = 'flowchart';
    flowchartDiv.id = `flowchart-${type}`;

    let currentStep = steps[0];
    let html = '';

    // Function to build step HTML
    const buildStepHTML = (step) => {
      let stepHTML = `<div class="flowchart-box ${step.type}${step.type === 'answer' && !step.isAnswer ? ' error' : ''}" id="step-${step.id}">
        ${step.text}
      </div>`;

      if (step.type === 'question') {
        stepHTML += `<div class="flowchart-buttons">
          <button class="flowchart-btn" data-step="${step.id}" data-answer="yes">${CONFIG.language === 'ar' ? 'نعم' : 'Yes'}</button>
          <button class="flowchart-btn" data-step="${step.id}" data-answer="no">${CONFIG.language === 'ar' ? 'لا' : 'No'}</button>
        </div>
        <div class="flowchart-arrow"></div>`;
      }

      return stepHTML;
    };

    html = buildStepHTML(currentStep);
    flowchartDiv.innerHTML = html;

    // Event delegation for flowchart buttons
    flowchartDiv.addEventListener('click', (e) => {
      if (e.target.classList.contains('flowchart-btn')) {
        const stepId = e.target.dataset.step;
        const answer = e.target.dataset.answer;
        const step = steps.find(s => s.id === stepId);

        if (step) {
          const nextStepId = answer === 'yes' ? step.yes : step.no;
          const nextStep = steps.find(s => s.id === nextStepId);

          if (nextStep) {
            // Clear previous steps
            flowchartDiv.innerHTML = '';

            // Add all steps leading to answer
            let path = [currentStep];
            let temp = currentStep;

            while (temp.id !== nextStepId) {
              const nextId = (e.target.dataset.answer === 'yes' ? temp.yes : temp.no);
              const next = steps.find(s => s.id === nextId);
              if (!next) break;
              path.push(next);
              temp = next;
            }

            path.forEach((s, idx) => {
              const stepDiv = document.createElement('div');
              stepDiv.innerHTML = buildStepHTML(s);
              flowchartDiv.appendChild(...stepDiv.children);
            });

            currentStep = nextStep;
          }
        }
      }

      if (e.target.classList.contains('flowchart-reset')) {
        location.reload();
      }
    });

    container.appendChild(flowchartDiv);
    return container;
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  function init() {
    // Inject styles
    createStyles();

    // Add tax-interactive class to body
    document.body.classList.add('tax-interactive');

    // Set language direction if Arabic
    if (CONFIG.language === 'ar') {
      document.body.setAttribute('dir', 'rtl');
    }

    // Enhance headers
    enhanceHeaders();

    // Inject calculators
    injectCalculators();

    // Inject simple explanations
    injectSimpleExplanations();

    // Inject tax bracket diagram
    injectBracketDiagram();

    // Inject flowcharts
    injectFlowcharts();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also handle dynamic content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        // Re-run enhancements on new content
        enhanceHeaders();
        injectCalculators();
        injectSimpleExplanations();
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();
