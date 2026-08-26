export type Language = 'ar' | 'en';

export interface Translations {
  appName: string;
  tagline: string;
  heroSubtitle: string;
  ctaCreateGroup: string;
  ctaHowItWorks: string;
  ctaGetStarted: string;

  // How it works
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;

  // Example schedule
  exampleTitle: string;
  exampleSubtitle: string;
  exampleTag: string;

  // Features
  featuresTitle: string;
  featuresSubtitle: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  feature4Title: string;
  feature4Desc: string;
  feature5Title: string;
  feature5Desc: string;
  feature6Title: string;
  feature6Desc: string;

  // Group creation & form
  createGroupTitle: string;
  createGroupSubtitle: string;
  groupNameLabel: string;
  groupNamePlaceholder: string;
  groupNameHelp: string;

  // Member setup
  membersTitle: string;
  membersSubtitle: string;
  addMemberBtn: string;
  noMembersTitle: string;
  noMembersDesc: string;
  memberNameLabel: string;
  memberNamePlaceholder: string;
  knowledgeLabel: string;
  knowledgeEntire: string;
  knowledgeJuzRange: string;
  knowledgeSurahRange: string;
  startJuzLabel: string;
  endJuzLabel: string;
  startSurahLabel: string;
  endSurahLabel: string;
  weeklyAmountLabel: string;
  weeklyAmountUnit: string;
  weeklyAmountHelp: string;
  removeMember: string;
  memberCount: string;

  // Total validation
  totalLabel: string;
  totalSuccess: string;
  totalErrorLess: string;
  totalErrorMore: string;
  totalExactRequired: string;
  juzUnit: string;

  // Number of weeks
  weeksTitle: string;
  weeksSubtitle: string;
  weeksLabel: string;
  weeksUnit: string;

  // Actions & Buttons
  btnContinue: string;
  btnBack: string;
  btnGenerate: string;
  btnGenerating: string;
  btnEditPlan: string;
  btnRegenerate: string;
  btnShare: string;
  btnExportImage: string;
  btnExportPdf: string;
  btnCopyLink: string;
  linkCopied: string;

  // Schedule view
  planTitle: string;
  weekLabel: string;
  weekOf: string;
  startLabel: string;
  endLabel: string;
  juzLabel: string;
  ayahLabel: string;
  viewCards: string;
  viewTable: string;
  tableHeaderMember: string;
  tableHeaderAmount: string;
  tableHeaderStart: string;
  tableHeaderEnd: string;
  summaryTitle: string;
  summaryTotal: string;
  summaryMembers: string;
  summaryQuran: string;
  currentWeekOnly: string;
  fullPlan: string;

  // Dialogs & Modals
  regenerateTitle: string;
  regenerateWarning: string;
  regenerateConfirm: string;
  cancel: string;
  exportTitle: string;
  exportSubtitle: string;
  exportPngCurrent: string;
  exportPngCurrentFormat: string;
  exportZipAll: string;
  exportZipAllFormat: string;
  exportPdfAll: string;
  exportPdfAllFormat: string;
  exportLoadingCurrent: string;
  exportLoadingAll: string;
  exportLoadingPdf: string;
  exportSuccess: string;
  exportError: string;
  preparingExport: string;

  // Quick groups suggestions
  suggestionsTitle: string;
  suggFamily: string;
  suggFriends: string;
  suggRamadan: string;
  suggMosque: string;
  suggStudy: string;

  // Footer & branding
  footerText: string;
  footerRights: string;
}

export const translations: Record<Language, Translations> = {
  ar: {
    appName: 'وِردي',
    tagline: 'نظّموا وردكم واقرؤوا القرآن معًا',
    heroSubtitle: 'تطبيق ذكي وبسيط لتوزيع قراءة القرآن الكريم بين أفراد المجموعات، مع جداول تدوير أسبوعية دقيقة تحدد بداية كل جزء ونهايته بدقة الآية والسورة.',
    ctaCreateGroup: 'إنشاء مجموعة',
    ctaHowItWorks: 'كيف يعمل؟',
    ctaGetStarted: 'ابدأ تنظيم ورد مجموعتك',

    howItWorksTitle: 'كيف يعمل وِردي؟',
    howItWorksSubtitle: 'ثلاث خطوات بسيطة لإنشاء جدول قراءة متكامل ومتوازن لمجموعتك.',
    step1Title: '١. أنشئ مجموعتك',
    step1Desc: 'اختر اسمًا لمجموعتك (العائلة، الأصدقاء، حلقة المسجد، أو أي مجموعة).',
    step2Title: '٢. حدد مقدار كل عضو',
    step2Desc: 'أضف الأعضاء، وحدد ما يحفظه أو يتقنه كل عضو ومقدار قراءته أسبوعيًا حتى يكتمل المجموع ٣٠ جزءًا.',
    step3Title: '٣. أنشئ جدولك المدوّر',
    step3Desc: 'اختر عدد الأسابيع، ويقوم وِردي بتوليد جدول دوري ذكي ومحدد بآيات البداية والنهاية.',

    exampleTitle: 'نموذج من الجدول',
    exampleSubtitle: 'تصميم أنيق وواضح يسهل قراءته ومشاركته عبر واتساب أو طباعته.',
    exampleTag: 'معاينة مباشرة',

    featuresTitle: 'مميزات وِردي',
    featuresSubtitle: 'صُمم ليكون هادئًا، دقيقًا، وخاليًا من التعقيد.',
    feature1Title: 'تقسيم قرآني ذكي',
    feature1Desc: 'يضمن قراءة الـ ٣٠ جزءًا كاملة كل أسبوع دون أي نقص أو تكرار.',
    feature2Title: 'مرونة في معرفة الأعضاء',
    feature2Desc: 'مراعاة مستوى معرفة كل عضو (القرآن كاملًا، أجزاء محددة، أو سور محددة).',
    feature3Title: 'تدوير أسبوعي متوازن',
    feature3Desc: 'يغير أجزاء الأعضاء أسبوعيًا ليتنقل كل قارئ بين أجزاء القرآن المختلفة.',
    feature4Title: 'تحديد دقيق للآيات',
    feature4Desc: 'عرض اسم السورة ورقم الآية لبداية ونهاية كل ورد بدقة متناهية.',
    feature5Title: 'تصدير صور و PDF',
    feature5Desc: 'تحميل الجداول كصور عالية الجودة للمشاركة في واتساب أو ملفات PDF للطباعة.',
    feature6Title: 'ثنائي اللغة والتوجيه',
    feature6Desc: 'دعم كامل للغتين العربية (RTL) والإنجليزية (LTR) مع توافق تام.',

    createGroupTitle: 'إنشاء مجموعة جديدة',
    createGroupSubtitle: 'ابدأ بتسمية مجموعتك',
    groupNameLabel: 'اسم المجموعة',
    groupNamePlaceholder: 'مثال: عائلة الفرح، حلقة الإيمان، أصدقاء رمضان...',
    groupNameHelp: 'يمكن لأي مجموعة (عائلة، زملاء، طلاب، أصدقاء) القراءة معًا.',

    membersTitle: 'أعضاء المجموعة وتوزيع الورد',
    membersSubtitle: 'أضف الأعضاء وحدد نطاق المعرفة والمقدار الأسبوعي لكل عضو.',
    addMemberBtn: 'إضافة عضو جديد',
    noMembersTitle: 'ابدأ بإضافة أعضاء مجموعتك',
    noMembersDesc: 'أضف أسماء المشاركين في الورد القرآني وحدد المقدار الأسبوعي لكل منهم.',
    memberNameLabel: 'اسم العضو',
    memberNamePlaceholder: 'مثال: طارق، خديجة، يوسف...',
    knowledgeLabel: 'نطاق معرفة القرآن',
    knowledgeEntire: 'القرآن كاملًا (الجزء ١ إلى ٣٠)',
    knowledgeJuzRange: 'أجزاء محددة',
    knowledgeSurahRange: 'سور محددة',
    startJuzLabel: 'من الجزء',
    endJuzLabel: 'إلى الجزء',
    startSurahLabel: 'من سورة',
    endSurahLabel: 'إلى سورة',
    weeklyAmountLabel: 'المقدار الأسبوعي',
    weeklyAmountUnit: 'أجزاء / أسبوع',
    weeklyAmountHelp: 'كم جزءًا سيقرأ هذا العضو في الأسبوع؟',
    removeMember: 'حذف العضو',
    memberCount: 'الأعضاء',

    totalLabel: 'مجموع القراءة الأسبوعية للمجموعة',
    totalSuccess: 'ممتاز. ستكمل المجموعة ٣٠ جزءًا كاملًا كل أسبوع.',
    totalErrorLess: 'المجموع الحالي أقل من ٣٠ جزءًا. المطلوب إكمال ٣٠ جزءًا.',
    totalErrorMore: 'المجموع الحالي يتجاوز ٣٠ جزءًا. المطلوب ٣٠ جزءًا بالضبط.',
    totalExactRequired: 'يجب أن يساوي مجموع القراءة الأسبوعية ٣٠ جزءًا بالضبط.',
    juzUnit: 'جزء',

    weeksTitle: 'مدة الخطة',
    weeksSubtitle: 'كم أسبوعًا تريد توليد الجدول له؟',
    weeksLabel: 'عدد الأسابيع',
    weeksUnit: 'أسابيع',

    btnContinue: 'المتابعة',
    btnBack: 'رجوع',
    btnGenerate: 'إنشاء الجدول',
    btnGenerating: 'جارٍ إنشاء جدولك...',
    btnEditPlan: 'تعديل الخطة والأعضاء',
    btnRegenerate: 'إعادة إنشاء الجدول',
    btnShare: 'مشاركة',
    btnExportImage: 'تحميل كصورة',
    btnExportPdf: 'تحميل PDF',
    btnCopyLink: 'نسخ الرابط',
    linkCopied: 'تم نسخ الرابط بنجاح',

    planTitle: 'خطة إتمام القرآن الكريم',
    weekLabel: 'الأسبوع',
    weekOf: 'من',
    startLabel: 'البداية',
    endLabel: 'النهاية',
    juzLabel: 'الجزء',
    ayahLabel: 'الآية',
    viewCards: 'البطاقات',
    viewTable: 'الجدول',
    tableHeaderMember: 'العضو',
    tableHeaderAmount: 'الورد',
    tableHeaderStart: 'البداية',
    tableHeaderEnd: 'النهاية',
    summaryTitle: 'ملخص الورد',
    summaryTotal: '٣٠ جزءًا أسبوعيًا',
    summaryMembers: 'أعضاء',
    summaryQuran: 'ختمة كاملة كل أسبوع',
    currentWeekOnly: 'الأسبوع الحالي',
    fullPlan: 'الخطة كاملة',

    regenerateTitle: 'إعادة إنشاء الجدول؟',
    regenerateWarning: 'إعادة إنشاء الجدول ستستبدل الجدول الحالي بجدول جديد يتم توليده وفق الإعدادات الحالية.',
    regenerateConfirm: 'نعم، أعد الإنشاء',
    cancel: 'إلغاء',
    exportTitle: 'تصدير الجدول',
    exportSubtitle: 'اختر الصيغة التي ترغب بتحميلها.',
    exportPngCurrent: 'تحميل الأسبوع الحالي',
    exportPngCurrentFormat: 'PNG',
    exportZipAll: 'تحميل جميع الأسابيع',
    exportZipAllFormat: 'ZIP',
    exportPdfAll: 'تحميل الخطة كاملة',
    exportPdfAllFormat: 'PDF',
    exportLoadingCurrent: 'جارٍ إنشاء الملف...',
    exportLoadingAll: 'جارٍ إنشاء جميع الأسابيع...',
    exportLoadingPdf: 'جارٍ إنشاء ملف PDF...',
    exportSuccess: 'تم إنشاء الملف بنجاح.',
    exportError: 'تعذر إنشاء الملف. يرجى المحاولة مرة أخرى.',
    preparingExport: 'جارٍ تجهيز الملف...',

    suggestionsTitle: 'أفكار سريعة لأسماء المجموعات:',
    suggFamily: 'عائلة الهدى',
    suggFriends: 'صحبة الخير',
    suggRamadan: 'ورد رمضان',
    suggMosque: 'حلقة النور',
    suggStudy: 'مجموعة التدارس',

    footerText: 'وِردي — تنظيم ورد القرآن الكريم للمجموعات والأسَر',
    footerRights: 'جميع الحقوق محفوظة',
  },

  en: {
    appName: 'Wirddy',
    tagline: 'Plan your Quran reading together.',
    heroSubtitle: 'A modern, clean web application for groups to divide and complete the Quran together with rotating weekly schedules and exact Ayah references.',
    ctaCreateGroup: 'Create a group',
    ctaHowItWorks: 'See how it works',
    ctaGetStarted: 'Create your first group',

    howItWorksTitle: 'How Wirddy Works',
    howItWorksSubtitle: 'Three simple steps to generate a balanced rotating reading schedule.',
    step1Title: '1. Create your group',
    step1Desc: 'Enter a group name (family, friends, university peers, study circle, etc.).',
    step2Title: '2. Configure each member',
    step2Desc: "Set each member's Quran knowledge range and weekly reading amount until the total equals 30 Juz.",
    step3Title: '3. Generate rotating schedule',
    step3Desc: 'Choose the number of weeks and Wirddy creates a verified schedule with exact start and end Ayahs.',

    exampleTitle: 'Sample Schedule Preview',
    exampleSubtitle: 'Clean, modern, and easily shareable on WhatsApp or printable as PDF.',
    exampleTag: 'Live Preview',

    featuresTitle: 'Why Wirddy',
    featuresSubtitle: 'Built to be calm, mathematically rigorous, and effortless.',
    feature1Title: 'Smart Quran Division',
    feature1Desc: 'Ensures exactly 30 Juz are covered every week with 0 overlaps and 0 gaps.',
    feature2Title: 'Knowledge Range Flexibility',
    feature2Desc: 'Accommodates members with full Quran knowledge or specific Juz/Surah limits.',
    feature3Title: 'Weekly Rotation Engine',
    feature3Desc: 'Cycles readings so each member experiences different portions of the Quran.',
    feature4Title: 'Exact Ayah Precision',
    feature4Desc: 'Displays exact Surah and Ayah numbers for both the start and end of every portion.',
    feature5Title: 'Image & PDF Exports',
    feature5Desc: 'Download WhatsApp-ready high-resolution images or multi-page A4 PDFs.',
    feature6Title: 'Bilingual RTL & LTR',
    feature6Desc: 'Seamlessly switch between Arabic (RTL) and English (LTR) layouts anytime.',

    createGroupTitle: 'Create a group',
    createGroupSubtitle: 'Start with your group name',
    groupNameLabel: 'Group Name',
    groupNamePlaceholder: 'e.g. Family, Friends, Ramadan 2027, Quran Circle...',
    groupNameHelp: 'Any group (family, study circle, mosque group, colleagues) can read together.',

    membersTitle: 'Add Group Members',
    membersSubtitle: 'Define each member, their known Quran range, and their weekly Juz reading amount.',
    addMemberBtn: 'Add Member',
    noMembersTitle: 'Add your group members',
    noMembersDesc: 'Start by adding members and configuring how much they will read each week.',
    memberNameLabel: 'Member Name',
    memberNamePlaceholder: 'e.g. Tariq, Khadijah, Yousef...',
    knowledgeLabel: 'Quran Knowledge Range',
    knowledgeEntire: 'Entire Quran (Juz 1 to 30)',
    knowledgeJuzRange: 'Specific Juz Range',
    knowledgeSurahRange: 'Specific Surah Range',
    startJuzLabel: 'From Juz',
    endJuzLabel: 'To Juz',
    startSurahLabel: 'From Surah',
    endSurahLabel: 'To Surah',
    weeklyAmountLabel: 'Weekly Reading Amount',
    weeklyAmountUnit: 'Juz / week',
    weeklyAmountHelp: 'How many Juz will this member read each week?',
    removeMember: 'Remove Member',
    memberCount: 'Members',

    totalLabel: 'Group Weekly Reading Total',
    totalSuccess: 'Perfect. Your group will complete exactly 30 Juz each week.',
    totalErrorLess: 'Weekly reading total is less than 30 Juz. Exactly 30 Juz is required.',
    totalErrorMore: 'Weekly reading total exceeds 30 Juz. Exactly 30 Juz is required.',
    totalExactRequired: 'The weekly reading total must equal exactly 30 Juz.',
    juzUnit: 'Juz',

    weeksTitle: 'Plan Duration',
    weeksSubtitle: 'How many weeks would you like to schedule?',
    weeksLabel: 'Number of Weeks',
    weeksUnit: 'weeks',

    btnContinue: 'Continue',
    btnBack: 'Back',
    btnGenerate: 'Generate Schedule',
    btnGenerating: 'Creating your schedule...',
    btnEditPlan: 'Edit Plan & Members',
    btnRegenerate: 'Regenerate Schedule',
    btnShare: 'Share',
    btnExportImage: 'Download Image',
    btnExportPdf: 'Download PDF',
    btnCopyLink: 'Copy Link',
    linkCopied: 'Link copied to clipboard',

    planTitle: 'Quran Completion Plan',
    weekLabel: 'Week',
    weekOf: 'of',
    startLabel: 'START',
    endLabel: 'END',
    juzLabel: 'Juz',
    ayahLabel: 'Ayah',
    viewCards: 'Cards',
    viewTable: 'Table',
    tableHeaderMember: 'Member',
    tableHeaderAmount: 'Juz',
    tableHeaderStart: 'Start',
    tableHeaderEnd: 'End',
    summaryTitle: 'Plan Summary',
    summaryTotal: '30 Juz weekly',
    summaryMembers: 'members',
    summaryQuran: '1 complete Quran per week',
    currentWeekOnly: 'Current Week',
    fullPlan: 'Full Plan',

    regenerateTitle: 'Regenerate Schedule?',
    regenerateWarning: 'Regenerating will replace the current schedule with a freshly computed one based on your current settings.',
    regenerateConfirm: 'Yes, Regenerate',
    cancel: 'Cancel',
    exportTitle: 'Export Schedule',
    exportSubtitle: 'Choose format to download.',
    exportPngCurrent: 'Download current week',
    exportPngCurrentFormat: 'PNG',
    exportZipAll: 'Download all weeks',
    exportZipAllFormat: 'ZIP',
    exportPdfAll: 'Download full plan',
    exportPdfAllFormat: 'PDF',
    exportLoadingCurrent: 'Preparing your file...',
    exportLoadingAll: 'Generating all weeks...',
    exportLoadingPdf: 'Generating PDF file...',
    exportSuccess: 'File created successfully.',
    exportError: 'Unable to create the file. Please try again.',
    preparingExport: 'Preparing your export...',

    suggestionsTitle: 'Quick name suggestions:',
    suggFamily: 'Family',
    suggFriends: 'Good Friends',
    suggRamadan: 'Ramadan 2027',
    suggMosque: 'Mosque Study Circle',
    suggStudy: 'Quran Study Group',

    footerText: 'Wirddy — Group Quran Reading & Division Planner',
    footerRights: 'All rights reserved',
  },
};
