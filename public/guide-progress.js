(function() {
  'use strict';

  // ==================== Configuration ====================
  const CONFIG = {
    progressBarHeight: 3,
    chapterThreshold: 0.8,
    storagePrefix: 'tap_guide_',
    quizScoreThreshold: 0.75,
    animationDuration: 300,
    toastDuration: 5000
  };

  const QUIZZES = {
    'guide.html': [
      {
        title: '🧠 Test Your Knowledge — اختبر معلوماتك',
        afterSelector: '[data-chapter="filing-status"], h2:contains("Filing Status")',
        questions: [
          {
            q: 'Which filing status gives the highest standard deduction?',
            q_ar: 'أي حالة تقديم تعطي أعلى خصم قياسي؟',
            options: [
              { text: 'Head of Household', text_ar: 'رب الأسرة', correct: false },
              { text: 'Married Filing Jointly', text_ar: 'متزوج يقدم بشكل مشترك', correct: true },
              { text: 'Single', text_ar: 'أعزب', correct: false },
              { text: 'Married Filing Separately', text_ar: 'متزوج يقدم بشكل منفصل', correct: false }
            ],
            explanation: 'MFJ provides the highest standard deduction for 2025.',
            explanation_ar: 'MFJ توفر أعلى خصم قياسي لعام 2025.'
          },
          {
            q: 'If you\'re unmarried with a dependent child, you probably file as?',
            q_ar: 'إذا كنت أعزب مع طفل معال، فأنت على الأرجح تقدم باسم؟',
            options: [
              { text: 'Single', text_ar: 'أعزب', correct: false },
              { text: 'Head of Household', text_ar: 'رب الأسرة', correct: true },
              { text: 'Married Filing Jointly', text_ar: 'متزوج يقدم بشكل مشترك', correct: false },
              { text: 'Qualifying Widow(er)', text_ar: 'أرملة مؤهلة', correct: false }
            ],
            explanation: 'Head of Household is the correct status for unmarried individuals with qualifying dependents.',
            explanation_ar: 'رب الأسرة هي الحالة الصحيحة للأفراد غير المتزوجين مع المعالين المؤهلين.'
          },
          {
            q: 'What\'s the 2025 standard deduction for Single filers?',
            q_ar: 'ما هو الخصم القياسي لعام 2025 لمقدمي الطلبات الفرديين؟',
            options: [
              { text: '$13,850', text_ar: '$13,850', correct: false },
              { text: '$14,600', text_ar: '$14,600', correct: false },
              { text: '$15,000', text_ar: '$15,000', correct: true },
              { text: '$15,500', text_ar: '$15,500', correct: false }
            ],
            explanation: 'The 2025 standard deduction for Single filers is $15,000.',
            explanation_ar: 'الخصم القياسي لعام 2025 لمقدمي الطلبات الفرديين هو $15,000.'
          }
        ]
      },
      {
        title: '🧠 Test Your Knowledge — اختبر معلوماتك',
        afterSelector: '[data-chapter="income-deductions"], h2:contains("Income"), h2:contains("Deductions")',
        questions: [
          {
            q: 'W-2 income is also called?',
            q_ar: 'دخل W-2 يُسمى أيضًا؟',
            options: [
              { text: 'Wages and Salary', text_ar: 'الأجور والراتب', correct: true },
              { text: 'Self-Employment Income', text_ar: 'دخل العمل الحر', correct: false },
              { text: 'Investment Income', text_ar: 'دخل الاستثمار', correct: false },
              { text: 'Rental Income', text_ar: 'دخل الإيجار', correct: false }
            ],
            explanation: 'W-2 reports wages and salary income from employers.',
            explanation_ar: 'نموذج W-2 يبلغ عن دخل الأجور والراتب من أصحاب العمل.'
          },
          {
            q: '1099-NEC is for?',
            q_ar: '1099-NEC مخصص لـ؟',
            options: [
              { text: 'Employee wages', text_ar: 'أجور الموظفين', correct: false },
              { text: 'Self-employment and freelance income', text_ar: 'دخل العمل الحر والعمل بدوام جزئي', correct: true },
              { text: 'Interest and dividends', text_ar: 'الفائدة والأرباح', correct: false },
              { text: 'Real estate transactions', text_ar: 'معاملات العقارات', correct: false }
            ],
            explanation: '1099-NEC reports non-employee compensation for self-employed and freelance workers.',
            explanation_ar: '1099-NEC يبلغ عن تعويض غير الموظفين للعاملين بحسابهم الخاص والعاملين بدوام جزئي.'
          },
          {
            q: 'Standard deduction vs itemized: you should choose?',
            q_ar: 'الخصم القياسي مقابل التفصيلي: يجب أن تختار؟',
            options: [
              { text: 'Standard deduction', text_ar: 'الخصم القياسي', correct: false },
              { text: 'Itemized deductions', text_ar: 'الخصومات المفصلة', correct: false },
              { text: 'Whichever is higher', text_ar: 'أيهما أعلى', correct: true },
              { text: 'Both combined', text_ar: 'كلاهما معا', correct: false }
            ],
            explanation: 'Always choose the option that reduces your taxable income the most.',
            explanation_ar: 'اختر دائمًا الخيار الذي يقلل دخلك الخاضع للضريبة أكثر.'
          }
        ]
      },
      {
        title: '🧠 Test Your Knowledge — اختبر معلوماتك',
        afterSelector: '[data-chapter="credits-refunds"], h2:contains("Credits"), h2:contains("Refunds")',
        questions: [
          {
            q: 'A tax credit of $1,000 means your tax bill is reduced by?',
            q_ar: 'رصيد ضريبي بقيمة $1,000 يعني تقليل فاتورة الضريبة الخاصة بك بمقدار؟',
            options: [
              { text: '$100', text_ar: '$100', correct: false },
              { text: '$500', text_ar: '$500', correct: false },
              { text: '$1,000', text_ar: '$1,000', correct: true },
              { text: '$2,000', text_ar: '$2,000', correct: false }
            ],
            explanation: 'Tax credits are dollar-for-dollar reductions in tax liability.',
            explanation_ar: 'الأرصدة الضريبية تقلل الالتزام الضريبي بشكل مباشر.'
          },
          {
            q: 'EITC is designed to help?',
            q_ar: 'EITC مصمم لمساعدة؟',
            options: [
              { text: 'High-income earners', text_ar: 'أصحاب الدخل المرتفع', correct: false },
              { text: 'Low-to-moderate income workers', text_ar: 'العمال ذوي الدخل المنخفض إلى المتوسط', correct: true },
              { text: 'Business owners only', text_ar: 'أصحاب الأعمال فقط', correct: false },
              { text: 'Retirees only', text_ar: 'المتقاعدون فقط', correct: false }
            ],
            explanation: 'The Earned Income Tax Credit supports low-to-moderate income working individuals and families.',
            explanation_ar: 'الرصيد الضريبي للدخل المكتسب يدعم الأفراد والعائلات العاملة ذات الدخل المنخفض إلى المتوسط.'
          },
          {
            q: 'If your employer withheld more tax than you owe, you get a?',
            q_ar: 'إذا احتجز صاحب عملك ضريبة أكثر مما تدين به، فستحصل على؟',
            options: [
              { text: 'Penalty', text_ar: 'غرامة', correct: false },
              { text: 'Deduction', text_ar: 'خصم', correct: false },
              { text: 'Refund', text_ar: 'استرداد', correct: true },
              { text: 'Credit', text_ar: 'رصيد', correct: false }
            ],
            explanation: 'Excess withholding results in a tax refund to you.',
            explanation_ar: 'الحجب الزائد ينتج عنه استرداد ضريبي لك.'
          }
        ]
      }
    ],
    'itin-guide.html': [
      {
        title: '🧠 Test Your Knowledge — اختبر معلوماتك',
        afterSelector: '[data-chapter="itin-basics"], h2:contains("ITIN"), h2:contains("What is an ITIN")',
        questions: [
          {
            q: 'ITIN stands for?',
            q_ar: 'ITIN تعني؟',
            options: [
              { text: 'Individual Taxpayer Income Number', text_ar: 'رقم دخل دافع الضرائب الفردي', correct: false },
              { text: 'Individual Taxpayer Identification Number', text_ar: 'رقم تعريف دافع الضرائب الفردي', correct: true },
              { text: 'International Tax Identification Number', text_ar: 'رقم التعريف الضريبي الدولي', correct: false },
              { text: 'Individual Tax Income Notification', text_ar: 'إخطار دخل الضريبة الفردية', correct: false }
            ],
            explanation: 'ITIN is the Individual Taxpayer Identification Number issued by the IRS.',
            explanation_ar: 'ITIN هو رقم تعريف دافع الضرائب الفردي الصادر عن IRS.'
          },
          {
            q: 'ITIN is for people who?',
            q_ar: 'ITIN مخصص للأشخاص الذين؟',
            options: [
              { text: 'Have a Social Security Number', text_ar: 'لديهم رقم الضمان الاجتماعي', correct: false },
              { text: 'Can\'t get an SSN but need to file taxes', text_ar: 'لا يمكنهم الحصول على SSN لكنهم يحتاجون إلى تقديم ضرائب', correct: true },
              { text: 'Work only part-time', text_ar: 'يعملون بدوام جزئي فقط', correct: false },
              { text: 'Are citizens only', text_ar: 'مواطنون فقط', correct: false }
            ],
            explanation: 'ITIN is issued to individuals who cannot obtain an SSN but have a U.S. tax filing requirement.',
            explanation_ar: 'يتم إصدار ITIN للأفراد الذين لا يمكنهم الحصول على SSN لكن لديهم متطلب تقديم ضريبي أمريكي.'
          },
          {
            q: 'Which form do you use to apply for ITIN?',
            q_ar: 'ما هو النموذج الذي تستخدمه للتقدم بطلب للحصول على ITIN؟',
            options: [
              { text: 'Form 1040', text_ar: 'نموذج 1040', correct: false },
              { text: 'Form W-7', text_ar: 'نموذج W-7', correct: true },
              { text: 'Form 1099', text_ar: 'نموذج 1099', correct: false },
              { text: 'Form SS-5', text_ar: 'نموذج SS-5', correct: false }
            ],
            explanation: 'Form W-7 is the Application for IRS Individual Taxpayer Identification Number.',
            explanation_ar: 'نموذج W-7 هو طلب الحصول على رقم تعريف دافع الضرائب الفردي من IRS.'
          },
          {
            q: 'Can ITIN holders claim EITC?',
            q_ar: 'هل يمكن لحاملي ITIN المطالبة بـ EITC؟',
            options: [
              { text: 'Yes, always', text_ar: 'نعم، دائما', correct: false },
              { text: 'No, ITIN holders are ineligible', text_ar: 'لا، حاملو ITIN غير مؤهلين', correct: true },
              { text: 'Only if they have a dependent', text_ar: 'فقط إذا كان لديهم معال', correct: false },
              { text: 'Only after 5 years', text_ar: 'فقط بعد 5 سنوات', correct: false }
            ],
            explanation: 'ITIN holders cannot claim the Earned Income Tax Credit under current IRS rules.',
            explanation_ar: 'لا يمكن لحاملي ITIN المطالبة بـ Earned Income Tax Credit بموجب قواعس IRS الحالية.'
          }
        ]
      }
    ]
  };

  // ==================== State Quiz Generator ====================
  function generateStateQuiz(stateName) {
    const stateQuizzes = {
      'California': {
        title: '🧠 Test Your Knowledge — اختبر معلوماتك',
        questions: [
          {
            q: 'California\'s state income tax rate ranges from?',
            q_ar: 'تتراوح معدل الضريبة على الدخل بولاية كاليفورنيا بين؟',
            options: [
              { text: '2% to 9.3%', text_ar: '2% إلى 9.3%', correct: true },
              { text: '3% to 8%', text_ar: '3% إلى 8%', correct: false },
              { text: '1% to 10%', text_ar: '1% إلى 10%', correct: false },
              { text: '5% to 12%', text_ar: '5% إلى 12%', correct: false }
            ],
            explanation: 'California has progressive tax brackets ranging from 2% to 9.3% for residents.',
            explanation_ar: 'كاليفورنيا لديها أقواس ضريبية تصاعدية تتراوح من 2% إلى 9.3% للمقيمين.'
          },
          {
            q: 'Does California allow a standard deduction?',
            q_ar: 'هل تسمح كاليفورنيا بخصم قياسي؟',
            options: [
              { text: 'Yes, same as federal', text_ar: 'نعم، نفس الاتحادي', correct: false },
              { text: 'No, must itemize', text_ar: 'لا، يجب تفصيل', correct: false },
              { text: 'Yes, but different from federal', text_ar: 'نعم، لكن مختلف عن الاتحادي', correct: true },
              { text: 'No deductions allowed', text_ar: 'لا توجد خصومات مسموحة', correct: false }
            ],
            explanation: 'California allows a standard deduction that differs from the federal standard deduction.',
            explanation_ar: 'تسمح كاليفورنيا بخصم قياسي يختلف عن الخصم القياسي الفيدرالي.'
          },
          {
            q: 'California offers a dependent exemption of?',
            q_ar: 'تقدم كاليفورنيا إعفاء معال بقيمة؟',
            options: [
              { text: '$0 (no exemption)', text_ar: '$0 (لا توجد إعفاء)', correct: true },
              { text: '$150 per dependent', text_ar: '$150 لكل معال', correct: false },
              { text: '$250 per dependent', text_ar: '$250 لكل معال', correct: false },
              { text: '$400 per dependent', text_ar: '$400 لكل معال', correct: false }
            ],
            explanation: 'California does not allow dependent exemptions; you may claim credits instead.',
            explanation_ar: 'لا تسمح كاليفورنيا بإعفاءات المعالين؛ قد تطالب بأرصدة بدلاً من ذلك.'
          }
        ]
      },
      'Texas': {
        title: '🧠 Test Your Knowledge — اختبر معلوماتك',
        questions: [
          {
            q: 'Does Texas have a state income tax?',
            q_ar: 'هل تمتلك تكساس ضريبة دخل الولاية؟',
            options: [
              { text: 'Yes, 5% flat rate', text_ar: 'نعم، معدل ثابت 5%', correct: false },
              { text: 'No state income tax', text_ar: 'لا توجد ضريبة دخل الولاية', correct: true },
              { text: 'Yes, 3.5% to 10.5%', text_ar: 'نعم، 3.5% إلى 10.5%', correct: false },
              { text: 'Yes, progressive up to 8%', text_ar: 'نعم، تصاعدي حتى 8%', correct: false }
            ],
            explanation: 'Texas does not have a state income tax, making it a tax-friendly state.',
            explanation_ar: 'لا تمتلك تكساس ضريبة دخل الولاية، مما يجعلها ولاية صديقة للضرائب.'
          },
          {
            q: 'What taxes does Texas rely on instead of income tax?',
            q_ar: 'ما هي الضرائب التي تعتمد عليها تكساس بدلاً من ضريبة الدخل؟',
            options: [
              { text: 'Property tax and sales tax', text_ar: 'ضريبة الممتلكات وضريبة المبيعات', correct: true },
              { text: 'Payroll tax only', text_ar: 'ضريبة الرواتب فقط', correct: false },
              { text: 'Capital gains tax', text_ar: 'ضريبة مكاسب رأس المال', correct: false },
              { text: 'No taxes at all', text_ar: 'لا توجد ضرائب على الإطلاق', correct: false }
            ],
            explanation: 'Texas generates state revenue through property and sales taxes instead of income tax.',
            explanation_ar: 'تولد تكساس إيرادات الدولة من خلال ضرائب الممتلكات والمبيعات بدلاً من ضريبة الدخل.'
          },
          {
            q: 'What is Texas\'s state sales tax rate?',
            q_ar: 'ما هو معدل ضريبة المبيعات بولاية تكساس؟',
            options: [
              { text: '6.25%', text_ar: '6.25%', correct: true },
              { text: '5%', text_ar: '5%', correct: false },
              { text: '7%', text_ar: '7%', correct: false },
              { text: '8.5%', text_ar: '8.5%', correct: false }
            ],
            explanation: 'Texas state sales tax is 6.25%, though local jurisdictions may add additional sales tax.',
            explanation_ar: 'ضريبة المبيعات بولاية تكساس 6.25%، على الرغم من أن الولايات المحلية قد تضيف ضريبة مبيعات إضافية.'
          }
        ]
      },
      'New York': {
        title: '🧠 Test Your Knowledge — اختبر معلوماتك',
        questions: [
          {
            q: 'New York\'s top state income tax rate is approximately?',
            q_ar: 'أعلى معدل ضريبة دخل الولاية في نيويورك هو تقريبًا؟',
            options: [
              { text: '6.85%', text_ar: '6.85%', correct: true },
              { text: '5%', text_ar: '5%', correct: false },
              { text: '8.5%', text_ar: '8.5%', correct: false },
              { text: '10%', text_ar: '10%', correct: false }
            ],
            explanation: 'New York\'s top state income tax rate is approximately 6.85% for residents.',
            explanation_ar: 'أعلى معدل ضريبة دخل الولاية في نيويورك للمقيمين هو تقريبًا 6.85%.'
          },
          {
            q: 'Does New York City have an additional income tax?',
            q_ar: 'هل مدينة نيويورك لديها ضريبة دخل إضافية؟',
            options: [
              { text: 'No', text_ar: 'لا', correct: false },
              { text: 'Yes, up to 3.876%', text_ar: 'نعم، تصل إلى 3.876%', correct: true },
              { text: 'Yes, flat 2%', text_ar: 'نعم، ثابتة 2%', correct: false },
              { text: 'Yes, 5% only', text_ar: 'نعم، 5% فقط', correct: false }
            ],
            explanation: 'New York City residents pay an additional city income tax up to 3.876%.',
            explanation_ar: 'يدفع سكان مدينة نيويورك ضريبة دخل مدينة إضافية تصل إلى 3.876%.'
          }
        ]
      }
    };

    return stateQuizzes[stateName] || null;
  }

  // ==================== UI Components ====================

  function createProgressBar() {
    const bar = document.createElement('div');
    bar.id = 'tap-progress-bar';
    bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: ${CONFIG.progressBarHeight}px;
      width: 0%;
      background: linear-gradient(90deg, #c9a84c 0%, #dab95e 100%);
      z-index: 9999;
      transition: width 0.3s ease;
    `;
    bar.title = 'Scroll to read more';
    document.body.appendChild(bar);
    return bar;
  }

  function createQuizCard(quiz, quizIndex) {
    const card = document.createElement('div');
    card.className = 'tap-quiz-card';
    card.id = `tap-quiz-${quizIndex}`;
    card.innerHTML = `
      <div class="tap-quiz-header">
        <h3>${quiz.title}</h3>
      </div>
      <div class="tap-quiz-content">
        ${quiz.questions.map((q, idx) => `
          <div class="tap-question" data-question-index="${idx}">
            <p class="tap-question-text">${q.q}</p>
            <p class="tap-question-text-ar">${q.q_ar}</p>
            <div class="tap-options">
              ${q.options.map((opt, optIdx) => `
                <button class="tap-option-btn" data-option-index="${optIdx}" data-correct="${opt.correct}">
                  ${opt.text}
                  <span class="tap-option-ar">${opt.text_ar}</span>
                </button>
              `).join('')}
            </div>
            <div class="tap-feedback" style="display: none;"></div>
          </div>
        `).join('')}
        <div class="tap-quiz-score" style="display: none;">
          <h4>Score</h4>
          <p class="tap-score-text"></p>
          <button class="tap-retry-btn">Try Again</button>
        </div>
      </div>
    `;
    return card;
  }

  function createBookmarkPanel() {
    const panel = document.createElement('div');
    panel.id = 'tap-bookmark-panel';
    panel.className = 'tap-bookmark-panel';
    panel.innerHTML = `
      <div class="tap-panel-toggle">
        <span>🔖</span>
      </div>
      <div class="tap-panel-content" style="display: none;">
        <h3>My Bookmarks — علاماتي</h3>
        <div class="tap-bookmarks-list"></div>
        <p class="tap-no-bookmarks">No bookmarks yet</p>
      </div>
    `;
    return panel;
  }

  function createContinueToast(chapterName, chapterPosition) {
    const toast = document.createElement('div');
    toast.className = 'tap-continue-toast';
    toast.innerHTML = `
      <span>📖 Continue from <strong>${chapterName}</strong>?</span>
      <button class="tap-continue-btn">Yes</button>
      <button class="tap-dismiss-btn">Dismiss</button>
    `;
    return toast;
  }

  // ==================== Core Logic ====================

  class GuideProgressTracker {
    constructor() {
      this.currentPageUrl = window.location.pathname;
      this.storageKey = `${CONFIG.storagePrefix}${this.currentPageUrl}`;
      this.chapterElements = [];
      this.progressBar = null;
      this.quizzes = [];
      this.bookmarkedChapters = new Set();
      this.loadBookmarks();
    }

    init() {
      this.progressBar = createProgressBar();
      this.setupScrollTracking();
      this.setupChapters();
      this.setupBookmarks();
      this.injectQuizzes();
      this.checkResumeSession();
      this.setupBookmarkPanel();
      this.injectStyles();
    }

    injectStyles() {
      const style = document.createElement('style');
      style.textContent = `
        /* Progress Bar */
        #tap-progress-bar {
          box-shadow: 0 0 10px rgba(201, 168, 76, 0.5);
        }

        /* Quiz Card Styles */
        .tap-quiz-card {
          background: white;
          border-radius: 8px;
          border-top: 4px solid #1a3a52;
          padding: 24px;
          margin: 24px 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tap-quiz-header {
          border-bottom: 2px solid #dab95e;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }

        .tap-quiz-header h3 {
          color: #1a3a52;
          margin: 0;
          font-size: 18px;
        }

        .tap-question {
          margin-bottom: 24px;
        }

        .tap-question-text {
          color: #1a3a52;
          font-weight: 600;
          margin: 0 0 8px 0;
          font-size: 16px;
        }

        .tap-question-text-ar {
          color: #666;
          font-size: 14px;
          margin: 4px 0 16px 0;
          direction: rtl;
          text-align: right;
        }

        .tap-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .tap-option-btn {
          padding: 12px 16px;
          border: 2px solid #dab95e;
          border-radius: 6px;
          background: white;
          color: #1a3a52;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .tap-option-btn:hover {
          border-color: #c9a84c;
          background: #f9f7f4;
        }

        .tap-option-btn.selected {
          border-color: #c9a84c;
          background: #c9a84c;
          color: white;
        }

        .tap-option-btn.correct-answer {
          border-color: #22c55e;
          background: #22c55e;
          color: white;
          animation: correctFlash 0.5s ease;
        }

        .tap-option-btn.incorrect-answer {
          border-color: #ef4444;
          background: #ef4444;
          color: white;
          animation: incorrectFlash 0.5s ease;
        }

        @keyframes correctFlash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes incorrectFlash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .tap-option-ar {
          display: block;
          font-size: 12px;
          margin-top: 4px;
          opacity: 0.8;
          direction: rtl;
          text-align: right;
          width: 100%;
        }

        .tap-feedback {
          padding: 12px;
          border-radius: 4px;
          margin-top: 12px;
          font-size: 14px;
        }

        .tap-feedback.correct {
          background: #dcfce7;
          color: #166534;
          border-left: 4px solid #22c55e;
        }

        .tap-feedback.incorrect {
          background: #fee2e2;
          color: #991b1b;
          border-left: 4px solid #ef4444;
        }

        .tap-quiz-score {
          background: #f0f4f8;
          padding: 24px;
          border-radius: 8px;
          text-align: center;
          margin-top: 20px;
        }

        .tap-quiz-score h4 {
          color: #1a3a52;
          margin: 0 0 12px 0;
        }

        .tap-score-text {
          font-size: 24px;
          font-weight: 700;
          color: #dab95e;
          margin: 12px 0;
        }

        .tap-retry-btn {
          background: #1a3a52;
          color: #dab95e;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 12px;
        }

        .tap-retry-btn:hover {
          background: #0f1f2e;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(26, 58, 82, 0.2);
        }

        /* Bookmark System */
        .tap-bookmark-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 8px;
          opacity: 0.6;
          transition: all 0.2s ease;
          margin-left: 8px;
        }

        .tap-bookmark-btn:hover {
          opacity: 1;
        }

        .tap-bookmark-btn.bookmarked {
          opacity: 1;
          color: #dab95e;
          filter: drop-shadow(0 0 3px rgba(218, 185, 94, 0.5));
        }

        .tap-bookmarked-chapter {
          border-left: 4px solid #dab95e;
          padding-left: 12px;
        }

        /* Bookmark Panel */
        .tap-bookmark-panel {
          position: fixed;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 9998;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .tap-panel-toggle {
          position: absolute;
          left: -40px;
          top: 0;
          background: #1a3a52;
          color: #dab95e;
          width: 40px;
          height: 40px;
          border-radius: 8px 0 0 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 20px;
        }

        .tap-panel-toggle:hover {
          background: #0f1f2e;
        }

        .tap-panel-content {
          background: white;
          border-left: 2px solid #dab95e;
          padding: 16px;
          border-radius: 8px 0 0 8px;
          box-shadow: -2px 2px 8px rgba(0, 0, 0, 0.15);
          width: 250px;
          max-height: 60vh;
          overflow-y: auto;
        }

        .tap-panel-content h3 {
          color: #1a3a52;
          margin: 0 0 16px 0;
          font-size: 16px;
          border-bottom: 1px solid #dab95e;
          padding-bottom: 8px;
        }

        .tap-bookmark-item {
          padding: 12px;
          margin: 8px 0;
          background: #f0f4f8;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          color: #1a3a52;
        }

        .tap-bookmark-item:hover {
          background: #dab95e;
          color: white;
        }

        .tap-bookmark-remove {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 16px;
        }

        .tap-no-bookmarks {
          text-align: center;
          color: #999;
          font-size: 12px;
          padding: 16px 0;
        }

        /* Continue Toast */
        .tap-continue-toast {
          position: fixed;
          bottom: 24px;
          left: 24px;
          background: white;
          border-left: 4px solid #dab95e;
          padding: 16px;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 9997;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tap-continue-toast span {
          flex: 1;
          color: #1a3a52;
          font-size: 14px;
        }

        .tap-continue-btn,
        .tap-dismiss-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          font-size: 12px;
        }

        .tap-continue-btn {
          background: #dab95e;
          color: #1a3a52;
        }

        .tap-continue-btn:hover {
          background: #c9a84c;
        }

        .tap-dismiss-btn {
          background: #e5e7eb;
          color: #6b7280;
        }

        .tap-dismiss-btn:hover {
          background: #d1d5db;
        }

        /* Chapter Progress */
        .tap-chapter-progress {
          display: inline-block;
          margin-left: 8px;
          color: #22c55e;
          font-weight: bold;
        }

        .tap-progress-summary {
          position: fixed;
          top: 10px;
          right: 10px;
          background: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          color: #1a3a52;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 9998;
          pointer-events: none;
        }

        #tap-progress-bar:hover ~ .tap-progress-summary,
        .tap-progress-summary:hover {
          opacity: 1;
          pointer-events: auto;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .tap-options {
            grid-template-columns: 1fr;
          }

          .tap-panel-content {
            width: 200px;
          }

          .tap-quiz-card {
            padding: 16px;
          }

          .tap-continue-toast {
            left: 12px;
            right: 12px;
            bottom: 12px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    setupScrollTracking() {
      const progressBar = this.progressBar;
      const progressSummary = document.createElement('div');
      progressSummary.className = 'tap-progress-summary';
      document.body.appendChild(progressSummary);

      window.addEventListener('scroll', () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        const progress = scrollHeight ? (scrolled / scrollHeight) * 100 : 0;

        progressBar.style.width = Math.min(progress, 100) + '%';
        progressSummary.textContent = Math.round(progress) + '% read';
      });
    }

    setupChapters() {
      // Find chapter headings (h1, h2, h3 or elements with data-chapter)
      const headings = document.querySelectorAll('h1, h2, h3, [data-chapter]');
      const chapters = [];

      headings.forEach((heading) => {
        if (heading.textContent.trim()) {
          chapters.push({
            element: heading,
            title: heading.textContent.trim(),
            id: heading.id || `chapter-${chapters.length}`,
            read: false
          });
        }
      });

      this.chapterElements = chapters;
      this.trackChapterVisibility();
    }

    trackChapterVisibility() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const chapter = this.chapterElements.find(ch => ch.element === entry.target);
          if (chapter && entry.intersectionRatio >= CONFIG.chapterThreshold) {
            if (!chapter.read) {
              chapter.read = true;
              this.markChapterAsRead(chapter);
            }
          }
        });
      }, { threshold: CONFIG.chapterThreshold });

      this.chapterElements.forEach(ch => observer.observe(ch.element));
    }

    markChapterAsRead(chapter) {
      // Add checkmark if near chapter title
      if (!chapter.element.querySelector('.tap-chapter-progress')) {
        const checkmark = document.createElement('span');
        checkmark.className = 'tap-chapter-progress';
        checkmark.textContent = '✅';
        chapter.element.appendChild(checkmark);
      }
      this.saveProgress();
    }

    setupBookmarks() {
      this.chapterElements.forEach((chapter) => {
        // Add bookmark button
        const btn = document.createElement('button');
        btn.className = 'tap-bookmark-btn';
        btn.textContent = '🔖';
        btn.title = 'Bookmark this section';
        btn.dataset.chapterId = chapter.id;

        if (this.bookmarkedChapters.has(chapter.id)) {
          btn.classList.add('bookmarked');
          chapter.element.classList.add('tap-bookmarked-chapter');
        }

        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleBookmark(chapter, btn);
        });

        chapter.element.appendChild(btn);
      });
    }

    toggleBookmark(chapter, btn) {
      if (this.bookmarkedChapters.has(chapter.id)) {
        this.bookmarkedChapters.delete(chapter.id);
        btn.classList.remove('bookmarked');
        chapter.element.classList.remove('tap-bookmarked-chapter');
      } else {
        this.bookmarkedChapters.add(chapter.id);
        btn.classList.add('bookmarked');
        chapter.element.classList.add('tap-bookmarked-chapter');
      }
      this.saveBookmarks();
      this.updateBookmarkPanel();
    }

    setupBookmarkPanel() {
      const panel = createBookmarkPanel();
      document.body.appendChild(panel);

      const toggle = panel.querySelector('.tap-panel-toggle');
      const content = panel.querySelector('.tap-panel-content');

      toggle.addEventListener('click', () => {
        const isHidden = content.style.display === 'none';
        content.style.display = isHidden ? 'block' : 'none';
      });

      this.updateBookmarkPanel();
    }

    updateBookmarkPanel() {
      const panel = document.getElementById('tap-bookmark-panel');
      const list = panel.querySelector('.tap-bookmarks-list');
      const noMsg = panel.querySelector('.tap-no-bookmarks');

      list.innerHTML = '';

      if (this.bookmarkedChapters.size === 0) {
        noMsg.style.display = 'block';
        return;
      }

      noMsg.style.display = 'none';

      this.chapterElements.forEach((chapter) => {
        if (this.bookmarkedChapters.has(chapter.id)) {
          const item = document.createElement('div');
          item.className = 'tap-bookmark-item';
          item.innerHTML = `
            <span>${chapter.title.substring(0, 30)}${chapter.title.length > 30 ? '...' : ''}</span>
            <button class="tap-bookmark-remove" title="Remove bookmark">✕</button>
          `;

          item.querySelector('span').addEventListener('click', () => {
            chapter.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });

          item.querySelector('.tap-bookmark-remove').addEventListener('click', () => {
            this.toggleBookmark(chapter, chapter.element.querySelector('.tap-bookmark-btn'));
          });

          list.appendChild(item);
        }
      });
    }

    injectQuizzes() {
      const filename = this.getPageFilename();
      let quizzesToInject = QUIZZES[filename] || [];

      // For state guides, generate state-specific quizzes
      if (filename.includes('state-') || filename.endsWith('-guide.html')) {
        const stateMatch = filename.match(/(?:state-)?(\w+)(?:-guide)?\.html/);
        if (stateMatch) {
          const stateName = this.capitalizeWords(stateMatch[1]);
          const stateQuiz = generateStateQuiz(stateName);
          if (stateQuiz) {
            quizzesToInject = [stateQuiz];
          }
        }
      }

      quizzesToInject.forEach((quiz, idx) => {
        const anchor = this.findInsertionPoint(quiz.afterSelector);
        if (anchor) {
          const quizCard = createQuizCard(quiz, idx);
          anchor.parentNode.insertBefore(quizCard, anchor.nextSibling);
          this.attachQuizLogic(quizCard, quiz, idx);
        }
      });
    }

    getPageFilename() {
      const path = this.currentPageUrl;
      return path.split('/').pop() || 'guide.html';
    }

    capitalizeWords(str) {
      return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    }

    findInsertionPoint(selector) {
      if (!selector) return document.body;

      const parts = selector.split(',');
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.startsWith('[data-chapter')) {
          const elem = document.querySelector(trimmed);
          if (elem) return elem;
        } else if (trimmed.includes(':contains')) {
          const text = trimmed.match(/:contains\("(.+?)"\)/)?.[1];
          if (text) {
            const elems = document.querySelectorAll('h1, h2, h3, h4');
            for (const el of elems) {
              if (el.textContent.includes(text)) return el;
            }
          }
        } else {
          const elem = document.querySelector(trimmed);
          if (elem) return elem;
        }
      }
      return document.body;
    }

    attachQuizLogic(card, quiz, quizIndex) {
      const questions = card.querySelectorAll('.tap-question');
      let answeredCount = 0;
      const answers = {};

      questions.forEach((qDiv, qIdx) => {
        const question = quiz.questions[qIdx];
        const options = qDiv.querySelectorAll('.tap-option-btn');

        options.forEach((opt, optIdx) => {
          opt.addEventListener('click', () => {
            if (answers[qIdx] !== undefined) return; // Already answered

            const isCorrect = opt.dataset.correct === 'true';
            answers[qIdx] = isCorrect;
            answeredCount++;

            options.forEach((o) => o.disabled = true);
            opt.classList.add(isCorrect ? 'correct-answer' : 'incorrect-answer');

            const feedback = qDiv.querySelector('.tap-feedback');
            feedback.style.display = 'block';
            feedback.classList.add(isCorrect ? 'correct' : 'incorrect');

            if (isCorrect) {
              feedback.innerHTML = `<strong>✅ Correct! / صح!</strong> ${question.explanation}<br><em>${question.explanation_ar}</em>`;
            } else {
              const correctOption = question.options.find(o => o.correct);
              feedback.innerHTML = `<strong>❌ Not quite.</strong> The correct answer is: ${correctOption.text}<br><em>${question.explanation_ar}</em>`;
            }

            if (answeredCount === quiz.questions.length) {
              this.showQuizScore(card, answers, quiz, quizIndex);
            }
          });
        });
      });

      const retryBtn = card.querySelector('.tap-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          card.querySelector('.tap-quiz-content').style.display = 'block';
          card.querySelector('.tap-quiz-score').style.display = 'none';
          location.reload();
        });
      }
    }

    showQuizScore(card, answers, quiz, quizIndex) {
      const correct = Object.values(answers).filter(v => v).length;
      const total = quiz.questions.length;
      const percentage = (correct / total) * 100;

      const scoreDiv = card.querySelector('.tap-quiz-score');
      const scoreText = scoreDiv.querySelector('.tap-score-text');
      scoreText.textContent = `You got ${correct}/${total}! ${percentage >= 75 ? '🎉' : '📚'}`;

      card.querySelector('.tap-quiz-content').style.display = 'none';
      scoreDiv.style.display = 'block';

      // Save score
      const scoreKey = `${this.storageKey}_quiz_${quizIndex}`;
      const currentBest = parseInt(localStorage.getItem(scoreKey) || '0', 10);
      if (correct > currentBest) {
        localStorage.setItem(scoreKey, correct);
      }
    }

    checkResumeSession() {
      const lastPosition = localStorage.getItem(`${this.storageKey}_last_chapter`);
      if (!lastPosition) return;

      const chapter = this.chapterElements.find(ch => ch.id === lastPosition);
      if (chapter) {
        const toast = createContinueToast(chapter.title, lastPosition);
        document.body.appendChild(toast);

        const continueBtn = toast.querySelector('.tap-continue-btn');
        const dismissBtn = toast.querySelector('.tap-dismiss-btn');

        continueBtn.addEventListener('click', () => {
          chapter.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          toast.remove();
        });

        dismissBtn.addEventListener('click', () => {
          toast.remove();
        });

        setTimeout(() => {
          if (toast.parentNode) {
            toast.style.animation = 'none';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
          }
        }, CONFIG.toastDuration);
      }
    }

    saveProgress() {
      const lastRead = this.chapterElements.filter(ch => ch.read);
      if (lastRead.length > 0) {
        const last = lastRead[lastRead.length - 1];
        localStorage.setItem(`${this.storageKey}_last_chapter`, last.id);
        localStorage.setItem(`${this.storageKey}_chapters_read`, JSON.stringify(
          lastRead.map(ch => ch.id)
        ));
      }
    }

    saveBookmarks() {
      localStorage.setItem(`${this.storageKey}_bookmarks`, JSON.stringify(
        Array.from(this.bookmarkedChapters)
      ));
    }

    loadBookmarks() {
      const saved = localStorage.getItem(`${this.storageKey}_bookmarks`);
      if (saved) {
        this.bookmarkedChapters = new Set(JSON.parse(saved));
      }
    }
  }

  // ==================== Initialize ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const tracker = new GuideProgressTracker();
      tracker.init();
    });
  } else {
    const tracker = new GuideProgressTracker();
    tracker.init();
  }
})();
