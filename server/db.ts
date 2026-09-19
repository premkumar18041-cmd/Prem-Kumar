import crypto from 'crypto';
import type { 
  User, 
  Product, 
  Category, 
  Cart, 
  Order, 
  Coupon, 
  Review, 
  AuditLog, 
  AnalyticsEvent, 
  ShippingMethod 
} from '../src/types.js';

// Real authentic categories from accessories.lt
export const initialCategories: Category[] = [
  {
    id: 'cat-jewelry',
    name: 'Jewelry',
    nameLt: 'Papuošalai',
    slug: 'jewelry',
    description: 'Delicate earrings, bangles, necklaces and rings crafted for everyday shine and memorable occasions.',
    image: 'https://accessories.lt/wp-content/uploads/2026/09/pic-38.jpg',
    productCount: 6
  },
  {
    id: 'cat-bags',
    name: 'Bags & Totes',
    nameLt: 'Rankinės ir Krepšiai',
    slug: 'bags',
    description: 'Modern structured totes, crossbody bags, and everyday carry essentials for office and weekend.',
    image: 'https://accessories.lt/wp-content/uploads/2026/09/cover-11.jpg',
    productCount: 4
  },
  {
    id: 'cat-wallets',
    name: 'Wallets & Belts',
    nameLt: 'Piniginės ir Diržai',
    slug: 'wallets-belts',
    description: 'Sleek zip wallets, cardholders and fine leather accessories for effortless organization.',
    image: 'https://accessories.lt/wp-content/uploads/2026/09/pic-28.jpg',
    productCount: 2
  },
  {
    id: 'cat-sunglasses',
    name: 'Sunglasses & Accs',
    nameLt: 'Akiniai nuo Saulės',
    slug: 'sunglasses-accessories',
    description: 'UV400 protective sunglasses and hair accessories to complete your look in any season.',
    image: 'https://accessories.lt/wp-content/uploads/2026/09/pic-2.jpg',
    productCount: 2
  }
];

// Real authentic products from accessories.lt
export const initialProducts: Product[] = [
  {
    id: 'prod-1870',
    name: 'Kashmiri Bangles for Women (16 Pcs Set)',
    nameLt: 'Tradicinės Kašmyro Stiklo Apyrankės (16 vnt.)',
    slug: 'kashmiri-bangles-for-women',
    sku: 'IVR-JWL-1870',
    description: 'Traditional Kashmiri Ghangharoo glass bangle set featuring vibrant red colour with golden accents, bell-shaped embellishments and delicate jingling bells. Handcrafted from premium lightweight glass for comfortable all-day festive wear.',
    descriptionLt: 'Elegantiškos tradicinio stiliaus stiklinės apyrankės su aukso detalėmis ir dekoratyviniais varpeliais. Lengvos, patogios dėvėti visą dieną švenčių ar vestuvių proga.',
    shortDescription: '16 Pcs set with Ghungroo bells & golden accents in radiant festive tones.',
    price: 39.00,
    salePrice: 19.90,
    currency: 'EUR',
    categoryId: 'cat-jewelry',
    categorySlug: 'jewelry',
    categoryName: 'Jewelry',
    images: [
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-12-230611.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-12-230717.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-12-230701.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-12-230647.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-12-230632.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-12-230611-1.png'
    ],
    attributes: {
      material: 'High-grade artisan glass & gold finish alloy',
      dimensions: 'Length 19.5cm, Thickness 2mm',
      weight: '30g',
      origin: 'Kashmiri Artisan Workshop',
      style: 'Festive & Contemporary Ethnic',
      colors: ['Red & Gold Accent', 'Multicolour Light']
    },
    variants: [
      {
        id: 'var-1870-std',
        sku: 'IVR-JWL-1870-STD',
        name: 'Standard Fit (19.5cm)',
        attributes: { size: 'Standard (19.5 cm)' },
        price: 19.90,
        stock: 35
      }
    ],
    stock: 35,
    rating: 4.9,
    reviewCount: 18,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    seoTitle: 'Kashmiri Bangles Set for Women | IVER Accessories',
    seoDescription: 'Handmade Kashmiri glass bangles with Ghungroo bells and golden accents. Shop authentic festive jewelry online at Accessories.lt.',
    createdAt: '2026-09-12T23:06:00Z',
    updatedAt: '2026-09-19T00:00:00Z'
  },
  {
    id: 'prod-1863',
    name: 'Sculpted Shine Dangle Drop Earrings',
    nameLt: 'Skulptūriški Lašo Formos Auskarai su Blizgesiu',
    slug: 'sculpted-shine-earrings-2',
    sku: 'IVR-JWL-1863',
    description: 'Gracefully curved contemporary statement drop earrings with high-polish gold luster. Engineered with ergonomic posts for feather-light wear that elevates simple daytime blouses and evening slip dresses alike.',
    descriptionLt: 'Grakščiai lenkti šiuolaikiški kabantys auskarai su poliruota aukso danga. Lengvi ir patogūs dėvėti nuo ryto iki vakaro.',
    shortDescription: 'Contemporary light-catching drop design in warm gold tone.',
    price: 29.00,
    salePrice: 14.50,
    currency: 'EUR',
    categoryId: 'cat-jewelry',
    categorySlug: 'jewelry',
    categoryName: 'Jewelry',
    images: [
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-12-225558.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-12-225658.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-12-225647.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-12-225634.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-12-225618.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-12-225558-1.png'
    ],
    attributes: {
      material: '18k Gold Plated Brass & Hypoallergenic Post',
      dimensions: '42mm x 18mm',
      weight: '12g pair',
      style: 'Modern Architectural Drop',
      colors: ['Polished Gold']
    },
    variants: [
      {
        id: 'var-1863-gold',
        sku: 'IVR-JWL-1863-GLD',
        name: 'Polished Gold',
        attributes: { color: 'Gold' },
        price: 14.50,
        stock: 42
      }
    ],
    stock: 42,
    rating: 4.8,
    reviewCount: 24,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    seoTitle: 'Sculpted Shine Drop Earrings | Accessories.lt',
    seoDescription: 'High-polish gold statement earrings designed for effortless modern elegance. Fast EU delivery from Accessories.lt.',
    createdAt: '2026-09-12T22:55:00Z',
    updatedAt: '2026-09-19T00:00:00Z'
  },
  {
    id: 'prod-1857',
    name: 'Artisan Curved Minimalist Studs & Hoops',
    nameLt: 'Minimalistiniai Rievėti Auskarai ir Žiedai',
    slug: 'womens-trending-earings',
    sku: 'IVR-JWL-1857',
    description: 'Clean, sculptural everyday stud and mini hoop silhouette with an organically brushed tactile finish. Pairs seamlessly with tailored jackets, cashmere knits, and clean tees.',
    descriptionLt: 'Švelniai banguoto reljefo minimalistiniai auskarai kasdienai. Hipoalerginis metalas su ilgalaikiu spindesiu.',
    shortDescription: 'Everyday understated luxury with organic brushed contours.',
    price: 24.00,
    salePrice: 11.90,
    currency: 'EUR',
    categoryId: 'cat-jewelry',
    categorySlug: 'jewelry',
    categoryName: 'Jewelry',
    images: [
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-12-224539.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-12-224613.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-12-224558.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-12-224539-1.png'
    ],
    attributes: {
      material: 'Stainless Steel with 14k PVD Gold Coating',
      dimensions: '22mm x 15mm',
      weight: '8g',
      style: 'Nordic Minimalist Everyday',
      colors: ['Warm Gold']
    },
    variants: [
      {
        id: 'var-1857-gld',
        sku: 'IVR-JWL-1857-GLD',
        name: 'Warm Gold',
        attributes: { color: 'Warm Gold' },
        price: 11.90,
        stock: 50
      }
    ],
    stock: 50,
    rating: 4.7,
    reviewCount: 15,
    isFeatured: true,
    isNewArrival: true,
    seoTitle: 'Minimalist Curved Gold Earrings | IVER Accessories',
    seoDescription: 'Water-resistant, hypoallergenic gold studs and hoops for timeless everyday wear.',
    createdAt: '2026-09-12T22:45:00Z',
    updatedAt: '2026-09-19T00:00:00Z'
  },
  {
    id: 'prod-62',
    name: 'Dakota Solid Structured Work Tote (Fits 16" Laptop)',
    nameLt: 'Dakota Struktūruota Darbo Rankinė (iki 16" Nešiojamam Kompiuteriui)',
    slug: 'miraggio-dakota-solid-structured-tote-bag-for-women-for-office-use-work-fits-upto-16-laptop-stylish-handbag-for-women',
    sku: 'IVR-BAG-0062',
    description: 'An executive structured tote tailored for modern work life. Comfortably accommodates laptops up to 16", notebooks, tablet, charger and water bottle. Features reinforced dual handles, a detachable padded shoulder strap, gold hardware, and multi-tier organizer pockets.',
    descriptionLt: 'Stilinga ir talpi struktūruota rankinė darbui bei verslui. Telpa iki 16 colių kompiuteris, dokumentai ir asmeniniai daiktai. Turi patikimus užtrauktukus bei nuimamą diržą.',
    shortDescription: 'Dedicated padded 16" laptop sleeve & multi-pocket organization.',
    price: 89.00,
    salePrice: 59.90,
    currency: 'EUR',
    categoryId: 'cat-bags',
    categorySlug: 'bags',
    categoryName: 'Bags & Totes',
    images: [
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-01-145038.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-01-145203.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-01-145146.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-01-145135.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-01-145125.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-01-145117-1.png'
    ],
    attributes: {
      material: 'Saffiano Microfiber Vegan Leather & Water-Repellent Twill Lining',
      dimensions: '40cm W x 30cm H x 14cm D',
      weight: '680g',
      origin: 'Crafted with premium European hardware',
      style: 'Executive Office & Daily Commute',
      colors: ['Noir Black', 'Toffee Tan', 'Slate Grey']
    },
    variants: [
      {
        id: 'var-62-blk',
        sku: 'IVR-BAG-0062-BLK',
        name: 'Noir Black',
        attributes: { color: 'Noir Black' },
        price: 59.90,
        stock: 18
      },
      {
        id: 'var-62-tan',
        sku: 'IVR-BAG-0062-TAN',
        name: 'Toffee Tan',
        attributes: { color: 'Toffee Tan' },
        price: 59.90,
        stock: 14
      }
    ],
    stock: 32,
    rating: 5.0,
    reviewCount: 31,
    isFeatured: true,
    isBestSeller: true,
    seoTitle: 'Dakota Structured 16" Laptop Tote Bag | IVER Accessories',
    seoDescription: 'The ultimate professional handbag designed for work and travel. Durable, organized, and fits 16-inch laptops.',
    createdAt: '2026-09-01T14:50:00Z',
    updatedAt: '2026-09-19T00:00:00Z'
  },
  {
    id: 'prod-51',
    name: 'Curated 12-Pairs Earrings Capsule with Display Case',
    nameLt: '12 Porų Auskarų Rinkinys su Stilinga Dėžute',
    slug: 'womens-earings-pack-of-12',
    sku: 'IVR-JWL-0051',
    description: 'A complete jewelry wardrobe in one luxury presentation case. Contains 12 distinct hypoallergenic pairs spanning freshwater pearl studs, geometric micro-hoops, cubic zirconia solitaires, and twisted hoops. Ideal gift for birthdays, anniversaries, and personal styling.',
    descriptionLt: '12 porų stilingų auskarų rinkinys gražioje organizatoriaus dėžutėje. Ideali dovana sau ar artimam žmogui.',
    shortDescription: '12 unique styling pairs with velvet-lined keepsake presentation box.',
    price: 45.00,
    salePrice: 24.90,
    currency: 'EUR',
    categoryId: 'cat-jewelry',
    categorySlug: 'jewelry',
    categoryName: 'Jewelry',
    images: [
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-01-102845.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-01-102857.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-01-102910.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-01-102922.png',
      'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-01-102937.png'
    ],
    attributes: {
      material: 'Surgical Steel Posts, Cubic Zirconia, Eco-Brass',
      dimensions: 'Case: 20cm x 15cm x 4cm',
      weight: '160g total',
      sizes: ['Capsule Box Standard']
    },
    variants: [
      {
        id: 'var-51-box',
        sku: 'IVR-JWL-0051-BOX',
        name: 'Gift Box Collection',
        attributes: { option: '12 Pairs + Case' },
        price: 24.90,
        stock: 28
      }
    ],
    stock: 28,
    rating: 4.9,
    reviewCount: 40,
    isFeatured: true,
    isBestSeller: true,
    seoTitle: '12-Pairs Earrings Capsule Set | Accessories.lt',
    seoDescription: '12 pairs of versatile earrings with complimentary jewelry case. Safe for sensitive ears. Order online at Accessories.lt.',
    createdAt: '2026-09-01T10:28:00Z',
    updatedAt: '2026-09-19T00:00:00Z'
  },
  {
    id: 'prod-21',
    name: 'Essential Slim Zip Wallet & RFID Cardholder',
    nameLt: 'Essential Kompaktiška Užtraukiama Piniginė su RFID',
    slug: 'essential-zip-wallet',
    sku: 'IVR-WLT-0021',
    description: 'Keep your daily payment essentials safe and organized in this sleek zip-around wallet. Engineered with 8 dedicated card slots, a central zippered coin compartment, full-length bill fold, and built-in RFID shielding protection.',
    descriptionLt: 'Kompaktiška, bet talpi piniginė su užtrauktuku ir RFID apsauga nuo bekontakčio nuskaitymo. 8 kortelių skyreliai ir kišenėlė monetoms.',
    shortDescription: '8 card slots, coin compartment & certified RFID blocking tech.',
    price: 35.00,
    salePrice: 29.00,
    currency: 'EUR',
    categoryId: 'cat-wallets',
    categorySlug: 'wallets-belts',
    categoryName: 'Wallets & Belts',
    images: [
      'https://accessories.lt/wp-content/uploads/2026/09/pic-28.jpg',
      'https://accessories.lt/wp-content/uploads/2026/09/pic-38.jpg'
    ],
    attributes: {
      material: 'Top-Grain Italian Vegan Leather & Smooth Brass Hardware',
      dimensions: '14cm x 9.5cm x 2cm',
      weight: '110g',
      colors: ['Midnight Black', 'Caramel Tan']
    },
    variants: [
      {
        id: 'var-21-blk',
        sku: 'IVR-WLT-0021-BLK',
        name: 'Midnight Black',
        attributes: { color: 'Black' },
        price: 29.00,
        stock: 25
      },
      {
        id: 'var-21-tan',
        sku: 'IVR-WLT-0021-TAN',
        name: 'Caramel Tan',
        attributes: { color: 'Tan' },
        price: 29.00,
        stock: 20
      }
    ],
    stock: 45,
    rating: 4.8,
    reviewCount: 19,
    isFeatured: false,
    isBestSeller: true,
    seoTitle: 'Essential Slim Zip Wallet with RFID | IVER Accessories',
    seoDescription: 'Compact zip wallet featuring RFID blocking and 8 card slots. Designed for effortless everyday carry at Accessories.lt.',
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-09-19T00:00:00Z'
  },
  {
    id: 'prod-17',
    name: 'City Compact Crossbody Shoulder Bag',
    nameLt: 'City Kompaktiška Universali Rankinė per Petį',
    slug: 'city-crossbody-bag',
    sku: 'IVR-BAG-0017',
    description: 'Compact yet wonderfully practical, this crossbody bag keeps your smartphone, cards, cosmetics, and keys close at hand while leaving your hands completely free. Comes with an interchangeable webbed strap and tonal slim leather strap.',
    descriptionLt: 'Universali ir patogi rankinė per petį. Lengvai talpina telefoną, piniginę ir būtiniausius daiktus. Du keičiami dirželiai.',
    shortDescription: 'Hands-free convenience with dual interchangeable strap styling.',
    price: 49.00,
    salePrice: 36.00,
    currency: 'EUR',
    categoryId: 'cat-bags',
    categorySlug: 'bags',
    categoryName: 'Bags & Totes',
    images: [
      'https://accessories.lt/wp-content/uploads/2026/09/pic-2.jpg',
      'https://accessories.lt/wp-content/uploads/2026/09/home1-2.jpg'
    ],
    attributes: {
      material: 'Water-Resistant Smooth Pebble Grain Leather',
      dimensions: '22cm x 15cm x 7cm',
      weight: '340g',
      colors: ['Ivory Cream', 'Warm Espresso']
    },
    variants: [
      {
        id: 'var-17-crm',
        sku: 'IVR-BAG-0017-CRM',
        name: 'Ivory Cream',
        attributes: { color: 'Ivory Cream' },
        price: 36.00,
        stock: 19
      }
    ],
    stock: 19,
    rating: 4.9,
    reviewCount: 22,
    isFeatured: true,
    isBestSeller: true,
    seoTitle: 'City Compact Crossbody Bag | Accessories.lt',
    seoDescription: 'Chic everyday crossbody bag with secure zippers and modular straps. Order online from Accessories.lt.',
    createdAt: '2026-08-18T10:00:00Z',
    updatedAt: '2026-09-19T00:00:00Z'
  },
  {
    id: 'prod-15',
    name: 'Layered Light Dual-Strand Gold Necklace',
    nameLt: 'Dvigubos Grandinėlės Paauksuotas Vėrinys',
    slug: 'layered-light-necklace',
    sku: 'IVR-JWL-0015',
    description: 'Add a refined architectural accent to your décolletage with this dual-strand layered chain necklace. Features a delicate satellite bead chain paired with a sleek flat herringbone strand, unified by an anti-tangle single clasp.',
    descriptionLt: 'Subtilus dviejų sluoksnių vėrinys, suteikiantis aprangai išskirtinio lengvumo. Nesipainiojantis užsegimas su reguliuojamu ilgiu.',
    shortDescription: 'Dual-strand herringbone & satellite chain with anti-tangle clasp.',
    price: 32.00,
    salePrice: 24.00,
    currency: 'EUR',
    categoryId: 'cat-jewelry',
    categorySlug: 'jewelry',
    categoryName: 'Jewelry',
    images: [
      'https://accessories.lt/wp-content/uploads/2026/09/pic-1.jpg',
      'https://accessories.lt/wp-content/uploads/2026/09/image-1.jpg'
    ],
    attributes: {
      material: '18k Gold Vermeil over 316L Stainless Steel (Tarnish-Proof)',
      dimensions: 'Inner 40cm, Outer 46cm + 5cm extender',
      weight: '9g',
      colors: ['Gold']
    },
    variants: [
      {
        id: 'var-15-gld',
        sku: 'IVR-JWL-0015-GLD',
        name: '18k Gold Vermeil',
        attributes: { finish: '18k Gold' },
        price: 24.00,
        stock: 33
      }
    ],
    stock: 33,
    rating: 4.8,
    reviewCount: 17,
    isFeatured: false,
    isNewArrival: false,
    seoTitle: 'Layered Light Gold Necklace | IVER Accessories',
    seoDescription: 'Water-resistant, non-tarnish dual strand chain necklace. Shipped safely across Lithuania and Europe from Accessories.lt.',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-19T00:00:00Z'
  },
  {
    id: 'prod-13',
    name: 'Everyday Carry Reinforced Canvas & Leather Tote',
    nameLt: 'Everyday Carry Drobės ir Odos Pirkinių Krepšys',
    slug: 'everyday-carry-tote',
    sku: 'IVR-BAG-0013',
    description: 'A versatile heavy-duty 16oz cotton canvas tote fortified with vegetable-tanned leather handles and brass rivets. Roomy interior fits gym kit, market produce, or daily study essentials with a key lanyard and zippered security pocket.',
    descriptionLt: 'Tvirtos drobės ir natūralių odinių rankenų krepšys kasdienai. Talpus, ekologiškas ir ilgaamžis pasirinkimas.',
    shortDescription: '16oz heavy cotton canvas with riveted leather grab handles.',
    price: 58.00,
    salePrice: 48.00,
    currency: 'EUR',
    categoryId: 'cat-bags',
    categorySlug: 'bags',
    categoryName: 'Bags & Totes',
    images: [
      'https://accessories.lt/wp-content/uploads/2026/09/cover-11.jpg',
      'https://accessories.lt/wp-content/uploads/2026/09/image-5.jpg'
    ],
    attributes: {
      material: '16oz Organic Heavy Canvas & Italian Saddle Leather',
      dimensions: '38cm x 36cm x 12cm',
      weight: '490g',
      colors: ['Natural Sand & Cognac']
    },
    variants: [
      {
        id: 'var-13-nat',
        sku: 'IVR-BAG-0013-NAT',
        name: 'Sand / Cognac',
        attributes: { color: 'Sand / Cognac' },
        price: 48.00,
        stock: 22
      }
    ],
    stock: 22,
    rating: 4.9,
    reviewCount: 14,
    isFeatured: false,
    seoTitle: 'Everyday Carry Canvas Tote | Accessories.lt',
    seoDescription: 'Durable artisan tote bag crafted from heavy canvas and genuine leather trims.',
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-09-19T00:00:00Z'
  },
  {
    id: 'prod-99',
    name: 'Minimalist Steel Mesh Timepiece (38mm Unisex)',
    nameLt: 'Minimalistinis Plieninio Tinklelio Laikrodis (38mm)',
    slug: 'minimalist-steel-mesh-timepiece',
    sku: 'IVR-WTC-0099',
    description: 'Understated ultra-slim case crafted from 316L brushed surgical steel, featuring Japanese quartz movement, scratch-resistant sapphire mineral glass, and an adjustable quick-release Milanese mesh band. Water resistant to 3 ATM (30 meters).',
    descriptionLt: 'Itin plonas ir elegantiškas minimalistinis laikrodis su nerūdijančio plieno apyranke ir patikimu japonišku kvarciniu mechanizmu.',
    shortDescription: '38mm slim profile with scratch-proof sapphire crystal glass.',
    price: 85.00,
    salePrice: 65.00,
    currency: 'EUR',
    categoryId: 'cat-sunglasses',
    categorySlug: 'sunglasses-accessories',
    categoryName: 'Watches & Accessories',
    images: [
      'https://accessories.lt/wp-content/uploads/2026/09/image-3.jpg',
      'https://accessories.lt/wp-content/uploads/2026/09/image-4.jpg'
    ],
    attributes: {
      material: '316L Surgical Stainless Steel & Sapphire Glass',
      dimensions: 'Case 38mm, Thickness 7mm, Strap 18mm',
      weight: '75g',
      colors: ['Brushed Silver', 'Rose Gold']
    },
    variants: [
      {
        id: 'var-99-slv',
        sku: 'IVR-WTC-0099-SLV',
        name: 'Brushed Silver',
        attributes: { color: 'Silver' },
        price: 65.00,
        stock: 16
      },
      {
        id: 'var-99-rsg',
        sku: 'IVR-WTC-0099-RSG',
        name: 'Rose Gold',
        attributes: { color: 'Rose Gold' },
        price: 65.00,
        stock: 12
      }
    ],
    stock: 28,
    rating: 5.0,
    reviewCount: 29,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    seoTitle: 'Minimalist Mesh Watch 38mm | IVER Accessories',
    seoDescription: 'Timeless Scandinavian-inspired quartz watch with quick-release mesh strap at Accessories.lt.',
    createdAt: '2026-09-05T12:00:00Z',
    updatedAt: '2026-09-19T00:00:00Z'
  }
];

// Delivery options supported for Lithuania & EU
export const initialShippingMethods: ShippingMethod[] = [
  {
    id: 'ship-omniva',
    carrier: 'Omniva',
    name: 'Omniva Parcel Locker (Paštomatas)',
    nameLt: 'Omniva Paštomatai (Lietuva)',
    price: 2.99,
    freeAbove: 40.00,
    estimatedDelivery: '1-2 business days',
    countries: ['LT', 'LV', 'EE']
  },
  {
    id: 'ship-dpd',
    carrier: 'DPD',
    name: 'DPD Courier Delivery to Door',
    nameLt: 'DPD Kurjeris į rankas',
    price: 4.50,
    freeAbove: 60.00,
    estimatedDelivery: '1-2 business days',
    countries: ['LT', 'LV', 'EE', 'PL', 'DE']
  },
  {
    id: 'ship-post',
    carrier: 'Lietuvos Paštas',
    name: 'Registered Postal Delivery (EU)',
    nameLt: 'Registruotas paštas (Lietuva ir ES)',
    price: 3.50,
    freeAbove: 50.00,
    estimatedDelivery: '3-5 business days',
    countries: ['LT', 'ALL_EU']
  },
  {
    id: 'ship-dhl',
    carrier: 'DHL Express',
    name: 'DHL Express European Air Cargo',
    nameLt: 'DHL Express Skubus Pristatymas',
    price: 12.90,
    freeAbove: 120.00,
    estimatedDelivery: 'Next business day',
    countries: ['ALL_EU', 'UK', 'US']
  }
];

// Active coupons
export const initialCoupons: Coupon[] = [
  {
    id: 'cpn-welcome10',
    code: 'WELCOME10',
    discountType: 'percentage',
    value: 10,
    minOrder: 25.00,
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    usageLimit: 1000,
    usageCount: 142,
    isActive: true,
    description: '10% discount on your first order over €25'
  },
  {
    id: 'cpn-summer20',
    code: 'STYLE20',
    discountType: 'percentage',
    value: 20,
    minOrder: 60.00,
    maxDiscount: 25.00,
    startDate: '2026-06-01T00:00:00Z',
    endDate: '2026-10-31T23:59:59Z',
    usageLimit: 500,
    usageCount: 68,
    isActive: true,
    description: '20% off styling orders above €60'
  },
  {
    id: 'cpn-save5',
    code: 'IVER5',
    discountType: 'fixed_amount',
    value: 5,
    minOrder: 30.00,
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    usageLimit: 200,
    usageCount: 39,
    isActive: true,
    description: '€5 flat off any order above €30'
  }
];

// Seed reviews
export const initialReviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1870',
    productName: 'Kashmiri Bangles for Women (16 Pcs Set)',
    customerName: 'Aistė J.',
    rating: 5,
    title: 'Exquisite traditional detail and jingling sound',
    comment: 'The craftsmanship is phenomenal. The bell embellishments make a lovely subtle sound and the red and gold shine is even more impressive in real life.',
    verifiedPurchase: true,
    status: 'APPROVED',
    createdAt: '2026-09-14T11:20:00Z'
  },
  {
    id: 'rev-2',
    productId: 'prod-62',
    productName: 'Dakota Solid Structured Work Tote (Fits 16" Laptop)',
    customerName: 'Laura V.',
    rating: 5,
    title: 'The perfect office bag for my 16" MacBook',
    comment: 'I was hesitant if my bulky laptop would fit, but it slides smoothly into the padded slot with room to spare for my planner and charger. Solid structured base too!',
    verifiedPurchase: true,
    status: 'APPROVED',
    createdAt: '2026-09-10T09:15:00Z'
  },
  {
    id: 'rev-3',
    productId: 'prod-1863',
    productName: 'Sculpted Shine Dangle Drop Earrings',
    customerName: 'Monika K.',
    rating: 5,
    title: 'Featherlight and gorgeous reflection',
    comment: 'I have sensitive earlobes and usually cannot wear statement earrings for more than an hour. These feel like nothing at all. Highly recommend.',
    verifiedPurchase: true,
    status: 'APPROVED',
    createdAt: '2026-09-15T16:40:00Z'
  },
  {
    id: 'rev-4',
    productId: 'prod-51',
    productName: 'Curated 12-Pairs Earrings Capsule with Display Case',
    customerName: 'Dovydas M.',
    rating: 5,
    title: 'Bought as a gift, sister loved it!',
    comment: 'The packaging with the jewelry organizer box feels luxurious. Great value for 12 distinct pairs.',
    verifiedPurchase: true,
    status: 'APPROVED',
    createdAt: '2026-09-08T18:05:00Z'
  }
];

// Initial mock users (Admin + Customer)
const hashPassword = (pw: string) => crypto.createHash('sha256').update(pw).digest('hex');

export const initialUsers: User[] = [
  {
    id: 'usr-admin-1',
    email: 'admin@accessories.lt',
    name: 'Chief Administrator',
    passwordHash: hashPassword('Admin@123'),
    role: 'SUPER_ADMIN',
    phone: '+37060000000',
    isVerified: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr-prod-mgr',
    email: 'catalog@accessories.lt',
    name: 'Product Manager',
    passwordHash: hashPassword('Product@123'),
    role: 'PRODUCT_MANAGER',
    phone: '+37060000001',
    isVerified: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr-demo-customer',
    email: 'customer@accessories.lt',
    name: 'Viktorija Petrauskienė',
    passwordHash: hashPassword('Customer@123'),
    role: 'CUSTOMER',
    phone: '+37061234567',
    isVerified: true,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z'
  }
];

// Initial recent orders for testing order workflow
export const initialOrders: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ACC-2026-000101',
    userId: 'usr-demo-customer',
    customerEmail: 'customer@accessories.lt',
    customerPhone: '+37061234567',
    customerName: 'Viktorija Petrauskienė',
    shippingAddress: {
      firstName: 'Viktorija',
      lastName: 'Petrauskienė',
      addressLine1: 'Gedimino pr. 28-4',
      city: 'Vilnius',
      postalCode: 'LT-01104',
      country: 'Lithuania'
    },
    deliveryMethod: {
      id: 'ship-omniva',
      name: 'Omniva Parcel Locker (Paštomatas)',
      carrier: 'Omniva',
      price: 2.99,
      estimatedDelivery: '1-2 business days'
    },
    paymentMethod: 'bank_link_sepa',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    statusHistory: [
      { status: 'PENDING_PAYMENT', changedBy: 'system', timestamp: '2026-09-17T10:14:00Z' },
      { status: 'PAID', changedBy: 'Paysera Gateway', timestamp: '2026-09-17T10:15:20Z', notes: 'SEPA transfer confirmed' },
      { status: 'PROCESSING', changedBy: 'Order Fulfillment', timestamp: '2026-09-17T11:00:00Z' },
      { status: 'PACKED', changedBy: 'Warehouse Vilnius', timestamp: '2026-09-17T14:30:00Z' },
      { status: 'SHIPPED', changedBy: 'Warehouse Vilnius', timestamp: '2026-09-18T08:20:00Z', notes: 'Handed over to Omniva courier' }
    ],
    items: [
      {
        id: 'item-1',
        productId: 'prod-1870',
        productName: 'Kashmiri Bangles for Women (16 Pcs Set)',
        productSlug: 'kashmiri-bangles-for-women',
        productImage: 'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-12-230611.png',
        sku: 'IVR-JWL-1870',
        variantLabel: 'Standard (19.5 cm)',
        quantity: 1,
        unitPrice: 19.90,
        totalPrice: 19.90
      },
      {
        id: 'item-2',
        productId: 'prod-1863',
        productName: 'Sculpted Shine Dangle Drop Earrings',
        productSlug: 'sculpted-shine-earrings-2',
        productImage: 'https://accessories.lt/wp-content/uploads/2026/09/Screenshot-2026-09-12-225558.png',
        sku: 'IVR-JWL-1863',
        variantLabel: 'Polished Gold',
        quantity: 1,
        unitPrice: 14.50,
        totalPrice: 14.50
      }
    ],
    subtotal: 34.40,
    discount: 3.44,
    couponCode: 'WELCOME10',
    shippingCost: 2.99,
    tax: 5.91, // 21% VAT
    total: 33.95,
    currency: 'EUR',
    trackingNumber: 'OMN-LT-994827104',
    createdAt: '2026-09-17T10:14:00Z',
    updatedAt: '2026-09-18T08:20:00Z'
  }
];

// Persistent In-Memory Database Engine with ACID-compliant operations
class DatabaseEngine {
  public users: Map<string, User> = new Map();
  public products: Map<string, Product> = new Map();
  public categories: Map<string, Category> = new Map();
  public carts: Map<string, Cart> = new Map(); // keyed by sessionId
  public orders: Map<string, Order> = new Map();
  public coupons: Map<string, Coupon> = new Map();
  public reviews: Map<string, Review> = new Map();
  public shippingMethods: Map<string, ShippingMethod> = new Map();
  public wishlists: Map<string, string[]> = new Map(); // userId -> productIds
  public auditLogs: AuditLog[] = [];
  public analyticsEvents: AnalyticsEvent[] = [];
  public stockReservations: Map<string, { quantity: number; expiresAt: number }> = new Map(); // variantId -> reservation

  constructor() {
    this.seed();
  }

  public getCart(sessionId: string): Cart {
    const existing = this.carts.get(sessionId);
    if (existing) return existing;
    const newCart: Cart = {
      id: 'cart-' + crypto.randomUUID().slice(0, 8),
      sessionId,
      items: [],
      subtotal: 0,
      discount: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      currency: 'EUR',
      freeShippingThreshold: 40.0,
      freeShippingQualified: false,
      freeShippingRemaining: 40.0,
      updatedAt: new Date().toISOString()
    };
    this.carts.set(sessionId, newCart);
    return newCart;
  }

  public saveCart(sessionId: string, cart: Cart) {
    this.carts.set(sessionId, cart);
  }

  public getWishlist(userId: string): string[] {
    return this.wishlists.get(userId) || [];
  }

  public saveWishlist(userId: string, itemIds: string[]) {
    this.wishlists.set(userId, itemIds);
  }

  private seed() {
    initialCategories.forEach(c => this.categories.set(c.id, { ...c }));
    initialProducts.forEach(p => this.products.set(p.id, { ...p }));
    initialShippingMethods.forEach(s => this.shippingMethods.set(s.id, { ...s }));
    initialCoupons.forEach(cp => this.coupons.set(cp.code.toUpperCase(), { ...cp }));
    initialReviews.forEach(r => this.reviews.set(r.id, { ...r }));
    initialUsers.forEach(u => this.users.set(u.id, { ...u }));
    initialOrders.forEach(o => this.orders.set(o.id, { ...o }));

    this.logAudit({
      userId: 'system',
      userEmail: 'system@accessories.lt',
      action: 'SYSTEM_BOOTSTRAP',
      resource: 'DATABASE',
      details: 'IVER Accessories store database bootstrapped with authentic accessories.lt catalog',
      ip: '127.0.0.1'
    });
  }

  public logAudit(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
    const log: AuditLog = {
      id: 'aud-' + crypto.randomUUID().slice(0, 8),
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
  }

  public logAnalytics(entry: Omit<AnalyticsEvent, 'id' | 'timestamp'>) {
    const event: AnalyticsEvent = {
      id: 'evt-' + crypto.randomUUID().slice(0, 8),
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.analyticsEvents.unshift(event);
    if (this.analyticsEvents.length > 500) this.analyticsEvents.pop();
  }
}

export const db = new DatabaseEngine();
