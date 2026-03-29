(function() {
  'use strict';

  // ============================================================================
  // TAX GLOSSARY SYSTEM - Self-contained IIFE
  // ============================================================================

  const GLOSSARY_DATA = {
    // Core income terms
    'AGI': {
      en: 'Adjusted Gross Income - Your total income minus specific deductions like student loan interest and educator expenses. It determines your eligibility for certain tax credits.',
      ar: 'الدخل الإجمالي المعدّل - إجمالي دخلك مطروحاً منه الخصومات المحددة مثل فائدة قرض الطالب ونفقات المعلم. يحدد أهليتك للحصول على رصيد ضريبي معين.'
    },
    'Gross Income': {
      en: 'All income received from any source before any deductions or adjustments, including wages, interest, dividends, and rental income.',
      ar: 'جميع الدخل المستلم من أي مصدر قبل أي خصومات أو تعديلات، بما في ذلك الأجور والفائدة والأرباح والدخل الإيجاري.'
    },
    'Net Income': {
      en: 'Income remaining after all business expenses, deductions, and taxes have been subtracted from gross income.',
      ar: 'الدخل المتبقي بعد خصم جميع نفقات الأعمال والخصومات والضرائب من الدخل الإجمالي.'
    },
    'Taxable Income': {
      en: 'The amount of income that is subject to income tax after all applicable deductions and exemptions have been applied.',
      ar: 'مبلغ الدخل الذي يخضع لضريبة الدخل بعد تطبيق جميع الخصومات والإعفاءات المنطبقة.'
    },

    // Forms
    'W-2': {
      en: 'Wage and Tax Statement - Form filed by employers showing employee wages, taxes withheld, and other income information for the year.',
      ar: 'نموذج الأجور والضريبة - نموذج تقدمه أصحاب العمل يوضح رواتب الموظفين والضرائب المقتطعة وغيرها من معلومات الدخل للسنة.'
    },
    '1099': {
      en: 'Information Return - Form issued by payers to report non-employee income including freelance work, interest, and dividends. Various types include 1099-NEC, 1099-MISC, and 1099-INT.',
      ar: 'نموذج الإقرار الإعلامي - نموذج يصدره الدافعون للإبلاغ عن الدخل غير الموظف بما في ذلك العمل الحر والفائدة والأرباح. تشمل الأنواع المختلفة 1099-NEC و 1099-MISC و 1099-INT.'
    },
    '1099-NEC': {
      en: 'Nonemployee Compensation - Form reporting payments to independent contractors and self-employed individuals who are not employees.',
      ar: 'نموذج تعويض غير الموظفين - نموذج يقرر المدفوعات للمقاولين المستقلين والأفراد العاملين بحسابهم الخاص.'
    },
    '1099-MISC': {
      en: 'Miscellaneous Income - Form reporting various types of miscellaneous income including rentals, royalties, and prize winnings.',
      ar: 'نموذج الدخل المتنوع - نموذج يقرر أنواعاً مختلفة من الدخل المتنوع بما في ذلك الإيجارات والحقوق والجوائز.'
    },
    '1099-INT': {
      en: 'Interest Income - Form reporting interest paid on savings accounts, bonds, and other interest-bearing investments.',
      ar: 'نموذج الدخل من الفائدة - نموذج يقرر الفائدة المدفوعة على حسابات التوفير والسندات والاستثمارات الأخرى التي تحمل فائدة.'
    },
    'Form 1040': {
      en: 'U.S. Individual Income Tax Return - The primary form used to file annual personal tax returns with the IRS.',
      ar: 'النموذج الأساسي للإقرار الضريبي الفردي الأمريكي - النموذج الأساسي المستخدم لتقديم الإقرارات الضريبية السنوية الشخصية لمصلحة الضرائب الأمريكية.'
    },
    'Schedule C': {
      en: 'Profit or Loss from Business - Form used to report net profit or loss from self-employment or sole proprietorship business operations.',
      ar: 'جدول الأرباح أو الخسائر من الأعمال - نموذج يستخدم للإبلاغ عن صافي الأرباح أو الخسائر من أنشطة الأعمال الحرة أو الملكية الفردية.'
    },
    'Schedule A': {
      en: 'Itemized Deductions - Form used to list and claim itemized deductions instead of taking the standard deduction.',
      ar: 'جدول الخصومات المفصّلة - نموذج يستخدم لقائمة والمطالبة بالخصومات المفصّلة بدلاً من أخذ الخصم القياسي.'
    },
    'W-4': {
      en: 'Employee\'s Withholding Certificate - Form completed by employees to tell their employer how much tax to withhold from their paycheck.',
      ar: 'نموذج شهادة الاستقطاع من الموظف - نموذج يملأه الموظفون لإخبار صاحب العملِ عن مبلغ الضريبة المراد اقتطاعها من راتبهم.'
    },

    // Deductions and Credits
    'Deduction': {
      en: 'An amount subtracted from gross income to reduce your taxable income. Can be standard or itemized.',
      ar: 'مبلغ يتم خصمه من الدخل الإجمالي لتقليل دخلك الخاضع للضريبة. يمكن أن يكون معياري أو مفصّل.'
    },
    'Standard Deduction': {
      en: 'A fixed dollar amount that reduces your taxable income automatically. Amount varies by filing status, age, and year.',
      ar: 'مبلغ بالدولار محدد مسبقاً يقلل دخلك الخاضع للضريبة تلقائياً. يختلف المبلغ حسب حالة التقديم والعمر والسنة.'
    },
    'Itemized Deduction': {
      en: 'Individual deductions you list (such as mortgage interest, charitable donations, state taxes) instead of taking the standard deduction.',
      ar: 'الخصومات الفردية التي تدرجها (مثل فائدة الرهن العقاري والتبرعات الخيرية والضرائب الحكومية) بدلاً من أخذ الخصم القياسي.'
    },
    'Above-the-line Deduction': {
      en: 'Deductions subtracted from gross income to calculate AGI, available even if you take the standard deduction. Examples: student loan interest, educator expenses.',
      ar: 'الخصومات المخصومة من الدخل الإجمالي لحساب AGI، متاحة حتى لو تأخذ الخصم القياسي. أمثلة: فائدة قرض الطالب ونفقات المعلم.'
    },
    'Below-the-line Deduction': {
      en: 'Deductions claimed after AGI is calculated, generally as part of itemized deductions (Schedule A).',
      ar: 'الخصومات المطالب بها بعد حساب AGI، عموماً كجزء من الخصومات المفصّلة (الجدول A).'
    },
    'Charitable Contribution': {
      en: 'Donations to qualified charitable organizations that can be deducted from your taxable income if you itemize deductions.',
      ar: 'التبرعات للمنظمات الخيرية المؤهلة التي يمكن خصمها من دخلك الخاضع للضريبة إذا كنت تفصّل الخصومات.'
    },
    'Mortgage Interest': {
      en: 'Interest paid on a home loan that may be deducted if you itemize deductions (subject to certain limits).',
      ar: 'الفائدة المدفوعة على قرض المنزل التي قد تكون قابلة للخصم إذا كنت تفصّل الخصومات (يخضع لقيود معينة).'
    },
    'Property Tax': {
      en: 'State and local taxes paid on real estate property, deductible if you itemize (subject to SALT limitations).',
      ar: 'الضرائب الحكومية والمحلية المدفوعة على الممتلكات العقارية، قابلة للخصم إذا كنت تفصّل (يخضع لقيود SALT).'
    },
    'SALT': {
      en: 'State and Local Tax - Collective term for deductible state income taxes, property taxes, and local taxes (limited to $10,000 per year).',
      ar: 'ضرائب الولاية والضرائب المحلية - المصطلح الجماعي لضرائب الدخل الحكومية والضرائب العقارية والضرائب المحلية (محدودة بـ 10,000 دولار سنوياً).'
    },

    // Tax Credits
    'Tax Credit': {
      en: 'A direct reduction of the tax you owe (dollar-for-dollar). More valuable than a deduction since it directly reduces your tax liability.',
      ar: 'تخفيض مباشر للضريبة المستحقة (دولار مقابل دولار). أكثر قيمة من الخصم لأنه يقلل مباشرة التزامك الضريبي.'
    },
    'EITC': {
      en: 'Earned Income Tax Credit - Refundable credit for low to moderate income working individuals and families, especially those with children.',
      ar: 'ائتمان الدخل المكتسب - رصيد قابل للاسترجاع للأفراد والعائلات العاملة بدخل منخفض إلى متوسط، خاصة أولئك الذين لديهم أطفال.'
    },
    'Child Tax Credit': {
      en: 'Credit of up to $2,000 per qualifying child under age 17 to help offset the cost of raising children.',
      ar: 'ائتمان بقيمة تصل إلى 2,000 دولار لكل طفل مؤهل تحت سن 17 للمساعدة في تعويض تكاليف تربية الأطفال.'
    },
    'Earned Income': {
      en: 'Income from work, including wages, salaries, tips, and self-employment income (as opposed to unearned income like interest or dividends).',
      ar: 'الدخل من العمل، بما في ذلك الأجور والرواتب والإكراميات والدخل من العمل الحر (بعكس الدخل غير المكتسب مثل الفائدة والأرباح).'
    },
    'Dependent': {
      en: 'A person (usually a child or relative) who relies on you for financial support and meets IRS requirements to reduce your taxable income.',
      ar: 'شخص (عادة ما يكون طفلاً أو قريباً) يعتمد عليك للدعم المالي ويستوفي متطلبات مصلحة الضرائب الأمريكية لتقليل دخلك الخاضع للضريبة.'
    },
    'Exemption': {
      en: 'A deduction allowed for each taxpayer and dependent (though personal exemptions were suspended 2017-2025 under current tax law).',
      ar: 'خصم مسموح به لكل دافع ضرائب ومعال (على الرغم من أن الإعفاءات الشخصية تم إيقافها 2017-2025 بموجب القانون الضريبي الحالي).'
    },

    // Income types
    'Capital Gains': {
      en: 'Profit from the sale of an investment or asset (such as stocks or real estate). Taxed at preferential rates: long-term (0%, 15%, or 20%) and short-term (ordinary income rates).',
      ar: 'الأرباح من بيع استثمار أو أصل (مثل الأسهم أو العقارات). يتم فرض الضرائب عليها بأسعار تفضيلية: طويلة الأجل (0٪ أو 15٪ أو 20٪) وقصيرة الأجل (معدلات الدخل العادية).'
    },
    'Capital Loss': {
      en: 'Loss from the sale of an investment or asset, which can offset capital gains and up to $3,000 of ordinary income per year.',
      ar: 'خسارة من بيع استثمار أو أصل، والتي يمكن أن تعوض المكاسب الرأسمالية وتصل إلى 3,000 دولار من الدخل العادي سنوياً.'
    },
    'Dividend': {
      en: 'Earnings paid to shareholders from a company\'s profits, taxed as ordinary income or at capital gains rates depending on the type.',
      ar: 'الأرباح المدفوعة للمساهمين من أرباح الشركة، يتم فرض الضرائب عليها كدخل عادي أو بمعدلات الأرباح الرأسمالية حسب النوع.'
    },
    'Self-Employment Tax': {
      en: 'Tax covering Social Security and Medicare for self-employed individuals. Approximately 15.3% (12.4% Social Security + 2.9% Medicare) of net business income.',
      ar: 'ضريبة تغطي الضمان الاجتماعي والرعاية الصحية للعاملين بحسابهم الخاص. حوالي 15.3% (12.4% الضمان الاجتماعي + 2.9% الرعاية الصحية) من صافي الدخل الحر.'
    },

    // Withholding and payments
    'Withholding': {
      en: 'Amount of tax automatically deducted from your paycheck by your employer based on information you provide on your W-4.',
      ar: 'مبلغ الضريبة المقتطعة تلقائياً من راتبك من قبل صاحب العمل بناءً على المعلومات التي تقدمها في نموذج W-4.'
    },
    'Estimated Tax': {
      en: 'Tax payments made quarterly (April, June, September, January) by self-employed individuals or those with significant non-wage income.',
      ar: 'مدفوعات ضريبية تُسدد ربع سنوية (أبريل ويونيو وسبتمبر وينايرتقديم) من قبل العاملين بحسابهم الخاص أو أولئك الذين لديهم دخل غير راتب كبير.'
    },
    'Refund': {
      en: 'Money returned to you by the IRS when your total tax payments exceed your tax liability, or due to refundable credits.',
      ar: 'المال الذي يتم إرجاعه إليك من قبل مصلحة الضرائب الأمريكية عندما تتجاوز مدفوعاتك الضريبية الكلية التزامك الضريبي أو بسبب الأرصدة القابلة للاسترجاع.'
    },
    'Direct Deposit': {
      en: 'Electronic deposit of your tax refund directly into your bank account, the fastest way to receive your refund (14-21 days).',
      ar: 'الإيداع الإلكتروني لاسترجاع الضريبة مباشرة في حسابك البنكي، أسرع طريقة لاستلام استرجاعك (14-21 يوماً).'
    },
    'Payroll Tax': {
      en: 'Taxes withheld from employee wages for federal income tax, Social Security, and Medicare. Employer matches Social Security and Medicare contributions.',
      ar: 'الضرائب المقتطعة من رواتب الموظفين لضريبة الدخل الفيدرالية والضمان الاجتماعي والرعاية الصحية. صاحب العمل يطابق مساهمات الضمان الاجتماعي والرعاية الصحية.'
    },
    'Tax Liability': {
      en: 'The total amount of tax you owe to the IRS for the tax year after all deductions, credits, and adjustments.',
      ar: 'المبلغ الإجمالي للضريبة المستحقة لمصلحة الضرائب الأمريكية للسنة الضريبية بعد جميع الخصومات والأرصدة والتعديلات.'
    },

    // Tax brackets and rates
    'Tax Bracket': {
      en: 'Range of income subject to a specific tax rate. The U.S. uses progressive tax brackets: higher income is taxed at higher rates.',
      ar: 'نطاق الدخل الخاضع لمعدل ضريبي محدد. تستخدم الولايات المتحدة أقواس ضريبية تصاعدية: الدخل الأعلى يخضع لمعدلات أعلى.'
    },
    'Marginal Rate': {
      en: 'The tax rate applied to your last dollar of income; the highest tax bracket your income reaches. Important for understanding how much additional income will be taxed.',
      ar: 'معدل الضريبة المطبق على آخر دولار من دخلك؛ أعلى قوس ضريبي يصل إليه دخلك. مهم لفهم مقدار الضريبة على الدخل الإضافي.'
    },
    'Effective Rate': {
      en: 'Your total tax divided by your total income; the average tax rate you pay across all your income.',
      ar: 'إجمالي الضريبة مقسومة على إجمالي دخلك؛ متوسط معدل الضريبة الذي تدفعه على جميع دخلك.'
    },

    // Filing status
    'Filing Status': {
      en: 'Your tax classification (Single, Married Filing Jointly, Married Filing Separately, Head of Household, or Qualifying Widow/Widower) that determines tax rates and standard deduction.',
      ar: 'تصنيفك الضريبي (أعزب، متزوج تقديم مشترك، متزوج تقديم منفصل، رب أسرة، أو أرمل/ة مؤهل/ة) الذي يحدد معدلات الضريبة والخصم القياسي.'
    },
    'Single': {
      en: 'Filing status for unmarried individuals or those legally separated/divorced, using standard deduction and tax brackets for single filers.',
      ar: 'حالة التقديم للأفراد العزاب أو أولئك الذين تم فصلهم قانوناً/مطلقين، باستخدام الخصم القياسي وأقواس الضريبة لمقدمي الطلبات العزاب.'
    },
    'Married Filing Jointly': {
      en: 'Filing status for married couples filing one combined return, allowing higher income thresholds and broader tax brackets.',
      ar: 'حالة التقديم للأزواج المتزوجين الذين يقدمون إقرار مشترك واحد، مما يسمح بعتبات دخل أعلى وأقواس ضريبية أوسع.'
    },
    'Married Filing Separately': {
      en: 'Filing status where each spouse files their own separate return; generally results in higher taxes but may be beneficial in some situations.',
      ar: 'حالة التقديم حيث يقدم كل زوج إقراره الخاص المنفصل؛ عموماً ينتج عن ضرائب أعلى لكن قد يكون مفيداً في بعض الحالات.'
    },
    'Head of Household': {
      en: 'Filing status for unmarried individuals supporting dependents, offering lower tax rates than Single but higher standard deduction.',
      ar: 'حالة التقديم للأفراد العزاب الذين يعولون معالين، مما يوفر معدلات ضريبية أقل من الأعزب ولكن خصم قياسي أعلى.'
    },
    'Qualifying Widow(er)': {
      en: 'Filing status available for up to 2 years after a spouse\'s death, providing tax benefits similar to Married Filing Jointly.',
      ar: 'حالة التقديم المتاحة لمدة تصل إلى سنتين بعد وفاة الزوج، توفر مزايا ضريبية مشابهة للتقديم المشترك.'
    },

    // Retirement
    '401(k)': {
      en: 'Employer-sponsored retirement plan where employees can contribute pre-tax income, reducing current taxable income and deferring taxes until retirement.',
      ar: 'خطة تقاعد برعاية صاحب العمل حيث يمكن للموظفين المساهمة بدخل قبل الضريبة، مما يقلل الدخل الخاضع للضريبة الحالي ويؤجل الضرائب حتى التقاعد.'
    },
    'IRA': {
      en: 'Individual Retirement Account - Personal retirement savings account with annual contribution limits. Pre-tax (Traditional) or after-tax (Roth) contributions available.',
      ar: 'حساب التقاعد الفردي - حساب توفير تقاعد شخصي بحدود مساهمة سنوية. المساهمات قبل الضريبة (التقليدية) أو بعد الضريبة (روث) متاحة.'
    },
    'Roth IRA': {
      en: 'Individual Retirement Account where after-tax contributions grow tax-free; withdrawals in retirement are tax-free if requirements are met.',
      ar: 'حساب التقاعد الفردي حيث تنمو المساهمات بعد الضريبة معفاة من الضرائب؛ الانسحابات عند التقاعد معفاة من الضرائب إذا تم استيفاء المتطلبات.'
    },
    'Traditional IRA': {
      en: 'Individual Retirement Account with pre-tax contributions (potentially deductible) and taxable withdrawals in retirement.',
      ar: 'حساب التقاعد الفردي مع المساهمات قبل الضريبة (قابلة للخصم محتملاً) والانسحابات الخاضعة للضريبة عند التقاعد.'
    },
    'HSA': {
      en: 'Health Savings Account - Triple tax-advantaged account for health expenses: contributions are deductible, growth is tax-free, and qualified withdrawals are tax-free.',
      ar: 'حساب التوفير الصحي - حساب ذو مزايا ضريبية ثلاثية للنفقات الصحية: المساهمات قابلة للخصم، والنمو معفى من الضرائب، والانسحابات المؤهلة معفاة من الضرائب.'
    },

    // Tax administration
    'IRS': {
      en: 'Internal Revenue Service - U.S. federal tax agency responsible for collecting taxes and enforcing tax law.',
      ar: 'مصلحة الضرائب الأمريكية - وكالة الضرائب الفيدرالية الأمريكية المسؤولة عن تحصيل الضرائب وتطبيق قانون الضريبة.'
    },
    'SSN': {
      en: 'Social Security Number - Nine-digit identifier issued by the Social Security Administration, required for tax filing.',
      ar: 'رقم الضمان الاجتماعي - معرف من تسعة أرقام يصدره إدارة الضمان الاجتماعي، مطلوب لتقديم الضريبة.'
    },
    'ITIN': {
      en: 'Individual Taxpayer Identification Number - Nine-digit number issued by the IRS for tax filing purposes to those without a Social Security Number.',
      ar: 'رقم تعريف دافع الضرائب الفردي - رقم من تسعة أرقام يصدره مصلحة الضرائب الأمريكية لأغراض تقديم الضريبة لأولئك الذين لا يملكون رقم ضمان اجتماعي.'
    },
    'EIN': {
      en: 'Employer Identification Number - Nine-digit number issued by the IRS for business entities; also called a Federal Tax ID.',
      ar: 'رقم تعريف صاحب العمل - رقم من تسعة أرقام يصدره مصلحة الضرائب الأمريكية للكيانات التجارية؛ يسمى أيضاً معرف ضريبة فيدرالي.'
    },
    'Fiscal Year': {
      en: 'The 12-month accounting period used by a business for tax purposes. Can be a calendar year (Jan-Dec) or any other 12-month period.',
      ar: 'فترة الحساب لمدة 12 شهراً تستخدمها الشركة لأغراض ضريبية. يمكن أن تكون سنة تقويمية (يناير-ديسمبر) أو أي فترة 12 شهراً أخرى.'
    },
    'Quarterly': {
      en: 'Every three months. Relevant for estimated tax payments (quarterly), quarterly tax filings, and business financial reporting.',
      ar: 'كل ثلاثة أشهر. ذات صلة بمدفوعات الضريبة التقديرية (ربع سنوية)، والإقرارات الضريبية ربع السنوية، والتقارير المالية للأعمال.'
    },
    'E-File': {
      en: 'Electronic filing - Submitting your tax return electronically to the IRS through approved software or tax professionals instead of paper filing.',
      ar: 'التقديم الإلكتروني - تقديم إقرار الضريبة إلكترونياً لمصلحة الضرائب الأمريكية من خلال برنامج معتمد أو متخصصي الضرائب بدلاً من التقديم الورقي.'
    },
    'Tax Return': {
      en: 'The official form (like Form 1040) and supporting documents filed annually with the IRS to report income, deductions, and tax liability.',
      ar: 'النموذج الرسمي (مثل النموذج 1040) والمستندات الداعمة المقدمة سنوياً لمصلحة الضرائب الأمريكية للإبلاغ عن الدخل والخصومات والالتزام الضريبي.'
    },
    'Amendment': {
      en: 'Change or correction to a previously filed tax return. Filed using Form 1040-X.',
      ar: 'تغيير أو تصحيح على إقرار ضريبي قدم سابقاً. يتم تقديمه باستخدام النموذج 1040-X.'
    },
    'Amended Return': {
      en: 'A corrected tax return filed after the original to fix errors, claim additional credits/deductions, or adjust reported income.',
      ar: 'إقرار ضريبي مصحح يتم تقديمه بعد الأصلي لإصلاح الأخطاء أو المطالبة بأرصدة/خصومات إضافية أو تعديل الدخل المُبلّغ عنه.'
    },
    'Extension': {
      en: 'Automatic six-month extension to file your tax return (Form 4868), moving the deadline from April 15 to October 15. Does not extend the time to pay taxes owed.',
      ar: 'تمديد تلقائي لمدة ستة أشهر لتقديم إقرار الضريبة (النموذج 4868)، مما يؤجل الموعد النهائي من 15 أبريل إلى 15 أكتوبر. لا يمدد الوقت لسداد الضرائب المستحقة.'
    },
    'Audit': {
      en: 'Examination of tax return by the IRS to verify accuracy and compliance with tax laws. Can be a simple letter audit or complex field audit.',
      ar: 'فحص الإقرار الضريبي من قبل مصلحة الضرائب الأمريكية للتحقق من الدقة والامتثال لقوانين الضريبة. يمكن أن يكون تدقيقاً بسيطاً عبر البريد أو تدقيقاً ميدانياً معقداً.'
    },
    'Penalty': {
      en: 'Additional monetary punishment imposed by the IRS for failure to file, failure to pay, underpayment, or other violations.',
      ar: 'عقوبة نقدية إضافية تفرضها مصلحة الضرائب الأمريكية لعدم التقديم أو عدم الدفع أو الدفع الناقص أو الانتهاكات الأخرى.'
    },

    // International
    'Tax Treaty': {
      en: 'Agreement between two countries to avoid double taxation and clarify tax obligations for citizens and residents in both countries.',
      ar: 'اتفاق بين دولتين لتجنب الازدواج الضريبي وتوضيح الالتزامات الضريبية للمواطنين والمقيمين في كلا الدولتين.'
    },
    'Non-Resident Alien': {
      en: 'Foreign national without a green card or substantial presence in the U.S. Subject to different tax rules and withholding.',
      ar: 'أجنبي لا يملك بطاقة خضراء أو وجوداً كبيراً في الولايات المتحدة. يخضع لقواعد ضريبية واستقطاع مختلفة.'
    },
    'Resident Alien': {
      en: 'Foreign national who has a green card or meets the substantial presence test, taxed like U.S. citizens on worldwide income.',
      ar: 'أجنبي يملك بطاقة خضراء أو يفي باختبار الوجود الكبير، يتم فرض ضرائب عليه مثل المواطنين الأمريكيين على الدخل العالمي.'
    },

    // Other important terms
    'Depreciation': {
      en: 'Deduction for the decline in value of business property over time (buildings, equipment, vehicles). Allows business owners to deduct a portion of asset cost annually.',
      ar: 'خصم لانخفاض قيمة ممتلكات الأعمال بمرور الوقت (المباني والمعدات والمركبات). يسمح لأصحاب الأعمال بخصم جزء من تكلفة الأصل سنوياً.'
    },
    'Medicare': {
      en: 'Federal health insurance program for seniors 65+ and some younger people with disabilities. Funded by payroll taxes.',
      ar: 'برنامج التأمين الصحي الفيدرالي للمسنين بعمر 65 سنة فما فوق وبعض الأشخاص الأصغر الذين لديهم إعاقات. يتم تمويله من خلال ضرائب الرواتب.'
    },
    'Social Security': {
      en: 'Federal retirement and disability insurance program. Funded by payroll taxes and provides retirement, survivor, and disability benefits.',
      ar: 'برنامج الضمان الاجتماعي الفيدرالي للتقاعد والتأمين ضد الإعاقة. يتم تمويله من خلال ضرائب الرواتب ويوفر مزايا التقاعد والورثة والإعاقة.'
    },
    'AMT': {
      en: 'Alternative Minimum Tax - Parallel tax system ensuring high-income individuals pay a minimum amount of tax even with large deductions.',
      ar: 'الحد الأدنى البديل للضريبة - نظام ضريبي موازٍ يضمن دفع الأفراد ذوي الدخل المرتفع حداً أدنى من الضريبة حتى مع الخصومات الكبيرة.'
    },
    'Carryforward': {
      en: 'Ability to apply unused deductions, credits, or losses to future tax years to reduce future tax liability.',
      ar: 'القدرة على تطبيق الخصومات أو الأرصدة أو الخسائر غير المستخدمة على السنوات الضريبية المستقبلية لتقليل الالتزام الضريبي المستقبلي.'
    }
  };

  // ============================================================================
  // Configuration
  // ============================================================================

  const CONFIG = {
    buttonCorner: 'bottom-left',
    debounceDelay: 300,
    minWordLength: 2,
    maxTooltipWidth: 300
  };

  // ============================================================================
  // CSS Styles (Injected)
  // ============================================================================

  function injectStyles() {
    const styleId = 'tax-glossary-styles';
    if (document.getElementById(styleId)) return;

    const styles = `
      /* Glossary term highlighting */
      .tax-term {
        border-bottom: 2px dotted #d4af37;
        cursor: help;
        position: relative;
        transition: background-color 0.2s ease;
      }

      .tax-term:hover {
        background-color: rgba(212, 175, 55, 0.1);
      }

      /* Tooltip container */
      .tax-tooltip {
        position: fixed;
        background-color: #1a3a52;
        color: #ffffff;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        max-width: 320px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        pointer-events: auto;
        opacity: 0;
        visibility: hidden;
        transform: translateY(0);
        transition: opacity 0.2s ease, visibility 0.2s ease;
      }

      .tax-tooltip.visible {
        opacity: 1;
        visibility: visible;
      }

      /* Arrow pointer */
      .tax-tooltip::after {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid #1a3a52;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
      }

      .tax-tooltip.below::after {
        bottom: auto;
        top: -8px;
        border-top: none;
        border-bottom: 8px solid #1a3a52;
      }

      /* Tooltip content */
      .tax-tooltip-title {
        font-weight: bold;
        margin-bottom: 8px;
        color: #ffffff;
      }

      .tax-tooltip-english {
        color: #ffffff;
        margin-bottom: 8px;
        font-size: 13px;
      }

      .tax-tooltip-arabic {
        color: #d4af37;
        font-size: 12px;
        font-weight: 500;
        direction: rtl;
        text-align: right;
      }

      /* Glossary button */
      .tax-glossary-btn {
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #1a3a52 0%, #2d5a7b 100%);
        color: #ffffff;
        border: 2px solid #d4af37;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        z-index: 9999;
        transition: all 0.3s ease;
      }

      .tax-glossary-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
      }

      .tax-glossary-btn:active {
        transform: scale(0.95);
      }

      .tax-glossary-btn-label {
        position: absolute;
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: #1a3a52;
        color: #ffffff;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
      }

      .tax-glossary-btn:hover .tax-glossary-btn-label {
        opacity: 1;
      }

      /* Glossary panel */
      .tax-glossary-panel {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 10001;
      }

      .tax-glossary-panel.open {
        display: flex;
      }

      .tax-glossary-modal {
        background: #ffffff;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      }

      .tax-glossary-modal-header {
        background: linear-gradient(135deg, #1a3a52 0%, #2d5a7b 100%);
        color: #ffffff;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .tax-glossary-modal-title {
        font-size: 20px;
        font-weight: bold;
      }

      .tax-glossary-modal-close {
        background: none;
        border: none;
        color: #ffffff;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .tax-glossary-search {
        padding: 16px;
        background: #f8f9fa;
        border-bottom: 1px solid #e0e0e0;
      }

      .tax-glossary-search input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d0d0d0;
        border-radius: 6px;
        font-size: 14px;
        font-family: inherit;
      }

      .tax-glossary-search input:focus {
        outline: none;
        border-color: #1a3a52;
        box-shadow: 0 0 0 3px rgba(26, 58, 82, 0.1);
      }

      .tax-glossary-list {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
      }

      .tax-glossary-item {
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e0e0e0;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .tax-glossary-item:last-child {
        border-bottom: none;
      }

      .tax-glossary-item:hover {
        background: rgba(212, 175, 55, 0.05);
        padding: 8px;
        border-radius: 6px;
        margin-left: -8px;
        margin-right: -8px;
        padding-left: 24px;
      }

      .tax-glossary-item-term {
        font-weight: bold;
        color: #1a3a52;
        margin-bottom: 4px;
      }

      .tax-glossary-item-def {
        color: #555555;
        font-size: 13px;
        line-height: 1.4;
      }

      .tax-glossary-item-arabic {
        color: #d4af37;
        font-size: 12px;
        margin-top: 6px;
        direction: rtl;
        text-align: right;
      }

      .tax-glossary-no-results {
        padding: 40px 20px;
        text-align: center;
        color: #999999;
        font-size: 14px;
      }

      /* Mobile responsiveness */
      @media (max-width: 600px) {
        .tax-glossary-btn {
          width: 48px;
          height: 48px;
          font-size: 18px;
          bottom: 16px;
          left: 16px;
        }

        .tax-glossary-modal {
          width: 95%;
          max-height: 90vh;
        }

        .tax-tooltip {
          max-width: 280px;
        }
      }

      /* Accessibility */
      .tax-glossary-btn:focus {
        outline: 2px solid #d4af37;
        outline-offset: 2px;
      }

      .tax-term:focus {
        outline: 2px solid #d4af37;
        outline-offset: 2px;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  // ============================================================================
  // Utility Functions
  // ============================================================================

  function getTermList() {
    return Object.keys(GLOSSARY_DATA).sort();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function isVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function shouldSkipElement(node) {
    const tag = node.tagName?.toUpperCase();
    return ['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK', 'CODE'].includes(tag) ||
           node.classList?.contains('tax-glossary-btn') ||
           node.classList?.contains('tax-glossary-panel') ||
           node.classList?.contains('tax-tooltip');
  }

  function getSessionStorage() {
    try {
      return sessionStorage;
    } catch {
      return null;
    }
  }

  // ============================================================================
  // Main Glossary System
  // ============================================================================

  class TaxGlossary {
    constructor() {
      this.tooltipElement = null;
      this.highlightsEnabled = true;
      this.glossaryPanel = null;
      this.currentTooltipTerm = null;
      this.termCount = 0;
      this.storage = getSessionStorage();
      this.loadPreference();
    }

    loadPreference() {
      if (!this.storage) return;
      const saved = this.storage.getItem('tax-glossary-enabled');
      if (saved !== null) {
        this.highlightsEnabled = saved === 'true';
      }
    }

    savePreference() {
      if (!this.storage) return;
      this.storage.setItem('tax-glossary-enabled', this.highlightsEnabled.toString());
    }

    init() {
      injectStyles();
      this.createButton();
      this.scanAndHighlight();
      this.setupEventListeners();
    }

    createButton() {
      const button = document.createElement('button');
      button.className = 'tax-glossary-btn';
      button.title = 'Open tax glossary';
      button.innerHTML = '📖';

      const label = document.createElement('span');
      label.className = 'tax-glossary-btn-label';
      label.textContent = `Glossary (${this.termCount})`;
      button.appendChild(label);

      button.addEventListener('click', (e) => this.handleButtonClick(e));
      button.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.openPanel();
      });

      document.body.appendChild(button);
    }

    handleButtonClick(e) {
      e.stopPropagation();
      this.highlightsEnabled = !this.highlightsEnabled;
      this.savePreference();
      this.updateHighlights();
      this.updateButton();
    }

    updateButton() {
      const btn = document.querySelector('.tax-glossary-btn');
      if (!btn) return;

      const label = btn.querySelector('.tax-glossary-btn-label');
      if (label) {
        label.textContent = `Glossary (${this.termCount})`;
      }

      const opacity = this.highlightsEnabled ? '1' : '0.5';
      btn.style.opacity = opacity;
    }

    updateHighlights() {
      document.querySelectorAll('.tax-term').forEach(term => {
        if (this.highlightsEnabled) {
          term.style.textDecoration = 'none';
          term.style.opacity = '1';
        } else {
          term.style.opacity = '0.4';
        }
      });
    }

    scanAndHighlight() {
      const terms = getTermList();
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      const nodesToProcess = [];

      while (node = walker.nextNode()) {
        if (shouldSkipElement(node.parentElement)) continue;
        if (!isVisible(node.parentElement)) continue;
        nodesToProcess.push(node);
      }

      nodesToProcess.forEach(node => {
        this.processTextNode(node, terms);
      });

      this.termCount = document.querySelectorAll('.tax-term').length;
      this.updateHighlights();
    }

    processTextNode(node, terms) {
      let html = node.textContent;
      let replaced = false;

      // Create a map of terms sorted by length (longest first) to avoid partial matches
      const sortedTerms = terms.sort((a, b) => b.length - a.length);

      sortedTerms.forEach(term => {
        const regex = new RegExp(`\\b${this.escapeRegex(term)}\\b`, 'gi');
        if (regex.test(html)) {
          replaced = true;
          html = html.replace(regex, (match) => {
            return `<span class="tax-term" data-term="${escapeHtml(match)}">${escapeHtml(match)}</span>`;
          });
        }
      });

      if (replaced) {
        const span = document.createElement('span');
        span.innerHTML = html;
        node.parentNode.replaceChild(span, node);
      }
    }

    escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    setupEventListeners() {
      document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('tax-term')) {
          this.showTooltip(e.target, e);
        }
      });

      document.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('tax-term')) {
          this.hideTooltip();
        }
      });

      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tax-term')) {
          e.stopPropagation();
          this.showTooltip(e.target, e);
        } else if (!e.target.closest('.tax-glossary-panel') && !e.target.closest('.tax-tooltip')) {
          this.hideTooltip();
          if (e.target !== document.querySelector('.tax-glossary-btn')) {
            this.closePanel();
          }
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.hideTooltip();
          this.closePanel();
        }
      });
    }

    showTooltip(term, event) {
      if (!this.highlightsEnabled) return;

      const termText = term.getAttribute('data-term');
      if (!termText || !GLOSSARY_DATA[termText]) return;

      const data = GLOSSARY_DATA[termText];

      if (!this.tooltipElement) {
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.className = 'tax-tooltip';
        document.body.appendChild(this.tooltipElement);
      }

      this.tooltipElement.innerHTML = `
        <div class="tax-tooltip-title">${escapeHtml(termText)}</div>
        <div class="tax-tooltip-english">${escapeHtml(data.en)}</div>
        <div class="tax-tooltip-arabic">${escapeHtml(data.ar)}</div>
      `;

      this.currentTooltipTerm = termText;
      this.positionTooltip(term);
      this.tooltipElement.classList.add('visible');
    }

    positionTooltip(term) {
      if (!this.tooltipElement) return;

      const rect = term.getBoundingClientRect();
      const tooltip = this.tooltipElement;
      const scrollTop = window.scrollY;
      const scrollLeft = window.scrollX;

      // Show tooltip temporarily to measure it
      tooltip.style.position = 'fixed';
      tooltip.style.visibility = 'hidden';
      tooltip.style.opacity = '1';

      const tooltipRect = tooltip.getBoundingClientRect();
      const tooltipHeight = tooltipRect.height;

      // Check if there's room above
      const spaceAbove = rect.top - 16;
      const spaceBelow = window.innerHeight - rect.bottom - 16;

      let top, posClass;
      if (spaceAbove > tooltipHeight) {
        top = scrollTop + rect.top - tooltipHeight - 16;
        posClass = 'above';
      } else {
        top = scrollTop + rect.bottom + 16;
        posClass = 'below';
      }

      let left = scrollLeft + rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      left = Math.max(scrollLeft + 8, Math.min(left, scrollLeft + window.innerWidth - tooltipRect.width - 8));

      tooltip.style.top = top + 'px';
      tooltip.style.left = left + 'px';
      tooltip.style.visibility = 'visible';
      tooltip.classList.toggle('below', posClass === 'below');
    }

    hideTooltip() {
      if (this.tooltipElement) {
        this.tooltipElement.classList.remove('visible');
        this.currentTooltipTerm = null;
      }
    }

    openPanel() {
      if (!this.glossaryPanel) {
        this.glossaryPanel = document.createElement('div');
        this.glossaryPanel.className = 'tax-glossary-panel';
        document.body.appendChild(this.glossaryPanel);

        const modal = document.createElement('div');
        modal.className = 'tax-glossary-modal';
        this.glossaryPanel.appendChild(modal);

        modal.innerHTML = `
          <div class="tax-glossary-modal-header">
            <div class="tax-glossary-modal-title">Tax Glossary</div>
            <button class="tax-glossary-modal-close" aria-label="Close glossary">✕</button>
          </div>
          <div class="tax-glossary-search">
            <input type="text" placeholder="Search glossary..." class="tax-glossary-search-input">
          </div>
          <div class="tax-glossary-list"></div>
        `;

        const closeBtn = modal.querySelector('.tax-glossary-modal-close');
        closeBtn.addEventListener('click', () => this.closePanel());

        const searchInput = modal.querySelector('.tax-glossary-search-input');
        searchInput.addEventListener('input', (e) => this.filterGlossary(e.target.value));

        this.glossaryPanel.addEventListener('click', (e) => {
          if (e.target === this.glossaryPanel) this.closePanel();
        });

        this.populateGlossary();
      }

      this.glossaryPanel.classList.add('open');
      const searchInput = this.glossaryPanel.querySelector('.tax-glossary-search-input');
      if (searchInput) searchInput.focus();
    }

    closePanel() {
      if (this.glossaryPanel) {
        this.glossaryPanel.classList.remove('open');
      }
    }

    populateGlossary(filter = '') {
      const list = document.querySelector('.tax-glossary-list');
      if (!list) return;

      const terms = getTermList();
      const filtered = filter
        ? terms.filter(t => t.toLowerCase().includes(filter.toLowerCase()))
        : terms;

      if (filtered.length === 0) {
        list.innerHTML = '<div class="tax-glossary-no-results">No terms found</div>';
        return;
      }

      list.innerHTML = filtered.map(term => {
        const data = GLOSSARY_DATA[term];
        return `
          <div class="tax-glossary-item" data-term="${escapeHtml(term)}">
            <div class="tax-glossary-item-term">${escapeHtml(term)}</div>
            <div class="tax-glossary-item-def">${escapeHtml(data.en)}</div>
            <div class="tax-glossary-item-arabic">${escapeHtml(data.ar)}</div>
          </div>
        `;
      }).join('');

      // Add click handlers for glossary items
      list.querySelectorAll('.tax-glossary-item').forEach(item => {
        item.addEventListener('click', () => {
          const term = item.getAttribute('data-term');
          this.scrollToTerm(term);
        });
      });
    }

    filterGlossary(filter) {
      this.populateGlossary(filter);
    }

    scrollToTerm(term) {
      const termElements = Array.from(document.querySelectorAll('.tax-term'))
        .filter(el => el.getAttribute('data-term') === term);

      if (termElements.length > 0) {
        const firstTerm = termElements[0];
        firstTerm.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Highlight the term
        firstTerm.style.backgroundColor = 'rgba(212, 175, 55, 0.3)';
        setTimeout(() => {
          firstTerm.style.backgroundColor = '';
        }, 1500);

        this.closePanel();
      }
    }
  }

  // ============================================================================
  // Initialize on DOM Ready
  // ============================================================================

  function init() {
    // Use requestIdleCallback if available, fall back to setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        new TaxGlossary().init();
      });
    } else {
      setTimeout(() => {
        new TaxGlossary().init();
      }, 0);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
