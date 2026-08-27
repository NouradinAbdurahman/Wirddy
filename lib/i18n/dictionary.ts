export type Language = "ar" | "en"
export type Direction = "rtl" | "ltr"

export interface Translations {
  // Navigation & General
  appName: string
  tagline: string
  heroEyebrow: string
  heroSubtitle: string
  heroCtaAccount: string
  heroCtaGuest: string
  heroCtaDashboard: string
  ctaCreateGroup: string
  ctaHowItWorks: string
  ctaGetStarted: string

  // Navigation Links
  navHowItWorks: string
  navFeatures: string
  navPreview: string
  navInstall: string
  navCreateAccount: string

  // How it works (4 Steps)
  howItWorksTitle: string
  howItWorksSubtitle: string
  step1Title: string
  step1Desc: string
  step2Title: string
  step2Desc: string
  step3Title: string
  step3Desc: string
  step4Title: string
  step4Desc: string

  // Personal Dashboard Showcase
  dashboardShowcaseTitle: string
  dashboardShowcaseSubtitle: string
  dashFeatTodayTitle: string
  dashFeatTodayDesc: string
  dashFeatContinueTitle: string
  dashFeatContinueDesc: string
  dashFeatBookmarksTitle: string
  dashFeatBookmarksDesc: string
  dashFeatProgressTitle: string
  dashFeatProgressDesc: string
  dashFeatAnnounceTitle: string
  dashFeatAnnounceDesc: string

  // Quran Reader Showcase
  readerShowcaseTitle: string
  readerShowcaseSubtitle: string
  readerFeatTextTitle: string
  readerFeatTextDesc: string
  readerFeatSearchTitle: string
  readerFeatSearchDesc: string
  readerFeatBoundsTitle: string
  readerFeatBoundsDesc: string
  readerFeatBookmarksTitle: string
  readerFeatBookmarksDesc: string
  readerFeatResumeTitle: string
  readerFeatResumeDesc: string

  // Smart Scheduling Section
  smartScheduleTitle: string
  smartScheduleSubtitle: string
  smartFeatRotationTitle: string
  smartFeatRotationDesc: string
  smartFeatKnowledgeTitle: string
  smartFeatKnowledgeDesc: string
  smartFeatAmountsTitle: string
  smartFeatAmountsDesc: string
  smartFeatCustomTitle: string
  smartFeatCustomDesc: string
  smartFeatRamadanTitle: string
  smartFeatRamadanDesc: string
  smartFeatDailyTitle: string
  smartFeatDailyDesc: string
  smartFeatRecurringTitle: string
  smartFeatRecurringDesc: string
  smartFeatHistoryTitle: string
  smartFeatHistoryDesc: string

  // Stay on Track (Progress & Notifications)
  stayOnTrackTitle: string
  stayOnTrackSubtitle: string
  trackFeatProgressTitle: string
  trackFeatProgressDesc: string
  trackFeatDailyTitle: string
  trackFeatDailyDesc: string
  trackFeatIncompleteTitle: string
  trackFeatIncompleteDesc: string
  trackFeatPushTitle: string
  trackFeatPushDesc: string
  trackFeatRealtimeTitle: string
  trackFeatRealtimeDesc: string
  trackFeatOfflineTitle: string
  trackFeatOfflineDesc: string

  // Group Collaboration
  collabTitle: string
  collabSubtitle: string
  collabFeatLinksTitle: string
  collabFeatLinksDesc: string
  collabFeatLinkAccountTitle: string
  collabFeatLinkAccountDesc: string
  collabFeatAnnounceTitle: string
  collabFeatAnnounceDesc: string
  collabFeatProgressTitle: string
  collabFeatProgressDesc: string
  collabFeatQrTitle: string
  collabFeatQrDesc: string
  collabFeatWhatsappTitle: string
  collabFeatWhatsappDesc: string

  // Unified Share & Export
  shareExportTitle: string
  shareExportSubtitle: string
  exportPngTitle: string
  exportPngDesc: string
  exportPdfTitle: string
  exportPdfDesc: string
  exportZipTitle: string
  exportZipDesc: string
  exportLinksTitle: string
  exportLinksDesc: string
  exportQrTitle: string
  exportQrDesc: string
  exportWhatsappTitle: string
  exportWhatsappDesc: string

  // Use Wirddy Like an App (PWA)
  pwaTitle: string
  pwaSubtitle: string
  pwaFeatHomeTitle: string
  pwaFeatHomeDesc: string
  pwaFeatOfflineTitle: string
  pwaFeatOfflineDesc: string
  pwaFeatPushTitle: string
  pwaFeatPushDesc: string

  // Why Groups Choose Wirddy (6 Summary Points)
  whyChooseTitle: string
  whyChooseSubtitle: string
  why1Title: string
  why1Desc: string
  why2Title: string
  why2Desc: string
  why3Title: string
  why3Desc: string
  why4Title: string
  why4Desc: string
  why5Title: string
  why5Desc: string
  why6Title: string
  why6Desc: string

  // One Account Value Banner
  accountBannerTitle: string
  accountBannerDesc: string
  accountBannerCta: string
  accountBannerSignIn: string

  // Final CTA
  finalCtaTitle: string
  finalCtaDesc: string
  finalCtaPrimary: string
  finalCtaGuest: string
  finalCtaDashboard: string
  finalCtaTrust: string

  // Value Badges
  badgeFree: string
  badgeNoLogin: string
  badgeBilingual: string
  badgeMultiDevice: string

  // Example schedule section
  previewTitle: string
  previewSubtitle: string
  exampleTitle: string
  exampleSubtitle: string
  exampleBadge: string
  exampleGroupName: string
  exampleSummary: string
  exampleTryTemplate: string

  // Features (General / Compatibility)
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
  groupTitleLabel: string
  groupTitlePlaceholder: string
  groupDescLabel: string
  groupDescPlaceholder: string
  scheduleDatesTitle: string
  noDateOption: string
  setDateOption: string
  startDatePickerLabel: string
  datesBadge: string
  occasionTitle: string
  occasionNormal: string
  occasionRamadan: string
  islamicYearLabel: string
  ramadanBadge: string
  dailyDivisionTitle: string
  noDailyDivision: string
  withDailyDivision: string
  dailyDivisionDesc: string
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
  viewDaily: string
  viewModeGroup: string
  viewModePersonal: string
  selectYourName: string
  myScheduleTitle: string
  returnToGroupView: string
  dayUnit: string
  globalDayUnit: string
  todayLabel: string
  dailyAyahRange: string
  dailyTotalAyahs: string
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
  exportMemberPng: string
  exportMemberPdf: string
  exportAllMembersZip: string
  downloadAllMembersZip: string
  downloadAllMembersZipDesc: string
  downloadMySchedule: string
  scanToOpenMySchedule: string
  personalQrCode: string
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
  packagingMembersZip: string

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

  // Google Authentication Only
  authLoginTitle: string
  authLoginSubtitle: string
  authContinueWithGoogle: string
  authSecureGoogle: string
  authConnectingGoogle: string
  authFailedTitle: string
  authCancelled: string
  authFailedGeneric: string
  authTryAgain: string
  authSignIn: string
  authSignOut: string
  authBackToHome: string

  // Footer & branding
  footerText: string
  footerRights: string

  // Dashboard & Navigation
  navDashboard: string
  navMyGroups: string
  navSettings: string
  navBookmarks: string
  dashboardWelcome: string
  dashboardSubtitle: string
  dashboardTodaysReading: string
  dashboardContinueReading: string
  dashboardActiveGroups: string
  dashboardCompletedGroups: string
  dashboardArchivedGroups: string
  dashboardRecentSchedules: string
  dashboardQuickCreate: string
  dashboardNoActiveGroups: string
  dashboardNoTodaysReading: string
  dashboardReadNow: string
  dashboardMarkComplete: string
  dashboardCompleted: string
  dashboardGroupProgress: string
  dashboardSearchPlaceholder: string

  // My Groups Filters & Actions
  tabAll: string
  tabActive: string
  tabDrafts: string
  tabCompleted: string
  tabArchived: string
  tabRamadan: string
  actionOpen: string
  actionShare: string
  actionDownload: string
  actionEdit: string
  actionDuplicate: string
  actionNewKhatmah: string
  actionArchive: string
  actionRestore: string
  actionDelete: string
  confirmDelete: string
  confirmArchive: string

  // Quran Reader
  readerTitle: string
  readerSurah: string
  readerAyah: string
  readerJuz: string
  readerPrevAyah: string
  readerNextAyah: string
  readerPrevPortion: string
  readerNextPortion: string
  readerFontSize: string
  readerBookmarkSaved: string
  readerMarkAssignmentDone: string
  readerOpenReader: string

  // Bookmarks
  bookmarksTitle: string
  bookmarksEmpty: string
  bookmarksJumpTo: string

  // Member Invitations & Linking
  inviteMemberTitle: string
  inviteCopyLink: string
  inviteWhatsApp: string
  inviteQrCode: string
  linkAccountTitle: string
  linkAccountSuccess: string
  linkedAccountBadge: string
  anonymousMemberBadge: string

  // Announcements
  announcementsTitle: string
  announcementsEmpty: string
  announcementCreate: string
  announcementTitlePlaceholder: string
  announcementContentPlaceholder: string
  announcementPostBtn: string

  // History & Lifecycle
  historyTitle: string
  historyEmpty: string
  khatmahSuccess: string

  // Settings & Notifications
  settingsTitle: string
  settingsAccount: string
  settingsAppearance: string
  settingsLanguage: string
  settingsReading: string
  settingsNotifications: string
  settingsData: string
  notifDailyReminder: string
  notifReminderTime: string
  notifIncompleteReminder: string
  notifWeeklySummary: string
  notifGroupAlerts: string
  notifEnableBtn: string
  notifDisabled: string
  exportDataBtn: string
  deleteAccountBtn: string
  deleteAccountConfirm: string
}

export const translations: Record<Language, Translations> = {
  ar: {
    appName: "وِردي",
    tagline: "نظّموا وردكم واقرؤوا القرآن معًا",
    heroEyebrow: "تنظيم قراءة القرآن للمجموعات",
    heroSubtitle:
      "أنشئ جدولًا متوازنًا لقراءة القرآن مع مجموعتك، واعرف وردك اليومي، واقرأ مباشرة داخل وِردي، وتابع تقدمك، وابقَ على تواصل مع مجموعتك طوال الختمة.",
    heroCtaAccount: "أنشئ حسابك مجانًا",
    heroCtaGuest: "أنشئ جدولًا بدون حساب",
    heroCtaDashboard: "لوحة التحكم",
    ctaCreateGroup: "إنشاء مجموعة",
    ctaHowItWorks: "كيف يعمل؟",
    ctaGetStarted: "ابدأ تنظيم ورد مجموعتك",

    navHowItWorks: "كيف يعمل؟",
    navFeatures: "المميزات",
    navPreview: "معاينة الجدول",
    navInstall: "تثبيت التطبيق",
    navCreateAccount: "تسجيل الدخول",

    howItWorksTitle: "كيف يعمل وِردي؟",
    howItWorksSubtitle:
      "من إنشاء مجموعتك وحتى ختم القرآن، يضمن وِردي تنظيم الختمة بأكملها بكل سلاسة.",
    step1Title: "أنشئ مجموعتك",
    step1Desc:
      "أضف أفراد عائلتك أو مجموعتك، وحدد مقدار قراءة كل شخص وما يحفظه من القرآن.",
    step2Title: "ابنِ جدولًا متوازنًا",
    step2Desc:
      "يقوم وِردي بتقسيم القرآن بالترتيب وتدوير التعيينات أسبوعيًا بعدالة مع مراعاة طاقة كل عضو.",
    step3Title: "اقرأ وردك المحدد",
    step3Desc:
      "افتح ورد اليوم من لوحة تحكمك واقرأ المقطع المحدد لك بدقة وبخط عثماني أصيل داخل وِردي مباشرة.",
    step4Title: "تابع الإنجاز واختم معًا",
    step4Desc:
      "علّم أورادك المكتملة، واحفظ إشاراتك المرجعية، واستلم التذكيرات، وتابع تقدم المجموعة للوصول إلى الختمة معًا.",

    dashboardShowcaseTitle: "قرآنك ووردك ومجموعاتك في مكان واحد",
    dashboardShowcaseSubtitle:
      "لوحة تحكمك الشخصية تعرض لك ما يجب قراءته اليوم، والمكان الذي توقفت عنده، وإشاراتك المرجعية، ومجموعاتك، وإعلانات المنظم، ونسبة إنجازك.",
    dashFeatTodayTitle: "ورد اليوم",
    dashFeatTodayDesc:
      "شاهد بدقة المقطع والسور المطلوب قراءتها لورد اليوم بضغطة زر.",
    dashFeatContinueTitle: "متابعة القراءة",
    dashFeatContinueDesc: "عُد مباشرة إلى آخر آية وموضع توقفت عنده في القارئ.",
    dashFeatBookmarksTitle: "الإشارات المرجعية",
    dashFeatBookmarksDesc:
      "احفظ الآيات والمواضع المهمة للرجوع إليها في أي وقت.",
    dashFeatProgressTitle: "تقدم المجموعة",
    dashFeatProgressDesc:
      "شاهد كيف تتقدم مجموعتك نحو إتمام الختمة أسبوعًا بأسبوع.",
    dashFeatAnnounceTitle: "إعلانات المجموعة",
    dashFeatAnnounceDesc:
      "ابقَ على اطلاع بأحدث التنبيهات والرسائل من منظم الختمة.",

    readerShowcaseTitle: "اقرأ القرآن مباشرة دون مغادرة وِردي",
    readerShowcaseSubtitle:
      "افتح وردك المحدد مباشرة في قارئ القرآن. تنقل بين السور والآيات، وابحث في نص المصحف، واضبط حجم الخط، وضع إشاراتك المرجعية، وتابع من حيث توقفت.",
    readerFeatTextTitle: "قارئ القرآن العثماني",
    readerFeatTextDesc:
      "اقرأ بنص عثماني معتمد ورسم مصحف المدينة الأصيل المريح للعين.",
    readerFeatSearchTitle: "بحث شامل في القرآن",
    readerFeatSearchDesc:
      "ابحث في كلمات القرآن وسوره وانتقل فورًا وبدقة إلى الآية المطلوبة.",
    readerFeatBoundsTitle: "حدود قراءة دقيقة",
    readerFeatBoundsDesc:
      "شاهد بداية ونهاية وردك بالآية والسورة ورقم الجزء بوضوح.",
    readerFeatBookmarksTitle: "إشارات مرجعية سريعة",
    readerFeatBookmarksDesc:
      "احفظ الآيات بضغطة زر مع ملاحظاتك الخاصة للوصول إليها لاحقًا.",
    readerFeatResumeTitle: "متابعة فورية",
    readerFeatResumeDesc:
      "تابع القراءة فورًا من آخر موضع توقفت عنده دون عناء البحث.",

    smartScheduleTitle: "جدول ذكي مصمم خصيصًا لمجموعتك",
    smartScheduleSubtitle:
      "وِردي لا يكتفي بتقسيم ٣٠ جزءًا فقط، بل يبني خطة قراءة متوازنة تدويرية تناسب عدد أعضائك، ومقدار قراءة كل شخص، وما يحفظه من القرآن.",
    smartFeatRotationTitle: "تدوير عادل ومتوازن",
    smartFeatRotationDesc:
      "يتنقل الأعضاء بين أجزاء وسور القرآن أسبوعًا بعد أسبوع لختم القرآن كاملًا.",
    smartFeatKnowledgeTitle: "مراعاة ما يحفظه كل عضو",
    smartFeatKnowledgeDesc:
      "حدد لكل عضو الأجزاء أو السور التي يتقنها فقط ليتم التوزيع بما يناسبه.",
    smartFeatAmountsTitle: "مرونة في كمية القراءة",
    smartFeatAmountsDesc:
      "خصص لكل عضو عدد الأجزاء المناسب لطاقته أسبوعيًا من جزء واحد إلى عدة أجزاء.",
    smartFeatCustomTitle: "نطاقات قرآنية مخصصة",
    smartFeatCustomDesc:
      "ابدأ واختم الجدول بسور وآيات مخصصة عند الرغبة في قراءة سور محددة.",
    smartFeatRamadanTitle: "دعم ختمات رمضان والمناسبات",
    smartFeatRamadanDesc:
      "أنشئ جداول مخصصة لشهر رمضان بالتقويم الهجري والتواريخ الدقيقة.",
    smartFeatDailyTitle: "تقسيم يومي للأوراد",
    smartFeatDailyDesc:
      "قسّم الورد الأسبوعي إلى حصص يومية من السبت للجمعة لسهولة الالتزام.",
    smartFeatRecurringTitle: "تجديد دوري تلقائي",
    smartFeatRecurringDesc:
      "استمرارية تلقائية للدورات والختمات المتكررة أسبوعيًا أو شهريًا دون انقطاع.",
    smartFeatHistoryTitle: "سجل النسخ والاستعادة",
    smartFeatHistoryDesc:
      "راجع التعديلات السابقة واستعد أي نسخة سابقة من جدولك بضغطة زر.",

    stayOnTrackTitle: "تابع وردك والتزم بختمتك يوميًا",
    stayOnTrackSubtitle:
      "يحافظ وِردي على تزامن تقدمك في القراءة عبر جميع أجهزتك لتعرف دائمًا ما قرأته وما تبقى لك.",
    trackFeatProgressTitle: "تسجيل الإنجاز",
    trackFeatProgressDesc:
      "علّم كل ورد أو يوم مكتمل لترى نسبة إنجازك وإنجاز مجموعتك بوضوح.",
    trackFeatDailyTitle: "تذكير يومي ذكي",
    trackFeatDailyDesc:
      "حدد الوقت المناسب لك يوميًا لنذكرك بقراءة وردك في موعدك المفضل.",
    trackFeatIncompleteTitle: "تنبيه الأوراد غير المكتملة",
    trackFeatIncompleteDesc:
      "تنبيه خاص في حال عدم إكمال ورد اليوم لمساعدتك على عدم فوات الورد.",
    trackFeatPushTitle: "إشعارات الويب المباشرة",
    trackFeatPushDesc:
      "استقبل تذكيراتك وإعلانات مجموعتك مباشرة على هاتفك أو حاسوبك.",
    trackFeatRealtimeTitle: "تزامن لحظي فوري",
    trackFeatRealtimeDesc:
      "تحديث مباشر لتقدم الأعضاء والإعلانات دون الحاجة لتحديث الصفحة.",
    trackFeatOfflineTitle: "دعم القراءة بدون إنترنت",
    trackFeatOfflineDesc:
      "اقرأ وسجل إنجازك حتى عند انقطاع الاتصال وستتزامن بياناتك فور عودة الإنترنت.",

    collabTitle: "تواصل مستمر مع أعضاء مجموعتك",
    collabSubtitle:
      "يستطيع كل عضو الوصول لورده الخاص بسهولة، بينما يمتلك المنظم أدوات كاملة لإدارة وتوجيه الختمة.",
    collabFeatLinksTitle: "روابط خاصة لكل عضو",
    collabFeatLinksDesc:
      "رابط مخصص لكل عضو يعرض ورده فقط وأزرار القراءة والتسجيل دون تعقيد.",
    collabFeatLinkAccountTitle: "ربط العضو بحسابه",
    collabFeatLinkAccountDesc:
      "يمكن للأعضاء ربط وردهم بحساب جوجل لحفظه ومتابعته في لوحة تحكمهم الشخصية.",
    collabFeatAnnounceTitle: "إعلانات الختمة",
    collabFeatAnnounceDesc:
      "شارك التوجيهات ورسائل التحفيز مع أعضاء المجموعة بكل سهولة.",
    collabFeatProgressTitle: "متابعة إنجاز الفريق",
    collabFeatProgressDesc:
      "شاهد لوحة متابعة توضح التزام كل عضو ونسبة إنجاز الختمة أسبوعيًا.",
    collabFeatQrTitle: "مشاركة فورية برمز QR",
    collabFeatQrDesc:
      "امسح رمز الاستجابة السريعة للانضمام إلى الجدول فورًا من أي هاتف.",
    collabFeatWhatsappTitle: "مشاركة سهلة عبر الواتساب",
    collabFeatWhatsappDesc:
      "أرسل روابط الأعضاء ونصوص الأوراد بضغطة زر واحدة عبر واتساب.",

    shareExportTitle: "شارك جدولك بكل سهولة وفي أي مكان",
    shareExportSubtitle:
      "امنح كل عضو جدولًا واضحًا يمكن فتحه أو حفظه أو طباعته أو مشاركته بأي صيغة تناسبه.",
    exportPngTitle: "صور عالية الدقة (PNG)",
    exportPngDesc:
      "صور أنيقة ومصممة خصيصًا للمشاركة عبر واتساب وشبكات التواصل.",
    exportPdfTitle: "ملفات PDF جاهزة للطباعة",
    exportPdfDesc:
      "جداول منسقة بعناية بمقاس A4 جاهزة للطباعة الورقية وتوزيعها.",
    exportZipTitle: "حزمة كاملة (ZIP)",
    exportZipDesc: "حمّل صور جميع الأسابيع والأعضاء دفعة واحدة في ملف مضغوط.",
    exportLinksTitle: "روابط دائمة",
    exportLinksDesc:
      "افتح الجدول من أي متصفح أو جهاز في أي وقت دون الحاجة لتحميل ملفات.",
    exportQrTitle: "رموز QR",
    exportQrDesc: "مشاركة سريعة عبر المسح بالكاميرا من الهاتف مباشرة.",
    exportWhatsappTitle: "واتساب",
    exportWhatsappDesc: "إرسال الورد مباشرة بنصوص منسقة وروابط مختصرة جاهزة.",

    pwaTitle: "استخدم وِردي كتطبيق على هاتفك",
    pwaSubtitle:
      "ثبّت وِردي على شاشتك الرئيسية للوصول السريع لجدولك، وقارئ القرآن، وتسجيل الإنجاز، والتذكيرات اليومية.",
    pwaFeatHomeTitle: "تثبيت على الشاشة الرئيسية",
    pwaFeatHomeDesc:
      "افتح وِردي بضغطة زر واحدة كتطبيق مستقل وبدون شريط المتصفح.",
    pwaFeatOfflineTitle: "قراءة بدون إنترنت",
    pwaFeatOfflineDesc:
      "يبقى جدولك والمصحف متاحين للقراءة حتى في حال عدم توفر اتصال بالشبكة.",
    pwaFeatPushTitle: "إشعارات وتذكيرات مباشرة",
    pwaFeatPushDesc:
      "تصلك تنبيهات وردك اليومي وإعلانات المجموعة مباشرة كإشعار على شاشتك.",

    whyChooseTitle: "لماذا تختار المجموعات وِردي؟",
    whyChooseSubtitle:
      "صُمم وِردي ليجمع بين دقة التخطيط وسهولة القراءة والمتابعة في منصة واحدة متكاملة.",
    why1Title: "جدولة قرآنية ذكية وعادلة",
    why1Desc: "توزيع عادل للأجزاء وتدوير أسبوعي سلس ومنظم يمنع التكرار.",
    why2Title: "ورد مخصص لكل قارئ",
    why2Desc: "يعرف كل عضو بدايته ونهايته بدقة السورة والآية مع مراعاة حفظه.",
    why3Title: "مصحف مدمج وبحث فوري",
    why3Desc: "قراءة مباشرة بالرسم العثماني المعتمد وبحث سريع في كامل المصحف.",
    why4Title: "متابعة مستمرة وتذكير يومي",
    why4Desc:
      "تسجيل إنجاز فوري وتذكيرات يومية وإشعارات ويب تساعد على الالتزام.",
    why5Title: "مشاركة وتصدير متعدد الصيغ",
    why5Desc:
      "تصدير صور PNG عالية الدقة، وملفات PDF للطباعة، وحزم ZIP، وروابط دائمة.",
    why6Title: "واجهة عربية وإنجليزية كاملة",
    why6Desc:
      "دعم كامل للغتين العربية والإنجليزية مع اتجاهات RTL وLTR والوضع الليلي.",

    accountBannerTitle: "مجموعاتك، وردك، وقراءتك في حساب واحد",
    accountBannerDesc:
      "أنشئ حسابًا مجانيًا لحفظ مجموعاتك، وتزامن تقدمك، وإشاراتك المرجعية، وتفضيلات الإشعارات عبر كل أجهزتك.",
    accountBannerCta: "أنشئ حسابك مجانًا",
    accountBannerSignIn: "لديك حساب بالفعل؟ تسجيل الدخول",

    finalCtaTitle: "ابدأ ختمتك القادمة مع وِردي اليوم",
    finalCtaDesc:
      "أنشئ مجموعتك، وابنِ جدولًا قرآنيًا متوازنًا، وامنح الجميع مسارًا واضحًا من الجزء الأول إلى الختام.",
    finalCtaPrimary: "أنشئ حسابك مجانًا",
    finalCtaGuest: "أنشئ جدولًا بدون حساب",
    finalCtaDashboard: "فتح لوحة التحكم",
    finalCtaTrust: "بدون أي تعقيد. مجموعتك، مصحفك، وخطة واضحة.",

    badgeFree: "مجاني",
    badgeNoLogin: "بدون تسجيل دخول",
    badgeBilingual: "بالعربية والإنجليزية",
    badgeMultiDevice: "يعمل على الهاتف والكمبيوتر",
    previewTitle: "نظرة شاملة على الختمة كاملة",
    previewSubtitle:
      "يحصل كل عضو على ورد واضح ومحدد بدقة السورة والآية مع تدوير عادل ومدروس عبر الأسابيع.",
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
    groupTitleLabel: "عنوان الجدول (اختياري)",
    groupTitlePlaceholder: "مثال: ورد القرآن الأسبوعي",
    groupDescLabel: "وصف الجدول (اختياري)",
    groupDescPlaceholder: "مثال: ختمة جماعية للعائلة والأصدقاء",
    scheduleDatesTitle: "تاريخ بداية الجدول",
    noDateOption: "بدون تاريخ",
    setDateOption: "تحديد تاريخ البداية",
    startDatePickerLabel: "اختر تاريخ بداية الأسبوع الأول",
    datesBadge: "مؤرّخ",
    occasionTitle: "المناسبة",
    occasionNormal: "عادي",
    occasionRamadan: "رمضان",
    islamicYearLabel: "السنة الهجرية",
    ramadanBadge: "ختمة رمضان",
    dailyDivisionTitle: "التقسيم اليومي",
    noDailyDivision: "بدون تقسيم يومي",
    withDailyDivision: "تقسيم يومي (٧ أيام)",
    dailyDivisionDesc: "تقسيم ورد كل أسبوع بالتساوي على ٧ أيام بآيات دقيقة",
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
    viewDaily: "اليومي",
    viewModeGroup: "عرض المجموعة",
    viewModePersonal: "عرضي (جدولي)",
    selectYourName: "أنا: اختر اسمك",
    myScheduleTitle: "جدولي الخاص",
    returnToGroupView: "العودة لعرض المجموعة",
    dayUnit: "اليوم",
    globalDayUnit: "اليوم الإجمالي",
    todayLabel: "اليوم",
    dailyAyahRange: "ورد اليوم",
    dailyTotalAyahs: "عدد الآيات",
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
    exportMemberPng: "صورة جدولي (PNG)",
    exportMemberPdf: "ملف جدولي (PDF)",
    exportAllMembersZip: "جداول جميع الأعضاء (ZIP)",
    downloadAllMembersZip: "تحميل جداول الأعضاء (ZIP)",
    downloadAllMembersZipDesc:
      "تنزيل ملف مضغوط يحتوي على بطاقة جدول 4K مستقلة لكل عضو",
    downloadMySchedule: "تحميل جدولي",
    scanToOpenMySchedule: "امسح لفتح جدولي",
    personalQrCode: "رمز QR الخاص بجداول القراءة",
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
    packagingMembersZip: "جارٍ تجهيز وحزم بطاقات الأعضاء بدقة 4K...",

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
    pwaIosTab: "iPhone (iOS)",
    pwaAndroidTab: "Android",
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

    // Google Authentication Only
    authLoginTitle: "نظّم ورد القرآن بسهولة",
    authLoginSubtitle: "اجمع عائلتك أو مجموعتك وأنشئ جدول ورد واضحًا للجميع.",
    authContinueWithGoogle: "المتابعة باستخدام Google",
    authSecureGoogle: "تسجيل الدخول آمن عبر Google",
    authConnectingGoogle: "جاري الاتصال بـ Google...",
    authFailedTitle: "تعذر تسجيل الدخول",
    authCancelled: "تم إلغاء عملية تسجيل الدخول.",
    authFailedGeneric:
      "حدث خطأ أثناء الاتصال بخدمة Google. يرجى المحاولة مرة أخرى.",
    authTryAgain: "إعادة المحاولة",
    authSignIn: "تسجيل الدخول",
    authSignOut: "تسجيل الخروج",
    authBackToHome: "العودة للرئيسية",

    // Dashboard & Navigation
    navDashboard: "الرئيسية",
    navMyGroups: "جداولي",
    navSettings: "الإعدادات",
    navBookmarks: "العلامات المحفوظة",
    dashboardWelcome: "مرحباً، {name}",
    dashboardSubtitle: "تابع وردك اليومي وأدر مجموعاتك بكل سهولة",
    dashboardTodaysReading: "وردك اليوم",
    dashboardContinueReading: "تابع وردك",
    dashboardActiveGroups: "مجموعاتي النشطة",
    dashboardCompletedGroups: "مجموعات مكتملة",
    dashboardArchivedGroups: "مجموعات مؤرشفة",
    dashboardRecentSchedules: "جداول حديثة",
    dashboardQuickCreate: "إنشاء جدول جديد",
    dashboardNoActiveGroups: "لم تنشئ أي جدول نشط بعد.",
    dashboardNoTodaysReading: "لا يوجد ورد محدد لك اليوم.",
    dashboardReadNow: "اقرأ الآن",
    dashboardMarkComplete: "تم الإنجاز",
    dashboardCompleted: "مكتمل",
    dashboardGroupProgress: "تقدم المجموعة",
    dashboardSearchPlaceholder: "بحث في المجموعات والأعضاء...",

    // My Groups Filters & Actions
    tabAll: "الكل",
    tabActive: "نشطة",
    tabDrafts: "مسودات",
    tabCompleted: "مكتملة",
    tabArchived: "مؤرشفة",
    tabRamadan: "رمضان",
    actionOpen: "فتح",
    actionShare: "مشاركة",
    actionDownload: "تحميل",
    actionEdit: "تعديل",
    actionDuplicate: "نسخ",
    actionNewKhatmah: "بدء ختمة جديدة",
    actionArchive: "أرشفة",
    actionRestore: "استعادة",
    actionDelete: "حذف",
    confirmDelete:
      "هل أنت متأكد من حذف هذا الجدول؟ لا يمكن التراجع عن هذا الإجراء.",
    confirmArchive: "هل تريد أرشفة هذا الجدول؟ يمكنك استعادته في أي وقت.",

    // Quran Reader
    readerTitle: "المصحف الشريف",
    readerSurah: "سورة",
    readerAyah: "آية",
    readerJuz: "الجزء",
    readerPrevAyah: "الآية السابقة",
    readerNextAyah: "الآية التالية",
    readerPrevPortion: "المقطع السابق",
    readerNextPortion: "المقطع التالي",
    readerFontSize: "حجم الخط",
    readerBookmarkSaved: "تم حفظ العلامة المرجعية بنجاح",
    readerMarkAssignmentDone: "إتمام قراءة هذا المقطع",
    readerOpenReader: "فتح المصحف",

    // Bookmarks
    bookmarksTitle: "العلامات المحفوظة",
    bookmarksEmpty: "لا توجد علامات محفوظة بعد.",
    bookmarksJumpTo: "الانتقال للمصحف",

    // Member Invitations & Linking
    inviteMemberTitle: "دعوة عضو",
    inviteCopyLink: "نسخ الرابط",
    inviteWhatsApp: "مشاركة عبر واتساب",
    inviteQrCode: "رمز الاستجابة السريع QR",
    linkAccountTitle: "ربط بحسابي في Google",
    linkAccountSuccess: "تم ربط العضو بحسابك بنجاح",
    linkedAccountBadge: "مرتبط بحساب",
    anonymousMemberBadge: "عضو بدون حساب",

    // Announcements
    announcementsTitle: "إعلانات المجموعة",
    announcementsEmpty: "لا توجد إعلانات حالياً.",
    announcementCreate: "إنشاء إعلان جديد",
    announcementTitlePlaceholder: "عنوان الإعلان",
    announcementContentPlaceholder: "اكتب نص الإعلان هنا...",
    announcementPostBtn: "نشر الإعلان",

    // History & Lifecycle
    historyTitle: "سجل التعديلات",
    historyEmpty: "لا توجد تعديلات سابقة مسجلة.",
    khatmahSuccess: "تم إنشاء الختمة الجديدة بنجاح",

    // Settings & Notifications
    settingsTitle: "الإعدادات",
    settingsAccount: "الحساب",
    settingsAppearance: "المظهر",
    settingsLanguage: "اللغة",
    settingsReading: "تفضيلات القراءة",
    settingsNotifications: "الإشعارات",
    settingsData: "إدارة البيانات",
    notifDailyReminder: "تذكير الورد اليومي",
    notifReminderTime: "وقت التذكير",
    notifIncompleteReminder: "تذكير إذا لم أكمل وردي",
    notifWeeklySummary: "ملخص أسبوعي",
    notifGroupAlerts: "تنبيهات وإعلانات المجموعة",
    notifEnableBtn: "تفعيل الإشعارات",
    notifDisabled: "الإشعارات معطلة أو غير مدعومة في هذا المتصفح",
    exportDataBtn: "تصدير نسخة من بياناتي (JSON)",
    deleteAccountBtn: "حذف حسابي نهائياً",
    deleteAccountConfirm:
      "هل أنت متأكد تماماً من حذف حسابك؟ سيتم حذف جميع جداولك وبياناتك نهائياً.",
  },
  en: {
    appName: "Wirddy",
    tagline: "Organize your Quran reading together",
    heroEyebrow: "QURAN READING FOR GROUPS",
    heroSubtitle:
      "Create a balanced Quran schedule for your group, get your personal daily reading, read directly inside Wirddy, track your progress, and stay connected throughout the Khatmah.",
    heroCtaAccount: "Create your free account",
    heroCtaGuest: "Create a schedule without an account",
    heroCtaDashboard: "Dashboard",
    ctaCreateGroup: "Create a Group",
    ctaHowItWorks: "How It Works",
    ctaGetStarted: "Start organizing your group",

    navHowItWorks: "How It Works",
    navFeatures: "Features",
    navPreview: "Preview",
    navInstall: "Install App",
    navCreateAccount: "Sign In",

    howItWorksTitle: "How Wirddy Works",
    howItWorksSubtitle:
      "From creating your group to completing your reading, Wirddy keeps the entire Khatmah organized.",
    step1Title: "Create your group",
    step1Desc:
      "Add your family or group members, choose how much each person reads, and set their Quran knowledge range.",
    step2Title: "Build a balanced schedule",
    step2Desc:
      "Wirddy divides the Quran in order and rotates assignments across weeks while respecting each member's capacity.",
    step3Title: "Read your assigned portion",
    step3Desc:
      "Open Today's Reading from your dashboard and read the exact assigned Quran section directly inside Wirddy.",
    step4Title: "Track and complete together",
    step4Desc:
      "Mark portions complete, use bookmarks, receive reminders, follow group progress, and reach the Khatmah together.",

    dashboardShowcaseTitle: "Your Quran, organized in one place.",
    dashboardShowcaseSubtitle:
      "Your personal dashboard shows what you need to read today, where you stopped, your bookmarks, your groups, announcements, and your reading progress.",
    dashFeatTodayTitle: "Today's Reading",
    dashFeatTodayDesc:
      "See exactly what you need to read today with starting and ending Ayahs.",
    dashFeatContinueTitle: "Continue Reading",
    dashFeatContinueDesc:
      "Return directly to the exact Ayah and Surah where you left off.",
    dashFeatBookmarksTitle: "Bookmarks",
    dashFeatBookmarksDesc:
      "Save important Quran locations and return to them anytime.",
    dashFeatProgressTitle: "Group Progress",
    dashFeatProgressDesc:
      "See how your group is progressing through the Khatmah week by week.",
    dashFeatAnnounceTitle: "Announcements",
    dashFeatAnnounceDesc:
      "Stay updated with messages and guidance from your group organizer.",

    readerShowcaseTitle: "Read the Quran without leaving Wirddy.",
    readerShowcaseSubtitle:
      "Open your assigned portion directly in the Quran Reader. Navigate by Surah and Ayah, search the Quran, adjust text size, bookmark Ayahs, and continue exactly where you stopped.",
    readerFeatTextTitle: "Quran Reader",
    readerFeatTextDesc:
      "Read authentic Uthmani Quran script in an eye-friendly format.",
    readerFeatSearchTitle: "Full Quran Search",
    readerFeatSearchDesc:
      "Search Quranic words and jump directly to matching Ayahs instantaneously.",
    readerFeatBoundsTitle: "Exact Reading Boundaries",
    readerFeatBoundsDesc:
      "See precisely where your assigned portion starts and ends by Ayah and Surah.",
    readerFeatBookmarksTitle: "Quick Bookmarks",
    readerFeatBookmarksDesc:
      "Save Ayahs with personal notes for effortless retrieval.",
    readerFeatResumeTitle: "Instant Resume",
    readerFeatResumeDesc:
      "Resume reading from your exact last position without manual searching.",

    smartScheduleTitle: "A schedule built around your group.",
    smartScheduleSubtitle:
      "Wirddy does more than divide 30 Juz between people. It builds a balanced reading plan around your members, their reading amounts, and the parts of the Quran they know.",
    smartFeatRotationTitle: "Balanced Rotation",
    smartFeatRotationDesc:
      "Members rotate through different Quran sections across weeks without repetition.",
    smartFeatKnowledgeTitle: "Knowledge Ranges",
    smartFeatKnowledgeDesc:
      "Assign members only the Quran sections they know or are comfortable reading.",
    smartFeatAmountsTitle: "Flexible Reading Amounts",
    smartFeatAmountsDesc:
      "Give each member a personalized weekly reading allocation based on their capacity.",
    smartFeatCustomTitle: "Custom Quran Ranges",
    smartFeatCustomDesc:
      "Start and end schedules at specific Surahs and Ayahs when needed.",
    smartFeatRamadanTitle: "Ramadan Support",
    smartFeatRamadanDesc:
      "Create schedules specifically tailored for Ramadan with accurate Hijri calendars.",
    smartFeatDailyTitle: "Daily Division",
    smartFeatDailyDesc:
      "Break weekly portions into daily reading assignments from Saturday to Friday.",
    smartFeatRecurringTitle: "Recurring Schedules",
    smartFeatRecurringDesc:
      "Automatically continue repeating reading cycles seamlessly across weeks or months.",
    smartFeatHistoryTitle: "Version History",
    smartFeatHistoryDesc:
      "Review previous schedule versions and restore an earlier plan with one click.",

    stayOnTrackTitle: "Stay on track throughout the Khatmah.",
    stayOnTrackSubtitle:
      "Wirddy keeps your reading progress connected across your devices so you always know what is done and what remains.",
    trackFeatProgressTitle: "Reading Progress",
    trackFeatProgressDesc:
      "Mark each assigned daily or weekly portion as complete and watch your Khatmah grow.",
    trackFeatDailyTitle: "Daily Reminders",
    trackFeatDailyDesc:
      "Choose your preferred hour to be reminded of your daily reading.",
    trackFeatIncompleteTitle: "Incomplete Reading Reminders",
    trackFeatIncompleteDesc:
      "Receive timely reminders when today's reading is still unfinished.",
    trackFeatPushTitle: "Web Push Notifications",
    trackFeatPushDesc:
      "Receive reading reminders and group alerts directly on your device.",
    trackFeatRealtimeTitle: "Realtime Updates",
    trackFeatRealtimeDesc:
      "Group progress and announcements update across devices without refreshing.",
    trackFeatOfflineTitle: "Offline Support",
    trackFeatOfflineDesc:
      "Continue reading and record progress even when offline; syncs automatically once reconnected.",

    collabTitle: "Keep the whole group connected.",
    collabSubtitle:
      "Everyone can access their own reading portion while organizers keep the entire group organized.",
    collabFeatLinksTitle: "Personal Member Links",
    collabFeatLinksDesc:
      "Give every member a private schedule link displaying only their assigned portion.",
    collabFeatLinkAccountTitle: "Account Linking",
    collabFeatLinkAccountDesc:
      "Members can connect their personal schedule to their Google account for sync.",
    collabFeatAnnounceTitle: "Announcements",
    collabFeatAnnounceDesc:
      "Share important updates and reminders with the whole group easily.",
    collabFeatProgressTitle: "Group Progress",
    collabFeatProgressDesc:
      "Track overall Khatmah progress and member completion rates.",
    collabFeatQrTitle: "QR Sharing",
    collabFeatQrDesc:
      "Scan QR codes to open schedules instantly on any mobile device.",
    collabFeatWhatsappTitle: "WhatsApp Sharing",
    collabFeatWhatsappDesc:
      "Send member and group links directly through pre-formatted WhatsApp messages.",

    shareExportTitle: "Share your schedule anywhere.",
    shareExportSubtitle:
      "Give every member a clear schedule they can open, save, print, or share.",
    exportPngTitle: "PNG Images",
    exportPngDesc:
      "High-resolution schedule images tailored for messaging and social sharing.",
    exportPdfTitle: "PDF Documents",
    exportPdfDesc: "Clean printable A4 schedules ready for paper distribution.",
    exportZipTitle: "ZIP Packages",
    exportZipDesc:
      "Download complete bundles containing all weeks and member cards in one click.",
    exportLinksTitle: "Permanent Links",
    exportLinksDesc:
      "Open schedules from any device or browser without downloading files.",
    exportQrTitle: "QR Codes",
    exportQrDesc: "Share schedules instantly with quick camera scan codes.",
    exportWhatsappTitle: "WhatsApp",
    exportWhatsappDesc:
      "Share pre-formatted member assignment text directly via WhatsApp.",

    pwaTitle: "Use Wirddy like an app.",
    pwaSubtitle:
      "Install Wirddy on your phone for quick access to your reading schedule, Quran Reader, progress, bookmarks, and reminders.",
    pwaFeatHomeTitle: "Install on Home Screen",
    pwaFeatHomeDesc:
      "Open Wirddy like a native app without navigating through browser bars.",
    pwaFeatOfflineTitle: "Offline Reading",
    pwaFeatOfflineDesc:
      "Your schedule and Quran text remain accessible even without an internet connection.",
    pwaFeatPushTitle: "Push Notifications",
    pwaFeatPushDesc:
      "Receive daily reading reminders and group announcements directly on your screen.",

    whyChooseTitle: "Why groups choose Wirddy",
    whyChooseSubtitle:
      "Engineered to blend precise Quran scheduling with effortless daily reading and group motivation.",
    why1Title: "Balanced Quran Scheduling",
    why1Desc:
      "Fair rotation algorithm ensuring equal distribution and zero repetition across weeks.",
    why2Title: "Personalized Reading",
    why2Desc:
      "Each member sees their exact starting and ending Ayah tailored to their knowledge range.",
    why3Title: "Built-in Quran Reader",
    why3Desc:
      "Read authentic Uthmani Quran script directly within the app with instant full-text search.",
    why4Title: "Progress & Reminders",
    why4Desc:
      "Real-time progress logging, daily reminders, and web push notifications keep the Khatmah active.",
    why5Title: "Easy Multi-Format Sharing",
    why5Desc:
      "Export high-resolution PNGs, printable A4 PDFs, complete ZIPs, and permanent share links.",
    why6Title: "Arabic & English Bilinguality",
    why6Desc:
      "Complete bilingual support with natural RTL/LTR layouts and elegant dark/light themes.",

    accountBannerTitle: "Your groups. Your reading. One account.",
    accountBannerDesc:
      "Create a free account to keep your groups, reading progress, bookmarks, and preferences available across your devices.",
    accountBannerCta: "Create your free account",
    accountBannerSignIn: "Already have an account? Sign in",

    finalCtaTitle: "Start your next Khatmah with Wirddy.",
    finalCtaDesc:
      "Create your group, build a balanced Quran schedule, and give everyone a clear path from the first Juz to the last.",
    finalCtaPrimary: "Create your free account",
    finalCtaGuest: "Create a schedule without an account",
    finalCtaDashboard: "Open Dashboard",
    finalCtaTrust:
      "No complicated setup. Just your group, your Quran, and a clear plan.",

    badgeFree: "Free",
    badgeNoLogin: "No login",
    badgeBilingual: "Arabic + English",
    badgeMultiDevice: "Works on phone and desktop",

    previewTitle: "See your entire Khatmah at a glance.",
    previewSubtitle:
      "Every member gets a clear portion of the Quran, with exact starting and ending points and a balanced rotation across weeks.",
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
    groupTitleLabel: "Schedule Title (Optional)",
    groupTitlePlaceholder: "e.g., Weekly Quran Reading",
    groupDescLabel: "Description (Optional)",
    groupDescPlaceholder: "e.g., Group completion for family and friends",
    scheduleDatesTitle: "Schedule Start Date",
    noDateOption: "No Date",
    setDateOption: "Set Start Date",
    startDatePickerLabel: "Select start date for Week 1",
    datesBadge: "Dated",
    occasionTitle: "Occasion",
    occasionNormal: "Regular",
    occasionRamadan: "Ramadan",
    islamicYearLabel: "Islamic Year",
    ramadanBadge: "Ramadan Plan",
    dailyDivisionTitle: "Daily Division",
    noDailyDivision: "Weekly Only",
    withDailyDivision: "Daily Breakdown (7 Days)",
    dailyDivisionDesc:
      "Divide each week's portion equally across 7 days with exact Ayahs",
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
    viewDaily: "Daily",
    viewModeGroup: "Group View",
    viewModePersonal: "My Schedule",
    selectYourName: "I am: Select your name",
    myScheduleTitle: "My Personal Schedule",
    returnToGroupView: "Back to Group View",
    dayUnit: "Day",
    globalDayUnit: "Total Day",
    todayLabel: "Today",
    dailyAyahRange: "Daily Portion",
    dailyTotalAyahs: "Ayahs",
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
    exportMemberPng: "My schedule image (PNG)",
    exportMemberPdf: "My schedule (PDF)",
    exportAllMembersZip: "All members cards (ZIP)",
    downloadAllMembersZip: "Download All Members (ZIP)",
    downloadAllMembersZipDesc:
      "Download a ZIP containing an independent 4K schedule card for each member",
    downloadMySchedule: "Download My Schedule",
    scanToOpenMySchedule: "Scan to open my schedule",
    personalQrCode: "Personal Reading Schedule QR Code",
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
    packagingMembersZip: "Packaging all 4K member schedule cards...",

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

    // Google Authentication Only
    authLoginTitle: "Organize your Quran reading with ease",
    authLoginSubtitle:
      "Create a clear reading schedule for your family or group.",
    authContinueWithGoogle: "Continue with Google",
    authSecureGoogle: "Secure sign in with Google",
    authConnectingGoogle: "Connecting to Google...",
    authFailedTitle: "Authentication Failed",
    authCancelled: "Sign in was cancelled.",
    authFailedGeneric:
      "An error occurred while connecting to Google. Please try again.",
    authTryAgain: "Try Again",
    authSignIn: "Sign In",
    authSignOut: "Sign Out",
    authBackToHome: "Back to Home",

    // Dashboard & Navigation
    navDashboard: "Dashboard",
    navMyGroups: "My Groups",
    navSettings: "Settings",
    navBookmarks: "Bookmarks",
    dashboardWelcome: "Welcome back, {name}",
    dashboardSubtitle:
      "Track your daily reading and manage your groups with ease",
    dashboardTodaysReading: "Today's Reading",
    dashboardContinueReading: "Continue Reading",
    dashboardActiveGroups: "My Active Groups",
    dashboardCompletedGroups: "Completed Groups",
    dashboardArchivedGroups: "Archived Groups",
    dashboardRecentSchedules: "Recent Schedules",
    dashboardQuickCreate: "Create New Schedule",
    dashboardNoActiveGroups: "No active schedules found.",
    dashboardNoTodaysReading: "No reading assignment scheduled for today.",
    dashboardReadNow: "Read Now",
    dashboardMarkComplete: "Mark Complete",
    dashboardCompleted: "Completed",
    dashboardGroupProgress: "Group Progress",
    dashboardSearchPlaceholder: "Search groups and members...",

    // My Groups Filters & Actions
    tabAll: "All",
    tabActive: "Active",
    tabDrafts: "Drafts",
    tabCompleted: "Completed",
    tabArchived: "Archived",
    tabRamadan: "Ramadan",
    actionOpen: "Open",
    actionShare: "Share",
    actionDownload: "Download",
    actionEdit: "Edit",
    actionDuplicate: "Duplicate",
    actionNewKhatmah: "Start New Khatmah",
    actionArchive: "Archive",
    actionRestore: "Restore",
    actionDelete: "Delete",
    confirmDelete:
      "Are you sure you want to delete this schedule? This action cannot be undone.",
    confirmArchive:
      "Are you sure you want to archive this schedule? You can restore it anytime.",

    // Quran Reader
    readerTitle: "Holy Quran",
    readerSurah: "Surah",
    readerAyah: "Ayah",
    readerJuz: "Juz",
    readerPrevAyah: "Previous Ayah",
    readerNextAyah: "Next Ayah",
    readerPrevPortion: "Previous Portion",
    readerNextPortion: "Next Portion",
    readerFontSize: "Font Size",
    readerBookmarkSaved: "Bookmark saved successfully",
    readerMarkAssignmentDone: "Complete this portion",
    readerOpenReader: "Open Quran",

    // Bookmarks
    bookmarksTitle: "Bookmarks",
    bookmarksEmpty: "No bookmarks saved yet.",
    bookmarksJumpTo: "Open in Quran",

    // Member Invitations & Linking
    inviteMemberTitle: "Invite Member",
    inviteCopyLink: "Copy Link",
    inviteWhatsApp: "Share via WhatsApp",
    inviteQrCode: "QR Code",
    linkAccountTitle: "Connect Google Account",
    linkAccountSuccess: "Successfully connected member to your account",
    linkedAccountBadge: "Account linked",
    anonymousMemberBadge: "Guest member",

    // Announcements
    announcementsTitle: "Group Announcements",
    announcementsEmpty: "No announcements at this time.",
    announcementCreate: "Post Announcement",
    announcementTitlePlaceholder: "Announcement Title",
    announcementContentPlaceholder: "Write announcement content here...",
    announcementPostBtn: "Post",

    // History & Lifecycle
    historyTitle: "Version History",
    historyEmpty: "No revision history recorded yet.",
    khatmahSuccess: "New Khatmah created successfully",

    // Settings & Notifications
    settingsTitle: "Settings",
    settingsAccount: "Account",
    settingsAppearance: "Appearance",
    settingsLanguage: "Language",
    settingsReading: "Reading Preferences",
    settingsNotifications: "Notifications",
    settingsData: "Data Management",
    notifDailyReminder: "Daily Reading Reminder",
    notifReminderTime: "Reminder Time",
    notifIncompleteReminder: "Reminder if reading incomplete",
    notifWeeklySummary: "Weekly Summary",
    notifGroupAlerts: "Group Alerts & Announcements",
    notifEnableBtn: "Enable Notifications",
    notifDisabled: "Notifications disabled or not supported in this browser",
    exportDataBtn: "Export My Data (JSON)",
    deleteAccountBtn: "Delete My Account",
    deleteAccountConfirm:
      "Are you absolutely sure you want to delete your account? All your schedules and data will be permanently removed.",
  },
}
