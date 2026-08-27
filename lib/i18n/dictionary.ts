export type Language = "ar" | "en"
export type Direction = "rtl" | "ltr"

export interface Translations {
  // Navigation & General
  appName: string
  tagline: string
  heroSubtitle: string
  ctaCreateGroup: string
  ctaHowItWorks: string
  ctaGetStarted: string

  // How it works
  howItWorksTitle: string
  howItWorksSubtitle: string
  step1Title: string
  step1Desc: string
  step2Title: string
  step2Desc: string
  step3Title: string
  step3Desc: string

  // Value Badges
  badgeFree: string
  badgeNoLogin: string
  badgeBilingual: string
  badgeMultiDevice: string

  // Example schedule section
  exampleTitle: string
  exampleSubtitle: string
  exampleBadge: string
  exampleGroupName: string
  exampleSummary: string
  exampleTryTemplate: string

  // Features
  featuresTitle: string
  featuresSubtitle: string
  feature1Title: string
  feature1Desc: string
  feature2Title: string
  feature2Desc: string
  feature3Title: string
  feature3Desc: string
  feature4Title: string
  feature4Desc: string
  feature5Title: string
  feature5Desc: string
  feature6Title: string
  feature6Desc: string

  // Section Headers
  sectionGroup: string
  sectionQuranRange: string
  sectionMembers: string
  sectionRotation: string
  sectionWeeks: string

  // Rotation Styles
  rotationStyleTitle: string
  rotationStyleDesc: string
  rotationLarge: string
  rotationLargeDesc: string
  rotationMedium: string
  rotationMediumDesc: string
  rotationSmall: string
  rotationSmallDesc: string
  rotationRandom: string
  rotationRandomDesc: string

  // Starting Point
  startingPointTitle: string
  startingPointDesc: string
  startJuzLabel: string
  endJuzLabel: string

  // Quran Range
  quranRangeTitle: string
  quranRangeFull: string
  quranRangeFullDesc: string
  quranRangeCustom: string
  quranRangeCustomDesc: string
  rangeFrom: string
  rangeTo: string
  surahLabel: string
  ayahLabel: string
  rangeSummary: string
  customRangeAmountNotice: string

  // Group Form
  createGroupTitle: string
  createGroupSubtitle: string
  formTitle: string
  formSubtitle: string
  groupNameLabel: string
  groupNamePlaceholder: string
  groupNameHelp: string
  weeksCountLabel: string
  weeksCountHelper: string
  weekUnit: string
  weeksOption: string
  btnContinue: string

  // Total Indicator
  totalLabel: string
  totalSuccess: string
  totalErrorLess: string
  totalErrorMore: string
  totalExactRequired: string
  totalJuzLabel: string
  totalExactMsg: string
  totalLessMsg: string
  totalMoreMsg: string
  juzUnit: string

  // Member Management
  membersTitle: string
  membersSubtitle: string
  membersListTitle: string
  addMemberBtn: string
  removeMemberBtn: string
  removeMember: string
  noMembersTitle: string
  noMembersDesc: string
  memberNameLabel: string
  memberNamePlaceholder: string
  knowledgeLabel: string
  knowledgeEntire: string
  knowledgeJuzRange: string
  knowledgeSurahRange: string
  fromJuz: string
  toJuz: string
  fromSurah: string
  toSurah: string
  startSurahLabel: string
  endSurahLabel: string
  weeklyAmountLabel: string
  weeklyAmountUnit: string
  weeklyAmountHelp: string
  amountJuz: string
  memberCount: string

  // Weeks Selector
  weeksTitle: string
  weeksSubtitle: string
  weeksLabel: string
  weeksUnit: string

  // Generate Button & Common Actions
  btnGenerate: string
  btnGenerating: string
  btnRegenerate: string
  btnEditPlan: string
  btnBack: string
  btnSave: string
  btnShare: string
  btnExportImage: string
  btnExportPdf: string
  btnCopyLink: string
  btnQrCode: string
  btnCopyEditLink: string
  linkCopied: string

  // Validation Messages
  errGroupNameRequired: string
  errAtLeastOneMember: string
  errMemberNameRequired: string
  errTotalMustBe30: string
  errKnowledgeInvalid: string
  errAmountExceedsKnowledge: string

  // Schedule View
  planTitle: string
  scheduleGeneratedSuccess: string
  weekLabel: string
  weekOf: string
  startLabel: string
  endLabel: string
  juzLabel: string
  viewCards: string
  viewTable: string
  tableHeaderMember: string
  tableHeaderAmount: string
  tableHeaderStart: string
  tableHeaderEnd: string
  tableHeaderJuzRange: string
  tableHeaderAyahRange: string
  summaryTitle: string
  summaryTotal: string
  summaryMembers: string
  summaryQuran: string
  currentWeekOnly: string
  fullPlan: string
  shareSchedule: string

  // Modal Dialogs
  regenerateTitle: string
  regenerateWarning: string
  regenerateConfirm: string
  cancel: string
  exportTitle: string
  exportSubtitle: string
  exportDownloadSection: string
  exportShareSection: string
  exportPngCurrent: string
  exportPngCurrentFormat: string
  exportZipAll: string
  exportZipAllFormat: string
  exportPdfAll: string
  exportPdfAllFormat: string
  exportSharePdfAll: string
  exportLoadingCurrent: string
  exportLoadingAll: string
  exportLoadingPdf: string
  exportLoadingShare: string
  exportOpeningShare: string
  exportSuccess: string
  exportShareSuccess: string
  exportError: string
  exportLogoError: string
  exportShareFallbackUnsupported: string
  exportShareFallbackError: string
  preparingExport: string

  // Export Options & Branding
  exportOptionsTitle: string
  optShowLogo: string
  optShowQr: string
  optShowGroupName: string
  optShowDate: string

  // Print & Duplicate
  btnPrint: string
  btnDuplicate: string
  duplicatingSchedule: string
  scheduleDuplicatedSuccess: string

  // Save & Share / Persistence
  btnSaveAndShare: string
  saveModalTitle: string
  saveModalSubtitle: string
  savingSchedule: string
  scheduleSavedSuccess: string
  scheduleSavedDesc: string
  sectionViewLink: string
  sectionViewLinkDesc: string
  sectionEditLink: string
  sectionEditLinkDesc: string
  publicShareLink: string
  copyPublicLink: string
  shareGroupLink: string
  qrCodeTitle: string
  qrCodeDesc: string
  btnShowQrCode: string
  btnHideQrCode: string
  secretEditLinkTitle: string
  secretEditLinkDesc: string
  copyEditLink: string
  editLinkCopied: string
  scanToOpen: string
  saveOfflineWarning: string
  viewOnlyBadge: string
  editorBadge: string
  scheduleNotFoundTitle: string
  scheduleNotFoundDesc: string
  scheduleExpiredTitle: string
  scheduleExpiredDesc: string
  btnCreateNewSchedule: string
  btnDeleteSchedule: string
  deleteScheduleConfirm: string

  // Recent Schedules
  recentSchedulesTitle: string
  recentSchedulesSubtitle: string
  lastUsedToday: string
  lastUsedYesterday: string
  btnOpenRecent: string
  btnRemoveRecent: string
  btnClearAll: string
  noRecentSchedules: string

  // PWA Add to Home Screen
  pwaTitle: string
  pwaDesc: string
  pwaSectionBadge: string
  pwaSectionTitle: string
  pwaSectionDesc: string
  pwaIosStep: string
  pwaAndroidStep: string
  pwaIosTab: string
  pwaAndroidTab: string
  pwaIphoneTab: string
  pwaIphoneTitle: string
  pwaAndroidTitle: string
  pwaIphoneStep1: string
  pwaIphoneStep2: string
  pwaIphoneStep3: string
  pwaIphoneStep4: string
  pwaAndroidStep1: string
  pwaAndroidStep2: string
  pwaAndroidStep3: string
  pwaAndroidStep4: string
  pwaIphoneNote: string
  pwaAndroidNote: string
  pwaGifAlt: string

  // Quick groups suggestions
  suggestionsTitle: string
  suggFamily: string
  suggFriends: string
  suggRamadan: string
  suggMosque: string
  suggStudy: string

  // Footer & branding
  footerText: string
  footerRights: string
}

export const translations: Record<Language, Translations> = {
  ar: {
    appName: "وِردي",
    tagline: "نظّموا وردكم واقرؤوا القرآن معًا",
    heroSubtitle:
      "تطبيق ذكي وبسيط لتوزيع قراءة القرآن الكريم بين أفراد المجموعات، مع جداول تدوير أسبوعية دقيقة تحدد بداية كل جزء ونهايته بدقة الآية والسورة.",
    ctaCreateGroup: "إنشاء مجموعة",
    ctaHowItWorks: "كيف يعمل؟",
    ctaGetStarted: "ابدأ تنظيم ورد مجموعتك",

    howItWorksTitle: "كيف يعمل وِردي؟",
    howItWorksSubtitle:
      "ثلاث خطوات بسيطة لإنشاء جدول قراءة متكامل ومتوازن لمجموعتك.",
    step1Title: "أنشئ مجموعتك",
    step1Desc: "أضف الأعضاء وحدد مقدار قراءة كل شخص.",
    step2Title: "أنشئ جدولك",
    step2Desc: "وِردي يقسم القرآن ويغيّر التوزيع بين الأسابيع.",
    step3Title: "شارك الجدول",
    step3Desc: "أرسل الرابط أو رمز QR إلى مجموعتك.",

    badgeFree: "مجاني",
    badgeNoLogin: "بدون تسجيل دخول",
    badgeBilingual: "بالعربية والإنجليزية",
    badgeMultiDevice: "يعمل على الهاتف والكمبيوتر",

    exampleTitle: "نموذج لجدول أسبوعي",
    exampleSubtitle: "شاهد كيف يبدو جدول الورد المنظم لمجموعة مكونة من ٤ أعضاء",
    exampleBadge: "معاينة مباشرة",
    exampleGroupName: "ختمة العائلة المباركة",
    exampleSummary: "٤ أعضاء • ٣٠ جزءًا أسبوعيًا",
    exampleTryTemplate: "استخدم هذا النموذج",

    featuresTitle: "لماذا وِردي؟",
    featuresSubtitle:
      "صُمم ليكون التطبيق الأكثر دقة وسهولة في تنظيم قراءة القرآن للمجموعات.",
    feature1Title: "تدوير ذكي ومستمر",
    feature1Desc:
      "خوارزمية ذكية تضمن عدم تكرار قراءة الأجزاء نفسها لكل عضو أسبوعًا بعد أسبوع.",
    feature2Title: "مراعاة ما يحفظه كل شخص",
    feature2Desc:
      "حدد للأعضاء الأجزاء التي يحفظونها فقط ليتم توزيع القراءة بما يناسب قدرة كل شخص.",
    feature3Title: "دقة الآية والسورة",
    feature3Desc:
      "بيانات موثقة تحدد لك بالضبط من أي آية وسورة تبدأ وأين تنتهي في كل أسبوع.",
    feature4Title: "تصدير فوري ومشاركة سهلة",
    feature4Desc:
      "حمّل جدول مجموعتك كصورة أنيقة، أو ملف PDF، أو شاركه مباشرة مع أحبابك برابط دائم.",
    feature5Title: "تصدير صور وPDF عالي الجودة",
    feature5Desc:
      "حمل صوراً جاهزة للواتساب أو ملفات PDF منسقة للطباعة بحجم A4.",
    feature6Title: "واجهة ثنائية اللغة",
    feature6Desc: "دعم كامل للغتين العربية والإنجليزية مع اتجاهات RTL وLTR.",

    sectionGroup: "المجموعة",
    sectionQuranRange: "نطاق القراءة والبداية",
    sectionMembers: "الأعضاء وتوزيع الأجزاء",
    sectionRotation: "طريقة التغيير",
    sectionWeeks: "المدة وعدد الأسابيع",

    rotationStyleTitle: "طريقة التغيير",
    rotationStyleDesc: "اختر كيف يتم تدوير الأجزاء بين الأعضاء من أسبوع لآخر",
    rotationLarge: "تغيير كبير كل أسبوع",
    rotationLargeDesc:
      "يغيّر توزيع الأجزاء بين الأعضاء بشكل واضح من أسبوع إلى آخر.",
    rotationMedium: "تغيير متوسط",
    rotationMediumDesc: "يوازن بين الاستقرار والتغيير.",
    rotationSmall: "تغيير بسيط",
    rotationSmallDesc: "يحافظ على توزيع قريب من الأسبوع السابق مع بعض التغيير.",
    rotationRandom: "عشوائي",
    rotationRandomDesc:
      "ينشئ توزيعًا مختلفًا لكل أسبوع مع الالتزام بجميع القيود.",

    startingPointTitle: "بداية الورد",
    startingPointDesc: "حدد من أي جزء تبدأ القراءة للأسبوع الأول",
    startJuzLabel: "يبدأ من",
    endJuzLabel: "إلى الجزء",

    quranRangeTitle: "نطاق القراءة",
    quranRangeFull: "القرآن كاملًا",
    quranRangeFullDesc: "قراءة القرآن كاملًا (٣٠ جزءًا)",
    quranRangeCustom: "تحديد نطاق مخصص",
    quranRangeCustomDesc: "حدد سورًا أو آيات معينة للقراءة",
    rangeFrom: "من",
    rangeTo: "إلى",
    surahLabel: "السورة",
    ayahLabel: "الآية",
    rangeSummary: "المقدار",
    customRangeAmountNotice: "المجموع يتناسب مع النطاق المحدد",

    createGroupTitle: "أنشئ مجموعتك",
    createGroupSubtitle: "اختر اسماً لمجموعتك لبدء تنظيم الورد وتوزيع القراءة",
    formTitle: "إعداد خطة القراءة",
    formSubtitle:
      "أدخل بيانات مجموعتك وأعضائها لنقوم بإنشاء جدول منظم ودقيق تلقائيًا.",
    groupNameLabel: "اسم المجموعة",
    groupNamePlaceholder: "مثال: عائلة الفرح، أصدقاء القرآن...",
    groupNameHelp: "يمكنك تغيير اسم المجموعة في أي وقت لاحقاً.",
    weeksCountLabel: "عدد الأسابيع",
    weeksCountHelper: "اختر مدة الخطة (من أسبوع واحد حتى ٥٢ أسبوعًا)",
    weekUnit: "أسابيع",
    weeksOption: "أسابيع",
    btnContinue: "متابعة وإضافة الأعضاء",

    totalLabel: "مجموع الأجزاء الأسبوعية",
    totalSuccess: "ممتاز! سيكمل أفراد المجموعة قراءة ٣٠ جزءاً بالضبط كل أسبوع.",
    totalErrorLess:
      "مجموع القراءة الأسبوعية أقل من ٣٠ جزءاً. المطلوب ٣٠ جزءاً بالضبط.",
    totalErrorMore:
      "مجموع القراءة الأسبوعية تجاوز ٣٠ جزءاً. المطلوب ٣٠ جزءاً بالضبط.",
    totalExactRequired:
      "يجب أن يكون مجموع القراءة الأسبوعية مساوياً لـ ٣٠ جزءاً بالضبط.",
    totalJuzLabel: "مجموع الأجزاء الأسبوعية",
    totalExactMsg: "المجموع مكتمل (٣٠/٣٠ جزءًا). جاهز لإنشاء الجدول!",
    totalLessMsg: "المجموع الحالي أقل من ٣٠ جزءًا. تبقّى",
    totalMoreMsg: "المجموع الحالي تجاوز ٣٠ جزءًا. الزيادة",
    juzUnit: "جزء",

    membersTitle: "إضافة أعضاء المجموعة",
    membersSubtitle:
      "حدد أسماء الأعضاء، ونطاق ما يتقنونه، ومقدار قراءة كل عضو أسبوعياً.",
    membersListTitle: "أعضاء المجموعة",
    addMemberBtn: "إضافة عضو",
    removeMemberBtn: "حذف العضو",
    removeMember: "حذف العضو",
    noMembersTitle: "لم تتم إضافة أي عضو بعد",
    noMembersDesc: "ابدأ بإضافة الأعضاء وتحديد مقدار قراءتهم الأسبوعية.",
    memberNameLabel: "اسم العضو",
    memberNamePlaceholder: "اسم العضو",
    knowledgeLabel: "نطاق المعرفة / الحفظ",
    knowledgeEntire: "القرآن كاملًا (١-٣٠)",
    knowledgeJuzRange: "أجزاء محددة",
    knowledgeSurahRange: "سور محددة",
    fromJuz: "من الجزء",
    toJuz: "إلى الجزء",
    fromSurah: "من سورة",
    toSurah: "إلى سورة",
    startSurahLabel: "من سورة",
    endSurahLabel: "إلى سورة",
    weeklyAmountLabel: "مقدار القراءة الأسبوعي",
    weeklyAmountUnit: "أجزاء / أسبوع",
    weeklyAmountHelp: "كم جزءاً يقرأ هذا العضو في الأسبوع؟",
    amountJuz: "أجزاء أسبوعيًا",
    memberCount: "الأعضاء",

    weeksTitle: "مدة الخطة",
    weeksSubtitle: "كم أسبوعاً ترغب في جدولته للمجموعة؟",
    weeksLabel: "عدد الأسابيع",
    weeksUnit: "أسابيع",

    btnGenerate: "إنشاء جدول الورد",
    btnGenerating: "جارٍ الحساب والإنشاء...",
    btnRegenerate: "إعادة إنشاء الجدول",
    btnEditPlan: "تعديل الخطة والأعضاء",
    btnBack: "الرجوع للخلف",
    btnSave: "حفظ ومتابعة",
    btnShare: "مشاركة",
    btnExportImage: "تنزيل صورة",
    btnExportPdf: "تنزيل PDF",
    btnCopyLink: "نسخ الرابط",
    btnQrCode: "رمز QR",
    btnCopyEditLink: "نسخ رابط التعديل",

    errGroupNameRequired: "يرجى كتابة اسم المجموعة.",
    errAtLeastOneMember: "يجب إضافة عضو واحد على الأقل.",
    errMemberNameRequired: "يرجى كتابة أسماء جميع الأعضاء.",
    errTotalMustBe30: "يجب أن يكون مجموع الأجزاء ٣٠ جزءًا بالضبط.",
    errKnowledgeInvalid: "نطاق الحفظ غير صحيح لبعض الأعضاء.",
    errAmountExceedsKnowledge: "مقدار القراءة أكبر من الأجزاء المحددة للعضو.",

    planTitle: "خطة ختمة القرآن",
    scheduleGeneratedSuccess: "تم إنشاء جدول الورد بنجاح!",
    weekLabel: "الأسبوع",
    weekOf: "من",
    startLabel: "البداية",
    endLabel: "النهاية",
    juzLabel: "الجزء",
    viewCards: "بطاقات",
    viewTable: "جدول",
    tableHeaderMember: "العضو",
    tableHeaderAmount: "المقدار",
    tableHeaderStart: "البداية",
    tableHeaderEnd: "النهاية",
    tableHeaderJuzRange: "الأجزاء",
    tableHeaderAyahRange: "بداية ونهاية القراءة",
    summaryTitle: "ملخص الخطة",
    summaryTotal: "٣٠ جزءاً أسبوعياً",
    summaryMembers: "أعضاء",
    summaryQuran: "ختمة واحدة كاملة كل أسبوع",
    currentWeekOnly: "الأسبوع الحالي",
    fullPlan: "الخطة كاملة",
    shareSchedule: "مشاركة الجدول",
    linkCopied: "تم نسخ الرابط بنجاح",

    regenerateTitle: "إعادة إنشاء الجدول؟",
    regenerateWarning:
      "سيؤدي هذا إلى إعادة توزيع الأجزاء وتوليد جدول جديد بالكامل لجميع الأسابيع.",
    regenerateConfirm: "نعم، أعد الإنشاء",
    cancel: "إلغاء",
    exportTitle: "تنزيل ومشاركة الجدول",
    exportSubtitle: "اختر الصيغة لتنزيل الجدول أو مشاركته مباشرة.",
    exportDownloadSection: "تنزيل الملفات",
    exportShareSection: "المشاركة المباشرة",
    exportPngCurrent: "صورة الأسبوع الحالي (PNG)",
    exportPngCurrentFormat: "PNG",
    exportZipAll: "جميع الأسابيع (ملف ZIP)",
    exportZipAllFormat: "ZIP",
    exportPdfAll: "الخطة كاملة (مستند PDF)",
    exportPdfAllFormat: "PDF",
    exportSharePdfAll: "مشاركة الخطة كاملة (PDF)",
    exportLoadingCurrent: "جارٍ تجهيز صورة الأسبوع الحالي...",
    exportLoadingAll: "جارٍ تجهيز جميع الأسابيع وضغطها...",
    exportLoadingPdf: "جارٍ إنشاء وتنسيق ملف PDF...",
    exportLoadingShare: "جارٍ تجهيز ملف PDF للمشاركة...",
    exportOpeningShare: "جارٍ فتح نافذة المشاركة في جهازك...",
    exportSuccess: "تم تنزيل الملف بنجاح!",
    exportShareSuccess: "تم فتح نافذة المشاركة بنجاح!",
    exportError: "حدث خطأ أثناء إنشاء ملف التصدير. يرجى المحاولة مجددًا.",
    exportLogoError: "تعذر تحميل الشعار بجودة عالية للتصدير.",
    exportShareFallbackUnsupported:
      "المشاركة المباشرة للملفات غير مدعومة في هذا المتصفح. تم تنزيل الملف بدلاً من ذلك.",
    exportShareFallbackError:
      "تعذرت المشاركة المباشرة. تم تنزيل الملف إلى جهازك بدلاً من ذلك.",
    preparingExport: "جارٍ تجهيز التصدير...",

    exportOptionsTitle: "خيارات التصدير",
    optShowLogo: "إظهار شعار Wirddy",
    optShowQr: "إظهار رمز QR",
    optShowGroupName: "إظهار اسم المجموعة",
    optShowDate: "إظهار تاريخ الإنشاء",

    btnPrint: "طباعة",
    btnDuplicate: "نسخ الجدول",
    duplicatingSchedule: "جارٍ نسخ الجدول...",
    scheduleDuplicatedSuccess: "تم نسخ الجدول بنجاح كخطة جديدة!",

    btnSaveAndShare: "حفظ ومشاركة",
    saveModalTitle: "مشاركة الجدول",
    saveModalSubtitle:
      "احصل على رابط مباشر لمشاركة الجدول مع مجموعتك أو إعادة فتحه في أي وقت دون تسجيل حساب.",
    savingSchedule: "جارٍ حفظ الجدول على الإنترنت...",
    scheduleSavedSuccess: "تم حفظ الجدول بنجاح!",
    scheduleSavedDesc:
      "يمكنك الآن مشاركة هذا الرابط مع أعضاء المجموعة للاطلاع على الجدول من أي جهاز.",
    sectionViewLink: "رابط المشاهدة",
    sectionViewLinkDesc:
      "يمكنك مشاركة هذا الرابط مع أفراد المجموعة. لا يحتاج إلى تسجيل الدخول.",
    sectionEditLink: "رابط التعديل",
    sectionEditLinkDesc:
      "هذا الرابط سري ويسمح لك بتعديل الجدول وإعادة إنشائه. احتفظ به في مكان آمن.",
    publicShareLink: "رابط المشاهدة للمجموعة",
    copyPublicLink: "نسخ الرابط",
    shareGroupLink: "مشاركة",
    qrCodeTitle: "رمز الاستجابة السريعة (QR)",
    qrCodeDesc: "امسح الرمز بكاميرا الهاتف لفتح الجدول فوراً.",
    btnShowQrCode: "عرض رمز QR",
    btnHideQrCode: "إخفاء رمز QR",
    secretEditLinkTitle: "رابط التعديل الخاص بك (سرّي)",
    secretEditLinkDesc:
      "احتفظ بهذا الرابط لتتمكن من تعديل أسماء الأعضاء أو إعادة إنشاء الجدول لاحقاً. لا تشاركه إلا مع من يملك صلاحية التعديل.",
    copyEditLink: "نسخ رابط التعديل",
    editLinkCopied: "تم نسخ رابط التعديل!",
    scanToOpen: "امسح لفتح الجدول",
    saveOfflineWarning:
      "تم إنشاء جدولك محلياً، ولكن تعذر حفظه على الإنترنت. يمكنك الاستمرار في استخدامه وتنزيله الآن.",
    viewOnlyBadge: "وضع المشاهدة",
    editorBadge: "وضع التعديل",
    scheduleNotFoundTitle: "الجدول غير موجود",
    scheduleNotFoundDesc:
      "عذراً، لم نتمكن من العثور على هذا الجدول. قد يكون الرابط خاطئاً أو تم حذفه.",
    scheduleExpiredTitle: "انتهت صلاحية الجدول",
    scheduleExpiredDesc:
      "هذا الجدول تجاوز المدة المحددة (سنة واحدة) ولم يعد متاحاً على الخادم.",
    btnCreateNewSchedule: "إنشاء جدول جديد",
    btnDeleteSchedule: "حذف الجدول",
    deleteScheduleConfirm: "هل أنت متأكد من حذف هذا الجدول نهائياً؟",

    recentSchedulesTitle: "جداولك الأخيرة",
    recentSchedulesSubtitle:
      "الجداول التي قمت بإنشائها أو فتحها مؤخراً على هذا الجهاز",
    lastUsedToday: "اليوم",
    lastUsedYesterday: "أمس",
    btnOpenRecent: "فتح الجدول",
    btnRemoveRecent: "إزالة",
    btnClearAll: "مسح السجل",
    noRecentSchedules: "لا توجد جداول محفوظة مؤخراً على هذا الجهاز",

    pwaTitle: "استخدم وِردي كتطبيق",
    pwaDesc:
      "أضفه إلى الشاشة الرئيسية للوصول إليه بسرعة وسهولة دون الحاجة لتنزيل أي تطبيق من المتجر.",
    pwaSectionBadge: "استخدم وِردي كتطبيق",
    pwaSectionTitle: "استخدم وِردي كتطبيق على هاتفك",
    pwaSectionDesc:
      "يمكنك إضافة وِردي مباشرة إلى شاشة هاتفك الرئيسية للوصول إلى جداولك بلمسة واحدة دون الحاجة لتحميل تطبيقات من المتجر.",
    pwaIosStep:
      "في متصفح Safari، اضغط على زر المشاركة ثم اختر 'إضافة إلى الشاشة الرئيسية'.",
    pwaAndroidStep:
      "في متصفح Chrome، اضغط على خيارات المتصفح (⋮) ثم اختر 'تثبيت التطبيق' أو 'إضافة إلى الشاشة الرئيسية'.",
    pwaIosTab: "أجهزة آيفون (iOS)",
    pwaAndroidTab: "أجهزة أندرويد (Android)",
    pwaIphoneTab: "iPhone (iOS)",
    pwaIphoneTitle: "إضافة وِردي إلى شاشة الآيفون",
    pwaAndroidTitle: "تثبيت وِردي على أندرويد",
    pwaIphoneStep1: "افتح موقع وِردي في متصفح Safari",
    pwaIphoneStep2: "اضغط على زر المشاركة في أسفل الشاشة",
    pwaIphoneStep3: "مرر للأسفل واختر 'إضافة إلى الشاشة الرئيسية'",
    pwaIphoneStep4: "اضغط على 'إضافة' في الزاوية العلوية",
    pwaAndroidStep1: "افتح موقع وِردي في متصفح Chrome",
    pwaAndroidStep2: "اضغط على القائمة (الثلاث نقاط) أعلى المتصفح",
    pwaAndroidStep3: "اختر 'تثبيت التطبيق' أو 'إضافة إلى الشاشة الرئيسية'",
    pwaAndroidStep4: "أكّد التثبيت لتجده مباشرة بين تطبيقاتك",
    pwaIphoneNote: "يعمل بسلاسة حتى في حال انقطاع الاتصال بعد الفتح الأول.",
    pwaAndroidNote: "تثبيت خفيف وسريع ولا يستهلك مساحة التخزين.",
    pwaGifAlt: "خطوات إضافة وِردي إلى الشاشة الرئيسية على الآيفون",

    suggestionsTitle: "مجموعات مقترحة",
    suggFamily: "ختمة العائلة",
    suggFriends: "أصدقاء المسجد",
    suggRamadan: "ختمة رمضان",
    suggMosque: "حلقة التحفيظ",
    suggStudy: "مجموعة التدارس",

    footerText: "وِردي - تنظيم قراءة القرآن الكريم للمجموعات",
    footerRights: "جميع الحقوق محفوظة",
  },
  en: {
    appName: "Wirddy",
    tagline: "Organize your Quran reading together",
    heroSubtitle:
      "A smart and simple app to distribute Quran reading among group members, with accurate weekly rotating schedules down to the exact Surah and Ayah.",
    ctaCreateGroup: "Create a Group",
    ctaHowItWorks: "How It Works",
    ctaGetStarted: "Start organizing your group",

    howItWorksTitle: "How Wirddy Works",
    howItWorksSubtitle:
      "Three simple steps to create a balanced, rotating Quran schedule for your group.",
    step1Title: "Create your group",
    step1Desc: "Add members and choose how much each person reads.",
    step2Title: "Generate your schedule",
    step2Desc: "Wirddy divides the Quran and rotates assignments across weeks.",
    step3Title: "Share your schedule",
    step3Desc: "Send the link or QR code to your group.",

    badgeFree: "Free",
    badgeNoLogin: "No login",
    badgeBilingual: "Arabic + English",
    badgeMultiDevice: "Works on phone and desktop",

    exampleTitle: "Weekly Schedule Preview",
    exampleSubtitle:
      "See how an organized reading plan looks for a group of 4 members",
    exampleBadge: "Live Preview",
    exampleGroupName: "Family Quran Reading",
    exampleSummary: "4 members • 30 Juz / week",
    exampleTryTemplate: "Use this template",

    featuresTitle: "Why Wirddy?",
    featuresSubtitle:
      "Designed to be the most accurate and effortless Quran group planner.",
    feature1Title: "Smart Rotating Schedules",
    feature1Desc:
      "An intelligent algorithm ensures members rotate through different Juz each week without repeating.",
    feature2Title: "Personalized Knowledge Ranges",
    feature2Desc:
      "Assign members only the parts they have memorized or feel comfortable reading.",
    feature3Title: "Surah & Ayah Precision",
    feature3Desc:
      "Verified Quranic data tells each member exactly which Surah and Ayah to start and finish with.",
    feature4Title: "Instant Export & Easy Sharing",
    feature4Desc:
      "Download your schedule as a sleek image, clean PDF, or share it via a permanent link.",
    feature5Title: "Image & PDF Exports",
    feature5Desc:
      "Download WhatsApp-ready high-resolution images or multi-page A4 PDFs.",
    feature6Title: "Bilingual RTL & LTR",
    feature6Desc:
      "Seamlessly switch between Arabic (RTL) and English (LTR) layouts anytime.",

    sectionGroup: "Group",
    sectionQuranRange: "Quran Range & Starting Point",
    sectionMembers: "Members & Allocations",
    sectionRotation: "Rotation Style",
    sectionWeeks: "Duration & Weeks",

    rotationStyleTitle: "Rotation style",
    rotationStyleDesc:
      "Choose how Quran assignments rotate between members across weeks",
    rotationLarge: "Large change",
    rotationLargeDesc:
      "Creates a significantly different assignment between weeks.",
    rotationMedium: "Medium change",
    rotationMediumDesc: "Balances stability and variation.",
    rotationSmall: "Small change",
    rotationSmallDesc:
      "Keeps assignments relatively close while still introducing variation.",
    rotationRandom: "Random",
    rotationRandomDesc:
      "Creates varied assignments while respecting all Quran and member constraints.",

    startingPointTitle: "Starting point",
    startingPointDesc:
      "Choose which Juz to begin reading from in the first week",
    startJuzLabel: "Starts from",
    endJuzLabel: "To Juz",

    quranRangeTitle: "Quran range",
    quranRangeFull: "Full Quran",
    quranRangeFullDesc: "Complete 30 Juz reading",
    quranRangeCustom: "Custom range",
    quranRangeCustomDesc: "Choose specific Surahs or Ayahs to read",
    rangeFrom: "From",
    rangeTo: "To",
    surahLabel: "Surah",
    ayahLabel: "Ayah",
    rangeSummary: "Amount",
    customRangeAmountNotice: "Total matches the selected range",

    createGroupTitle: "Create Your Group",
    createGroupSubtitle:
      "Choose a name for your group to start organizing your reading schedule",
    formTitle: "Reading Plan Setup",
    formSubtitle:
      "Enter your group details and members to automatically generate an organized schedule.",
    groupNameLabel: "Group Name",
    groupNamePlaceholder: "e.g., Family Circle, Quran Study Group...",
    groupNameHelp: "You can change the group name anytime later.",
    weeksCountLabel: "Number of Weeks",
    weeksCountHelper: "Choose plan duration (from 1 to 52 weeks)",
    weekUnit: "weeks",
    weeksOption: "weeks",
    btnContinue: "Continue to Members",

    totalLabel: "Group Weekly Reading Total",
    totalSuccess: "Perfect. Your group will complete exactly 30 Juz each week.",
    totalErrorLess:
      "Weekly reading total is less than 30 Juz. Exactly 30 Juz is required.",
    totalErrorMore:
      "Weekly reading total exceeds 30 Juz. Exactly 30 Juz is required.",
    totalExactRequired: "The weekly reading total must equal exactly 30 Juz.",
    totalJuzLabel: "Total Weekly Juz",
    totalExactMsg: "Total complete (30/30 Juz). Ready to generate!",
    totalLessMsg: "Total is currently less than 30 Juz. Remaining:",
    totalMoreMsg: "Total exceeds 30 Juz. Overflow:",
    juzUnit: "Juz",

    membersTitle: "Add Group Members",
    membersSubtitle:
      "Define each member, their known Quran range, and their weekly Juz reading amount.",
    membersListTitle: "Group Members",
    addMemberBtn: "Add Member",
    removeMemberBtn: "Remove Member",
    removeMember: "Remove Member",
    noMembersTitle: "Add your group members",
    noMembersDesc:
      "Start by adding members and configuring how much they will read each week.",
    memberNameLabel: "Member Name",
    memberNamePlaceholder: "Member Name",
    knowledgeLabel: "Knowledge / Memorization Range",
    knowledgeEntire: "Entire Quran (1-30)",
    knowledgeJuzRange: "Specific Juz Range",
    knowledgeSurahRange: "Specific Surahs",
    fromJuz: "From Juz",
    toJuz: "To Juz",
    fromSurah: "From Surah",
    toSurah: "To Surah",
    startSurahLabel: "From Surah",
    endSurahLabel: "To Surah",
    weeklyAmountLabel: "Weekly Reading Amount",
    weeklyAmountUnit: "Juz / week",
    weeklyAmountHelp: "How many Juz will this member read each week?",
    amountJuz: "Juz / week",
    memberCount: "Members",

    weeksTitle: "Plan Duration",
    weeksSubtitle: "How many weeks would you like to schedule?",
    weeksLabel: "Number of Weeks",
    weeksUnit: "weeks",

    btnGenerate: "Generate Schedule",
    btnGenerating: "Calculating & Generating...",
    btnRegenerate: "Regenerate Schedule",
    btnEditPlan: "Edit Plan & Members",
    btnBack: "Back",
    btnSave: "Save & Continue",
    btnShare: "Share",
    btnExportImage: "Download Image",
    btnExportPdf: "Download PDF",
    btnCopyLink: "Copy Link",
    btnQrCode: "QR Code",
    btnCopyEditLink: "Copy Edit Link",
    linkCopied: "Link copied to clipboard",

    errGroupNameRequired: "Please enter a group name.",
    errAtLeastOneMember: "At least one member is required.",
    errMemberNameRequired: "Please enter names for all members.",
    errTotalMustBe30: "Total reading amount must equal exactly 30 Juz.",
    errKnowledgeInvalid: "Invalid knowledge range for some members.",
    errAmountExceedsKnowledge:
      "Reading amount exceeds member's selected range.",

    planTitle: "Quran Completion Plan",
    scheduleGeneratedSuccess: "Schedule generated successfully!",
    weekLabel: "Week",
    weekOf: "of",
    startLabel: "START",
    endLabel: "END",
    juzLabel: "Juz",
    viewCards: "Cards",
    viewTable: "Table",
    tableHeaderMember: "Member",
    tableHeaderAmount: "Juz",
    tableHeaderStart: "Start",
    tableHeaderEnd: "End",
    tableHeaderJuzRange: "Juz Range",
    tableHeaderAyahRange: "Start & End Ayah",
    summaryTitle: "Plan Summary",
    summaryTotal: "30 Juz weekly",
    summaryMembers: "members",
    summaryQuran: "1 complete Quran per week",
    currentWeekOnly: "Current Week",
    fullPlan: "Full Plan",
    shareSchedule: "Share Schedule",

    regenerateTitle: "Regenerate Schedule?",
    regenerateWarning:
      "This will reassign all Juz portions and generate a completely new schedule for all weeks.",
    regenerateConfirm: "Yes, Regenerate",
    cancel: "Cancel",
    exportTitle: "Download & Share Schedule",
    exportSubtitle:
      "Choose a format to download or share the generated schedule directly.",
    exportDownloadSection: "Download Files",
    exportShareSection: "Direct Share",
    exportPngCurrent: "Current week image (PNG)",
    exportPngCurrentFormat: "PNG",
    exportZipAll: "All weeks (ZIP archive)",
    exportZipAllFormat: "ZIP",
    exportPdfAll: "Full plan (PDF document)",
    exportPdfAllFormat: "PDF",
    exportSharePdfAll: "Share full plan (PDF)",
    exportLoadingCurrent: "Preparing current week image...",
    exportLoadingAll: "Rendering and compressing all weeks...",
    exportLoadingPdf: "Creating and formatting PDF document...",
    exportLoadingShare: "Preparing full PDF for sharing...",
    exportOpeningShare: "Opening native share dialog...",
    exportSuccess: "File downloaded successfully!",
    exportShareSuccess: "Share dialog opened successfully!",
    exportError:
      "An error occurred while generating the export file. Please try again.",
    exportLogoError: "Unable to load high-resolution logo for export.",
    exportShareFallbackUnsupported:
      "Direct file sharing is unsupported in this browser. The file has been downloaded instead.",
    exportShareFallbackError:
      "Direct sharing failed. The file has been downloaded to your device instead.",
    preparingExport: "Preparing export...",

    exportOptionsTitle: "Export options",
    optShowLogo: "Show Wirddy logo",
    optShowQr: "Show QR code",
    optShowGroupName: "Show group name",
    optShowDate: "Show creation date",

    btnPrint: "Print",
    btnDuplicate: "Duplicate schedule",
    duplicatingSchedule: "Duplicating schedule...",
    scheduleDuplicatedSuccess: "Schedule duplicated as a new group!",

    btnSaveAndShare: "Save & Share",
    saveModalTitle: "Share schedule",
    saveModalSubtitle:
      "Get a direct link to share your schedule with your group or reopen it anytime without creating an account.",
    savingSchedule: "Saving schedule online...",
    scheduleSavedSuccess: "Schedule Saved Successfully!",
    scheduleSavedDesc:
      "You can now share this link with group members to view the schedule from any device.",
    sectionViewLink: "View link",
    sectionViewLinkDesc:
      "Share this link with your group. No account or login is required.",
    sectionEditLink: "Edit link",
    sectionEditLinkDesc:
      "This private link lets you edit and regenerate the schedule. Keep it somewhere safe.",
    publicShareLink: "Group View Link",
    copyPublicLink: "Copy link",
    shareGroupLink: "Share",
    qrCodeTitle: "QR Code",
    qrCodeDesc: "Scan with your phone camera to open the schedule instantly.",
    btnShowQrCode: "Show QR Code",
    btnHideQrCode: "Hide QR Code",
    secretEditLinkTitle: "Your Secret Edit Link",
    secretEditLinkDesc:
      "Keep this link safe to modify member names or regenerate the schedule later. Only share with organizers.",
    copyEditLink: "Copy Edit Link",
    editLinkCopied: "Edit link copied!",
    scanToOpen: "Scan to open schedule",
    saveOfflineWarning:
      "Your schedule was created locally, but could not be saved online. You can still download and use it right now.",
    viewOnlyBadge: "View Only",
    editorBadge: "Edit Mode",
    scheduleNotFoundTitle: "Schedule Not Found",
    scheduleNotFoundDesc:
      "Sorry, we could not find this schedule. The link may be incorrect or it has been deleted.",
    scheduleExpiredTitle: "Schedule Expired",
    scheduleExpiredDesc:
      "This schedule has exceeded its 1-year lifetime and is no longer available on the server.",
    btnCreateNewSchedule: "Create New Schedule",
    btnDeleteSchedule: "Delete Schedule",
    deleteScheduleConfirm:
      "Are you sure you want to permanently delete this schedule?",

    recentSchedulesTitle: "Your recent schedules",
    recentSchedulesSubtitle:
      "Schedules recently created or opened on this device",
    lastUsedToday: "Today",
    lastUsedYesterday: "Yesterday",
    btnOpenRecent: "Open",
    btnRemoveRecent: "Remove",
    btnClearAll: "Clear all",
    noRecentSchedules: "No recently opened schedules on this device",

    pwaTitle: "Use Wirddy like an app",
    pwaDesc:
      "Add it to your home screen for quick access without downloading an app store binary.",
    pwaSectionBadge: "USE WIRDDY LIKE AN APP",
    pwaSectionTitle: "Use Wirddy Like an App on Your Phone",
    pwaSectionDesc:
      "Add Wirddy directly to your mobile home screen to access your reading schedules with one tap—no app store downloads needed.",
    pwaIosStep:
      "In Safari, tap the Share icon and select 'Add to Home Screen'.",
    pwaAndroidStep:
      "In Chrome, tap the menu (⋮) and select 'Install app' or 'Add to Home Screen'.",
    pwaIosTab: "iPhone (iOS)",
    pwaAndroidTab: "Android",
    pwaIphoneTab: "iPhone (iOS)",
    pwaIphoneTitle: "Add Wirddy to iPhone Home Screen",
    pwaAndroidTitle: "Install Wirddy on Android",
    pwaIphoneStep1: "Open Wirddy website in Safari",
    pwaIphoneStep2: "Tap the Share button at the bottom of the screen",
    pwaIphoneStep3: "Scroll down and select 'Add to Home Screen'",
    pwaIphoneStep4: "Tap 'Add' in the top right corner",
    pwaAndroidStep1: "Open Wirddy website in Chrome",
    pwaAndroidStep2: "Tap the menu (three dots) in the browser toolbar",
    pwaAndroidStep3: "Select 'Install app' or 'Add to Home screen'",
    pwaAndroidStep4: "Confirm installation to see Wirddy among your apps",
    pwaIphoneNote: "Works seamlessly offline once opened on your device.",
    pwaAndroidNote: "Ultra-lightweight with zero storage footprint.",
    pwaGifAlt: "Steps to add Wirddy to Home Screen on iPhone",

    suggestionsTitle: "Suggested Groups",
    suggFamily: "Family Completion",
    suggFriends: "Mosque Friends",
    suggRamadan: "Ramadan Reading",
    suggMosque: "Memorization Circle",
    suggStudy: "Study Group",

    footerText: "Wirddy - Quran Reading Planner for Groups",
    footerRights: "All rights reserved",
  },
}
