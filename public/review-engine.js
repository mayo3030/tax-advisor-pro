/**
 * Tax Return Accuracy Review Engine
 * Comprehensive validation, scoring, and accuracy checking for tax returns
 * Supports bilingual (English/Arabic) output and visual reporting
 *
 * @module TaxReviewEngine
 * @version 1.0.0
 */

(function(global) {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // CORE ENGINE
  // ═══════════════════════════════════════════════════════════════════

  const TaxReviewEngine = {

    /**
     * Main entry point: runs full review on tax data
     * @param {Object} taxData - Complete tax return data object
     * @returns {Object} Review results with score, grade, issues, warnings, tips, summary
     */
    runFullReview(taxData) {
      const issues = [];
      const warnings = [];
      const tips = [];

      // Run all validation checks
      this._checkPersonalInfo(taxData, issues, warnings, tips);
      this._checkW2s(taxData, issues, warnings, tips);
      this._check1099s(taxData, issues, warnings, tips);
      this._checkMathAccuracy(taxData, issues, warnings, tips);
      this._checkDeductions(taxData, issues, warnings, tips);
      this._checkCredits(taxData, issues, warnings, tips);
      this._checkDependents(taxData, issues, warnings, tips);
      this._checkTaxBracket(taxData, issues, warnings, tips);
      this._checkEstimatedTaxes(taxData, issues, warnings, tips);
      this._checkStateSpecific(taxData, issues, warnings, tips);
      this._checkCommonMissedItems(taxData, issues, warnings, tips);

      // Calculate score
      const score = this._calculateScore(issues, warnings, tips);
      const grade = this._getGrade(score);
      const summary = this._generateSummary(score, grade, issues, warnings, tips);

      return {
        score,
        grade,
        issues,
        warnings,
        tips,
        summary,
        timestamp: new Date().toISOString(),
        reviewedFields: this._getReviewedFields(taxData)
      };
    },

    // ───────────────────────────────────────────────────────────────
    // CHECK: PERSONAL INFORMATION
    // ───────────────────────────────────────────────────────────────

    _checkPersonalInfo(taxData, issues, warnings, tips) {
      const personal = taxData.personal || {};

      // Check filing status
      if (!personal.filingStatus) {
        issues.push(this._createIssue({
          id: 'personal_missing_filing_status',
          severity: 'error',
          category: 'personal',
          titleEn: 'Filing Status Required',
          titleAr: 'حالة الضرائب مطلوبة',
          descEn: 'Filing status (Single, Married, Head of Household, etc.) is required for tax calculation.',
          descAr: 'حالة الضرائب (أعزب، متزوج، مسؤول الأسرة، إلخ) مطلوبة لحساب الضرائب.',
          field: 'personal.filingStatus'
        }));
      }

      // Check primary SSN format
      if (personal.ssn) {
        if (!this._isValidSSN(personal.ssn)) {
          issues.push(this._createIssue({
            id: 'personal_invalid_ssn',
            severity: 'error',
            category: 'personal',
            titleEn: 'Invalid SSN Format',
            titleAr: 'صيغة الرقم الضريبي غير صحيحة',
            descEn: 'Social Security Number must be in XXX-XX-XXXX format.',
            descAr: 'رقم الضمان الاجتماعي يجب أن يكون بصيغة XXX-XX-XXXX.',
            field: 'personal.ssn'
          }));
        }
      } else {
        issues.push(this._createIssue({
          id: 'personal_missing_ssn',
          severity: 'error',
          category: 'personal',
          titleEn: 'Missing Primary SSN',
          titleAr: 'رقم الضمان الاجتماعي الأساسي مفقود',
          descEn: 'Your Social Security Number is required to file.',
          descAr: 'رقم الضمان الاجتماعي الخاص بك مطلوب للتقديم.',
          field: 'personal.ssn'
        }));
      }

      // Check spouse SSN if married
      if (personal.filingStatus === 'married_filing_joint' || personal.filingStatus === 'married_filing_separate') {
        if (!personal.spouseSsn) {
          issues.push(this._createIssue({
            id: 'personal_missing_spouse_ssn',
            severity: 'error',
            category: 'personal',
            titleEn: 'Missing Spouse SSN',
            titleAr: 'رقم ضمان الزوج/الزوجة مفقود',
            descEn: 'Spouse Social Security Number is required for joint filing.',
            descAr: 'رقم ضمان الزوج/الزوجة مطلوب للتقديم المشترك.',
            field: 'personal.spouseSsn'
          }));
        } else if (!this._isValidSSN(personal.spouseSsn)) {
          issues.push(this._createIssue({
            id: 'personal_invalid_spouse_ssn',
            severity: 'error',
            category: 'personal',
            titleEn: 'Invalid Spouse SSN Format',
            titleAr: 'صيغة رقم ضمان الزوج/الزوجة غير صحيحة',
            descEn: 'Spouse SSN must be in XXX-XX-XXXX format.',
            descAr: 'رقم ضمان الزوج/الزوجة يجب أن يكون بصيغة XXX-XX-XXXX.',
            field: 'personal.spouseSsn'
          }));
        }
      }

      // Check ITIN format if applicable
      if (personal.itin && !this._isValidITIN(personal.itin)) {
        issues.push(this._createIssue({
          id: 'personal_invalid_itin',
          severity: 'error',
          category: 'personal',
          titleEn: 'Invalid ITIN Format',
          titleAr: 'صيغة الرقم الضريبي للأجانب غير صحيحة',
          descEn: 'ITIN must be in 9XX-XX-XXXX format.',
          descAr: 'رقم التعريف الضريبي للأجانب يجب أن يكون بصيغة 9XX-XX-XXXX.',
          field: 'personal.itin'
        }));
      }

      // Check first name
      if (!personal.firstName) {
        issues.push(this._createIssue({
          id: 'personal_missing_first_name',
          severity: 'error',
          category: 'personal',
          titleEn: 'Missing First Name',
          titleAr: 'الاسم الأول مفقود',
          descEn: 'First name is required.',
          descAr: 'الاسم الأول مطلوب.',
          field: 'personal.firstName'
        }));
      }

      // Check last name
      if (!personal.lastName) {
        issues.push(this._createIssue({
          id: 'personal_missing_last_name',
          severity: 'error',
          category: 'personal',
          titleEn: 'Missing Last Name',
          titleAr: 'اسم العائلة مفقود',
          descEn: 'Last name is required.',
          descAr: 'اسم العائلة مطلوب.',
          field: 'personal.lastName'
        }));
      }

      // Check address
      if (!personal.address || personal.address.trim() === '') {
        warnings.push(this._createIssue({
          id: 'personal_missing_address',
          severity: 'warning',
          category: 'personal',
          titleEn: 'Address Not Provided',
          titleAr: 'لم يتم تقديم العنوان',
          descEn: 'A valid address is recommended for your tax file.',
          descAr: 'يُنصح بتقديم عنوان صحيح لملفك الضريبي.',
          field: 'personal.address'
        }));
      }

      // Check state
      if (!personal.state) {
        warnings.push(this._createIssue({
          id: 'personal_missing_state',
          severity: 'warning',
          category: 'personal',
          titleEn: 'State Not Selected',
          titleAr: 'لم يتم اختيار الولاية',
          descEn: 'Selecting your state enables state-specific tax checks.',
          descAr: 'اختيار ولايتك يتيح فحوصات ضريبية خاصة بالولاية.',
          field: 'personal.state'
        }));
      }
    },

    // ───────────────────────────────────────────────────────────────
    // CHECK: W-2 INCOME
    // ───────────────────────────────────────────────────────────────

    _checkW2s(taxData, issues, warnings, tips) {
      const w2s = taxData.w2s || [];

      if (w2s.length === 0) {
        warnings.push(this._createIssue({
          id: 'w2_no_w2s_provided',
          severity: 'warning',
          category: 'income',
          titleEn: 'No W-2 Income Reported',
          titleAr: 'لم يتم الإبلاغ عن دخل W-2',
          descEn: 'If you had employment income, enter at least one W-2.',
          descAr: 'إذا كان لديك دخل من التوظيف، أدخل W-2 واحد على الأقل.',
          field: 'w2s'
        }));
        return;
      }

      w2s.forEach((w2, idx) => {
        // Check employer name
        if (!w2.employer || w2.employer.trim() === '') {
          issues.push(this._createIssue({
            id: 'w2_missing_employer',
            severity: 'error',
            category: 'income',
            titleEn: `W-2 #${idx + 1}: Missing Employer Name`,
            titleAr: `W-2 #${idx + 1}: اسم صاحب العمل مفقود`,
            descEn: 'Employer name is required for each W-2.',
            descAr: 'اسم صاحب العمل مطلوب لكل W-2.',
            field: `w2.${idx}.employer`
          }));
        }

        // Check EIN format
        if (w2.ein && !this._isValidEIN(w2.ein)) {
          issues.push(this._createIssue({
            id: 'w2_invalid_ein',
            severity: 'warning',
            category: 'income',
            titleEn: `W-2 #${idx + 1}: Invalid EIN Format`,
            titleAr: `W-2 #${idx + 1}: صيغة EIN غير صحيحة`,
            descEn: 'Employer ID (EIN) should be in XX-XXXXXXX format.',
            descAr: 'معرّف صاحب العمل (EIN) يجب أن يكون بصيغة XX-XXXXXXX.',
            field: `w2.${idx}.ein`
          }));
        } else if (!w2.ein) {
          warnings.push(this._createIssue({
            id: 'w2_missing_ein',
            severity: 'warning',
            category: 'income',
            titleEn: `W-2 #${idx + 1}: Missing EIN`,
            titleAr: `W-2 #${idx + 1}: معرّف صاحب العمل مفقود`,
            descEn: 'Employer Identification Number (EIN) is helpful for verification.',
            descAr: 'رقم تعريف صاحب العمل (EIN) مفيد للتحقق.',
            field: `w2.${idx}.ein`
          }));
        }

        // Check wages
        const wages = parseFloat(w2.wages) || 0;
        if (wages <= 0) {
          issues.push(this._createIssue({
            id: 'w2_zero_wages',
            severity: 'error',
            category: 'income',
            titleEn: `W-2 #${idx + 1}: Zero or Missing Wages`,
            titleAr: `W-2 #${idx + 1}: أجور صفر أو مفقودة`,
            descEn: 'W-2 wages must be greater than zero.',
            descAr: 'أجور W-2 يجب أن تكون أكبر من صفر.',
            field: `w2.${idx}.wages`
          }));
        }

        // Check federal withholding reasonableness
        const fedTax = parseFloat(w2.fedTax) || 0;
        const witholdingRate = wages > 0 ? (fedTax / wages) : 0;
        if (witholdingRate > 0.35) {
          warnings.push(this._createIssue({
            id: 'w2_high_withholding',
            severity: 'warning',
            category: 'income',
            titleEn: `W-2 #${idx + 1}: High Federal Withholding`,
            titleAr: `W-2 #${idx + 1}: احتجاز فيدرالي مرتفع`,
            descEn: `Federal withholding is ${(witholdingRate * 100).toFixed(1)}% of wages. Consider adjusting W-4 for potential refund.`,
            descAr: `الاحتجاز الفيدرالي هو ${(witholdingRate * 100).toFixed(1)}% من الأجور. فكر في تعديل W-4 للحصول على استرجاع محتمل.`,
            field: `w2.${idx}.fedTax`
          }));
        }

        // Check Social Security wages
        const ssWages = parseFloat(w2.ssWages) || 0;
        if (ssWages > 0 && ssWages < wages * 0.8) {
          warnings.push(this._createIssue({
            id: 'w2_low_ss_wages',
            severity: 'warning',
            category: 'income',
            titleEn: `W-2 #${idx + 1}: Low Social Security Wages`,
            titleAr: `W-2 #${idx + 1}: أجور الضمان الاجتماعي منخفضة`,
            descEn: 'Social Security wages are significantly lower than total wages. Verify with employer.',
            descAr: 'أجور الضمان الاجتماعي أقل بكثير من إجمالي الأجور. تحقق مع صاحب العمل.',
            field: `w2.${idx}.ssWages`
          }));
        }

        // Check Medicare wages
        const medicareWages = parseFloat(w2.medicareWages) || 0;
        if (medicareWages > 0 && Math.abs(medicareWages - wages) > wages * 0.1) {
          warnings.push(this._createIssue({
            id: 'w2_medicare_wages_mismatch',
            severity: 'warning',
            category: 'income',
            titleEn: `W-2 #${idx + 1}: Medicare Wages Discrepancy`,
            titleAr: `W-2 #${idx + 1}: تناقض في أجور الرعاية الطبية`,
            descEn: 'Medicare wages differ significantly from total wages. Review for accuracy.',
            descAr: 'أجور الرعاية الطبية تختلف بشكل كبير عن إجمالي الأجور. راجع للتأكد من الدقة.',
            field: `w2.${idx}.medicareWages`
          }));
        }
      });
    },

    // ───────────────────────────────────────────────────────────────
    // CHECK: 1099 INCOME
    // ───────────────────────────────────────────────────────────────

    _check1099s(taxData, issues, warnings, tips) {
      const form1099s = taxData.form1099s || [];

      form1099s.forEach((f1099, idx) => {
        // Check payer name
        if (!f1099.payerName || f1099.payerName.trim() === '') {
          issues.push(this._createIssue({
            id: '1099_missing_payer',
            severity: 'error',
            category: 'income',
            titleEn: `1099 #${idx + 1}: Missing Payer Name`,
            titleAr: `1099 #${idx + 1}: اسم الدافع مفقود`,
            descEn: 'Payer business name is required.',
            descAr: 'اسم الشركة الدافعة مطلوب.',
            field: `form1099.${idx}.payerName`
          }));
        }

        // Check amount
        const amount = parseFloat(f1099.amount) || 0;
        if (amount <= 0) {
          issues.push(this._createIssue({
            id: '1099_zero_amount',
            severity: 'error',
            category: 'income',
            titleEn: `1099 #${idx + 1}: Zero or Missing Amount`,
            titleAr: `1099 #${idx + 1}: المبلغ صفر أو مفقود`,
            descEn: '1099 income amount must be greater than zero.',
            descAr: 'مبلغ دخل 1099 يجب أن يكون أكبر من صفر.',
            field: `form1099.${idx}.amount`
          }));
        }

        // Check for unreported income
        if (amount > 0 && amount < 600) {
          warnings.push(this._createIssue({
            id: '1099_low_amount',
            severity: 'warning',
            category: 'income',
            titleEn: `1099 #${idx + 1}: Income Below $600 Threshold`,
            titleAr: `1099 #${idx + 1}: الدخل أقل من حد الـ $600`,
            descEn: 'While amounts under $600 may not require a 1099, all income must be reported.',
            descAr: 'بينما المبالغ أقل من $600 قد لا تتطلب 1099، يجب الإبلاغ عن كل الدخل.',
            field: `form1099.${idx}.amount`
          }));
        }

        // Check payer EIN
        if (f1099.payerEin && !this._isValidEIN(f1099.payerEin)) {
          warnings.push(this._createIssue({
            id: '1099_invalid_payer_ein',
            severity: 'warning',
            category: 'income',
            titleEn: `1099 #${idx + 1}: Invalid Payer EIN`,
            titleAr: `1099 #${idx + 1}: معرّف الدافع غير صحيح`,
            descEn: 'Payer EIN format appears invalid. Verify with payer.',
            descAr: 'صيغة معرّف الدافع تبدو غير صحيحة. تحقق مع الدافع.',
            field: `form1099.${idx}.payerEin`
          }));
        }
      });

      // Check for self-employment income warning
      if (form1099s.length > 0) {
        const totalSelfEmployment = form1099s.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
        if (totalSelfEmployment > 400) {
          warnings.push(this._createIssue({
            id: '1099_self_employment_taxes',
            severity: 'warning',
            category: 'income',
            titleEn: 'Self-Employment Taxes Required',
            titleAr: 'ضرائب العمل الحر مطلوبة',
            descEn: 'With self-employment income over $400, Schedule C and SE taxes are required.',
            descAr: 'مع دخل العمل الحر أكثر من $400، جدول C وضرائب SE مطلوبة.',
            field: 'form1099s'
          }));
        }
      }
    },

    // ───────────────────────────────────────────────────────────────
    // CHECK: MATH ACCURACY
    // ───────────────────────────────────────────────────────────────

    _checkMathAccuracy(taxData, issues, warnings, tips) {
      const w2s = taxData.w2s || [];
      const form1099s = taxData.form1099s || [];
      const deductions = taxData.deductions || {};
      const personal = taxData.personal || {};

      // Calculate W-2 total
      const w2Total = w2s.reduce((sum, w2) => sum + (parseFloat(w2.wages) || 0), 0);

      // Calculate 1099 total
      const form1099Total = form1099s.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);

      // Check income total matches sum
      const reportedIncome = parseFloat(taxData.totalIncome) || 0;
      const calculatedIncome = w2Total + form1099Total;

      if (Math.abs(reportedIncome - calculatedIncome) > 0.01) {
        issues.push(this._createIssue({
          id: 'math_income_mismatch',
          severity: 'error',
          category: 'math',
          titleEn: 'Income Total Mismatch',
          titleAr: 'عدم تطابق إجمالي الدخل',
          descEn: `Reported total ($${reportedIncome.toFixed(2)}) doesn't match sum of W-2s and 1099s ($${calculatedIncome.toFixed(2)}).`,
          descAr: `الإجمالي المبلغ عنه ($${reportedIncome.toFixed(2)}) لا يطابق مجموع W-2s و1099s ($${calculatedIncome.toFixed(2)}).`,
          field: 'totalIncome',
          autoFix: () => ({ totalIncome: calculatedIncome })
        }));
      }

      // Check standard vs itemized deduction decision
      const standardDed = this._getStandardDeduction(personal.filingStatus, personal.age || 0);
      const itemizedDed = parseFloat(deductions.itemized) || 0;

      if (itemizedDed > 0 && itemizedDed < standardDed) {
        tips.push(this._createIssue({
          id: 'math_suboptimal_deduction',
          severity: 'tip',
          category: 'deductions',
          titleEn: 'Consider Standard Deduction',
          titleAr: 'فكر في الخصم الموحد',
          descEn: `Your standard deduction ($${standardDed.toFixed(2)}) exceeds your itemized deductions ($${itemizedDed.toFixed(2)}). Use standard deduction instead to save taxes.`,
          descAr: `خصمك الموحد ($${standardDed.toFixed(2)}) يتجاوز خصماتك المفصلة ($${itemizedDed.toFixed(2)}). استخدم الخصم الموحد لتوفير الضرائب.`,
          field: 'deductions.itemized'
        }));
      }

      // Check withholding calculation
      const totalFedWithheld = w2s.reduce((sum, w2) => sum + (parseFloat(w2.fedTax) || 0), 0);
      if (totalFedWithheld === 0 && calculateTaxableIncome(taxData) > 12000) {
        warnings.push(this._createIssue({
          id: 'math_zero_withholding',
          severity: 'warning',
          category: 'math',
          titleEn: 'No Federal Withholding',
          titleAr: 'لا يوجد احتجاز فيدرالي',
          descEn: 'You had taxable income but no federal tax was withheld. You may owe taxes.',
          descAr: 'كان لديك دخل خاضع للضريبة ولم يتم احتجاز أي ضرائب فيدرالية. قد تكون مدين بالضرائب.',
          field: 'w2s'
        }));
      }
    },

    // ───────────────────────────────────────────────────────────────
    // CHECK: DEDUCTIONS
    // ───────────────────────────────────────────────────────────────

    _checkDeductions(taxData, issues, warnings, tips) {
      const deductions = taxData.deductions || {};
      const w2s = taxData.w2s || [];

      // Check standard vs itemized choice
      const personal = taxData.personal || {};
      const standardDed = this._getStandardDeduction(personal.filingStatus, personal.age || 0);

      if (!deductions.deductionType) {
        warnings.push(this._createIssue({
          id: 'ded_no_type_selected',
          severity: 'warning',
          category: 'deductions',
          titleEn: 'Deduction Type Not Selected',
          titleAr: 'نوع الخصم لم يتم اختياره',
          descEn: 'Specify whether you claim standard or itemized deductions.',
          descAr: 'حدد ما إذا كنت تطالب بخصومات موحدة أو مفصلة.',
          field: 'deductions.deductionType'
        }));
      }

      // Check for mortgage interest
      if (!deductions.mortgageInterest && (deductions.homeValue || 0) > 0) {
        tips.push(this._createIssue({
          id: 'ded_missing_mortgage_interest',
          severity: 'tip',
          category: 'deductions',
          titleEn: 'Possible Mortgage Interest Deduction',
          titleAr: 'خصم فائدة الرهن العقاري المحتمل',
          descEn: 'If you have a mortgage, you may be able to deduct interest. Verify with your lender.',
          descAr: 'إذا كان لديك رهن عقاري، قد تتمكن من خصم الفائدة. تحقق مع المُقرض.',
          field: 'deductions.mortgageInterest'
        }));
      }

      // Check for property tax deduction
      if (!deductions.propertyTax && (deductions.homeValue || 0) > 0) {
        tips.push(this._createIssue({
          id: 'ded_missing_property_tax',
          severity: 'tip',
          category: 'deductions',
          titleEn: 'Possible Property Tax Deduction',
          titleAr: 'خصم ضريبة الملكية المحتمل',
          descEn: 'Property taxes up to $10,000 (SALT cap) may be deductible.',
          descAr: 'قد تكون ضرائب الملكية حتى $10,000 (حد SALT) قابلة للخصم.',
          field: 'deductions.propertyTax'
        }));
      }

      // Check student loan interest
      if (!deductions.studentLoanInterest) {
        tips.push(this._createIssue({
          id: 'ded_missing_student_loan',
          severity: 'tip',
          category: 'deductions',
          titleEn: 'Check for Student Loan Interest Deduction',
          titleAr: 'تحقق من خصم فائدة القرض الطلابي',
          descEn: 'Up to $2,500 of student loan interest may be deductible (subject to income limits).',
          descAr: 'قد يكون حتى $2,500 من فائدة القرض الطلابي قابلة للخصم (تخضع لحدود الدخل).',
          field: 'deductions.studentLoanInterest'
        }));
      }

      // Check educator expenses
      if (w2s.length > 0 && !deductions.educatorExpenses) {
        tips.push(this._createIssue({
          id: 'ded_missing_educator_expenses',
          severity: 'tip',
          category: 'deductions',
          titleEn: 'Educator Expenses (K-12)',
          titleAr: 'نفقات المعلمين (K-12)',
          descEn: 'K-12 educators can deduct up to $300 in unreimbursed classroom supplies.',
          descAr: 'معلمو K-12 يمكنهم خصم ما يصل إلى $300 من مستلزمات الفصل غير المعاد.',
          field: 'deductions.educatorExpenses'
        }));
      }

      // Check charitable contributions
      if (!deductions.charitableDonations) {
        tips.push(this._createIssue({
          id: 'ded_missing_charitable',
          severity: 'tip',
          category: 'deductions',
          titleEn: 'Charitable Contributions',
          titleAr: 'التبرعات الخيرية',
          descEn: 'Don\'t forget to include cash donations, clothing, and household items to qualified charities.',
          descAr: 'لا تنس تضمين التبرعات النقدية والملابس والعناصر المنزلية للجمعيات الخيرية المؤهلة.',
          field: 'deductions.charitableDonations'
        }));
      }

      // Check HSA contributions
      if (!deductions.hsaContributions) {
        tips.push(this._createIssue({
          id: 'ded_missing_hsa',
          severity: 'tip',
          category: 'deductions',
          titleEn: 'Health Savings Account (HSA)',
          titleAr: 'حساب الادخار الصحي (HSA)',
          descEn: 'HSA contributions may be deductible above-the-line. Check if you have a qualified high-deductible health plan.',
          descAr: 'قد تكون مساهمات HSA قابلة للخصم أعلى من الخط. تحقق إذا كان لديك خطة صحية ذات قابلية استقطاع عالية مؤهلة.',
          field: 'deductions.hsaContributions'
        }));
      }

      // Check for excessive deductions
      const totalItemized = [
        parseFloat(deductions.mortgageInterest) || 0,
        parseFloat(deductions.propertyTax) || 0,
        parseFloat(deductions.charitableDonations) || 0
      ].reduce((a, b) => a + b, 0);

      if (totalItemized > 100000) {
        warnings.push(this._createIssue({
          id: 'ded_unusually_high',
          severity: 'warning',
          category: 'deductions',
          titleEn: 'Very High Itemized Deductions',
          titleAr: 'خصومات مفصلة عالية جداً',
          descEn: `Your itemized deductions ($${totalItemized.toFixed(2)}) are unusually high. Double-check for errors.`,
          descAr: `خصماتك المفصلة ($${totalItemized.toFixed(2)}) عالية جداً. تحقق من الأخطاء.`,
          field: 'deductions'
        }));
      }
    },

    // ───────────────────────────────────────────────────────────────
    // CHECK: TAX CREDITS
    // ───────────────────────────────────────────────────────────────

    _checkCredits(taxData, issues, warnings, tips) {
      const credits = taxData.credits || {};
      const personal = taxData.personal || {};
      const dependents = taxData.dependents || [];

      // Check EITC eligibility
      const grossIncome = parseFloat(taxData.totalIncome) || 0;
      if (grossIncome > 0 && grossIncome < 60000 && !credits.eitc) {
        tips.push(this._createIssue({
          id: 'credit_missing_eitc',
          severity: 'tip',
          category: 'credits',
          titleEn: 'Earned Income Tax Credit (EITC)',
          titleAr: 'ائتمان الدخل المكتسب (EITC)',
          descEn: 'You may qualify for the EITC. This is a valuable refundable credit.',
          descAr: 'قد تكون مؤهلاً لـ EITC. هذا رصيد مرن قيم.',
          field: 'credits.eitc'
        }));
      }

      // Check Child Tax Credit
      if (dependents.length > 0 && !credits.childTaxCredit) {
        tips.push(this._createIssue({
          id: 'credit_missing_child',
          severity: 'tip',
          category: 'credits',
          titleEn: 'Child Tax Credit',
          titleAr: 'ائتمان الطفل الضريبي',
          descEn: 'With qualifying children, you may claim $2,000 per child (2024).',
          descAr: 'مع الأطفال المؤهلين، قد تطالب بـ $2,000 لكل طفل (2024).',
          field: 'credits.childTaxCredit'
        }));
      }

      // Check CTC payment status
      if (credits.childTaxCredit && !credits.ctcPaymentReceived) {
        warnings.push(this._createIssue({
          id: 'credit_ctc_payment_not_tracked',
          severity: 'warning',
          category: 'credits',
          titleEn: 'CTC Advance Payments Not Noted',
          titleAr: 'مدفوعات CTC المسبقة لم تُلاحظ',
          descEn: 'Did you receive advance Child Tax Credit payments in 2024? This affects your calculation.',
          descAr: 'هل تلقيت مدفوعات مسبقة لائتمان الطفل الضريبي في 2024؟ هذا يؤثر على حسابك.',
          field: 'credits.ctcPaymentReceived'
        }));
      }

      // Check adoption credit
      if (credits.adoptionExpenses && parseFloat(credits.adoptionExpenses) > 0) {
        tips.push(this._createIssue({
          id: 'credit_adoption',
          severity: 'tip',
          category: 'credits',
          titleEn: 'Adoption Credit Claimed',
          titleAr: 'رصيد التبني المطالب به',
          descEn: 'Verify adoption expenses are from a qualified adoption. Keep all documentation.',
          descAr: 'تحقق من أن نفقات التبني من تبني مؤهل. احتفظ بجميع الوثائق.',
          field: 'credits.adoptionExpenses'
        }));
      }

      // Check education credits
      if (!credits.aotc && !credits.llc) {
        tips.push(this._createIssue({
          id: 'credit_missing_education',
          severity: 'tip',
          category: 'credits',
          titleEn: 'Education Credits',
          titleAr: 'الائتمانات التعليمية',
          descEn: 'Do you have qualified education expenses? AOTC or LLC may apply.',
          descAr: 'هل لديك نفقات تعليمية مؤهلة؟ قد ينطبق AOTC أو LLC.',
          field: 'credits'
        }));
      }

      // Check dependent care credit
      if (credits.dependentCareExpenses && parseFloat(credits.dependentCareExpenses) > 0) {
        if (!credits.dependentCareCredit) {
          tips.push(this._createIssue({
            id: 'credit_missing_dependent_care',
            severity: 'tip',
            category: 'credits',
            titleEn: 'Dependent Care Credit',
            titleAr: 'رصيد رعاية المعالين',
            descEn: 'With dependent care expenses, you may qualify for Form 2441 credit.',
            descAr: 'مع نفقات رعاية المعالين، قد تكون مؤهلاً لرصيد النموذج 2441.',
            field: 'credits.dependentCareCredit'
          }));
        }
      }

      // Check Saver's Credit
      if (grossIncome < 70000 && !credits.saversCredit) {
        tips.push(this._createIssue({
          id: 'credit_missing_savers',
          severity: 'tip',
          category: 'credits',
          titleEn: 'Saver\'s Credit',
          titleAr: 'رصيد المدخر',
          descEn: 'Lower-income savers may qualify for the Retirement Savings Contributions Credit.',
          descAr: 'قد يكون المدخرون ذوو الدخل المنخفض مؤهلين لائتمان مساهمات الادخار للتقاعد.',
          field: 'credits.saversCredit'
        }));
      }
    },

    // ───────────────────────────────────────────────────────────────
    // CHECK: DEPENDENTS
    // ───────────────────────────────────────────────────────────────

    _checkDependents(taxData, issues, warnings, tips) {
      const dependents = taxData.dependents || [];

      dependents.forEach((dep, idx) => {
        // Check dependent SSN
        if (!dep.ssn) {
          issues.push(this._createIssue({
            id: 'dep_missing_ssn',
            severity: 'error',
            category: 'personal',
            titleEn: `Dependent #${idx + 1}: Missing SSN`,
            titleAr: `المعال #${idx + 1}: رقم الضمان الاجتماعي مفقود`,
            descEn: 'Social Security Number is required for all dependents.',
            descAr: 'رقم الضمان الاجتماعي مطلوب لجميع المعالين.',
            field: `dependents.${idx}.ssn`
          }));
        } else if (!this._isValidSSN(dep.ssn)) {
          issues.push(this._createIssue({
            id: 'dep_invalid_ssn',
            severity: 'error',
            category: 'personal',
            titleEn: `Dependent #${idx + 1}: Invalid SSN Format`,
            titleAr: `المعال #${idx + 1}: صيغة SSN غير صحيحة`,
            descEn: 'Dependent SSN must be in XXX-XX-XXXX format.',
            descAr: 'رقم ضمان المعال يجب أن يكون بصيغة XXX-XX-XXXX.',
            field: `dependents.${idx}.ssn`
          }));
        }

        // Check dependent name
        if (!dep.firstName || !dep.lastName) {
          issues.push(this._createIssue({
            id: 'dep_missing_name',
            severity: 'error',
            category: 'personal',
            titleEn: `Dependent #${idx + 1}: Missing Name`,
            titleAr: `المعال #${idx + 1}: الاسم مفقود`,
            descEn: 'Full name (first and last) is required for all dependents.',
            descAr: 'الاسم الكامل (الأول والأخير) مطلوب لجميع المعالين.',
            field: `dependents.${idx}.firstName`
          }));
        }

        // Check age for qualifying child claims
        const age = parseInt(dep.age) || 0;
        if (age > 17 && dep.relationship === 'child') {
          warnings.push(this._createIssue({
            id: 'dep_child_too_old',
            severity: 'warning',
            category: 'personal',
            titleEn: `Dependent #${idx + 1}: Child Over Age 17`,
            titleAr: `المعال #${idx + 1}: الطفل أكبر من 17 سنة`,
            descEn: 'Child Tax Credit applies only to children under 17. Dependent exemption may still apply.',
            descAr: 'ينطبق ائتمان الطفل الضريبي فقط على الأطفال دون 17 سنة. قد ينطبق الاستثناء المعال.',
            field: `dependents.${idx}.age`
          }));
        }

        // Check relationship type
        if (!dep.relationship) {
          warnings.push(this._createIssue({
            id: 'dep_missing_relationship',
            severity: 'warning',
            category: 'personal',
            titleEn: `Dependent #${idx + 1}: Relationship Not Specified`,
            titleAr: `المعال #${idx + 1}: العلاقة لم تُحدد`,
            descEn: 'Specify relationship (child, parent, sibling, etc.) for dependent qualification.',
            descAr: 'حدد العلاقة (طفل، والد، أخ، إلخ) لمؤهلات المعال.',
            field: `dependents.${idx}.relationship`
          }));
        }

        // Check months lived in US
        if (dep.monthsInUS < 0 || dep.monthsInUS > 12) {
          issues.push(this._createIssue({
            id: 'dep_invalid_months_us',
            severity: 'error',
            category: 'personal',
            titleEn: `Dependent #${idx + 1}: Invalid US Residence Months`,
            titleAr: `المعال #${idx + 1}: أشهر الإقامة في الولايات المتحدة غير صحيحة`,
            descEn: 'Months in US must be between 0 and 12.',
            descAr: 'يجب أن تكون أشهر الإقامة في الولايات المتحدة بين 0 و 12.',
            field: `dependents.${idx}.monthsInUS`
          }));
        }
      });
    },

    // ───────────────────────────────────────────────────────────────
    // CHECK: TAX BRACKET & LIABILITY
    // ───────────────────────────────────────────────────────────────

    _checkTaxBracket(taxData, issues, warnings, tips) {
      const personal = taxData.personal || {};
      const taxableIncome = calculateTaxableIncome(taxData);

      if (taxableIncome <= 0) {
        return; // No tax liability
      }

      const brackets = this._getTaxBrackets(personal.filingStatus, 2024);
      let estimatedTax = 0;

      // Calculate estimated tax based on brackets
      let previousLimit = 0;
      for (const bracket of brackets) {
        if (taxableIncome > previousLimit) {
          const incomeInBracket = Math.min(taxableIncome, bracket.limit) - previousLimit;
          estimatedTax += incomeInBracket * bracket.rate;
          previousLimit = bracket.limit;
        }
      }

      // Check if enough tax was withheld
      const w2s = taxData.w2s || [];
      const totalWithheld = w2s.reduce((sum, w2) => sum + (parseFloat(w2.fedTax) || 0), 0);
      const estimatedPayments = parseFloat(taxData.estimatedTaxPayments) || 0;
      const totalPayments = totalWithheld + estimatedPayments;

      if (totalPayments < estimatedTax && estimatedTax - totalPayments > 100) {
        warnings.push(this._createIssue({
          id: 'bracket_underpayment',
          severity: 'warning',
          category: 'math',
          titleEn: 'Potential Underpayment',
          titleAr: 'دفع ناقص محتمل',
          descEn: `Estimated tax is $${estimatedTax.toFixed(2)} but only $${totalPayments.toFixed(2)} withheld. You may owe.`,
          descAr: `الضريبة المقدرة هي $${estimatedTax.toFixed(2)} لكن تم احتجاز $${totalPayments.toFixed(2)} فقط. قد تكون مدين.`,
          field: 'totalIncome'
        }));
      }

      if (totalPayments > estimatedTax && totalPayments - estimatedTax > 100) {
        tips.push(this._createIssue({
          id: 'bracket_overpayment',
          severity: 'tip',
          category: 'math',
          titleEn: 'Potential Refund',
          titleAr: 'استرجاع محتمل',
          descEn: `You may be due a refund of approximately $${(totalPayments - estimatedTax).toFixed(2)}.`,
          descAr: `قد تكون مستحقاً لك استرجاع بمبلغ يقارب $${(totalPayments - estimatedTax).toFixed(2)}.`,
          field: 'totalIncome'
        }));
      }
    },

    // ───────────────────────────────────────────────────────────────
    // CHECK: ESTIMATED TAXES
    // ───────────────────────────────────────────────────────────────

    _checkEstimatedTaxes(taxData, issues, warnings, tips) {
      const form1099s = taxData.form1099s || [];
      const estimatedPayments = parseFloat(taxData.estimatedTaxPayments) || 0;

      if (form1099s.length === 0) {
        return; // No self-employment income, skip
      }

      const totalSelfEmployment = form1099s.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
      if (totalSelfEmployment < 400) {
        return; // Below threshold
      }

      // Rough self-employment tax calculation
      const netSE = totalSelfEmployment * 0.9235;
      const seTax = netSE * 0.153;
      const estimatedIncomeTax = (totalSelfEmployment * 0.15); // Rough estimate

      const totalEstimatedTax = seTax + estimatedIncomeTax;

      if (estimatedPayments === 0 && totalEstimatedTax > 1000) {
        warnings.push(this._createIssue({
          id: 'est_no_estimated_payments',
          severity: 'warning',
          category: 'math',
          titleEn: 'No Estimated Tax Payments',
          titleAr: 'لا توجد مدفوعات ضرائب مقدرة',
          descEn: `With $${totalSelfEmployment.toFixed(2)} in self-employment income, estimated tax payments may be required.`,
          descAr: `مع $${totalSelfEmployment.toFixed(2)} من دخل العمل الحر، قد تكون مدفوعات الضرائب المقدرة مطلوبة.`,
          field: 'estimatedTaxPayments'
        }));
      }

      // Check for underpayment penalty risk
      if (estimatedPayments > 0 && estimatedPayments < totalEstimatedTax * 0.9) {
        warnings.push(this._createIssue({
          id: 'est_underpayment_penalty',
          severity: 'warning',
          category: 'math',
          titleEn: 'Possible Underpayment Penalty',
          titleAr: 'عقوبة دفع ناقص محتملة',
          descEn: 'Your estimated payments may be insufficient, risking an underpayment penalty.',
          descAr: 'قد تكون مدفوعاتك المقدرة غير كافية، مما يعرضك لخطر عقوبة الدفع الناقص.',
          field: 'estimatedTaxPayments'
        }));
      }
    },

    // ───────────────────────────────────────────────────────────────
    // CHECK: STATE-SPECIFIC RULES
    // ───────────────────────────────────────────────────────────────

    _checkStateSpecific(taxData, issues, warnings, tips) {
      const personal = taxData.personal || {};
      const state = personal.state || '';

      // No state selected
      if (!state) {
        return;
      }

      const stateRules = {
        'NY': this._checkNY,
        'NJ': this._checkNJ,
        'CA': this._checkCA,
        'TX': this._checkTX,
        'FL': this._checkFL,
        'IL': this._checkIL,
        'PA': this._checkPA,
        'OH': this._checkOH,
        'MI': this._checkMI,
        'GA': this._checkGA,
        'NC': this._checkNC,
        'VA': this._checkVA,
        'WA': this._checkWA
      };

      if (stateRules[state]) {
        stateRules[state].call(this, taxData, issues, warnings, tips);
      }
    },

    _checkNY(taxData, issues, warnings, tips) {
      const personal = taxData.personal || {};
      const w2s = taxData.w2s || [];

      if (w2s.length > 0) {
        tips.push(this._createIssue({
          id: 'state_ny_school_tax_credit',
          severity: 'tip',
          category: 'state',
          titleEn: 'NY School Tax Credit',
          titleAr: 'رصيد ضريبة المدرسة في نيويورك',
          descEn: 'NY residents may qualify for School Tax Credit. Check eligibility based on income.',
          descAr: 'قد يكون سكان نيويورك مؤهلين لرصيد ضريبة المدرسة. تحقق من الأهلية بناءً على الدخل.',
          field: 'personal.state'
        }));
      }
    },

    _checkNJ(taxData, issues, warnings, tips) {
      const personal = taxData.personal || {};
      tips.push(this._createIssue({
        id: 'state_nj_earned_income_credit',
        severity: 'tip',
        category: 'state',
        titleEn: 'NJ Earned Income Tax Credit',
        titleAr: 'رصيد ضريبة الدخل المكتسب في نيوجيرسي',
        descEn: 'NJ residents may qualify for state EITC. File NJ-1040 along with federal return.',
        descAr: 'قد يكون سكان نيوجيرسي مؤهلين لرصيد الضريبة الحكومية. قدم NJ-1040 مع الإقرار الفيدرالي.',
        field: 'personal.state'
      }));
    },

    _checkCA(taxData, issues, warnings, tips) {
      const personal = taxData.personal || {};
      const grossIncome = parseFloat(taxData.totalIncome) || 0;

      if (grossIncome > 0) {
        tips.push(this._createIssue({
          id: 'state_ca_filing_requirement',
          severity: 'tip',
          category: 'state',
          titleEn: 'CA State Income Tax Return',
          titleAr: 'إقرار ضريبة الدخل بولاية كاليفورنيا',
          descEn: 'CA residents with income must file Form 540. Ensure proper state withholding.',
          descAr: 'يجب على سكان كاليفورنيا ذوي الدخل تقديم نموذج 540. تأكد من الاحتجاز الصحيح للولاية.',
          field: 'personal.state'
        }));
      }
    },

    _checkTX(taxData, issues, warnings, tips) {
      tips.push(this._createIssue({
        id: 'state_tx_no_income_tax',
        severity: 'tip',
        category: 'state',
        titleEn: 'Texas: No State Income Tax',
        titleAr: 'تكساس: لا توجد ضريبة دخل محلية',
        descEn: 'TX has no state income tax. You only need to file federal return.',
        descAr: 'تكساس ليس لديها ضريبة دخل محلية. تحتاج فقط لتقديم الإقرار الفيدرالي.',
        field: 'personal.state'
      }));
    },

    _checkFL(taxData, issues, warnings, tips) {
      tips.push(this._createIssue({
        id: 'state_fl_no_income_tax',
        severity: 'tip',
        category: 'state',
        titleEn: 'Florida: No State Income Tax',
        titleAr: 'فلوريدا: لا توجد ضريبة دخل محلية',
        descEn: 'FL has no state income tax. You only need to file federal return.',
        descAr: 'فلوريدا ليس لديها ضريبة دخل محلية. تحتاج فقط لتقديم الإقرار الفيدرالي.',
        field: 'personal.state'
      }));
    },

    _checkIL(taxData, issues, warnings, tips) {
      const w2s = taxData.w2s || [];
      if (w2s.length > 0) {
        tips.push(this._createIssue({
          id: 'state_il_income_tax',
          severity: 'tip',
          category: 'state',
          titleEn: 'IL Flat Income Tax',
          titleAr: 'ضريبة الدخل الثابتة في إيلينوي',
          descEn: 'IL has flat 4.95% income tax. File IL-1040 along with federal return.',
          descAr: 'إيلينوي لديها ضريبة دخل ثابتة 4.95%. قدم IL-1040 مع الإقرار الفيدرالي.',
          field: 'personal.state'
        }));
      }
    },

    _checkPA(taxData, issues, warnings, tips) {
      const w2s = taxData.w2s || [];
      if (w2s.length > 0) {
        tips.push(this._createIssue({
          id: 'state_pa_income_tax',
          severity: 'tip',
          category: 'state',
          titleEn: 'PA Income Tax Return',
          titleAr: 'إقرار ضريبة الدخل بولاية بنسلفانيا',
          descEn: 'PA residents must file PA-40 for income tax purposes.',
          descAr: 'يجب على سكان بنسلفانيا تقديم PA-40 لأغراض ضريبة الدخل.',
          field: 'personal.state'
        }));
      }
    },

    _checkOH(taxData, issues, warnings, tips) {
      const w2s = taxData.w2s || [];
      if (w2s.length > 0) {
        tips.push(this._createIssue({
          id: 'state_oh_income_tax',
          severity: 'tip',
          category: 'state',
          titleEn: 'OH State Income Tax',
          titleAr: 'ضريبة الدخل بولاية أوهايو',
          descEn: 'OH residents must file Form IT 1040 for state income tax.',
          descAr: 'يجب على سكان أوهايو تقديم نموذج IT 1040 لضريبة الدخل.',
          field: 'personal.state'
        }));
      }
    },

    _checkMI(taxData, issues, warnings, tips) {
      const w2s = taxData.w2s || [];
      if (w2s.length > 0) {
        tips.push(this._createIssue({
          id: 'state_mi_income_tax',
          severity: 'tip',
          category: 'state',
          titleEn: 'MI State Income Tax',
          titleAr: 'ضريبة الدخل بولاية ميشيغان',
          descEn: 'MI residents must file Form MI-1040 for state income tax.',
          descAr: 'يجب على سكان ميشيغان تقديم نموذج MI-1040 لضريبة الدخل.',
          field: 'personal.state'
        }));
      }
    },

    _checkGA(taxData, issues, warnings, tips) {
      const w2s = taxData.w2s || [];
      if (w2s.length > 0) {
        tips.push(this._createIssue({
          id: 'state_ga_income_tax',
          severity: 'tip',
          category: 'state',
          titleEn: 'GA State Income Tax',
          titleAr: 'ضريبة الدخل بولاية جورجيا',
          descEn: 'GA residents must file Form IT 540 for state income tax.',
          descAr: 'يجب على سكان جورجيا تقديم نموذج IT 540 لضريبة الدخل.',
          field: 'personal.state'
        }));
      }
    },

    _checkNC(taxData, issues, warnings, tips) {
      const w2s = taxData.w2s || [];
      if (w2s.length > 0) {
        tips.push(this._createIssue({
          id: 'state_nc_income_tax',
          severity: 'tip',
          category: 'state',
          titleEn: 'NC State Income Tax',
          titleAr: 'ضريبة الدخل بولاية نورث كارولاينا',
          descEn: 'NC residents must file NC Form D-400 for state income tax.',
          descAr: 'يجب على سكان نورث كارولاينا تقديم نموذج NC D-400 لضريبة الدخل.',
          field: 'personal.state'
        }));
      }
    },

    _checkVA(taxData, issues, warnings, tips) {
      const w2s = taxData.w2s || [];
      if (w2s.length > 0) {
        tips.push(this._createIssue({
          id: 'state_va_income_tax',
          severity: 'tip',
          category: 'state',
          titleEn: 'VA State Income Tax',
          titleAr: 'ضريبة الدخل بولاية فرجينيا',
          descEn: 'VA residents must file VA Form 760 for state income tax.',
          descAr: 'يجب على سكان فرجينيا تقديم نموذج VA 760 لضريبة الدخل.',
          field: 'personal.state'
        }));
      }
    },

    _checkWA(taxData, issues, warnings, tips) {
      tips.push(this._createIssue({
        id: 'state_wa_no_income_tax',
        severity: 'tip',
        category: 'state',
        titleEn: 'Washington: No State Income Tax',
        titleAr: 'واشنطن: لا توجد ضريبة دخل محلية',
        descEn: 'WA has no state income tax. You only need to file federal return.',
        descAr: 'واشنطن ليس لديها ضريبة دخل محلية. تحتاج فقط لتقديم الإقرار الفيدرالي.',
        field: 'personal.state'
      }));
    },

    // ───────────────────────────────────────────────────────────────
    // CHECK: COMMON MISSED ITEMS
    // ───────────────────────────────────────────────────────────────

    _checkCommonMissedItems(taxData, issues, warnings, tips) {
      const form1099s = taxData.form1099s || [];
      const personal = taxData.personal || {};

      // Check for unreported tips/cash income
      if (form1099s.length === 0 && !taxData.otherIncome) {
        tips.push(this._createIssue({
          id: 'common_unreported_income',
          severity: 'tip',
          category: 'income',
          titleEn: 'Unreported Income',
          titleAr: 'دخل غير مبلغ عنه',
          descEn: 'Include all income: tips, cash, Venmo, PayPal, rental income, dividends, interest.',
          descAr: 'أدرج كل الدخل: الإكراميات، النقود، Venmo، PayPal، دخل الإيجار، الأرباح، الفائدة.',
          field: 'form1099s'
        }));
      }

      // Check for business deductions if self-employed
      if (form1099s.length > 0 && !taxData.businessExpenses) {
        tips.push(this._createIssue({
          id: 'common_missing_business_expenses',
          severity: 'tip',
          category: 'deductions',
          titleEn: 'Business Expenses (Schedule C)',
          titleAr: 'نفقات الأعمال (جدول C)',
          descEn: 'Self-employed? Deduct home office, supplies, equipment, vehicle, meals (50%), etc.',
          descAr: 'هل أنت عامل حر؟ خصم مكتب المنزل والمستلزمات والمعدات والسيارة والوجبات (50%)، إلخ.',
          field: 'businessExpenses'
        }));
      }

      // Check for medical/dental expenses
      if (!taxData.medicalExpenses) {
        tips.push(this._createIssue({
          id: 'common_medical_expenses',
          severity: 'tip',
          category: 'deductions',
          titleEn: 'Medical & Dental Expenses',
          titleAr: 'نفقات طبية وأسنان',
          descEn: 'Medical expenses over 7.5% of AGI are deductible. Include insurance premiums, prescriptions, dental.',
          descAr: 'النفقات الطبية التي تتجاوز 7.5% من الدخل الإجمالي قابلة للخصم. أدرج أقساط التأمين والأدوية والأسنان.',
          field: 'medicalExpenses'
        }));
      }

      // Check for tax-loss harvesting
      if (!taxData.capitalGains && personal.netWorth > 100000) {
        tips.push(this._createIssue({
          id: 'common_investment_losses',
          severity: 'tip',
          category: 'deductions',
          titleEn: 'Capital Losses',
          titleAr: 'خسائر رأس المال',
          descEn: 'Capital losses can offset gains and up to $3,000 of ordinary income per year.',
          descAr: 'يمكن لخسائر رأس المال أن تعوض الأرباح وحتى $3,000 من الدخل العادي سنوياً.',
          field: 'capitalGains'
        }));
      }

      // Alimony check
      if (!taxData.alimonyPaid && personal.filingStatus === 'single') {
        tips.push(this._createIssue({
          id: 'common_alimony',
          severity: 'tip',
          category: 'deductions',
          titleEn: 'Alimony Payments',
          titleAr: 'مدفوعات النفقة',
          descEn: 'If you pay alimony per a pre-2019 divorce decree, it may be deductible.',
          descAr: 'إذا كنت تدفع نفقة بموجب قرار طلاق ما قبل 2019، قد تكون قابلة للخصم.',
          field: 'alimonyPaid'
        }));
      }
    },

    // ───────────────────────────────────────────────────────────────
    // SCORING & GRADE CALCULATION
    // ───────────────────────────────────────────────────────────────

    _calculateScore(issues, warnings, tips) {
      // Start at 100
      let score = 100;

      // Deduct for errors
      score -= issues.length * 8;

      // Deduct for warnings
      score -= warnings.length * 3;

      // Add for tips followed (estimate)
      score += Math.min(tips.length, 5); // Max +5 for tips

      // Ensure between 0-100
      return Math.max(0, Math.min(100, score));
    },

    _getGrade(score) {
      if (score >= 90) return 'A';
      if (score >= 80) return 'B';
      if (score >= 70) return 'C';
      if (score >= 60) return 'D';
      return 'F';
    },

    _generateSummary(score, grade, issues, warnings, tips) {
      let en = '';
      let ar = '';

      if (grade === 'A') {
        en = `Excellent! Your tax return is well-organized with only ${issues.length} critical issue(s).`;
        ar = `ممتاز! إقرارك الضريبي منظم جيداً مع ${issues.length} فقط من المشكلة(ات) الحرجة.`;
      } else if (grade === 'B') {
        en = `Good progress! Your return has ${issues.length} issue(s) and ${warnings.length} warning(s). ${tips.length} optimization(s) available.`;
        ar = `تقدم جيد! إقرارك يحتوي على ${issues.length} مشكلة(ات) و ${warnings.length} تحذير(ات). ${tips.length} تحسين(ات) متاحة.`;
      } else if (grade === 'C') {
        en = `Review recommended. Address ${issues.length} error(s) and ${warnings.length} warning(s) before filing.`;
        ar = `الفحص موصى به. عالج ${issues.length} خطأ(أ) و ${warnings.length} تحذير(ات) قبل التقديم.`;
      } else {
        en = `Critical issues found. Please review ${issues.length} error(s) before filing your return.`;
        ar = `تم العثور على مشاكل حرجة. يرجى مراجعة ${issues.length} خطأ(أ) قبل تقديم إقرارك.`;
      }

      return { en, ar };
    },

    _getReviewedFields(taxData) {
      const fields = [];
      if (taxData.personal) fields.push('personal');
      if (taxData.w2s && taxData.w2s.length > 0) fields.push('w2');
      if (taxData.form1099s && taxData.form1099s.length > 0) fields.push('1099');
      if (taxData.deductions) fields.push('deductions');
      if (taxData.credits) fields.push('credits');
      if (taxData.dependents && taxData.dependents.length > 0) fields.push('dependents');
      return fields;
    },

    // ───────────────────────────────────────────────────────────────
    // UTILITY HELPERS
    // ───────────────────────────────────────────────────────────────

    _isValidSSN(ssn) {
      if (!ssn) return false;
      const regex = /^\d{3}-\d{2}-\d{4}$/;
      if (!regex.test(ssn)) return false;
      // Reject all zeros, 666, or 000-00-0000
      if (ssn === '000-00-0000' || ssn === '666-00-0000' || ssn.startsWith('666')) return false;
      return true;
    },

    _isValidITIN(itin) {
      if (!itin) return false;
      const regex = /^9\d{2}-\d{2}-\d{4}$/;
      return regex.test(itin);
    },

    _isValidEIN(ein) {
      if (!ein) return false;
      const regex = /^\d{2}-\d{7}$/;
      return regex.test(ein);
    },

    _getStandardDeduction(filingStatus, age) {
      const deductions2024 = {
        'single': age >= 65 ? 8550 : 14600,
        'married_filing_joint': age >= 65 ? 28700 : 29200,
        'married_filing_separate': age >= 65 ? 14700 : 14600,
        'head_of_household': age >= 65 ? 10950 : 21900,
        'qualifying_widow': 29200
      };
      return deductions2024[filingStatus] || 14600;
    },

    _getTaxBrackets(filingStatus, year) {
      // 2024 tax brackets
      const brackets2024 = {
        'single': [
          { limit: 11600, rate: 0.10 },
          { limit: 47150, rate: 0.12 },
          { limit: 100525, rate: 0.22 },
          { limit: 191950, rate: 0.24 },
          { limit: 243725, rate: 0.32 },
          { limit: 609350, rate: 0.35 },
          { limit: Infinity, rate: 0.37 }
        ],
        'married_filing_joint': [
          { limit: 23200, rate: 0.10 },
          { limit: 94300, rate: 0.12 },
          { limit: 201050, rate: 0.22 },
          { limit: 383900, rate: 0.24 },
          { limit: 487450, rate: 0.32 },
          { limit: 731200, rate: 0.35 },
          { limit: Infinity, rate: 0.37 }
        ],
        'head_of_household': [
          { limit: 16550, rate: 0.10 },
          { limit: 63100, rate: 0.12 },
          { limit: 100500, rate: 0.22 },
          { limit: 191950, rate: 0.24 },
          { limit: 243700, rate: 0.32 },
          { limit: 609350, rate: 0.35 },
          { limit: Infinity, rate: 0.37 }
        ]
      };

      return brackets2024[filingStatus] || brackets2024['single'];
    },

    _createIssue(config) {
      return {
        id: config.id,
        severity: config.severity,
        category: config.category,
        title: {
          en: config.titleEn,
          ar: config.titleAr
        },
        description: {
          en: config.descEn,
          ar: config.descAr
        },
        field: config.field,
        autoFix: config.autoFix || null
      };
    },

    // ───────────────────────────────────────────────────────────────
    // HTML RENDERING
    // ───────────────────────────────────────────────────────────────

    getReviewHTML(results) {
      const { score, grade, issues, warnings, tips, summary } = results;

      // Determine color scheme
      let scoreColor = '#0f5132'; // Green
      let scoreClass = 'grade-a';
      if (score < 80) {
        scoreColor = '#d4a017'; // Yellow
        scoreClass = 'grade-b';
      }
      if (score < 60) {
        scoreColor = '#b03a2e'; // Red
        scoreClass = 'grade-c';
      }

      // Group issues by category
      const byCategory = {
        personal: { icon: '👤', issues: [], warnings: [], tips: [] },
        income: { icon: '💵', issues: [], warnings: [], tips: [] },
        deductions: { icon: '💰', issues: [], warnings: [], tips: [] },
        credits: { icon: '✅', issues: [], warnings: [], tips: [] },
        math: { icon: '🧮', issues: [], warnings: [], tips: [] },
        state: { icon: '🏛️', issues: [], warnings: [], tips: [] }
      };

      issues.forEach(issue => {
        byCategory[issue.category].issues.push(issue);
      });
      warnings.forEach(warning => {
        byCategory[warning.category].warnings.push(warning);
      });
      tips.forEach(tip => {
        byCategory[tip.category].tips.push(tip);
      });

      // Build HTML
      let html = `
        <div class="review-panel ${scoreClass}" style="background: var(--surface); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-md); font-family: var(--font-body); color: var(--text);">

          <!-- Score Header -->
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--border);">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <div style="width: 100px; height: 100px; border-radius: 50%; background: conic-gradient(${scoreColor} ${score}%, var(--border) 0); display: flex; align-items: center; justify-content: center;">
                <div style="width: 90px; height: 90px; border-radius: 50%; background: var(--surface); display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 700;">
                  <div style="font-size: 36px; color: ${scoreColor};">${score}</div>
                  <div style="font-size: 20px; color: ${scoreColor};">${grade}</div>
                </div>
              </div>
            </div>
            <div style="flex: 1;">
              <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: var(--text);">Tax Return Review</h2>
              <p style="margin: 0 0 8px 0; color: var(--text-muted); font-size: 14px;">${summary.en}</p>
              <p style="margin: 0; color: var(--text-muted); font-size: 13px; font-style: italic;">${summary.ar}</p>
            </div>
          </div>

          <!-- Summary Stats -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px;">
            <div style="background: var(--surface-alt); padding: 12px 16px; border-radius: var(--radius-md); text-align: center;">
              <div style="font-size: 20px; font-weight: 700; color: #b03a2e;">${issues.length}</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Critical Issues</div>
            </div>
            <div style="background: var(--surface-alt); padding: 12px 16px; border-radius: var(--radius-md); text-align: center;">
              <div style="font-size: 20px; font-weight: 700; color: #d4a017;">${warnings.length}</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Warnings</div>
            </div>
            <div style="background: var(--surface-alt); padding: 12px 16px; border-radius: var(--radius-md); text-align: center;">
              <div style="font-size: 20px; font-weight: 700; color: #0f5132;">${tips.length}</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Tips</div>
            </div>
          </div>

          <!-- Issues by Category -->
          ${Object.entries(byCategory).filter(([cat, data]) => data.issues.length > 0 || data.warnings.length > 0 || data.tips.length > 0).map(([category, data]) => `
            <div style="margin-bottom: 16px;">
              <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">${data.icon}</span>
                ${this._getCategoryLabel(category)}
              </h3>

              ${data.issues.map(issue => `
                <div style="background: #fff5f5; border-left: 4px solid #b03a2e; padding: 12px 14px; margin-bottom: 8px; border-radius: var(--radius-md); font-size: 13px;">
                  <div style="font-weight: 600; color: #b03a2e; margin-bottom: 4px;">${issue.title.en}</div>
                  <div style="color: var(--text); margin-bottom: 6px; line-height: 1.4;">${issue.description.en}</div>
                  <div style="color: var(--text-muted); font-size: 12px; font-style: italic; margin-bottom: 6px;">${issue.description.ar}</div>
                  ${issue.autoFix ? `<button class="review-fix-btn" onclick="TaxReviewEngine.applyFix('${issue.id}')" style="background: #b03a2e; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: 600;">Fix Issue</button>` : ''}
                </div>
              `).join('')}

              ${data.warnings.map(warning => `
                <div style="background: #fffbf0; border-left: 4px solid #d4a017; padding: 12px 14px; margin-bottom: 8px; border-radius: var(--radius-md); font-size: 13px;">
                  <div style="font-weight: 600; color: #d4a017; margin-bottom: 4px;">⚠️ ${warning.title.en}</div>
                  <div style="color: var(--text); margin-bottom: 6px; line-height: 1.4;">${warning.description.en}</div>
                  <div style="color: var(--text-muted); font-size: 12px; font-style: italic;">${warning.description.ar}</div>
                </div>
              `).join('')}

              ${data.tips.map(tip => `
                <div style="background: #f0f8f5; border-left: 4px solid #0f5132; padding: 12px 14px; margin-bottom: 8px; border-radius: var(--radius-md); font-size: 13px;">
                  <div style="font-weight: 600; color: #0f5132; margin-bottom: 4px;">💡 ${tip.title.en}</div>
                  <div style="color: var(--text); margin-bottom: 6px; line-height: 1.4;">${tip.description.en}</div>
                  <div style="color: var(--text-muted); font-size: 12px; font-style: italic;">${tip.description.ar}</div>
                </div>
              `).join('')}
            </div>
          `).join('')}

          <!-- No Issues Message -->
          ${issues.length === 0 && warnings.length === 0 ? `
            <div style="background: var(--success-light); border-left: 4px solid var(--success); padding: 16px; border-radius: var(--radius-md); text-align: center; color: var(--success);">
              <div style="font-weight: 700; margin-bottom: 4px;">✅ Everything looks great!</div>
              <div style="font-size: 13px; color: var(--text-muted);">Your tax return is clean and ready for filing.</div>
            </div>
          ` : ''}

        </div>
      `;

      return html;
    },

    _getCategoryLabel(cat) {
      const labels = {
        'personal': 'Personal Information',
        'income': 'Income & Earnings',
        'deductions': 'Deductions',
        'credits': 'Tax Credits',
        'math': 'Calculations & Math',
        'state': 'State-Specific'
      };
      return labels[cat] || cat;
    },

    applyFix(issueId) {
      console.log(`Auto-fix applied for: ${issueId}`);
      // In a real implementation, this would update taxData and re-run review
    }
  };

  // Helper function for tax calculations (used internally)
  function calculateTaxableIncome(taxData) {
    const w2s = taxData.w2s || [];
    const form1099s = taxData.form1099s || [];
    const deductions = taxData.deductions || {};
    const personal = taxData.personal || {};

    const w2Total = w2s.reduce((sum, w2) => sum + (parseFloat(w2.wages) || 0), 0);
    const form1099Total = form1099s.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
    const grossIncome = w2Total + form1099Total + (parseFloat(taxData.otherIncome) || 0);

    const standardDed = TaxReviewEngine._getStandardDeduction(personal.filingStatus, personal.age || 0);
    const deductionAmount = deductions.deductionType === 'itemized'
      ? parseFloat(deductions.itemized) || 0
      : standardDed;

    return Math.max(0, grossIncome - deductionAmount);
  }

  // Export to global scope
  global.TaxReviewEngine = TaxReviewEngine;

})(window);
