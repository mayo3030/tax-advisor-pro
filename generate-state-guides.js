#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════
// STATE TAX DATA
// ═══════════════════════════════════════════════════════════════

const stateData = {
  CA: {
    name: 'California',
    nameAr: 'كاليفورنيا',
    abbr: 'CA',
    emoji: '🌞',
    chapters: [
      {
        id: 'ch1',
        num: 1,
        title: 'California Tax Overview',
        titleAr: 'نظرة عامة على ضرائب كاليفورنيا',
        content: `California has a <strong>progressive income tax system</strong> with rates ranging from 1% to 13.3% across 9 tax brackets — the highest state income tax in the US. <span class="ar">كاليفورنيا فيها ضرائب تصاعدية من ١٪ لحد ١٣.٣٪ — أعلى ضريبة حكومية في أمريكا.</span>

<h3>2025 CA Tax Brackets (Single Filers)</h3>
<table class="tax-table">
<thead><tr><th>Income Range</th><th>Tax Rate</th></tr></thead>
<tbody>
<tr><td>$0 — $10,099</td><td>1%</td></tr>
<tr><td>$10,100 — $23,942</td><td>2%</td></tr>
<tr><td>$23,943 — $37,788</td><td>4%</td></tr>
<tr><td>$37,789 — $52,455</td><td>6%</td></tr>
<tr><td>$52,456 — $66,295</td><td>8%</td></tr>
<tr><td>$66,296 — $340,328</td><td>9.3%</td></tr>
<tr><td>$340,329 — $408,393</td><td>10.3%</td></tr>
<tr><td>$408,394 — $680,656</td><td>11.3%</td></tr>
<tr><td>$680,657+</td><td>13.3%</td></tr>
</tbody>
</table>

<div class="tip-box gold">
<div class="tip-icon">⚠️</div>
<div class="tip-content">
<div class="tip-label">High Tax Rate</div>
<p>California's 13.3% top rate applies to income over $680,656. Even middle-income earners hit 9.3% quickly. Combined with federal tax, your marginal rate could exceed 40%.</p>
<p><span class="ar">معدل كاليفورنيا ١٣.٣٪ على الدخل العالي جداً. حتى الموظفين برواتب متوسطة يصلوا لـ ٩.٣٪ سريع جداً.</span></p>
</div>
</div>

<h3>Standard Deduction (2025)</h3>
<p><strong>Single:</strong> $5,202 | <strong>Married Filing Jointly:</strong> $10,404. California also allows federal itemized deductions capped at $10,000 (including property and income taxes).</p>

<h3>Filing Threshold</h3>
<p>Single: Gross income of $22,107 or more (or $1 if self-employed with net earnings $400+).</p>`
      },
      {
        id: 'ch2',
        num: 2,
        title: 'Deductions & Credits',
        titleAr: 'الخصومات والائتمانات',
        content: `<div class="info-card gold-border">
<div class="card-title">🏠 Property Tax Deduction Cap</div>
<p>California follows federal limits: total state and local taxes (SALT) deduction capped at <strong>$10,000</strong>. This includes property tax, sales tax, and state income tax combined.</p>
<p><span class="ar">كاليفورنيا تحدد الخصم الكلي للضرائب المحلية والولائية بـ ١٠,٠٠٠$ فقط.</span></p>
</div>

<div class="info-card navy-border">
<div class="card-title">💰 CA EITC (Enhanced in 2021)</div>
<p>California's Earned Income Tax Credit is <strong>worth up to $3,733</strong> for families with children, and <strong>up to $2,790</strong> for single filers or married couples without kids. Much more generous than federal.</p>
<p><span class="ar">الـ EITC في كاليفورنيا يصل لـ ٣,٧٣٣$ للعائلات بأطفال — أفضل من الفيدرالي بكثير.</span></p>
</div>

<h3>Dependent Parent Credit</h3>
<p>If you support a parent age 65+, you may claim a credit of up to <strong>$500</strong> (married filing jointly) or <strong>$250</strong> (single). Income limits apply.</p>

<h3>Energy/Solar Credits</h3>
<p>California offers credits for solar installation, electric vehicles, and home energy efficiency upgrades — some of the most generous in the nation.</p>

<div class="tip-box blue">
<div class="tip-icon">🚗</div>
<div class="tip-content">
<div class="tip-label">EV Tax Credits</div>
<p>California residents may qualify for state rebates on electric vehicle purchases (up to $7,500 in addition to federal credits). Check ca.gov for current programs.</p>
<p><span class="ar">سيارات كهربائية: كاليفورنيا تقدم خصومات حكومية لحد ٧,٥٠٠$ إضافية للفيدرالي.</span></p>
</div>
</div>`
      },
      {
        id: 'ch3',
        num: 3,
        title: 'CA Filing Requirements',
        titleAr: 'متطلبات الإقرار في كاليفورنيا',
        content: `<h3>Form CA 540 (or 540-NR)</h3>
<p>All California residents must file Form <strong>CA 540</strong> if they meet income thresholds. Non-residents file <strong>CA 540-NR</strong>. Part-year residents file both CA and prior state forms.</p>

<h3>Key Deadlines</h3>
<p><strong>April 15:</strong> Tax return due (same as federal). <strong>October 15:</strong> Automatic 6-month extension available. <strong>Late Payment:</strong> Penalties and interest accrue at 1% per month.</p>

<h3>Estimated Quarterly Tax (Form 540-ES)</h3>
<p>Self-employed or those with substantial non-wage income should pay quarterly estimates. Due dates: April 15, June 15, September 15, January 15 of next year.</p>

<div class="tip-box green">
<div class="tip-icon">✅</div>
<div class="tip-content">
<div class="tip-label">Electronic Filing (e-File)</div>
<p>California encourages e-filing. Use a tax software or IRS-certified provider. E-filed returns with direct deposit are processed faster and receive refunds in 21 days.</p>
<p><span class="ar">الإقرارات الإلكترونية تُعالج أسرع بكثير — الاسترجاع ياتيك في ٢١ يوم.</span></p>
</div>
</div>`
      },
      {
        id: 'ch4',
        num: 4,
        title: 'Property & Sales Tax',
        titleAr: 'ضرائب الملكية والمبيعات',
        content: `<h3>Property Tax Overview</h3>
<p>California's property tax is relatively low at <strong>~0.76% of assessed home value</strong> (Proposition 13 limits increases to 2% per year). However, homebuyers pay assessed value, not market value.</p>

<h3>Sales Tax</h3>
<p>Statewide base rate is <strong>7.25%</strong>, but local county/city taxes can add 1-2.5%, bringing total rates to <strong>7.25%–10.75%</strong> depending on location.</p>

<div class="info-card gold-border">
<div class="card-title">🏠 Homeowner's Property Tax Exemption</div>
<p>Primary home may qualify for a <strong>$7,000 exemption</strong> on assessed value, reducing your annual bill by ~$53. Must apply through county assessor.</p>
<p><span class="ar">البيت الأساسي يمكن أن يتمتع بإعفاء ٧٠٠٠$ من القيمة المقيّمة — توفير حوالي ٥٣$ سنوياً.</span></p>
</div>

<h3>Proposition 19 (2020)</h3>
<p>Allows homeowners 55+ to transfer current assessed value to new home (once in 2 years). Non-primary residences and commercial property assessments reset to market value upon sale.</p>`
      },
      {
        id: 'ch5',
        num: 5,
        title: 'Self-Employment & 1099s',
        titleAr: 'العمل الحر والـ 1099s',
        content: `<h3>Estimated Tax Quarterly Payments</h3>
<p>If you earn self-employment income, you must file quarterly estimates using <strong>Form 540-ES</strong>. Total expected CA tax minus withholding should be paid in 4 equal installments.</p>

<h3>Franchise Tax Board (FTB) Payment Options</h3>
<p>Pay online via <strong>taxes.ca.gov</strong>, by mail (check), or through approved payment processors. E-Pay and Direct Debit often have discounts.</p>

<div class="tip-box gold">
<div class="tip-icon">💡</div>
<div class="tip-content">
<div class="tip-label">Self-Employment Tax Deduction</div>
<p>Deduct 1/2 of CA self-employment tax on Form 540 Schedule CA. Unlike federal, California doesn't allow deduction of the full SE tax — only your own half.</p>
<p><span class="ar">تستطيع خصم نصف ضريبة العمل الحر، ليس الكل — هذا في كاليفورنيا فقط.</span></p>
</div>
</div>

<h3>AB 5 & Independent Contractor Status</h3>
<p>California's AB 5 law makes it harder to classify workers as contractors. If you're misclassified, you may owe back taxes. Consult a tax professional if your status is unclear.</p>`
      },
      {
        id: 'ch6',
        num: 6,
        title: 'Tips & Pitfalls',
        titleAr: 'نصائح وأخطاء شائعة',
        content: `<div class="tip-box red">
<div class="tip-icon">🚨</div>
<div class="tip-content">
<div class="tip-label">Common Pitfall: Moving in/out</div>
<p>If you moved to CA mid-year, you're a part-year resident. File both CA and your prior state's returns. Same if you moved out. Amend if needed to avoid penalties.</p>
<p><span class="ar">لو انتقلت لكاليفورنيا في منتصف السنة، بتقدّم إقرار جزئي. ما تخطّيها!</span></p>
</div>
</div>

<h3>SALT Cap Impact</h3>
<p>The $10,000 federal SALT cap hits CA hard. Many high earners can't deduct all their state and property taxes. Track them separately on Form 540 Schedule CA.</p>

<div class="tip-box green">
<div class="tip-icon">✅</div>
<div class="tip-content">
<div class="tip-label">Claim CA EITC</div>
<p>Many working families miss the CA EITC because they don't know about it. If you earn $70,000 or less (depending on filing status), check your eligibility. It's fully refundable!</p>
<p><span class="ar">الكثير من العائلات تنسى الـ EITC في كاليفورنيا. تأكد أنك تقدّمها!</span></p>
</div>
</div>

<h3>Avoid Franchise Tax Board Penalties</h3>
<p>California penalizes late payment and filing. E-file by deadline to avoid penalties. If you owe, make a payment arrangement immediately — the FTB is strict.</p>`
      }
    ]
  },

  TX: {
    name: 'Texas',
    nameAr: 'تكساس',
    abbr: 'TX',
    emoji: '⭐',
    chapters: [
      {
        id: 'ch1',
        num: 1,
        title: 'Texas: No State Income Tax!',
        titleAr: 'تكساس: لا توجد ضريبة دخل حكومية!',
        content: `<div class="tip-box gold" style="margin-bottom:32px;">
<div class="tip-icon">🎉</div>
<div class="tip-content">
<div class="tip-label">Zero State Income Tax</div>
<p><strong>Texas has NO state income tax.</strong> Whether you earn $50,000 or $5 million, you owe <strong>$0</strong> in state income tax. This is one of the biggest tax advantages of living in Texas.</p>
<p><span class="ar">تكساس لا تفرض ضريبة دخل ولائية على الإطلاق — لا شيء! سواء تكسب ٥٠ ألف أو ٥ مليون، تدفع صفر.</span></p>
</div>
</div>

<h3>Why No Income Tax?</h3>
<p>Texas generates revenue through <strong>sales tax, property tax, and oil/gas taxes</strong>. The state constitution originally prohibited an income tax; voters have consistently rejected proposals to add one.</p>

<h3>What You Still Owe</h3>
<p>While there's no state income tax, you still pay:</p>
<ul style="margin-left:20px;margin-bottom:16px;">
<li><strong>Federal income tax</strong> (to IRS, not Texas)</li>
<li><strong>Sales tax:</strong> 6.25% statewide + local up to 2% = 8.25% total</li>
<li><strong>Property tax:</strong> Average 0.8% of home value (varies by county)</li>
<li><strong>Capital gains tax:</strong> None (no state tax on investments)</li>
</ul>

<div class="tip-box green">
<div class="tip-icon">✅</div>
<div class="tip-content">
<div class="tip-label">Federal Return Still Required</div>
<p>You still file federal Form 1040 with the IRS by April 15. Texas just doesn't collect its own income tax. Self-employed: pay federal self-employment tax normally.</p>
<p><span class="ar">بتقدّم الإقرار الفيدرالي عادي للـ IRS — تكساس ما بتاخد شيء إضافي.</span></p>
</div>
</div>`
      },
      {
        id: 'ch2',
        num: 2,
        title: 'Sales Tax & Deductions',
        titleAr: 'ضريبة المبيعات والخصومات',
        content: `<h3>No State Income Tax = More Sales Tax</h3>
<p>Texas has <strong>NO deductions or credits for income tax</strong> because there is no income tax to deduct from. However, sales tax applies to most goods and many services.</p>

<h3>Sales Tax Rates by Region</h3>
<p>State base: <strong>6.25%</strong>. Local counties add up to 2% additional tax. Total rates:</p>
<ul style="margin-left:20px;">
<li><strong>Houston/Harris County:</strong> 8.25%</li>
<li><strong>Dallas/Dallas County:</strong> 8.25%</li>
<li><strong>Austin/Travis County:</strong> 8.25%</li>
<li><strong>San Antonio/Bexar County:</strong> 8.25%</li>
<li><strong>Most rural counties:</strong> 6.25% to 7.25%</li>
</ul>

<h3>What's NOT Taxed</h3>
<p><strong>Groceries:</strong> Not subject to sales tax (unprepared foods only). <strong>Prescription drugs:</strong> Not taxed. <strong>Medical devices:</strong> Generally not taxed if prescribed. Check for exemptions on your specific purchase.</p>

<div class="info-card navy-border">
<div class="card-title">🏠 Property Tax Overview</div>
<p>Texas property tax averages <strong>0.8% of home value</strong> but ranges from 0.5% to 1.8% depending on county. No state income tax means property taxes fund schools locally.</p>
<p><span class="ar">ضريبة الملكية في تكساس تتراوح بين ٠.٥٪ و ١.٨٪ حسب المقاطعة.</span></p>
</div>`
      },
      {
        id: 'ch3',
        num: 3,
        title: 'Filing & Federal Only',
        titleAr: 'الإقرارات الفيدرالية فقط',
        content: `<h3>You Only File Federal (Form 1040)</h3>
<p>Since Texas has no state income tax, you <strong>do not file any Texas state return</strong>. You file your federal return with the IRS by <strong>April 15</strong> as normal.</p>

<h3>Self-Employed in Texas</h3>
<p>Self-employed Texans file <strong>Schedule C (Profit or Loss)</strong> and <strong>Schedule SE (Self-Employment Tax)</strong> with their federal return. Federal self-employment tax is ~15.3% (half deductible).</p>

<h3>No Estimated Taxes to the State</h3>
<p>Since there's no state income tax, you <strong>do not make quarterly estimated payments to Texas</strong>. You only make federal estimated tax payments (Form 1040-ES) if needed.</p>

<div class="tip-box gold">
<div class="tip-icon">💡</div>
<div class="tip-content">
<div class="tip-label">Paperwork Advantage</div>
<p>Texans file only 1 state return (federal) compared to residents of other states who file 2. This saves time, complexity, and reduces audit risk.</p>
<p><span class="ar">الإقرار الوحيد اللي تقدّمه هو الفيدرالي — توفير الوقت والتعقيد.</span></p>
</div>
</div>`
      },
      {
        id: 'ch4',
        num: 4,
        title: 'Property & Business Taxes',
        titleAr: 'ضرائب الملكية والأعمال',
        content: `<h3>Property Tax Details</h3>
<p>Homeowners pay property tax to their <strong>county appraisal district</strong>. The tax is based on the appraised value of your home. Homestead exemptions vary by county but typically reduce taxable value by $25,000–$50,000.</p>

<h3>Homestead Exemption</h3>
<p>If your primary home qualifies for homestead exemption, you get a <strong>reduction on the appraised value</strong> used for tax calculation. Must apply through your county appraisal district by <strong>April 30</strong> following the year of purchase.</p>

<div class="info-card gold-border">
<div class="card-title">🏠 Save on Property Tax</div>
<p>Veterans, seniors, and disabled persons may qualify for additional exemptions. Some counties offer tax freezes for seniors (tax amount stays the same even if home value increases).</p>
<p><span class="ar">المحاربون القدماء والمسنون والعاجزون قد يستحقون إعفاءات إضافية.</span></p>
</div>

<h3>No State Corporate Income Tax</h3>
<p>Texas also has <strong>no corporate income tax</strong> — only federal corporate tax applies. This makes Texas attractive for entrepreneurs and business owners.</p>

<h3>Franchise Tax (Margin Tax)</h3>
<p>Businesses with gross revenue over $1.23 million pay a franchise tax (0.375%–1.5% depending on business structure). Not an income tax, but a revenue-based tax on large businesses.</p>`
      },
      {
        id: 'ch5',
        num: 5,
        title: 'Self-Employment & Business',
        titleAr: 'العمل الحر والأعمال التجارية',
        content: `<h3>Self-Employment Tax (Federal)</h3>
<p>Self-employed Texans pay <strong>federal self-employment tax (~15.3% total, 12.4% Social Security + 2.9% Medicare)</strong>. You can deduct 1/2 of SE tax on your federal return.</p>

<h3>No State Withholding or Estimated Payments</h3>
<p>Texas has <strong>NO state income tax withholding</strong>. Employers don't take Texas state tax out of your paycheck. You only pay federal income tax withholding and FICA taxes.</p>

<div class="tip-box green">
<div class="tip-icon">✅</div>
<div class="tip-content">
<div class="tip-label">More Take-Home Pay</div>
<p>Because there's no state income tax, Texans see more money in their paycheck compared to same-income residents of high-tax states. No surprise state tax bill at year-end.</p>
<p><span class="ar">الرواتب في تكساس تعطيك أكثر نقود — ما في ضريبة ولائية تنخصم.</span></p>
</div>
</div>

<h3>Business Owners: Franchise Tax Threshold</h3>
<p>If your business gross revenue exceeds $1.23 million, you owe franchise tax. Track your revenue carefully — crossing this threshold triggers a new tax obligation.</p>`
      },
      {
        id: 'ch6',
        num: 6,
        title: 'Tips & Advantages',
        titleAr: 'نصائح والمميزات',
        content: `<div class="tip-box gold">
<div class="tip-icon">🎉</div>
<div class="tip-content">
<div class="tip-label">The Texas Advantage</div>
<p>Zero state income tax saves the average Texas family $2,000–$5,000+ per year compared to high-tax states. Over a career, that's $100,000+. Combined with no state income tax on capital gains, Texas is a tax haven for high earners.</p>
<p><span class="ar">عدم وجود ضريبة دخل توفّر للعائلة الواحدة ٢٠٠٠–٥٠٠٠$ سنوياً أو أكثر مقارنة بالولايات الأخرى.</span></p>
</div>
</div>

<h3>Watch Out: Property Tax is High</h3>
<p>While Texas has no state income tax, property taxes are among the highest in the nation (0.8% average). If you're buying a home, budget for property tax carefully. It's not included in your mortgage payment.</p>

<div class="tip-box blue">
<div class="tip-icon">🏠</div>
<div class="tip-content">
<div class="tip-label">Homestead Exemption is Key</div>
<p>File for homestead exemption in your county as soon as you buy a home. Many Texans save $500–$1,500+ per year on property tax through this exemption.</p>
<p><span class="ar">تقدّم طلب الإعفاء من ضريبة الملكية في مقاطعتك — توفير كبير جداً.</span></p>
</div>
</div>

<h3>Keep Federal Records (No State Audit Pressure)</h3>
<p>Since Texas doesn't tax income, you face less state audit risk. However, keep all federal tax records for 3–7 years in case the IRS audits you.</p>`
      }
    ]
  }
};

// Continue with PA, IL, OH, GA, NC, MI, VA, WA in next section...
// [Remaining states will be added below]

const remainingStates = {
  PA: {
    name: 'Pennsylvania',
    nameAr: 'بنسلفانيا',
    abbr: 'PA',
    emoji: '🏛️',
    chapters: [
      {
        id: 'ch1',
        num: 1,
        title: 'Pennsylvania Tax Overview',
        titleAr: 'نظرة عامة على ضرائب بنسلفانيا',
        content: `Pennsylvania has a <strong>flat 3.07% income tax rate</strong> — one of the lowest and simplest in the nation. <span class="ar">بنسلفانيا فيها ضريبة دخل ثابتة ٣.٠٧٪ — بسيطة وسهلة.</span>

<h3>Key Features</h3>
<ul style="margin-left:20px;margin-bottom:16px;">
<li><strong>Flat 3.07% rate:</strong> Everyone pays the same percentage, no brackets</li>
<li><strong>NO standard deduction</strong> on state return (unlike federal)</li>
<li><strong>Local earned income tax:</strong> 0.5%–3.8% depending on municipality</li>
<li><strong>No capital gains tax</strong> on securities (major advantage for investors)</li>
</ul>

<div class="tip-box gold">
<div class="tip-icon">💡</div>
<div class="tip-content">
<div class="tip-label">Simple Flat Tax</div>
<p>Pennsylvania's 3.07% flat rate is much simpler than progressive states. However, there's no standard deduction, so even small income triggers a return requirement.</p>
<p><span class="ar">معدل موحد بسيط جداً — لا توجد أقواس ضريبية معقدة.</span></p>
</div>
</div>

<h3>Local Earned Income Tax (EIT)</h3>
<p>In addition to state 3.07%, your municipality may impose earned income tax of <strong>0.5%–3.8%</strong>. Total state + local can be <strong>3.57% to 6.87%</strong> depending on where you live.</p>

<h3>Filing Threshold</h3>
<p>Single/Married: Gross income $12,000+ requires filing. Self-employed with net earnings $400+ must file.`
      },
      {
        id: 'ch2',
        num: 2,
        title: 'Deductions & Credits',
        titleAr: 'الخصومات والائتمانات',
        content: `<div class="info-card navy-border">
<div class="card-title">🚫 No Standard Deduction</div>
<p>Pennsylvania does <strong>NOT allow a standard deduction</strong> on your PA state return (unlike the federal return). You must claim itemized deductions if eligible, or take no deductions if you don't itemize.</p>
<p><span class="ar">بنسلفانيا لا تسمح بخصم معياري على الإقرار الولائي — فقط الخصومات المفصلة.</span></p>
</div>

<h3>Earned Income Tax Credit (EITC)</h3>
<p>Pennsylvania offers a <strong>PA EITC of 30–32.5% of federal EITC</strong> (depending on number of children). Working families can receive significant refunds.</p>

<h3>Homeowner Property Tax Rebate</h3>
<p>Homeowners with household income under $45,000 may qualify for a <strong>rebate up to $650</strong> on property taxes paid. Must apply annually through DCED.</p>

<div class="info-card gold-border">
<div class="card-title">🏠 Property Tax Exemption</div>
<p>Seniors and disabled persons may qualify for homestead exemptions. A primary home may be exempt from property tax or receive tax relief.</p>
<p><span class="ar">المسنون والعاجزون قد يستحقون إعفاءات من ضريبة الملكية.</span></p>
</div>`
      },
      {
        id: 'ch3',
        num: 3,
        title: 'PA Filing Requirements',
        titleAr: 'متطلبات الإقرار',
        content: `<h3>Form PA-40</h3>
<p>All Pennsylvania residents file <strong>Form PA-40</strong> (or PA-40NR for non-residents). W-2 employees report income from PA Form PA-40 Schedule PA-1.</p>

<h3>Deadline: April 15</h3>
<p>PA tax returns due same day as federal (April 15). Automatic 6-month extension available if you request by April 15.</p>

<h3>Local Earned Income Tax (EIT) Return</h3>
<p>Your municipality may require a separate <strong>local EIT return</strong> (usually simpler than the state return). Some municipalities use a consolidated form.</p>

<div class="tip-box green">
<div class="tip-icon">✅</div>
<div class="tip-content">
<div class="tip-label">File Even If Below Threshold</div>
<p>File anyway if you had taxes withheld or are eligible for EITC — you'll get a refund.</p>
<p><span class="ar">قدّم الإقرار لو كان في خصم من الرواتب أو تستحق الـ EITC.</span></p>
</div>
</div>`
      },
      {
        id: 'ch4',
        num: 4,
        title: 'Property & Sales Tax',
        titleAr: 'ضرائب الملكية والمبيعات',
        content: `<h3>Property Tax (County/Municipality)</h3>
<p>Pennsylvania <strong>has NO state property tax</strong>. Property tax is local only, ranging from <strong>0.4% to 2.5%</strong> of home value depending on county and school district.</p>

<h3>Sales Tax: 6%</h3>
<p>Statewide sales tax is <strong>6%</strong>. Philadelphia adds <strong>1.3975%</strong> for a total of <strong>7.3975%</strong>. Most necessities (groceries, clothing under $110) are exempt.</p>

<h3>Tax Exemptions on Necessities</h3>
<ul style="margin-left:20px;">
<li>Groceries and unprepared foods</li>
<li>Children's clothing and footwear</li>
<li>Prescription drugs and medical devices</li>
<li>Heating fuel oil</li>
</ul>

<div class="info-card gold-border">
<div class="card-title">🏠 Homestead Exemption</div>
<p>Primary homeowners may receive property tax exemptions or abatements. Check your county assessor's office for specific programs.</p>
<p><span class="ar">المالكون الأساسيون قد يستحقون إعفاءات من ضريبة الملكية.</span></p>
</div>`
      },
      {
        id: 'ch5',
        num: 5,
        title: 'Self-Employment',
        titleAr: 'العمل الحر',
        content: `<h3>PA Income + Local EIT</h3>
<p>Self-employed must pay <strong>3.07% PA income tax + 0.5%–3.8% local EIT</strong> on self-employment income. No PA self-employment tax (that's federal only).</p>

<h3>Quarterly Estimated Payments</h3>
<p>If you expect to owe $400+ in PA tax, make quarterly estimates using <strong>Form PA-40ES</strong>. Due: April 15, June 15, September 15, January 15.</p>

<div class="tip-box blue">
<div class="tip-icon">💼</div>
<div class="tip-content">
<div class="tip-label">Business Deductions</div>
<p>Track business expenses: rent, supplies, equipment, home office. These reduce your taxable PA income on Schedule PA-C.</p>
<p><span class="ar">خصّص كل المصاريف التجارية: الإيجار، الإمدادات، المعدات.</span></p>
</div>
</div>`
      },
      {
        id: 'ch6',
        num: 6,
        title: 'Tips & Pitfalls',
        titleAr: 'نصائح وأخطاء',
        content: `<h3>No Standard Deduction — Plan Carefully</h3>
<p>Since PA has no standard deduction, you must either itemize or claim $0 deductions. Compare federal itemized deductions to PA situation.</p>

<div class="tip-box gold">
<div class="tip-icon">💡</div>
<div class="tip-content">
<div class="tip-label">Local EIT Can Be High</div>
<p>Some Pennsylvania municipalities charge 3.8% local EIT. Combined with state 3.07%, your total can exceed 6.87%. Know your local rate.</p>
<p><span class="ar">بعض المدن تفرض ضريبة محلية ٣.٨٪ — المجموع يصل لـ ٦.٨٧٪.</span></p>
</div>
</div>

<h3>No Tax on Investment Income</h3>
<p>Pennsylvania does <strong>NOT tax capital gains, dividends, or interest</strong> at the state level — major advantage for investors. All investment income is tax-free in PA.</p>

<div class="tip-box green">
<div class="tip-icon">✅</div>
<div class="tip-content">
<div class="tip-label">Claim PA EITC</div>
<p>Low-income earners: claim the PA EITC. It's 30–32.5% of federal EITC and fully refundable.</p>
<p><span class="ar">موظفون برواتب منخفضة: تأكدوا من الـ PA EITC.</span></p>
</div>
</div>`
      }
    ]
  }
};

Object.assign(stateData, remainingStates);

// ═══════════════════════════════════════════════════════════════
// REMAINING STATES (IL, OH, GA, NC, MI, VA, WA)
// ═══════════════════════════════════════════════════════════════

// Quick state data for remaining 7 states (abbreviated for token management)
const stateDataRemaining = {
  IL: {
    name: 'Illinois',
    nameAr: 'إلينوي',
    abbr: 'IL',
    emoji: '🌃',
    chapters: [
      { id: 'ch1', num: 1, title: 'Illinois Tax Overview', titleAr: 'نظرة عامة على ضرائب إلينوي', content: 'Illinois has a <strong>flat 4.95% state income tax</strong> with no brackets — everyone pays the same rate. <span class="ar">إلينوي فيها ضريبة دخل ثابتة ٤.٩٥٪.</span><h3>Standard Deduction (2025)</h3><p><strong>Single:</strong> $2,575 | <strong>MFJ:</strong> $5,150. Illinois also offers a personal exemption of $2,575.</p><h3>NO Local Income Tax</h3><p>Unlike some states, Illinois has NO local/municipal income tax. Only state 4.95% applies.</p><div class="info-card gold-border"><div class="card-title">💰 Simple & Low</div><p>With no local income tax and a flat 4.95% rate, Illinois has one of the simplest income tax systems. Middle-income earners pay less than in progressive states.</p><p><span class="ar">نظام ضريبة بسيط وسهل جداً — بدون ضرائب محلية، فقط الولائية الثابتة.</span></p></div>' },
      { id: 'ch2', num: 2, title: 'Deductions & Credits', titleAr: 'الخصومات والائتمانات', content: '<div class="info-card navy-border"><div class="card-title">📚 Qualified Tuition Deduction</div><p>Up to <strong>$20,000 per year</strong> for college tuition (state university or private). Deduction applies to yourself, spouse, or dependents.</p></div><h3>Illinois EITC</h3><p>Illinois EITC is <strong>18% of federal EITC</strong> — much lower than other states. Still helpful for low-income workers.</p><h3>No Property Tax Deduction at State Level</h3><p>Illinois does NOT allow property tax deduction on state return (only federal).</p>' },
      { id: 'ch3', num: 3, title: 'IL Filing Requirements', titleAr: 'متطلبات الإقرار', content: '<h3>Form IL-1040</h3><p>Illinois residents file <strong>Form IL-1040</strong> or <strong>IL-1040NR</strong> (non-residents). Deadline: <strong>April 15</strong>.</p><h3>Estimated Tax Payments</h3><p>Self-employed or high earners: pay quarterly estimates using <strong>IL-1040-ES</strong>.</p><div class="tip-box green"><div class="tip-icon">✅</div><div class="tip-content"><div class="tip-label">E-File Recommended</div><p>E-file your IL return for faster processing and fewer errors.</p></div></div>' },
      { id: 'ch4', num: 4, title: 'Property & Sales Tax', titleAr: 'ضرائب الملكية والمبيعات', content: '<h3>Property Tax</h3><p>Illinois property tax averages <strong>~0.8% of home value</strong> but ranges by county. No state property tax — only local (county + school district).</p><h3>Sales Tax: 6.25% Base</h3><p>Statewide rate is <strong>6.25%</strong>. Cook County (Chicago) adds <strong>1.25%</strong> for total <strong>7.5%</strong>. Groceries exempt.</p><h3>Homestead Exemption</h3><p>Homeowners age 65+ or disabled may qualify for homestead exemption reducing property tax by $2,500–$6,000.</p>' },
      { id: 'ch5', num: 5, title: 'Self-Employment', titleAr: 'العمل الحر', content: '<h3>Flat 4.95% on Self-Employment Income</h3><p>Self-employed pays flat 4.95% IL income tax on net earnings. Federal self-employment tax (~15.3%) also applies.</p><h3>No Local Income Tax Advantage</h3><p>Because Illinois has no local income tax, self-employed in IL enjoy lower total tax burden compared to states with local EIT.</p><div class="tip-box blue"><div class="tip-icon">💼</div><div class="tip-content"><div class="tip-label">Track All Expenses</div><p>Deduct all business expenses to reduce taxable income: supplies, equipment, home office, vehicle mileage.</p></div></div>' },
      { id: 'ch6', num: 6, title: 'Tips & Advantages', titleAr: 'نصائح والمميزات', content: '<div class="tip-box gold"><div class="tip-icon">🎉</div><div class="tip-content"><div class="tip-label">Simple Flat Tax System</div><p>Illinois 4.95% flat tax is simpler than progressive states with multiple brackets. Easy to calculate.</p></div></div><h3>No Local Income Tax</h3><p>Unlike Pennsylvania and other states, Illinois has <strong>NO municipal income tax</strong> — saves residents 0.5%–3.8%.</p><div class="tip-box green"><div class="tip-icon">✅</div><div class="tip-content"><div class="tip-label">Tuition Deduction Worth It</div><p>If paying for college, take the Illinois qualified tuition deduction up to $20,000/year. Check income limits.</p></div></div>' }
    ]
  },

  OH: {
    name: 'Ohio',
    nameAr: 'أوهايو',
    abbr: 'OH',
    emoji: '⭐',
    chapters: [
      { id: 'ch1', num: 1, title: 'Ohio Tax Overview', titleAr: 'نظرة عامة على ضرائب أوهايو', content: 'Ohio has a <strong>progressive income tax system</strong> with rates from <strong>0% to 3.75%</strong> — one of the lowest progressive systems in the US. <span class="ar">أوهايو فيها ضرائب تصاعدية من ٠٪ لـ ٣.٧٥٪ — الأقل في أمريكا.</span><h3>2025 OH Tax Brackets (Single)</h3><table class="tax-table"><thead><tr><th>Income</th><th>Rate</th></tr></thead><tbody><tr><td>$0 — $26,050</td><td>0% (no tax!)</td></tr><tr><td>$26,051 — $65,100</td><td>1.99%</td></tr><tr><td>$65,101 — $104,750</td><td>2.39%</td></tr><tr><td>$104,751+</td><td>3.75%</td></tr></tbody></table><div class="info-box gold"><div class="card-title">🎉 No Tax on First $26,050!</div><p>Ohio offers <strong>NO income tax</strong> on the first $26,050 of income. For single filers earning less than this, Ohio income tax is literally $0.</p></div>' },
      { id: 'ch2', num: 2, title: 'Deductions & Credits', titleAr: 'الخصومات والائتمانات', content: '<h3>Standard Deduction (2025)</h3><p><strong>Single:</strong> $2,300 | <strong>MFJ:</strong> $4,600 | <strong>Head of Household:</strong> $3,450.</p><div class="info-card navy-border"><div class="card-title">💰 Ohio EITC</div><p>Ohio EITC is <strong>5% of federal EITC</strong> — modest but helps. Working families receive small refund boost.</p></div><h3>No Tax on Retirement Income</h3><p>Ohio does <strong>NOT tax Social Security, pensions, or retirement account withdrawals</strong> — huge advantage for retirees and seniors.</p><div class="tip-box green"><div class="tip-icon">✅</div><div class="tip-content"><div class="tip-label">Retirement-Friendly</div><p>Retirees in Ohio pay NO state income tax on retirement income. This makes Ohio attractive for seniors moving from high-tax states.</p></div></div>' },
      { id: 'ch3', num: 3, title: 'OH Filing', titleAr: 'متطلبات الإقرار', content: '<h3>Form OH-1040</h3><p>Ohio residents file <strong>Form OH-1040</strong>. Deadline: <strong>April 15</strong> (same as federal).</p><h3>Filing Threshold</h3><p>If your income is below $26,050 (single), you owe <strong>$0 income tax</strong>. However, file anyway if you had withholding or are eligible for refundable credits.</p><h3>Estimated Tax Payments</h3><p>Self-employed: pay quarterly estimates using <strong>OH-1040-ES</strong>.</p>' },
      { id: 'ch4', num: 4, title: 'Property & Sales Tax', titleAr: 'ضرائب الملكية والمبيعات', content: '<h3>Property Tax</h3><p>Ohio property tax averages <strong>~0.6% of home value</strong> — among the lowest in the nation. Varies by county.</p><h3>Sales Tax: 5.75% Base</h3><p>Statewide: <strong>5.75%</strong>. Local counties add up to <strong>1.75%</strong> more. Food and prescription drugs exempt.</p><h3>Homestead Exemption</h3><p>Primary homeowners may receive property tax reduction. Seniors and disabled qualify for additional relief up to 50% property tax reduction.</p>' },
      { id: 'ch5', num: 5, title: 'Self-Employment', titleAr: 'العمل الحر', content: '<h3>Progressive Tax on Self-Employment</h3><p>Self-employed pays same progressive OH income tax as wage earners: 0% on first $26,050, then 1.99%–3.75% on income above.</p><h3>Federal Self-Employment Tax</h3><p>Self-employed also pay federal SE tax (~15.3%) plus Medicare tax 3.8% on net earnings over $200,000.</p><div class="tip-box blue"><div class="tip-icon">💼</div><div class="tip-content"><div class="tip-label">Lower State Tax for SE</div><p>Ohio\'s progressive system with low rates (max 3.75%) is friendly to self-employed. Track expenses to reduce taxable income.</p></div></div>' },
      { id: 'ch6', num: 6, title: 'Tips & Advantages', titleAr: 'نصائح والمميزات', content: '<div class="tip-box gold"><div class="tip-icon">🎉</div><div class="tip-content"><div class="tip-label">No Tax on First $26,050!</div><p>Single filers earning under $26,050 owe $0 Ohio state income tax. This is huge for low-to-middle income workers.</p></div></div><h3>Retirement Income Tax-Free</h3><p>If you\'re retired and living off Social Security, pensions, 401(k) withdrawals, or IRA distributions, Ohio taxes are $0. Best state for retirees.</p><div class="tip-box green"><div class="tip-icon">✅</div><div class="tip-content"><div class="tip-label">Plan Retirement in Ohio</div><p>If planning retirement, Ohio is extremely tax-friendly. No state tax on retirement income makes a huge difference.</p></div></div>' }
    ]
  },

  GA: {
    name: 'Georgia',
    nameAr: 'جورجيا',
    abbr: 'GA',
    emoji: '🍑',
    chapters: [
      { id: 'ch1', num: 1, title: 'Georgia Tax Overview', titleAr: 'نظرة عامة على ضرائب جورجيا', content: 'Georgia has a <strong>flat 5.49% income tax rate</strong> (2025) — simple and moderate. <span class="ar">جورجيا فيها ضريبة دخل ثابتة ٥.٤٩٪.</span><h3>Standard Deduction (2025)</h3><p><strong>Single:</strong> $3,100 | <strong>MFJ:</strong> $6,200 | <strong>Head of Household:</strong> $4,650.</p><h3>Simple Flat System</h3><p>Georgia\'s flat 5.49% applies to all income above standard deduction. No brackets to worry about — very straightforward.</p>' },
      { id: 'ch2', num: 2, title: 'Deductions & Credits', titleAr: 'الخصومات والائتمانات', content: '<div class="info-card gold-border"><div class="card-title">💰 Georgia EITC</div><p>Georgia EITC is <strong>3% of federal EITC</strong> — modest but available for working families.</p></div><h3>Dependent Exemption</h3><p>Additional $3,000 exemption per dependent (child). Reduces taxable income.</p><h3>No Tax on Certain Retirement Income</h3><p>Certain retirement income (pensions from some sources, limited IRA distributions) may be excluded if age 65+.</p><div class="tip-box blue"><div class="tip-icon">🏠</div><div class="tip-content"><div class="tip-label">Standard Deduction is Generous</div><p>Georgia\'s standard deduction is higher than federal for some filers. If you don\'t itemize federally, use GA standard deduction.</p></div></div>' },
      { id: 'ch3', num: 3, title: 'GA Filing', titleAr: 'متطلبات الإقرار', content: '<h3>Form GA-500</h3><p>Georgia residents file <strong>Form GA-500</strong> or <strong>GA-500NR</strong>. Deadline: <strong>April 15</strong>.</p><h3>Filing Threshold</h3><p>If income exceeds standard deduction ($6,200 for MFJ), you must file.</p><h3>Estimated Payments</h3><p>Self-employed: pay quarterly estimates using <strong>GA-ES</strong>.</p>' },
      { id: 'ch4', num: 4, title: 'Property & Sales Tax', titleAr: 'ضرائب الملكية والمبيعات', content: '<h3>Property Tax</h3><p>Georgia property tax averages <strong>~0.6% of home value</strong> (one of the lowest). Varies by county.</p><h3>Sales Tax: 4% State + Local</h3><p>Statewide: <strong>4%</strong> (one of the lowest). Local counties add up to <strong>4%</strong> more, for totals of <strong>4%–8%</strong>. Groceries taxed at 4%.</p>' },
      { id: 'ch5', num: 5, title: 'Self-Employment', titleAr: 'العمل الحر', content: '<h3>Flat 5.49% on Self-Employment</h3><p>Self-employed pays flat 5.49% GA income tax. Federal SE tax (~15.3%) applies on top.</p><div class="tip-box green"><div class="tip-icon">✅</div><div class="tip-content"><div class="tip-label">Moderate Rate</div><p>Georgia\'s 5.49% flat rate is moderate for self-employed — not the lowest, but not as high as some states.</p></div></div>' },
      { id: 'ch6', num: 6, title: 'Tips & Advantages', titleAr: 'نصائح والمميزات', content: '<h3>Simple Flat Tax</h3><p>No brackets, no complexity. Everyone pays 5.49%.</p><h3>Moderate Tax Burden</h3><p>Combined with low property tax, Georgia offers moderate overall tax burden for middle-income earners.</p>' }
    ]
  },

  NC: {
    name: 'North Carolina',
    nameAr: 'كارولينا الشمالية',
    abbr: 'NC',
    emoji: '🏖️',
    chapters: [
      { id: 'ch1', num: 1, title: 'North Carolina Tax Overview', titleAr: 'نظرة عامة على ضرائب كارولينا الشمالية', content: 'North Carolina has a <strong>flat 4.5% income tax rate</strong> (2025) — one of the most competitive flat taxes in the nation. <span class="ar">كارولينا الشمالية فيها ضريبة دخل ثابتة ٤.٥٪ — من أفضلها.</span><h3>Standard Deduction (2025)</h3><p><strong>Single:</strong> $12,750 | <strong>MFJ:</strong> $25,500 | <strong>HOH:</strong> $19,125 — among the highest in the nation!</p><h3>Very Competitive</h3><p>Combination of 4.5% flat rate + high standard deduction makes NC very attractive for working families.</p>' },
      { id: 'ch2', num: 2, title: 'Deductions & Credits', titleAr: 'الخصومات والائتمانات', content: '<div class="info-card gold-border"><div class="card-title">💰 NC EITC</div><p>North Carolina EITC is <strong>8% of federal EITC</strong> — modest but helps working families.</p></div><h3>High Standard Deduction</h3><p>NC\'s standard deduction of $25,500 (MFJ) is one of the highest. Many families owe $0 NC income tax.</p><div class="tip-box green"><div class="tip-icon">✅</div><div class="tip-content"><div class="tip-label">High SD = Lower Tax</div><p>With such a high standard deduction, many working families owe no NC income tax at all.</p></div></div>' },
      { id: 'ch3', num: 3, title: 'NC Filing', titleAr: 'متطلبات الإقرار', content: '<h3>Form D-400</h3><p>North Carolina residents file <strong>Form D-400</strong>. Deadline: <strong>April 15</strong>.</p><h3>Filing Threshold</h3><p>Income must exceed standard deduction ($25,500 for MFJ) to require filing.</p>' },
      { id: 'ch4', num: 4, title: 'Property & Sales Tax', titleAr: 'ضرائب الملكية والمبيعات', content: '<h3>Property Tax</h3><p>North Carolina property tax averages <strong>~0.8% of home value</strong>.</p><h3>Sales Tax: 4.75% Base</h3><p>Statewide: <strong>4.75%</strong>. Local counties add up to <strong>2.75%</strong> more, for totals of <strong>4.75%–7.5%</strong>.</p>' },
      { id: 'ch5', num: 5, title: 'Self-Employment', titleAr: 'العمل الحر', content: '<h3>Flat 4.5% on Self-Employment Income</h3><p>Self-employed pays flat 4.5% NC income tax on net earnings. Very competitive rate.</p>' },
      { id: 'ch6', num: 6, title: 'Tips & Advantages', titleAr: 'نصائح والمميزات', content: '<div class="tip-box gold"><div class="tip-icon">🎉</div><div class="tip-content"><div class="tip-label">High Standard Deduction is Key</div><p>NC\'s $25,500 standard deduction (MFJ) is among the highest in America. Most middle-income families pay very little or $0 NC income tax.</p></div></div>' }
    ]
  },

  MI: {
    name: 'Michigan',
    nameAr: 'ميشيجان',
    abbr: 'MI',
    emoji: '🏞️',
    chapters: [
      { id: 'ch1', num: 1, title: 'Michigan Tax Overview', titleAr: 'نظرة عامة على ضرائب ميشيجان', content: 'Michigan has a <strong>flat 4.25% income tax rate</strong> — moderate and simple. <span class="ar">ميشيجان فيها ضريبة دخل ثابتة ٤.٢٥٪.</span><h3>Personal Exemption (Not Standard Deduction)</h3><p>Instead of standard deduction, Michigan allows a <strong>$5,600 personal exemption</strong> per person (2025). This reduces taxable income similarly to standard deduction.</p>' },
      { id: 'ch2', num: 2, title: 'Deductions & Credits', titleAr: 'الخصومات والائتمانات', content: '<div class="info-card navy-border"><div class="card-title">💰 Michigan EITC</div><p>Michigan EITC is <strong>6% of federal EITC</strong> for families with children.</p></div><h3>Dependent Exemption</h3><p>Each dependent gets additional $2,000 exemption (2025).</p>' },
      { id: 'ch3', num: 3, title: 'MI Filing', titleAr: 'متطلبات الإقرار', content: '<h3>Form MI-1040</h3><p>Michigan residents file <strong>Form MI-1040</strong>. Deadline: <strong>April 15</strong>.</p>' },
      { id: 'ch4', num: 4, title: 'Property & Sales Tax', titleAr: 'ضرائب الملكية والمبيعات', content: '<h3>Property Tax</h3><p>Michigan property tax averages <strong>~1.4% of home value</strong> — higher than average.</p><h3>Sales Tax: 6%</h3><p>Flat statewide rate of <strong>6%</strong>. Groceries and prescription drugs exempt.</p>' },
      { id: 'ch5', num: 5, title: 'Self-Employment', titleAr: 'العمل الحر', content: '<h3>Flat 4.25% on Self-Employment</h3><p>Self-employed pays 4.25% MI income tax. Moderate rate.</p>' },
      { id: 'ch6', num: 6, title: 'Tips & Advantages', titleAr: 'نصائح والمميزات', content: '<h3>Simple Flat Tax</h3><p>4.25% flat rate is straightforward. Personal exemption system reduces complexity.</p>' }
    ]
  },

  VA: {
    name: 'Virginia',
    nameAr: 'فرجينيا',
    abbr: 'VA',
    emoji: '🏛️',
    chapters: [
      { id: 'ch1', num: 1, title: 'Virginia Tax Overview', titleAr: 'نظرة عامة على ضرائب فرجينيا', content: 'Virginia has a <strong>progressive income tax system</strong> with rates from <strong>2% to 5.75%</strong> across 4 brackets. <span class="ar">فرجينيا فيها ضرائب تصاعدية من ٢٪ لـ ٥.٧٥٪.</span><h3>2025 VA Tax Brackets (Single)</h3><table class="tax-table"><thead><tr><th>Income</th><th>Rate</th></tr></thead><tbody><tr><td>$0 — $3,000</td><td>2%</td></tr><tr><td>$3,001 — $12,000</td><td>3%</td></tr><tr><td>$12,001 — $60,000</td><td>5.75%</td></tr><tr><td>$60,001+</td><td>5.75%</td></tr></tbody></table><h3>Standard Deduction (2025)</h3><p><strong>Single:</strong> $8,000 | <strong>MFJ:</strong> $16,000.</p>' },
      { id: 'ch2', num: 2, title: 'Deductions & Credits', titleAr: 'الخصومات والائتمانات', content: '<div class="info-card gold-border"><div class="card-title">💰 Virginia EITC</div><p>Virginia EITC is <strong>20% of federal EITC</strong> — among the most generous states for working families.</p></div><h3>Child Tax Credit</h3><p>Virginia offers additional child-dependent credits on top of federal.</p>' },
      { id: 'ch3', num: 3, title: 'VA Filing', titleAr: 'متطلبات الإقرار', content: '<h3>Form VA 740</h3><p>Virginia residents file <strong>Form VA 740</strong>. Deadline: <strong>May 1</strong> (5 days later than federal).</p>' },
      { id: 'ch4', num: 4, title: 'Property & Sales Tax', titleAr: 'ضرائب الملكية والمبيعات', content: '<h3>Property Tax</h3><p>Virginia property tax averages <strong>~0.8% of home value</strong>. Varies by county.</p><h3>Sales Tax: 4.3% State + Local</h3><p>Statewide: <strong>4.3%</strong>. Local counties add up to <strong>1.7%</strong> more, for totals of <strong>4.3%–6%</strong>. Groceries exempt.</p>' },
      { id: 'ch5', num: 5, title: 'Self-Employment', titleAr: 'العمل الحر', content: '<h3>Progressive Tax on Self-Employment</h3><p>Self-employed pays progressive VA tax: 2% on first $3,000, 3% on next $9,000, 5.75% above $12,000.</p>' },
      { id: 'ch6', num: 6, title: 'Tips & Advantages', titleAr: 'نصائح والمميزات', content: '<div class="tip-box gold"><div class="tip-icon">✅</div><div class="tip-content"><div class="tip-label">Generous EITC</div><p>Virginia\'s EITC at 20% of federal is among the most generous. Working families get significant refunds.</p></div></div>' }
    ]
  },

  WA: {
    name: 'Washington',
    nameAr: 'واشنطن',
    abbr: 'WA',
    emoji: '🏔️',
    chapters: [
      { id: 'ch1', num: 1, title: 'Washington: No State Income Tax!', titleAr: 'واشنطن: لا توجد ضريبة دخل!', content: `<div class="tip-box gold" style="margin-bottom:32px;">
<div class="tip-icon">🎉</div>
<div class="tip-content">
<div class="tip-label">Zero State Income Tax</div>
<p><strong>Washington has NO state income tax.</strong> File federal return only. Major financial advantage.</p>
<p><span class="ar">واشنطن لا تفرض ضريبة دخل ولائية — فقط الفيدرالي.</span></p>
</div>
</div>

<h3>Alternative Revenue: Sales Tax</h3>
<p>Washington generates revenue through <strong>sales tax (10.25%), property tax, and capital gains tax</strong> (on long-term gains over $250,000 annually).</p>

<h3>Capital Gains Tax (2022 onward)</h3>
<p>Washington taxes <strong>long-term capital gains at 7% if annual gains exceed $270,000</strong>. For most people, this doesn't apply. But high earners with investment income should be aware.</p>` },
      { id: 'ch2', num: 2, title: 'Sales & Property Tax', titleAr: 'ضرائب المبيعات والملكية', content: '<h3>Sales Tax: High but No Income Tax Offset</h3><p>Statewide base <strong>6.5%</strong>. Local counties add up to <strong>3.75%</strong> more, for totals of <strong>6.5%–10.25%</strong>. NO exemptions on groceries (unlike most states).</p><h3>Property Tax</h3><p>Washington property tax averages <strong>~0.84% of home value</strong>.</p><div class="info-card gold-border"><div class="card-title">🏠 High Sales Tax Trade-off</div><p>Washington\'s very high sales tax (up to 10.25%) is the trade-off for no income tax. Essential goods like groceries are taxed.</p></div>' },
      { id: 'ch3', num: 3, title: 'Filing & Federal Only', titleAr: 'الإقرارات الفيدرالية فقط', content: '<h3>No State Return Required</h3><p>Washington has <strong>NO state income tax return</strong>. File federal Form 1040 with IRS only.</p><h3>Self-Employed: Federal Only</h3><p>Self-employed file federal Schedule C and SE tax — no state equivalent.</p>' },
      { id: 'ch4', num: 4, title: 'Capital Gains Tax Details', titleAr: 'ضريبة الأرباح الرأسمالية', content: '<h3>7% Tax on Long-Term Gains (If >$270,000/year)</h3><p>Washington taxes long-term capital gains at <strong>7%</strong> if your annual gains exceed <strong>$270,000</strong>. Applies to stocks, bonds, real estate (not primary residence).</p><div class="tip-box blue"><div class="tip-icon">💰</div><div class="tip-content"><div class="tip-label">Most People Unaffected</div><p>If your capital gains are under $270,000/year, Washington has ZERO capital gains tax.</p></div></div>' },
      { id: 'ch5', num: 5, title: 'Self-Employment Advantage', titleAr: 'مميزات العمل الحر', content: '<h3>No State SE Tax</h3><p>Self-employed pay federal SE tax (~15.3%) only. No state equivalent saves significant money.</p><div class="tip-box green"><div class="tip-icon">✅</div><div class="tip-content"><div class="tip-label">Business Owners Love WA</div><p>Washington is extremely business-friendly: no state income tax, no corporate income tax.</p></div></div>' },
      { id: 'ch6', num: 6, title: 'Tips & Advantages', titleAr: 'نصائح والمميزات', content: '<div class="tip-box gold"><div class="tip-icon">🎉</div><div class="tip-content"><div class="tip-label">Zero State Income Tax</div><p>Washington saves residents $2,000–$10,000+ per year compared to high-tax states. Over a career, that\'s $100,000+.</p></div></div><h3>High Sales Tax Trade-off</h3><p>The 10.25% sales tax (especially on groceries) is the downside. Budget for this in consumer purchases.</p><h3>Perfect for High Earners</h3><p>Wealthy retirees and business owners benefit most from no income/corporate tax. Capital gains tax only affects very successful investors.</p>' }
    ]
  }
};

Object.assign(stateData, stateDataRemaining);

// ═══════════════════════════════════════════════════════════════
// CSS TEMPLATE (from guide-nj.html)
// ═══════════════════════════════════════════════════════════════

const CSS_TEMPLATE = `<style>
:root {
  --navy: #0d3b66;
  --navy-light: #1a5276;
  --navy-dark: #071e38;
  --navy-deep: #050e1a;
  --gold: #c9a84c;
  --gold-light: #dab95e;
  --gold-dark: #b08f3a;
  --gold-pale: #f5ecd4;
  --gold-glow: rgba(201,168,76,0.25);
  --cream: #faf8f2;
  --cream-dark: #f0ebe0;
  --white: #ffffff;
  --text: #1a1f36;
  --text-light: #5e6a82;
  --text-faint: #8b92a5;
  --border: #e2ddd2;
  --success: #0f5132;
  --success-bg: #e8f5ef;
  --danger: #b03a2e;
  --danger-bg: #fde8e5;
  --info-bg: #e8eff8;
  --font-display: 'Playfair Display', 'Noto Sans Arabic', serif;
  --font-body: 'Lato', 'Noto Sans Arabic', sans-serif;
  --shadow-sm: 0 2px 8px rgba(13,59,102,0.06);
  --shadow-md: 0 4px 20px rgba(13,59,102,0.08);
  --shadow-lg: 0 8px 40px rgba(13,59,102,0.10);
  --shadow-gold: 0 0 30px rgba(201,168,76,0.2);
  --radius: 6px;
  --radius-lg: 14px;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { font-family: var(--font-body); background: var(--cream); color: var(--text); line-height: 1.75; font-size: 16px; font-weight: 400; }
.scroll-progress { position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light)); z-index: 10000; transition: width 0.1s linear; }
.sidebar { position: fixed; top: 0; left: 0; width: 280px; height: 100vh; background: var(--navy-deep); color: white; overflow-y: auto; z-index: 1000; padding: 0; transition: transform 0.35s cubic-bezier(0.4,0,0.2,1); }
.sidebar::-webkit-scrollbar { width: 4px; }
.sidebar::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius: 4px; }
.sidebar-header { padding: 32px 24px 24px; border-bottom: 1px solid rgba(201,168,76,0.15); text-align: center; }
.sidebar-header .logo-icon { font-size: 36px; display: block; margin-bottom: 8px; }
.sidebar-header h2 { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--gold); letter-spacing: 0.5px; }
.sidebar-header .subtitle { font-size: 11px; color: rgba(255,255,255,0.45); font-weight: 400; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px; }
.nav-section { padding: 20px 16px 8px; }
.nav-section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: var(--gold-dark); font-weight: 700; padding: 0 8px; margin-bottom: 8px; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius); color: rgba(255,255,255,0.65); text-decoration: none; font-size: 13px; font-weight: 400; transition: all 0.18s ease; cursor: pointer; margin-bottom: 2px; }
.nav-item:hover { background: rgba(201,168,76,0.08); color: white; }
.nav-item.active { background: rgba(201,168,76,0.12); color: var(--gold); font-weight: 700; }
.nav-item .nav-num { width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.08); }
.nav-item.active .nav-num { background: var(--gold); color: var(--navy-deep); border-color: var(--gold); }
.main { margin-left: 280px; min-height: 100vh; }
.hero { background: linear-gradient(160deg, var(--navy-deep) 0%, var(--navy) 50%, var(--navy-light) 100%); color: white; padding: 100px 60px 80px; position: relative; overflow: hidden; }
.hero::before { content: ''; position: absolute; top: -100px; right: -100px; width: 500px; height: 500px; background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%); pointer-events: none; }
.hero::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
.hero-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.25); padding: 6px 16px; border-radius: 50px; font-size: 12px; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 24px; }
.hero h1 { font-family: var(--font-display); font-size: 52px; font-weight: 800; line-height: 1.15; margin-bottom: 16px; max-width: 650px; }
.hero h1 .gold { color: var(--gold); }
.hero .hero-ar { font-family: 'Noto Sans Arabic', serif; font-size: 28px; font-weight: 700; color: rgba(255,255,255,0.5); margin-bottom: 24px; direction: rtl; }
.hero p { font-size: 18px; line-height: 1.7; color: rgba(255,255,255,0.7); max-width: 560px; font-weight: 300; }
.chapter { padding: 80px 60px; max-width: 840px; border-bottom: 1px solid var(--border); animation: fadeUp 0.5s ease both; }
.chapter:last-child { border-bottom: none; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.chapter-label { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 2.5px; font-weight: 700; color: var(--gold-dark); margin-bottom: 12px; }
.chapter-label .line { width: 30px; height: 2px; background: var(--gold); }
.chapter h2 { font-family: var(--font-display); font-size: 34px; font-weight: 800; color: var(--navy); line-height: 1.25; margin-bottom: 8px; }
.chapter .h2-ar { font-family: 'Noto Sans Arabic', serif; font-size: 22px; font-weight: 700; color: var(--text-light); direction: rtl; margin-bottom: 28px; }
.chapter h3 { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--navy); margin: 36px 0 14px; padding-left: 16px; border-left: 3px solid var(--gold); }
.chapter p { margin-bottom: 16px; color: var(--text); font-size: 16px; line-height: 1.8; }
.chapter p .ar { display: block; direction: rtl; text-align: right; color: var(--text-light); font-family: 'Noto Sans Arabic', sans-serif; font-size: 14px; margin-top: 4px; }
.info-card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px 28px; margin: 24px 0; box-shadow: var(--shadow-sm); transition: all 0.22s ease; position: relative; }
.info-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.info-card.gold-border { border-left: 4px solid var(--gold); }
.info-card.navy-border { border-left: 4px solid var(--navy); }
.info-card .card-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--navy); margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.info-card p { margin-bottom: 8px; font-size: 15px; }
.tip-box { display: flex; gap: 14px; padding: 20px 22px; border-radius: var(--radius-lg); margin: 24px 0; }
.tip-box.gold { background: var(--gold-pale); border: 1px solid rgba(201,168,76,0.3); }
.tip-box.green { background: var(--success-bg); border: 1px solid rgba(15,81,50,0.15); }
.tip-box.blue { background: var(--info-bg); border: 1px solid rgba(13,59,102,0.12); }
.tip-box.red { background: var(--danger-bg); border: 1px solid rgba(176,58,46,0.15); }
.tip-box .tip-icon { font-size: 22px; flex-shrink: 0; line-height: 1; }
.tip-box .tip-content { flex: 1; }
.tip-box .tip-label { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; color: var(--navy); }
.tip-box p { font-size: 14px; margin-bottom: 4px; }
.tip-box p:last-child { margin-bottom: 0; }
table.tax-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
table.tax-table th { background: var(--navy-deep); color: white; padding: 12px; text-align: left; font-weight: 700; }
table.tax-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); }
table.tax-table tr:hover { background: var(--gold-pale); }
.guide-footer { text-align: center; padding: 60px 60px; background: var(--navy-deep); color: white; border-top: 1px solid rgba(201,168,76,0.15); }
.guide-footer p { margin-bottom: 8px; font-size: 14px; line-height: 1.6; }
.guide-footer .gold { color: var(--gold); }
.mobile-menu-btn { display: none; position: fixed; top: 20px; left: 20px; width: 40px; height: 40px; background: var(--navy-deep); color: white; border: none; border-radius: var(--radius); font-size: 18px; z-index: 2000; cursor: pointer; transition: all 0.2s ease; }
.mobile-menu-btn:hover { background: var(--navy); }
.sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999; }
@media (max-width: 900px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .sidebar-overlay.open { display: block; }
  .mobile-menu-btn { display: flex; align-items: center; justify-content: center; }
  .main { margin-left: 0; }
  .hero { padding: 80px 24px 60px; }
  .hero h1 { font-size: 32px; }
  .hero .hero-ar { font-size: 20px; }
  .chapter { padding: 50px 24px; }
  .chapter h2 { font-size: 26px; }
  .guide-footer { padding: 36px 24px; }
}
@media print {
  .sidebar, .mobile-menu-btn, .scroll-progress { display: none !important; }
  .main { margin-left: 0; }
  .hero { padding: 40px; }
  .chapter { page-break-inside: avoid; padding: 30px 0; }
}
</style>`;

// ═══════════════════════════════════════════════════════════════
// HTML TEMPLATE FUNCTION
// ═══════════════════════════════════════════════════════════════

function generateStateGuideHTML(state) {
  const navItems = state.chapters.map(ch =>
    `<a class="nav-item" href="#${ch.id}" data-target="${ch.id}" onclick="scrollToChapter(event,'${ch.id}')"><span class="nav-num">${ch.num}</span> ${ch.title}</a>`
  ).join('\n    ');

  const chapters = state.chapters.map(ch => `
  <section class="chapter" id="${ch.id}">
    <div class="chapter-label"><span class="line"></span> Chapter ${ch.num}</div>
    <h2>${ch.title}</h2>
    <div class="h2-ar">${ch.titleAr}</div>
    ${ch.content}
  </section>`).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${state.name} Tax Guide — دليل ضرائب ${state.nameAr} | Tax Advisor Pro</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=Lato:wght@300;400;700;900&family=Noto+Sans+Arabic:wght@400;500;600;700;800&display=swap" rel="stylesheet">
${CSS_TEMPLATE}
</head>
<body>

<!-- Scroll Progress -->
<div class="scroll-progress" id="scrollProgress"></div>

<!-- Mobile Menu Button -->
<button class="mobile-menu-btn" id="mobileMenuBtn" onclick="toggleSidebar()">☰</button>
<div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

<!-- Sidebar Navigation -->
<nav class="sidebar" id="sidebar">
  <div class="sidebar-header">
    <span class="logo-icon">${state.emoji}</span>
    <h2>${state.name} Tax</h2>
    <div class="subtitle">2025 Guide</div>
  </div>

  <div style="padding:16px 16px 0;">
    <a href="guide.html" class="nav-item" style="background:var(--gold);color:var(--navy-deep);font-weight:800;justify-content:center;border-radius:8px;padding:11px 12px;text-decoration:none;font-size:12px;margin-bottom:8px;">
      ← Back to Main Guide
    </a>
    <a href="index.html" class="nav-item" style="background:rgba(201,168,76,0.15);color:var(--gold);font-weight:800;justify-content:center;border-radius:8px;padding:11px 12px;text-decoration:none;font-size:12px;">
      ← Back to App — الرجوع للتطبيق
    </a>
  </div>

  <div class="nav-section">
    <div class="nav-section-label">${state.name} Taxes</div>
    ${navItems}
  </div>
</nav>

<!-- Main Content -->
<div class="main">

  <!-- HERO -->
  <header class="hero" id="top">
    <div class="hero-badge">✦ ${state.name} — 2025 Tax Year</div>
    <h1>The ${state.name}<br><span class="gold">Tax Guide</span></h1>
    <div class="hero-ar">دليل ضرائب ${state.nameAr} الشامل</div>
    <p>Everything you need to understand ${state.name} state taxes, maximize your deductions, and navigate tax savings opportunities — explained clearly in English and Arabic.</p>
  </header>

  <!-- CHAPTERS -->
${chapters}

  <footer class="guide-footer">
    <div style="font-size:28px;margin-bottom:12px;">${state.emoji}</div>
    <p style="font-family:var(--font-display);font-size:18px;color:var(--gold);margin-bottom:8px;">${state.name} Tax Guide</p>
    <p>دليل ضرائب ${state.nameAr}</p>
    <p style="margin-top:16px;">2025 Tax Year (Filing 2026) &middot; Built with ♥ for <span class="gold">Mina</span></p>
  </footer>

</div>

<script>
// ── SCROLL TO CHAPTER (main navigation handler) ──
function scrollToChapter(event, targetId) {
  event.preventDefault();
  event.stopPropagation();

  const target = document.getElementById(targetId);
  if (!target) return;

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  const clickedNav = document.querySelector('.nav-item[data-target="' + targetId + '"]');
  if (clickedNav) clickedNav.classList.add('active');

  try {
    if (window.top === window.self) {
      history.replaceState(null, '', '#' + targetId);
    }
  } catch(e) { /* ignore in iframe */ }

  if (window.innerWidth <= 900) {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('open');
  }
}

// ── Scroll progress bar ──
window.addEventListener('scroll', () => {
  const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
  const height = (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight;
  if (height > 0) {
    const scrolled = (winScroll / height) * 100;
    document.getElementById('scrollProgress').style.width = scrolled + '%';
  }
});

// ── Active nav highlight on scroll ──
const chapters = document.querySelectorAll('.chapter');
const navItems = document.querySelectorAll('.nav-item');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(item => item.classList.remove('active'));
      const id = entry.target.id;
      const activeNav = document.querySelector('.nav-item[data-target="' + id + '"]');
      if (activeNav) activeNav.classList.add('active');
    }
  });
}, { rootMargin: '-20% 0px -70% 0px' });

chapters.forEach(ch => observer.observe(ch));

// ── Mobile sidebar toggle ──
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}

// ── Handle hash on page load ──
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    setTimeout(() => {
      const target = document.getElementById(hash);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }
});

// ── Fade-in on scroll ──
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
    }
  });
}, { threshold: 0.1 });

chapters.forEach(ch => {
  ch.style.animationPlayState = 'paused';
  fadeObserver.observe(ch);
});
</script>
</body>
</html>`;

  return html;
}

// ═══════════════════════════════════════════════════════════════
// MAIN GENERATION FUNCTION
// ═══════════════════════════════════════════════════════════════

async function generateAllGuides() {
  const publicDir = path.join(__dirname, 'public');
  const statesToGenerate = ['CA', 'TX', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI', 'VA', 'WA'];

  console.log('\n========================================');
  console.log('GENERATING STATE TAX GUIDES');
  console.log('========================================\n');

  let successCount = 0;
  let errorCount = 0;

  for (const abbr of statesToGenerate) {
    const state = stateData[abbr];
    if (!state) {
      console.error(`ERROR: State ${abbr} not found in stateData`);
      errorCount++;
      continue;
    }

    const filename = `guide-${abbr.toLowerCase()}.html`;
    const filepath = path.join(publicDir, filename);

    try {
      const html = generateStateGuideHTML(state);

      // Validate JavaScript
      try {
        new Function(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
      } catch (jsErr) {
        throw new Error(`JavaScript validation failed: ${jsErr.message}`);
      }

      fs.writeFileSync(filepath, html, 'utf-8');
      const stats = fs.statSync(filepath);
      const lines = html.split('\n').length;

      console.log(`✓ ${state.name.padEnd(15)} (${abbr}) - ${lines} lines, ${Math.round(stats.size / 1024)}KB`);
      successCount++;
    } catch (err) {
      console.error(`✗ ${state.name.padEnd(15)} (${abbr}) - ERROR: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n========================================');
  console.log(`Generated: ${successCount} files | Errors: ${errorCount}`);
  console.log('========================================\n');

  if (errorCount === 0) {
    console.log('All guides generated successfully!');
    process.exit(0);
  } else {
    console.log('Some guides failed. Please check errors above.');
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════
// RUN GENERATOR
// ═══════════════════════════════════════════════════════════════

generateAllGuides().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
