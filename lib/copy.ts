export type Locale = 'en' | 'ar'

export const MENU_CATEGORIES = ['All', 'Espresso', 'Iced', 'Dirty', 'Matcha', 'Filter', 'Bakery'] as const
export type MenuCategory = (typeof MENU_CATEGORIES)[number]

const en = {
  localeName: 'English',
  switchTo: 'عربي',
  switchAria: 'Switch language',
  home: 'Home',
  homeAria: '20 Grams — home',
  nav: {
    menu: 'Menu',
    branches: 'Branches',
    story: 'Story',
    gallery: 'Gallery',
  },
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  closeShort: 'Close',
  skipIntro: 'Skip intro',
  primaryNav: 'Primary navigation',
  mobileNav: 'Mobile navigation',
  introLabel: '20 Grams intro',

  heroMeta: '(01) 20GR® / BARISTA CRAFTED COFFEE',
  tagline: 'Twenty grams. Zero compromise.',
  intro: 'Specialty coffee, calibrated for the everyday ritual.',
  explore: 'Explore the menu',
  find: 'Find a branch',
  coords: '30° 00′ 42.0″ N\n31° 25′ 18.0″ E',
  marquee: ['Specialty coffee', '20 grams', 'Barista crafted'],

  doseLabel: 'The Dose',
  doseTitle: ['The Dose', 'is the', 'Difference'],
  storyText:
    'Every cup starts with twenty grams. A measured dose, a deliberate extraction, and nothing left to chance. We make specialty coffee feel precise, immediate, and yours.',
  facts: ['Barista crafted', 'Specialty beans', 'Since 2002'],
  doseNumber: '20',
  doseUnit: 'g',

  dirtyLabel: 'The Dirty Collection',
  dirtyTitle: ['Dirty', 'by design.'],
  dirtyText: 'Three signatures. One unmistakable 20g twist.',
  fullMenu: 'See full menu',

  teaserLabel: 'The menu, edited',
  teaserTitle: ['A short', 'list of', 'good ideas.'],

  tvLabel: '(02) 20GR® / LIVE SIGNAL',
  tvTitle: ['New drinks', 'just dropped'],
  tvFooter: 'Transmission 020 / 20 Grams',
  tvStatus: 'On air',

  branchesLabel: 'Branches',
  branchesTitle: 'Find your dose',
  branchesIntro: 'Six spots across Cairo and the coast.\nSame dose, different light.',
  newBadge: 'New',
  directions: 'Directions',

  galleryLabel: 'Gallery',
  galleryCaptions: ['Leven Square, Cairo', 'Barista crafted, every cup', 'Dirty, by design'],
  alts: {
    brand: '20 Grams wordmark',
    storefront: 'The 20 Grams storefront at Leven Square, Cairo',
    dirty: 'Three 20 Grams dirty drinks with ice, matcha and chocolate',
    pours: 'Barista brewing a pour-over coffee at 20 Grams',
    latte: 'Flat white with latte art in a ceramic cup',
    matcha: 'Iced matcha latte with a leaf pattern',
    croissant: 'Fresh butter croissant dusted with sugar',
    iced: 'Iced latte with milk swirling through espresso',
    americano: 'Iced americano in a glass jar',
    gallery: [
      '20 Grams storefront at Leven Square, Cairo',
      'Barista brewing a pour-over coffee',
      'Close-up of 20 Grams dirty drinks',
    ],
  },

  footerExplore: 'Explore',
  footerConnect: 'Connect',
  order: 'Order online',
  copyright: '© 20GR® — SPECIALTY COFFEE — 2002',
  location: 'CAIRO / EGYPT',

  menuMeta: '(01) / 20GR® MENU',
  menuTitle: ['The', 'Menu'],
  menuIntro: 'A focused list of coffee, signatures and things worth slowing down for.',
  backHome: 'Back home',
  searchPlaceholder: 'Search the menu',
  searchAria: 'Search the menu',
  itemsLabel: 'Items',
  emptyTitle: 'Nothing on this shelf.',
  emptyText: 'Try another search or browse the full menu.',
  resetFilters: 'Reset filters',
  endTitle: ['Find your', 'branch'],
  seeMenu: 'See the full menu',

  categoryLabels: {
    All: 'All',
    Espresso: 'Espresso',
    Iced: 'Iced',
    Dirty: 'Dirty',
    Matcha: 'Matcha',
    Filter: 'Filter',
    Bakery: 'Bakery',
  } as Record<MenuCategory, string>,
  tagLabels: {
    Iced: 'Iced',
    Caffeine: 'Caffeine',
    Hot: 'Hot',
    'Vegan-friendly': 'Vegan-friendly',
  } as Record<string, string>,
  currency: 'EGP',
  pricePattern: (amount: string) => `${amount} EGP`,
}

const ar: typeof en = {
  localeName: 'العربية',
  switchTo: 'EN',
  switchAria: 'تغيير اللغة',
  home: 'الرئيسية',
  homeAria: '٢٠ جرام — الرئيسية',
  nav: {
    menu: 'القائمة',
    branches: 'الفروع',
    story: 'قصتنا',
    gallery: 'المعرض',
  },
  openMenu: 'فتح القائمة',
  closeMenu: 'إغلاق القائمة',
  closeShort: 'إغلاق',
  skipIntro: 'تخطي المقدمة',
  primaryNav: 'التنقل الرئيسي',
  mobileNav: 'تنقل الجوال',
  introLabel: 'مقدمة ٢٠ جرام',

  heroMeta: '(01) 20GR® / قهوة مختصة على يد باريستا',
  tagline: 'عشرون جرامًا. بلا تنازل.',
  intro: 'قهوة مختصة، مضبوطة على إيقاع يومك.',
  explore: 'استكشف القائمة',
  find: 'اعثر على فرعك',
  coords: '30° 00′ 42.0″ N\n31° 25′ 18.0″ E',
  marquee: ['قهوة مختصة', '٢٠ جرامًا', 'تحضير باريستا'],

  doseLabel: 'الجرعة',
  doseTitle: ['الجرعة', 'هي', 'الفرق'],
  storyText:
    'كل كوب يبدأ بعشرين جرامًا. جرعة محسوبة، واستخلاص مقصود، ولا شيء متروك للصدفة. نصنع القهوة المختصة بدقة وبساطة، وبطريقتك.',
  facts: ['تحضير على يد باريستا', 'حبوب قهوة مختصة', 'منذ ٢٠٠٢'],
  doseNumber: '٢٠',
  doseUnit: 'جم',

  dirtyLabel: 'مجموعة ديرتي',
  dirtyTitle: ['ديرتي', 'عن قصد.'],
  dirtyText: 'ثلاث توقيعات. وبصمة ٢٠ جرامًا لا تُخطئها.',
  fullMenu: 'شاهد القائمة كاملة',

  teaserLabel: 'القائمة، باختصار',
  teaserTitle: ['قائمة', 'قصيرة', 'بأفكار جيدة.'],

  tvLabel: '(02) 20GR® / بث مباشر',
  tvTitle: ['مشروبات جديدة', 'نزلت للتو'],
  tvFooter: 'بث 020 / ٢٠ جرامًا',
  tvStatus: 'على الهواء',

  branchesLabel: 'الفروع',
  branchesTitle: 'اعثر على جرعتك',
  branchesIntro: 'ستة فروع في القاهرة والساحل.\nنفس الجرعة، وإضاءة مختلفة.',
  newBadge: 'جديد',
  directions: 'الاتجاهات',

  galleryLabel: 'المعرض',
  galleryCaptions: ['ليفن سكوير، القاهرة', 'تحضير باريستا لكل كوب', 'ديرتي، عن قصد'],
  alts: {
    brand: 'شعار ٢٠ جرام',
    storefront: 'واجهة فرع ٢٠ جرام في ليفن سكوير، القاهرة',
    dirty: 'ثلاثة مشروبات ديرتي من ٢٠ جرام مع الثلج والماتشا والشوكولاتة',
    pours: 'باريستا يحضّر قهوة فلتر في ٢٠ جرام',
    latte: 'فلات وايت مع رسم لاتيه في فنجان سيراميك',
    matcha: 'ماتشا لاتيه مثلجة مع رسم ورقة',
    croissant: 'كرواسون زبدة طازج مرشوش بالسكر',
    iced: 'لاتيه مثلج والحليب يختلط بالإسبريسو',
    americano: 'أمريكانو مثلج في برطمان زجاجي',
    gallery: [
      'واجهة فرع ٢٠ جرام في ليفن سكوير، القاهرة',
      'باريستا يحضّر قهوة فلتر',
      'لقطة قريبة لمشروبات ديرتي من ٢٠ جرام',
    ],
  },

  footerExplore: 'استكشف',
  footerConnect: 'تواصل',
  order: 'اطلب عبر الإنترنت',
  copyright: '© 20GR® — قهوة مختصة — ٢٠٠٢',
  location: 'القاهرة / مصر',

  menuMeta: '(01) / قائمة 20GR®',
  menuTitle: ['القائمة'],
  menuIntro: 'قائمة مركزة من القهوة والمشروبات المميزة وكل ما يستحق لحظة هدوء.',
  backHome: 'العودة للرئيسية',
  searchPlaceholder: 'ابحث في القائمة',
  searchAria: 'ابحث في القائمة',
  itemsLabel: 'منتج',
  emptyTitle: 'لا شيء على هذا الرف.',
  emptyText: 'جرّب بحثًا آخر أو تصفّح القائمة كاملة.',
  resetFilters: 'إعادة ضبط البحث',
  endTitle: ['اعثر على', 'فرعك'],
  seeMenu: 'شاهد القائمة كاملة',

  categoryLabels: {
    All: 'الكل',
    Espresso: 'إسبريسو',
    Iced: 'مثلج',
    Dirty: 'ديرتي',
    Matcha: 'ماتشا',
    Filter: 'فلتر',
    Bakery: 'مخبوزات',
  },
  tagLabels: {
    Iced: 'مثلج',
    Caffeine: 'كافيين',
    Hot: 'ساخن',
    'Vegan-friendly': 'نباتي',
  },
  currency: 'ج.م',
  pricePattern: (amount: string) => `${amount} ج.م`,
}

export const copy: Record<Locale, typeof en> = { en, ar }
export type Copy = typeof en

export const isRtl = (locale: Locale) => locale === 'ar'
