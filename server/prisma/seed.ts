import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ==============================================================================
// 12 CANONICAL MARKETPLACE CATEGORIES (AS PER SPECIFICATION)
// ==============================================================================
const categoriesData = [
  {
    name: 'Fashion & Accessories',
    slug: 'fashion-accessories',
    description: 'Easy everyday accessories, travel essentials, and timeless wardrobe staples.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Electronics & Audio',
    slug: 'electronics-audio',
    description: 'Audiophile headphones, smart earbuds, premium audio speakers, and portable electronics.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Tech Accessories',
    slug: 'tech-accessories',
    description: 'High-speed GaN chargers, ergonomic stands, docks, cables, and mobile desk accessories.',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Home Decor',
    slug: 'home-decor',
    description: 'Warm, considered ceramics, ambient lighting, textiles, and calming decorative pieces.',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Kitchen & Dining',
    slug: 'kitchen-dining',
    description: 'Thoughtful kitchenware, bento boxes, thermal flasks, tableware, and airtight food storage.',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Stationery & Office Supplies',
    slug: 'stationery-office',
    description: 'Premium notebooks, fine-line pens, desk planners, and creative study essentials.',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Food, Snacks & Pantry Staples',
    slug: 'pantry-food',
    description: 'Organic grains, single-origin chocolates, nut mixes, roasted snacks, and pantry staples.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Personal Care & Grooming',
    slug: 'personal-care',
    description: 'Botanical skin cleansers, natural body washes, oral care, and restorative grooming basics.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cleaning & Laundry',
    slug: 'cleaning-laundry',
    description: 'Plant-powered laundry detergents, non-toxic surface sprays, and eco dish care.',
    image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Fitness & Wellness',
    slug: 'fitness-wellness',
    description: 'High-density yoga mats, resistance bands, recovery foam rollers, and athletic gear.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Pet Care & Toys',
    slug: 'pet-care',
    description: 'Nutritious treats, enrichment toys, non-skid stainless bowls, and natural grooming for pets.',
    image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Reusable & Eco-Friendly Essentials',
    slug: 'eco-friendly',
    description: 'Certified zero-waste, plastic-free alternatives, organic cotton bags, and bamboo goods.',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=700&auto=format&fit=crop&q=80',
  },
];

// Compatibility alias mappings for legacy category slugs
const categoryAliases: Record<string, string> = {
  'electronics': 'electronics-audio',
  'audio': 'electronics-audio',
  'home-kitchen': 'kitchen-dining',
};

// ==============================================================================
// 6 PLAUSIBLE DEMO VENDORS
// ==============================================================================
const demoVendorsData = [
  {
    email: 'vendor1@example.com',
    name: 'Rajesh Kumar',
    phone: '+91 9811122233',
    storeName: 'ElectroHub Direct',
    slug: 'electrohub-direct',
    description: 'Authorized retailer for premium consumer electronics, personal audio, and computing hardware.',
    logo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    trustScore: 94.5,
    rating: 4.8,
    totalReviews: 48,
    successfulOrders: 142,
    cancelledOrders: 2,
    onTimeDeliveries: 138,
    isEcoFriendlyCertified: false,
  },
  {
    email: 'vendor2@example.com',
    name: 'Aarav Patel',
    phone: '+91 9822233344',
    storeName: 'GadgetWorld Superstore',
    slug: 'gadgetworld-superstore',
    description: 'Wholesale-direct pricing on top-tier gadgets, wearables, and smartphone accessories with express fulfillment.',
    logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=1200&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    trustScore: 89.0,
    rating: 4.5,
    totalReviews: 35,
    successfulOrders: 98,
    cancelledOrders: 4,
    onTimeDeliveries: 92,
    isEcoFriendlyCertified: false,
  },
  {
    email: 'vendor3@example.com',
    name: 'Dr. Sunita Rao',
    phone: '+91 9833344455',
    storeName: 'EcoLiving Earth Essentials',
    slug: 'ecoliving-earth-essentials',
    description: '100% Certified sustainable, plastic-free living goods, compostable home essentials, and eco lifestyle products.',
    logo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    trustScore: 98.2,
    rating: 4.95,
    totalReviews: 82,
    successfulOrders: 215,
    cancelledOrders: 1,
    onTimeDeliveries: 212,
    isEcoFriendlyCertified: true,
  },
  {
    email: 'vendor4@example.com',
    name: 'Kavita Sundaram',
    phone: '+91 9844455566',
    storeName: 'UrbanCraft & Living',
    slug: 'urbancraft-living',
    description: 'Artisanal homeware, handcrafted ceramic tableware, linen goods, and mindful living decor.',
    logo: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    trustScore: 92.4,
    rating: 4.7,
    totalReviews: 54,
    successfulOrders: 130,
    cancelledOrders: 3,
    onTimeDeliveries: 125,
    isEcoFriendlyCertified: false,
  },
  {
    email: 'vendor5@example.com',
    name: 'Vikram Malhotra',
    phone: '+91 9855566677',
    storeName: 'PulseFit Gear & Wellness',
    slug: 'pulsefit-gear',
    description: 'High-performance fitness gear, rehabilitation accessories, ergonomic wellness tools, and athletic hydration.',
    logo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    trustScore: 91.0,
    rating: 4.6,
    totalReviews: 40,
    successfulOrders: 112,
    cancelledOrders: 3,
    onTimeDeliveries: 106,
    isEcoFriendlyCertified: false,
  },
  {
    email: 'vendor6@example.com',
    name: 'Meera Nambiar',
    phone: '+91 9866677788',
    storeName: 'PurePaws & Home Naturals',
    slug: 'purepaws-naturals',
    description: 'Natural pet wellness, non-toxic pet toys, gentle grooming botanicals, and green household cleaning.',
    logo: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    trustScore: 96.5,
    rating: 4.85,
    totalReviews: 62,
    successfulOrders: 165,
    cancelledOrders: 2,
    onTimeDeliveries: 161,
    isEcoFriendlyCertified: true,
  },
];

// ==============================================================================
// 240+ UNIQUE PRODUCT DEFINITIONS ACROSS 12 CATEGORIES
// ==============================================================================
interface SeedProductDef {
  title: string;
  slug: string;
  categorySlug: string;
  vendorSlug: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  rating: number;
  numReviews: number;
  images: string[];
  sku: string;
  catalogGroup?: string;
  isEcoFriendly: boolean;
  ecoDetails?: string;
  isFeatured?: boolean;
  description: string;
}

// Helper to generate catalog items
function buildCatalog(): SeedProductDef[] {
  const items: SeedProductDef[] = [];

  // 1. FASHION & ACCESSORIES (21 products)
  const fashionList = [
    { title: 'Everyday Canvas Tote Bag', slug: 'everyday-canvas-tote-bag', price: 499, compare: 799, stock: 45, img: 'photo-1544816155-12df9643f363', eco: true, ecoDetail: '100% Unbleached Organic Cotton' },
    { title: 'Minimal Gold-Tone Hoop Earrings', slug: 'minimal-gold-tone-hoop-earrings', price: 699, compare: 999, stock: 30, img: 'photo-1535632066927-ab7c9ab60908', eco: false },
    { title: 'Cotton Crew Socks 3-Pack', slug: 'cotton-crew-socks-3-pack', price: 349, compare: 499, stock: 60, img: 'photo-1586350977771-b3b0abd50c82', eco: true, ecoDetail: 'Breathable Combed Organic Cotton' },
    { title: 'Classic Washed Baseball Cap', slug: 'classic-washed-baseball-cap', price: 599, compare: 899, stock: 25, img: 'photo-1588850561407-ed78c282e89b', eco: false },
    { title: 'Slim Italian Leather Card Holder', slug: 'slim-italian-leather-card-holder', price: 899, compare: 1299, stock: 20, img: 'photo-1627123424574-724758594e93', eco: false },
    { title: 'Soft Knit Cashmere Blend Beanie', slug: 'soft-knit-cashmere-blend-beanie', price: 799, compare: 1199, stock: 35, img: 'photo-1576871337622-98d48d1cf531', eco: false },
    { title: 'Everyday Matte Hair Claw Clip Set', slug: 'everyday-matte-hair-claw-clip-set', price: 299, compare: 450, stock: 70, img: 'photo-1522337360788-8b13dee7a37e', eco: false },
    { title: 'Neutral Pure Linen Summer Scarf', slug: 'neutral-pure-linen-summer-scarf', price: 999, compare: 1499, stock: 22, img: 'photo-1520903920243-00d872a2d1c9', eco: true, ecoDetail: 'Pure European Flax Linen' },
    { title: 'Full Grain Leather Casual Belt', slug: 'full-grain-leather-casual-belt', price: 1199, compare: 1699, stock: 18, img: 'photo-1624222247344-550fb60583dc', eco: false },
    { title: 'Compact Travel Jewellery Case', slug: 'compact-travel-jewellery-case', price: 849, compare: 1199, stock: 26, img: 'photo-1599643478518-a784e5dc4c8f', eco: false },
    { title: 'Waterproof Canvas Tech Pouch', slug: 'waterproof-canvas-tech-pouch', price: 649, compare: 899, stock: 40, img: 'photo-1553062407-98eeb64c6a62', eco: false },
    { title: 'Polarized Classic Aviator Sunglasses', slug: 'polarized-classic-aviator-sunglasses', price: 1499, compare: 2299, stock: 15, img: 'photo-1511499767150-a48a237f0083', eco: false },
    { title: 'Foldable Heavy-Duty Shopping Bag', slug: 'foldable-heavy-duty-shopping-bag', price: 249, compare: 399, stock: 80, img: 'photo-1597484661643-2f5fef640dd1', eco: true, ecoDetail: 'Recycled Ocean Bound Plastic' },
    { title: 'Minimalist Silver Pendant Necklace', slug: 'minimalist-silver-pendant-necklace', price: 1299, compare: 1899, stock: 20, img: 'photo-1599643477877-530eb83abc8e', eco: false },
    { title: 'Everyday Crossbody Sling Pouch', slug: 'everyday-crossbody-sling-pouch', price: 999, compare: 1399, stock: 28, img: 'photo-1548036328-c9fa89d128fa', eco: false },
    { title: 'Classic Denim Trucker Jacket', slug: 'classic-denim-trucker-jacket', price: 2799, compare: 3999, stock: 14, img: 'photo-1576995853123-5a10305d93c0', eco: false },
    { title: 'Oversized Heavyweight Cotton Tee', slug: 'oversized-heavyweight-cotton-tee', price: 799, compare: 1199, stock: 50, img: 'photo-1521572267360-ee0c2909d518', eco: true, ecoDetail: '240 GSM Organic Ring-Spun Cotton' },
    { title: 'Waterproof Chelsea Rain Boots', slug: 'waterproof-chelsea-rain-boots', price: 2499, compare: 3499, stock: 12, img: 'photo-1542291026-7eec264c27ff', eco: false },
    { title: 'Pure Mulberry Silk Sleep Mask', slug: 'pure-mulberry-silk-sleep-mask', price: 899, compare: 1299, stock: 32, img: 'photo-1584308666744-24d5c474f2ae', eco: true, ecoDetail: '100% Grade 6A Mulberry Silk' },
    { title: 'Vintage Wayfarer Sunglasses UV400', slug: 'vintage-wayfarer-sunglasses-uv400', price: 1299, compare: 1799, stock: 24, img: 'photo-1572635196237-14b3f281503f', eco: false },
    { title: 'Handmade Braided Leather Keychain', slug: 'handmade-braided-leather-keychain', price: 299, compare: 499, stock: 65, img: 'photo-1614312481077-4475454641cb', eco: false },
  ];

  fashionList.forEach((it, i) => {
    items.push({
      title: it.title,
      slug: it.slug,
      categorySlug: 'fashion-accessories',
      vendorSlug: ['urbancraft-living', 'gadgetworld-superstore', 'ecoliving-earth-essentials'][i % 3],
      price: it.price,
      compareAtPrice: it.compare,
      stock: it.stock,
      rating: Number((4.3 + (i % 6) * 0.1).toFixed(1)),
      numReviews: 12 + (i * 4),
      images: [`https://images.unsplash.com/${it.img}?w=800&auto=format&fit=crop&q=80`],
      sku: `NX-FSH-${String(i + 1).padStart(3, '0')}`,
      isEcoFriendly: it.eco,
      ecoDetails: it.ecoDetail,
      isFeatured: i < 3,
      description: `${it.title} designed for effortless everyday comfort, clean aesthetics, and dependable longevity. Thoroughly inspected and delivered by verified merchants.`,
    });
  });

  // 2. ELECTRONICS & AUDIO (21 products - includes cross-vendor comparison items)
  const audioList = [
    // Comparison Group 1: Sony WH-1000XM5
    { title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones (Midnight Black)', slug: 'sony-wh1000xm5-electrohub', vendor: 'electrohub-direct', price: 26990, compare: 34990, stock: 22, group: 'sony-wh1000xm5', img: 'photo-1505740420928-5e560c06d30e', feat: true },
    { title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones (Silver Offer)', slug: 'sony-wh1000xm5-gadgetworld', vendor: 'gadgetworld-superstore', price: 24990, compare: 34990, stock: 18, group: 'sony-wh1000xm5', img: 'photo-1484704849700-f032a568e944', feat: true },
    // Comparison Group 2: Apple AirPods Pro 2
    { title: 'Apple AirPods Pro (2nd Gen) with MagSafe Case USB-C', slug: 'apple-airpods-pro-2-electrohub', vendor: 'electrohub-direct', price: 22990, compare: 24900, stock: 25, group: 'apple-airpods-pro-2', img: 'photo-1600294037681-c80b4cb5b434', feat: true },
    { title: 'Apple AirPods Pro (2nd Gen) with MagSafe Case (Superstore Special)', slug: 'apple-airpods-pro-2-gadgetworld', vendor: 'gadgetworld-superstore', price: 21490, compare: 24900, stock: 15, group: 'apple-airpods-pro-2', img: 'photo-1588423771073-b8903fbb85b5', feat: true },
    // Other Audio/Electronics
    { title: 'Bose QuietComfort 45 Bluetooth Noise-Cancelling Headphones', slug: 'bose-quietcomfort-45-headphones', vendor: 'electrohub-direct', price: 21990, compare: 29900, stock: 12, img: 'photo-1546435770-a3e426bf472b' },
    { title: 'Marshall Stanmore III Bluetooth Home Speaker (Black)', slug: 'marshall-stanmore-iii-speaker', vendor: 'electrohub-direct', price: 31999, compare: 37999, stock: 8, img: 'photo-1545454675-3531b543be5d' },
    { title: 'Sennheiser Momentum 4 Wireless Audiophile Headphones', slug: 'sennheiser-momentum-4-wireless', vendor: 'gadgetworld-superstore', price: 27990, compare: 34990, stock: 10, img: 'photo-1590658268037-6bf12165a8df' },
    { title: 'JBL Flip 6 Waterproof Portable Bluetooth Speaker', slug: 'jbl-flip-6-portable-speaker', vendor: 'gadgetworld-superstore', price: 8999, compare: 13999, stock: 35, img: 'photo-1608043152269-423dbba4e7e1' },
    { title: 'boAt Rockerz 550 Over-Ear Wireless Headphones', slug: 'boat-rockerz-550-wireless', vendor: 'gadgetworld-superstore', price: 1799, compare: 4999, stock: 60, img: 'photo-1583394838336-acd977736f90' },
    { title: 'Sony WF-1000XM5 Truly Wireless Noise Cancelling Earbuds', slug: 'sony-wf1000xm5-wireless-earbuds', vendor: 'electrohub-direct', price: 19990, compare: 24990, stock: 16, img: 'photo-1590658268037-6bf12165a8df' },
    { title: 'Nothing Ear (2) Hi-Res Audio Wireless Earbuds', slug: 'nothing-ear-2-wireless-earbuds', vendor: 'gadgetworld-superstore', price: 8499, compare: 9999, stock: 22, img: 'photo-1600294037681-c80b4cb5b434' },
    { title: 'Audio-Technica ATH-M50x Professional Studio Headphones', slug: 'audio-technica-ath-m50x-studio', vendor: 'electrohub-direct', price: 12499, compare: 15499, stock: 14, img: 'photo-1505740420928-5e560c06d30e' },
    { title: 'Anker Soundcore Motion+ 30W Bluetooth Speaker', slug: 'anker-soundcore-motion-plus-speaker', vendor: 'gadgetworld-superstore', price: 6999, compare: 8999, stock: 20, img: 'photo-1545454675-3531b543be5d' },
    { title: 'Shure MV7 USB/XLR Podcast Microphone', slug: 'shure-mv7-podcast-microphone', vendor: 'electrohub-direct', price: 22490, compare: 26990, stock: 7, img: 'photo-1590658268037-6bf12165a8df' },
    { title: 'Sonos Era 100 Smart Home Spatial Speaker', slug: 'sonos-era-100-smart-speaker', vendor: 'electrohub-direct', price: 26999, compare: 29999, stock: 9, img: 'photo-1545454675-3531b543be5d' },
    { title: 'Ultimate Ears MEGABOOM 3 Rugged Bluetooth Speaker', slug: 'ultimate-ears-megaboom-3-speaker', vendor: 'gadgetworld-superstore', price: 14999, compare: 17999, stock: 11, img: 'photo-1608043152269-423dbba4e7e1' },
    { title: 'Beats Studio Pro Wireless Over-Ear Headphones', slug: 'beats-studio-pro-wireless', vendor: 'electrohub-direct', price: 29900, compare: 37900, stock: 13, img: 'photo-1583394838336-acd977736f90' },
    { title: 'Creative Pebble V3 Minimalist Desktop USB-C Speakers', slug: 'creative-pebble-v3-desktop-speakers', vendor: 'gadgetworld-superstore', price: 3499, compare: 4499, stock: 40, img: 'photo-1545454675-3531b543be5d' },
    { title: 'Marshall Emberton II Compact Portable Speaker', slug: 'marshall-emberton-ii-compact-speaker', vendor: 'electrohub-direct', price: 14999, compare: 17999, stock: 15, img: 'photo-1545454675-3531b543be5d' },
    { title: 'Yamaha TW-E3B True Wireless Earbuds', slug: 'yamaha-tw-e3b-wireless-earbuds', vendor: 'gadgetworld-superstore', price: 4499, compare: 7490, stock: 25, img: 'photo-1590658268037-6bf12165a8df' },
    { title: 'Sony SRS-XB13 Extra Bass Compact Wireless Speaker', slug: 'sony-srs-xb13-compact-speaker', vendor: 'electrohub-direct', price: 3490, compare: 4990, stock: 32, img: 'photo-1608043152269-423dbba4e7e1' },
  ];

  audioList.forEach((it, i) => {
    items.push({
      title: it.title,
      slug: it.slug,
      categorySlug: 'electronics-audio',
      vendorSlug: it.vendor,
      price: it.price,
      compareAtPrice: it.compare,
      stock: it.stock,
      rating: Number((4.5 + (i % 5) * 0.1).toFixed(1)),
      numReviews: 20 + (i * 3),
      images: [`https://images.unsplash.com/${it.img}?w=800&auto=format&fit=crop&q=80`],
      sku: `NX-AUD-${String(i + 1).padStart(3, '0')}`,
      catalogGroup: it.group || undefined,
      isEcoFriendly: false,
      isFeatured: !!it.feat,
      description: `${it.title} delivers audiophile grade clarity, robust wireless connectivity, and verified warranty from authorized sellers.`,
    });
  });

  // 3. TECH ACCESSORIES (21 products - includes cross-vendor comparison items)
  const techList = [
    // Comparison Group 3: Logitech MX Master 3S
    { title: 'Logitech MX Master 3S Wireless Performance Mouse (Graphite)', slug: 'logitech-mx-master-3s-electrohub', vendor: 'electrohub-direct', price: 8995, compare: 10995, stock: 25, group: 'logitech-mx-master-3s', img: 'photo-1527864550417-7fd91fc51a46', feat: true },
    { title: 'Logitech MX Master 3S Wireless Performance Mouse (Deal Edition)', slug: 'logitech-mx-master-3s-gadgetworld', vendor: 'gadgetworld-superstore', price: 7999, compare: 10995, stock: 19, group: 'logitech-mx-master-3s', img: 'photo-1615663245857-ac93bb7c39e7', feat: true },
    // Other Tech Accessories
    { title: 'Anker 737 GaNPrime Power Bank (24000mAh 140W Output)', slug: 'anker-737-power-bank-24k', vendor: 'electrohub-direct', price: 11999, compare: 14999, stock: 15, img: 'photo-1609592424109-dd9892f1b177' },
    { title: 'Keychron K2 Wireless Mechanical Keyboard (RGB Brown Switch)', slug: 'keychron-k2-mechanical-keyboard', vendor: 'gadgetworld-superstore', price: 7499, compare: 8999, stock: 18, img: 'photo-1587829741301-dc798b83add3' },
    { title: 'Satechi Aluminum Multi-Port USB-C Hub Adapter 4K HDMI', slug: 'satechi-aluminum-multiport-adapter', vendor: 'electrohub-direct', price: 5499, compare: 6999, stock: 24, img: 'photo-1498049794561-7780e7231661' },
    { title: 'Ugreen Nexode 65W GaN Fast Charger 3-Port Wall Plug', slug: 'ugreen-nexode-65w-gan-charger', vendor: 'gadgetworld-superstore', price: 2999, compare: 3999, stock: 45, img: 'photo-1583863788434-e58a36330cf0' },
    { title: 'Rain Design mStand Aluminum Laptop Stand (Space Grey)', slug: 'rain-design-mstand-laptop-stand', vendor: 'urbancraft-living', price: 4490, compare: 5490, stock: 16, img: 'photo-1527443224154-c4a3942d3acf' },
    { title: 'Twelve South BookArc Vertical Desktop Stand for MacBook', slug: 'twelve-south-bookarc-stand', vendor: 'gadgetworld-superstore', price: 4999, compare: 5999, stock: 12, img: 'photo-1544716278-ca5e3f4abd8c' },
    { title: 'Belkin 3-in-1 MagSafe Fast Wireless Charging Station', slug: 'belkin-3-in-1-magsafe-charger', vendor: 'electrohub-direct', price: 13999, compare: 16999, stock: 10, img: 'photo-1586953208448-b95a79798f07' },
    { title: 'Baseus 100W Fast Charging Braided USB-C Cable 2m', slug: 'baseus-100w-braided-cable-2m', vendor: 'gadgetworld-superstore', price: 799, compare: 1299, stock: 80, img: 'photo-1544716278-ca5e3f4abd8c' },
    { title: 'Spigen Rugged Armor Tough Protective Case for iPad', slug: 'spigen-rugged-armor-case-ipad', vendor: 'gadgetworld-superstore', price: 1899, compare: 2499, stock: 30, img: 'photo-1544716278-ca5e3f4abd8c' },
    { title: 'Elgato Stream Deck MK.2 15 Customizable LCD Keys', slug: 'elgato-stream-deck-mk2', vendor: 'electrohub-direct', price: 14499, compare: 16999, stock: 8, img: 'photo-1550745165-9bc0b252726f' },
    { title: 'SanDisk 1TB Extreme Portable SSD 1050MB/s USB 3.2', slug: 'sandisk-1tb-extreme-portable-ssd', vendor: 'electrohub-direct', price: 8499, compare: 12999, stock: 22, img: 'photo-1597872200969-2b65d56bd16b' },
    { title: 'CalDigit TS4 Thunderbolt 4 18-Port High-Speed Dock', slug: 'caldigit-ts4-thunderbolt-4-dock', vendor: 'electrohub-direct', price: 38999, compare: 44999, stock: 5, img: 'photo-1498049794561-7780e7231661' },
    { title: 'Moft Invisible Foldable Adhesive Laptop Stand', slug: 'moft-invisible-foldable-laptop-stand', vendor: 'gadgetworld-superstore', price: 1699, compare: 2299, stock: 40, img: 'photo-1527443224154-c4a3942d3acf' },
    { title: 'Cable Matters Braided 8K DisplayPort to HDMI 2.1 Cable', slug: 'cable-matters-8k-hdmi-cable', vendor: 'gadgetworld-superstore', price: 1499, compare: 1999, stock: 35, img: 'photo-1544716278-ca5e3f4abd8c' },
    { title: 'Nulaxy Ergonomic Heavy Duty Aluminum Laptop Riser', slug: 'nulaxy-ergonomic-laptop-riser', vendor: 'urbancraft-living', price: 2299, compare: 3199, stock: 28, img: 'photo-1527443224154-c4a3942d3acf' },
    { title: 'Anker MagGo Magnetic 5000mAh Portable Wireless Battery', slug: 'anker-maggo-5000mah-magnetic-battery', vendor: 'gadgetworld-superstore', price: 3499, compare: 4499, stock: 25, img: 'photo-1609592424109-dd9892f1b177' },
    { title: 'Tomtoc 360 Degree Protective Laptop Sleeve 14 Inch', slug: 'tomtoc-360-protective-laptop-sleeve', vendor: 'urbancraft-living', price: 2199, compare: 2899, stock: 30, img: 'photo-1553062407-98eeb64c6a62' },
    { title: 'Orbitkey Nest Portable Desk Organiser with Wireless Charger', slug: 'orbitkey-nest-portable-organiser', vendor: 'urbancraft-living', price: 8999, compare: 10999, stock: 10, img: 'photo-1517842645767-c639042777db' },
    { title: 'Logitech StreamCam Full HD 1080p 60fps USB-C Webcam', slug: 'logitech-streamcam-full-hd-webcam', vendor: 'electrohub-direct', price: 11495, compare: 14995, stock: 14, img: 'photo-1587829741301-dc798b83add3' },
  ];

  techList.forEach((it, i) => {
    items.push({
      title: it.title,
      slug: it.slug,
      categorySlug: 'tech-accessories',
      vendorSlug: it.vendor,
      price: it.price,
      compareAtPrice: it.compare,
      stock: it.stock,
      rating: Number((4.4 + (i % 5) * 0.1).toFixed(1)),
      numReviews: 18 + (i * 3),
      images: [`https://images.unsplash.com/${it.img}?w=800&auto=format&fit=crop&q=80`],
      sku: `NX-TCH-${String(i + 1).padStart(3, '0')}`,
      catalogGroup: it.group || undefined,
      isEcoFriendly: false,
      isFeatured: !!it.feat,
      description: `${it.title} built for peak productivity, sleek workspace setups, and verified dependable performance.`,
    });
  });

  // 4. HOME DECOR (21 products)
  const homeDecorList = [
    { title: 'Belgian Linen Cushion Cover Set of 2 (Sand Dune)', slug: 'belgian-linen-cushion-cover-set', price: 899, compare: 1299, stock: 35, img: 'photo-1616486338812-3dadae4b4ace', eco: true, ecoDetail: 'Pure Unbleached European Flax' },
    { title: 'Textured Ceramic Japanese Bud Vase (Matte Cream)', slug: 'textured-ceramic-japanese-bud-vase', price: 649, compare: 899, stock: 28, img: 'photo-1618221195710-dd6b41faaea6', eco: true, ecoDetail: 'Hand-thrown Natural Clay Ceramic' },
    { title: 'Minimalist Nordic Wooden Table Lamp with Linen Shade', slug: 'minimalist-nordic-wooden-table-lamp', price: 1899, compare: 2499, stock: 20, img: 'photo-1507473885765-e6ed057f782c', eco: true, ecoDetail: 'FSC Certified Solid Beechwood' },
    { title: 'Woven Chunky Cotton Throw Blanket (Warm Oatmeal)', slug: 'woven-chunky-cotton-throw-blanket', price: 1499, compare: 1999, stock: 22, img: 'photo-1584100936595-c0654b55a2e2', eco: true, ecoDetail: '100% Recycled Cotton Fibers' },
    { title: 'Framed Botanical Fern Wall Art Set of 3', slug: 'framed-botanical-fern-wall-art-set', price: 1699, compare: 2299, stock: 15, img: 'photo-1513519245088-0e12902e5a38', eco: false },
    { title: 'Natural Rattan Hand-Woven Storage Basket with Lid', slug: 'natural-rattan-storage-basket-lid', price: 1299, compare: 1699, stock: 25, img: 'photo-1595425970377-c9703cf48b6d', eco: true, ecoDetail: 'Harvested Natural Cane & Rattan' },
    { title: 'Scented Soy Wax Candle in Amber Glass (Cedar & Bergamot)', slug: 'scented-soy-candle-cedar-bergamot', price: 549, compare: 799, stock: 50, img: 'photo-1603006905003-be475563bc59', eco: true, ecoDetail: 'Pure Soy Wax & Cotton Wick' },
    { title: 'Handcrafted Stoneware Planter Pot with Drainage Tray', slug: 'handcrafted-stoneware-planter-pot', price: 799, compare: 1099, stock: 30, img: 'photo-1485955900006-10f4d324d411', eco: true, ecoDetail: 'Artisanal Terracotta Stoneware' },
    { title: 'Woven Jute & Cotton Runner (Geometric Pattern)', slug: 'woven-jute-cotton-runner-geometric', price: 849, compare: 1199, stock: 20, img: 'photo-1600121848594-d8644e57abab', eco: true, ecoDetail: 'Biodegradable Natural Jute' },
    { title: 'Abstract Modern Ceramic Desk Sculpture (Terracotta)', slug: 'abstract-modern-ceramic-desk-sculpture', price: 999, compare: 1399, stock: 18, img: 'photo-1579783902614-a3fb3927b675', eco: false },
    { title: 'Soft Tufted Cotton Moroccan Area Rug (3x5 ft)', slug: 'soft-tufted-cotton-moroccan-rug', price: 2999, compare: 4299, stock: 12, img: 'photo-1600121848594-d8644e57abab', eco: false },
    { title: 'Solid Teak Wood Wall-Mounted Entryway Key Holder', slug: 'solid-teak-wood-key-holder', price: 699, compare: 999, stock: 35, img: 'photo-1513694203232-719a280e022f', eco: true, ecoDetail: 'Reclaimed Teak Wood' },
    { title: 'Ribbed Amber Glass Flower Vase (Modern Cylindrical)', slug: 'ribbed-amber-glass-flower-vase', price: 649, compare: 899, stock: 26, img: 'photo-1581783342308-f792dbdd27c5', eco: false },
    { title: 'Brass Finish Decorative Mirror Vanity Tray', slug: 'brass-finish-decorative-mirror-tray', price: 1199, compare: 1599, stock: 17, img: 'photo-1513519245088-0e12902e5a38', eco: false },
    { title: 'Warm Ambient Copper Wire LED Fairy Lights 10m', slug: 'warm-ambient-copper-led-fairy-lights', price: 349, compare: 499, stock: 75, img: 'photo-1512496015851-a90fb38ba796', eco: false },
    { title: 'Minimalist Macrame Wall Hanging Tapestry', slug: 'minimalist-macrame-wall-hanging-tapestry', price: 899, compare: 1299, stock: 22, img: 'photo-1522758971460-1d21eed7dc1d', eco: true, ecoDetail: 'Hand-knotted 100% Cotton Rope' },
    { title: 'Handcrafted Mango Wood Deep Serving Bowl', slug: 'handcrafted-mango-wood-serving-bowl', price: 1249, compare: 1699, stock: 19, img: 'photo-1616486029423-aaa4789e8c9a', eco: true, ecoDetail: 'Sustainable Mango Wood' },
    { title: 'Nordic Floating Wall Shelf Set of 2 (Natural Oak)', slug: 'nordic-floating-wall-shelf-set', price: 1499, compare: 1999, stock: 24, img: 'photo-1513694203232-719a280e022f', eco: false },
    { title: 'Geometric Pattern Jacquard Floor Pouf Ottoman', slug: 'geometric-pattern-jacquard-floor-pouf', price: 2199, compare: 2999, stock: 14, img: 'photo-1584100936595-c0654b55a2e2', eco: false },
    { title: 'Minimalist Metal Pendulum Silent Wall Clock', slug: 'minimalist-metal-pendulum-wall-clock', price: 1799, compare: 2499, stock: 16, img: 'photo-1563861826100-9cb868fdbe1c', eco: false },
    { title: 'Terracotta Hand-Poured Scented Candle (Cardamom & Oud)', slug: 'terracotta-hand-poured-scented-candle', price: 699, compare: 999, stock: 32, img: 'photo-1603006905003-be475563bc59', eco: true, ecoDetail: 'Reusable Terracotta Vessel & Soy' },
  ];

  homeDecorList.forEach((it, i) => {
    items.push({
      title: it.title,
      slug: it.slug,
      categorySlug: 'home-decor',
      vendorSlug: ['urbancraft-living', 'ecoliving-earth-essentials'][i % 2],
      price: it.price,
      compareAtPrice: it.compare,
      stock: it.stock,
      rating: Number((4.4 + (i % 5) * 0.1).toFixed(1)),
      numReviews: 14 + (i * 3),
      images: [`https://images.unsplash.com/${it.img}?w=800&auto=format&fit=crop&q=80`],
      sku: `NX-DEC-${String(i + 1).padStart(3, '0')}`,
      isEcoFriendly: it.eco,
      ecoDetails: it.ecoDetail,
      isFeatured: i < 3,
      description: `${it.title} adds quiet sophistication, tactile warmth, and timeless organic charm to modern home spaces.`,
    });
  });

  // 5. KITCHEN & DINING (21 products - includes cross-vendor comparison items)
  const kitchenList = [
    // Comparison Group 4: Milton Thermosteel Flask
    { title: 'Milton Thermosteel Flip Lid Insulated Flask 1000ml', slug: 'milton-thermosteel-flask-urbancraft', vendor: 'urbancraft-living', price: 999, compare: 1299, stock: 40, group: 'milton-thermosteel-flask', img: 'photo-1517256064527-09c73fc73e38', feat: true },
    { title: 'Milton Thermosteel Flip Lid Insulated Flask 1000ml (EcoLiving Edition)', slug: 'milton-thermosteel-flask-ecoliving', vendor: 'ecoliving-earth-essentials', price: 849, compare: 1299, stock: 30, group: 'milton-thermosteel-flask', img: 'photo-1544816155-12df9643f363', feat: true },
    // Comparison Group 5: Bamboo Cutting Board Set
    { title: 'Bamboo Kitchen Cutting Board Set with Deep Juice Groove 3-Piece', slug: 'bamboo-cutting-board-set-urbancraft', vendor: 'urbancraft-living', price: 1199, compare: 1599, stock: 25, group: 'bamboo-cutting-board-set', img: 'photo-1556911220-bff31c812dba', feat: true, eco: true, ecoDetail: '100% Organic Moso Bamboo' },
    { title: 'Bamboo Kitchen Cutting Board Set with Deep Juice Groove (EcoLiving Direct)', slug: 'bamboo-cutting-board-set-ecoliving', vendor: 'ecoliving-earth-essentials', price: 999, compare: 1599, stock: 20, group: 'bamboo-cutting-board-set', img: 'photo-1556911220-e15b29be8c8f', feat: true, eco: true, ecoDetail: '100% Organic Moso Bamboo' },
    // Comparison Group 6: Stainless Steel Bento Box
    { title: 'Stainless Steel Leakproof Bento Lunch Box 3-Compartment', slug: 'stainless-steel-bento-box-ecoliving', vendor: 'ecoliving-earth-essentials', price: 899, compare: 1299, stock: 35, group: 'stainless-steel-bento-box', img: 'photo-1556912172-45b7abe8b7e1', feat: true, eco: true, ecoDetail: 'Food-Grade 304 Stainless Steel' },
    { title: 'Stainless Steel Leakproof Bento Lunch Box (UrbanCraft Value)', slug: 'stainless-steel-bento-box-urbancraft', vendor: 'urbancraft-living', price: 799, compare: 1299, stock: 22, group: 'stainless-steel-bento-box', img: 'photo-1544816155-12df9643f363', feat: true, eco: true, ecoDetail: 'Food-Grade 304 Stainless Steel' },
    // Other Kitchen Products
    { title: 'Borosil Glass Food Storage Container Set of 3 (Airtight Lids)', slug: 'borosil-glass-food-storage-set', vendor: 'urbancraft-living', price: 1299, compare: 1699, stock: 28, img: 'photo-1556911220-bff31c812dba' },
    { title: 'Artisanal Handcrafted Ceramic Coffee Mug Pair (Sage Green)', slug: 'artisanal-ceramic-coffee-mug-pair', vendor: 'urbancraft-living', price: 699, compare: 999, stock: 40, img: 'photo-1514432324607-a09d9b4aefdd', eco: true, ecoDetail: 'Lead-Free Glazed Ceramic' },
    { title: 'Heat-Resistant Food-Grade Silicone Spatula Set of 4', slug: 'food-grade-silicone-spatula-set', vendor: 'urbancraft-living', price: 499, compare: 799, stock: 55, img: 'photo-1556911220-e15b29be8c8f' },
    { title: 'Stainless Steel Measuring Cups and Spoons 8-Piece Set', slug: 'stainless-measuring-cups-spoons-set', vendor: 'urbancraft-living', price: 649, compare: 899, stock: 32, img: 'photo-1556912172-45b7abe8b7e1' },
    { title: 'Waffle Weave Pure Cotton Kitchen Dish Towels 4-Pack', slug: 'waffle-weave-cotton-kitchen-towels', vendor: 'ecoliving-earth-essentials', price: 549, compare: 799, stock: 45, img: 'photo-1584100936595-c0654b55a2e2', eco: true, ecoDetail: '100% Organic Turkish Cotton' },
    { title: 'Airtight Borosilicate Glass Pantry Jars with Acacia Lids Set of 4', slug: 'borosilicate-glass-pantry-jars-set', vendor: 'urbancraft-living', price: 1499, compare: 1999, stock: 24, img: 'photo-1556911220-bff31c812dba' },
    { title: 'Drip-Free Glass Olive Oil Dispenser Bottle 500ml', slug: 'drip-free-glass-olive-oil-dispenser', vendor: 'urbancraft-living', price: 399, compare: 599, stock: 50, img: 'photo-1556911220-e15b29be8c8f' },
    { title: 'Heavy-Duty Cast Aluminum Citrus Lemon Squeezer', slug: 'heavy-duty-cast-aluminum-lemon-squeezer', vendor: 'urbancraft-living', price: 449, compare: 649, stock: 38, img: 'photo-1556912172-45b7abe8b7e1' },
    { title: 'Beeswax Reusable Food Wrap Starter Pack of 3', slug: 'beeswax-reusable-food-wrap-starter-pack', vendor: 'ecoliving-earth-essentials', price: 599, compare: 899, stock: 42, img: 'photo-1544816155-12df9643f363', eco: true, ecoDetail: 'Organic Cotton & Local Beeswax' },
    { title: 'Stoneware Matte Dinner Plate Set of 4 (Oatmeal Grey)', slug: 'stoneware-matte-dinner-plate-set', vendor: 'urbancraft-living', price: 1899, compare: 2499, stock: 18, img: 'photo-1556911220-bff31c812dba' },
    { title: 'Glass French Press Coffee Maker 800ml with Triple Filter', slug: 'glass-french-press-coffee-maker', vendor: 'urbancraft-living', price: 1199, compare: 1599, stock: 26, img: 'photo-1514432324607-a09d9b4aefdd' },
    { title: 'Reusable Silicone Stretch Lids 6-Pack (BPA-Free)', slug: 'reusable-silicone-stretch-lids-6-pack', vendor: 'ecoliving-earth-essentials', price: 349, compare: 499, stock: 65, img: 'photo-1556911220-e15b29be8c8f', eco: true, ecoDetail: 'Zero-Waste Food Grade Silicone' },
    { title: 'Japanese Style Ceramic Ramen Bowls with Chopsticks Pair', slug: 'japanese-ceramic-ramen-bowls-chopsticks', vendor: 'urbancraft-living', price: 1399, compare: 1899, stock: 20, img: 'photo-1556912172-45b7abe8b7e1' },
    { title: 'Stainless Steel Tea Infuser with Drip Tray', slug: 'stainless-steel-tea-infuser-drip-tray', vendor: 'ecoliving-earth-essentials', price: 299, compare: 449, stock: 60, img: 'photo-1544816155-12df9643f363', eco: true, ecoDetail: 'Reusable Food Grade Mesh' },
    { title: 'Pre-Seasoned Cast Iron Skillet 26cm with Silicone Handle', slug: 'pre-seasoned-cast-iron-skillet-26cm', vendor: 'urbancraft-living', price: 1599, compare: 2199, stock: 22, img: 'photo-1556911220-bff31c812dba' },
  ];

  kitchenList.forEach((it, i) => {
    items.push({
      title: it.title,
      slug: it.slug,
      categorySlug: 'kitchen-dining',
      vendorSlug: it.vendor,
      price: it.price,
      compareAtPrice: it.compare,
      stock: it.stock,
      rating: Number((4.5 + (i % 5) * 0.1).toFixed(1)),
      numReviews: 16 + (i * 3),
      images: [`https://images.unsplash.com/${it.img}?w=800&auto=format&fit=crop&q=80`],
      sku: `NX-KIT-${String(i + 1).padStart(3, '0')}`,
      catalogGroup: it.group || undefined,
      isEcoFriendly: !!it.eco,
      ecoDetails: it.ecoDetail,
      isFeatured: !!it.feat,
      description: `${it.title} engineered for culinary precision, food-safe daily dining, and reliable durability.`,
    });
  });

  // 6. STATIONERY & OFFICE SUPPLIES (21 products)
  const stationeryList = [
    { title: 'Hardcover Ruled Notebook A5 120gsm Cream Paper', slug: 'hardcover-ruled-notebook-a5', price: 349, compare: 499, stock: 60, img: 'photo-1455390582262-044cdead277a', eco: true, ecoDetail: 'Acid-Free Recycled Paper' },
    { title: 'Mildliner Pastel Dual-Tip Highlighter Set of 6', slug: 'mildliner-pastel-highlighter-set', price: 449, compare: 599, stock: 45, img: 'photo-1517842645767-c639042777db', eco: false },
    { title: 'Uniball Signo Black Gel Ink Pens 0.5mm Pack of 5', slug: 'uniball-signo-gel-pens-pack-of-5', price: 299, compare: 399, stock: 80, img: 'photo-1453738773917-9c3eff1db985', eco: false },
    { title: 'Pentel GraphGear 1000 Drafting Mechanical Pencil 0.5mm', slug: 'pentel-graphgear-mechanical-pencil', price: 799, compare: 999, stock: 30, img: 'photo-1455390582262-044cdead277a', eco: false },
    { title: 'Undated Weekly Desk Planner Pad 60 Tear-Off Sheets', slug: 'undated-weekly-desk-planner-pad', price: 399, compare: 549, stock: 50, img: 'photo-1517842645767-c639042777db', eco: true, ecoDetail: 'FSC Certified Sustainable Paper' },
    { title: 'Recycled Paper Sticky Notes Multi-Pack 6 Pads', slug: 'recycled-paper-sticky-notes-pack', price: 249, compare: 349, stock: 75, img: 'photo-1453738773917-9c3eff1db985', eco: true, ecoDetail: '100% Post-Consumer Recycled' },
    { title: 'Sakura Pigma Micron Fine-Liner Pen Set of 6', slug: 'sakura-pigma-micron-pen-set', price: 749, compare: 999, stock: 35, img: 'photo-1455390582262-044cdead277a', eco: false },
    { title: 'Heavy-Duty Kraft Document Folders Pack of 5', slug: 'kraft-document-folders-pack-of-5', price: 299, compare: 449, stock: 65, img: 'photo-1517842645767-c639042777db', eco: true, ecoDetail: 'Biodegradable Kraft Fiber' },
    { title: 'Bullet Dot Grid Journal A5 Vegan Leather (Midnight Navy)', slug: 'bullet-dot-grid-journal-a5', price: 599, compare: 849, stock: 40, img: 'photo-1455390582262-044cdead277a', eco: false },
    { title: 'Powder-Coated Metal Mesh Desk Organiser Tray', slug: 'metal-mesh-desk-organiser-tray', price: 699, compare: 999, stock: 32, img: 'photo-1517842645767-c639042777db', eco: false },
    { title: 'Faber-Castell Triangular Watercolour Pencils 24 Shades', slug: 'faber-castell-watercolour-pencils', price: 499, compare: 699, stock: 40, img: 'photo-1453738773917-9c3eff1db985', eco: false },
    { title: 'Tombow Mono Correction Tape Twin Pack', slug: 'tombow-mono-correction-tape-twin-pack', price: 279, compare: 380, stock: 70, img: 'photo-1455390582262-044cdead277a', eco: false },
    { title: 'Translucent Page Index Marker Flags Set of 8', slug: 'translucent-page-index-flags-set', price: 199, compare: 299, stock: 90, img: 'photo-1517842645767-c639042777db', eco: false },
    { title: 'Solid Brass Minimalist Bookmark Ruler (Vintage)', slug: 'solid-brass-bookmark-ruler', price: 399, compare: 599, stock: 45, img: 'photo-1453738773917-9c3eff1db985', eco: false },
    { title: 'Ring-Bound Revision Flash Cards Pack of 3', slug: 'ring-bound-revision-flash-cards', price: 229, compare: 320, stock: 85, img: 'photo-1455390582262-044cdead277a', eco: true, ecoDetail: 'Unbleached Recycled Cardstock' },
    { title: 'Kokuyo Campus Loose Leaf Binder B5 26 Rings', slug: 'kokuyo-campus-binder-b5', price: 799, compare: 1099, stock: 25, img: 'photo-1517842645767-c639042777db', eco: false },
    { title: 'Midori MD Paper Notebook Grid A5 (Bleedproof)', slug: 'midori-md-paper-notebook-grid-a5', price: 999, compare: 1399, stock: 20, img: 'photo-1455390582262-044cdead277a', eco: false },
    { title: 'Lamy Safari Fountain Pen Charcoal Medium Nib', slug: 'lamy-safari-fountain-pen-charcoal', price: 2490, compare: 2990, stock: 15, img: 'photo-1453738773917-9c3eff1db985', eco: false },
    { title: 'Pilot Metropolitan Retro Pop Fountain Pen (Fine)', slug: 'pilot-metropolitan-fountain-pen', price: 1599, compare: 1999, stock: 22, img: 'photo-1455390582262-044cdead277a', eco: false },
    { title: 'Solid Aluminum Desk Pen Holder & Paperweight', slug: 'aluminum-desk-pen-holder', price: 599, compare: 849, stock: 35, img: 'photo-1517842645767-c639042777db', eco: false },
    { title: 'Rhodia Wirebound Notepad Dot Grid A4 (Orange)', slug: 'rhodia-wirebound-notepad-dot-grid-a4', price: 699, compare: 899, stock: 30, img: 'photo-1455390582262-044cdead277a', eco: true, ecoDetail: 'PEFC Certified Sustainable' },
  ];

  stationeryList.forEach((it, i) => {
    items.push({
      title: it.title,
      slug: it.slug,
      categorySlug: 'stationery-office',
      vendorSlug: ['urbancraft-living', 'gadgetworld-superstore'][i % 2],
      price: it.price,
      compareAtPrice: it.compare,
      stock: it.stock,
      rating: Number((4.4 + (i % 5) * 0.1).toFixed(1)),
      numReviews: 10 + (i * 3),
      images: [`https://images.unsplash.com/${it.img}?w=800&auto=format&fit=crop&q=80`],
      sku: `NX-STN-${String(i + 1).padStart(3, '0')}`,
      isEcoFriendly: it.eco,
      ecoDetails: it.ecoDetail,
      isFeatured: i < 3,
      description: `${it.title} designed for smooth handwriting, focused ideation, and organised desk productivity.`,
    });
  });

  // 7. FOOD, SNACKS & PANTRY STAPLES (21 products)
  const pantryList = [
    { title: 'Organic Rolled Oats 1kg Whole Grain High Fiber', slug: 'organic-rolled-oats-1kg', price: 299, compare: 399, stock: 65, img: 'photo-1542838132-92c53300491e', eco: true, ecoDetail: 'Certified Organic Whole Grains' },
    { title: '100% Durum Wheat Fusilli Pasta 500g (Italian Import)', slug: 'durum-wheat-fusilli-pasta-500g', price: 189, compare: 249, stock: 70, img: 'photo-1547592180-85f173990554', eco: false },
    { title: 'Himalayan Pink Salt Roasted Makhana Foxnuts 150g', slug: 'himalayan-salt-roasted-makhana', price: 229, compare: 299, stock: 80, img: 'photo-1490645935967-10de6ba17061', eco: true, ecoDetail: 'Pesticide-Free Natural Harvesting' },
    { title: 'Creamy Natural Unsweetened Peanut Butter 1kg', slug: 'creamy-natural-peanut-butter-1kg', price: 449, compare: 599, stock: 45, img: 'photo-1542838132-92c53300491e', eco: true, ecoDetail: '100% Roasted Peanuts, Zero Palm Oil' },
    { title: 'Single Origin 72% Dark Chocolate Bar 100g (Artisanal)', slug: 'single-origin-dark-chocolate-100g', price: 299, compare: 399, stock: 55, img: 'photo-1547592180-85f173990554', eco: true, ecoDetail: 'Fair-Trade Organic Indian Cacao' },
    { title: 'Authentic CTC Masala Chai Tea Bags 100 Count Box', slug: 'authentic-ctc-masala-chai-100-bags', price: 349, compare: 449, stock: 60, img: 'photo-1490645935967-10de6ba17061', eco: false },
    { title: 'Traditional Aged Basmati Rice 5kg Premium Long Grain', slug: 'traditional-aged-basmati-rice-5kg', price: 699, compare: 899, stock: 40, img: 'photo-1542838132-92c53300491e', eco: false },
    { title: 'Raw California Almonds & Walnuts Nut Mix 500g', slug: 'raw-almonds-walnuts-nut-mix-500g', price: 649, compare: 849, stock: 35, img: 'photo-1547592180-85f173990554', eco: false },
    { title: 'Roasted Seed & Cranberry Breakfast Granola 500g', slug: 'roasted-seed-cranberry-granola-500g', price: 399, compare: 520, stock: 50, img: 'photo-1490645935967-10de6ba17061', eco: true, ecoDetail: 'Zero Refined Sugar' },
    { title: 'Pure Organic Jaggery Powder 1kg Chemical-Free', slug: 'pure-organic-jaggery-powder-1kg', price: 179, compare: 240, stock: 75, img: 'photo-1542838132-92c53300491e', eco: true, ecoDetail: 'Naturally Processed Sugarcane' },
    { title: 'Freeze-Dried Arabica Instant Coffee 100g Glass Jar', slug: 'freeze-dried-arabica-instant-coffee', price: 399, compare: 499, stock: 48, img: 'photo-1547592180-85f173990554', eco: false },
    { title: 'Organic Kabuli Chana Whole Chickpeas 1kg', slug: 'organic-kabuli-chana-chickpeas-1kg', price: 199, compare: 260, stock: 65, img: 'photo-1490645935967-10de6ba17061', eco: true, ecoDetail: 'Certified Organic Indian Farm' },
    { title: 'Ancient Multigrain Baked Crackers 200g (Zero Trans Fat)', slug: 'ancient-multigrain-baked-crackers', price: 149, compare: 199, stock: 85, img: 'photo-1542838132-92c53300491e', eco: false },
    { title: 'Unsweetened Dutch-Processed Cocoa Powder 250g', slug: 'dutch-processed-cocoa-powder-250g', price: 299, compare: 399, stock: 40, img: 'photo-1547592180-85f173990554', eco: false },
    { title: 'Whole Dried Cranberries 250g (Low Added Sugar)', slug: 'whole-dried-cranberries-250g', price: 289, compare: 360, stock: 55, img: 'photo-1490645935967-10de6ba17061', eco: false },
    { title: 'Cold-Pressed Extra Virgin Mustard Oil 1L (Kachi Ghani)', slug: 'cold-pressed-mustard-oil-1l', price: 249, compare: 320, stock: 50, img: 'photo-1542838132-92c53300491e', eco: true, ecoDetail: 'Cold-Pressed, Zero Additives' },
    { title: 'Raw Unfiltered Wild Forest Honey 500g Glass Jar', slug: 'raw-unfiltered-wild-forest-honey-500g', price: 449, compare: 599, stock: 38, img: 'photo-1547592180-85f173990554', eco: true, ecoDetail: 'Ethically Foraged Forest Honey' },
    { title: 'Organic Chia Seeds 250g (Omega-3 Superfood)', slug: 'organic-chia-seeds-250g', price: 199, compare: 280, stock: 70, img: 'photo-1490645935967-10de6ba17061', eco: true, ecoDetail: 'Pure Organic Raw Seeds' },
    { title: 'Whole Grain Royal White Quinoa 500g', slug: 'whole-grain-white-quinoa-500g', price: 279, compare: 380, stock: 45, img: 'photo-1542838132-92c53300491e', eco: true, ecoDetail: 'High Protein Ancient Grain' },
    { title: 'Slow Roasted Peri Peri Whole Cashews 200g', slug: 'slow-roasted-peri-peri-cashews-200g', price: 349, compare: 450, stock: 60, img: 'photo-1547592180-85f173990554', eco: false },
    { title: 'Extra Virgin Cold-Pressed Olive Oil 500ml', slug: 'extra-virgin-olive-oil-500ml', price: 699, compare: 899, stock: 32, img: 'photo-1490645935967-10de6ba17061', eco: false },
  ];

  pantryList.forEach((it, i) => {
    items.push({
      title: it.title,
      slug: it.slug,
      categorySlug: 'pantry-food',
      vendorSlug: ['urbancraft-living', 'ecoliving-earth-essentials'][i % 2],
      price: it.price,
      compareAtPrice: it.compare,
      stock: it.stock,
      rating: Number((4.5 + (i % 5) * 0.1).toFixed(1)),
      numReviews: 22 + (i * 4),
      images: [`https://images.unsplash.com/${it.img}?w=800&auto=format&fit=crop&q=80`],
      sku: `NX-PAN-${String(i + 1).padStart(3, '0')}`,
      isEcoFriendly: it.eco,
      ecoDetails: it.ecoDetail,
      isFeatured: i < 3,
      description: `${it.title} curated for exceptional natural flavor, clean ingredients, and reliable freshness.`,
    });
  });

  // 8. PERSONAL CARE & GROOMING (21 products)
  const personalList = [
    { title: 'Gentle Hydrating Face Cleanser with Ceramides 150ml', slug: 'gentle-hydrating-face-cleanser', price: 349, compare: 499, stock: 55, img: 'photo-1608248543803-ba4f8c70ae0b', eco: true, ecoDetail: 'Sulfate & Paraben Free' },
    { title: 'Sulfate-Free Refreshing Body Wash 300ml (Tea Tree & Mint)', slug: 'sulfate-free-tea-tree-body-wash', price: 399, compare: 549, stock: 45, img: 'photo-1556228720-195a672e8a03', eco: true, ecoDetail: 'Plant-Based Biodegradable Formula' },
    { title: 'Shea Butter Ultra-Nourishing Hand Cream 75ml', slug: 'shea-butter-ultra-nourishing-hand-cream', price: 299, compare: 399, stock: 65, img: 'photo-1608571423902-eed4a5ad8108', eco: true, ecoDetail: 'Fair-Trade African Shea Butter' },
    { title: 'Pure Aloe Vera Soothing Body Lotion 250ml', slug: 'pure-aloe-vera-body-lotion', price: 349, compare: 480, stock: 50, img: 'photo-1608248543803-ba4f8c70ae0b', eco: true, ecoDetail: 'Organic Cold-Pressed Aloe Vera' },
    { title: 'Natural Botanical Mint Toothpaste Twin Pack 150g', slug: 'natural-mint-toothpaste-twin-pack', price: 249, compare: 349, stock: 80, img: 'photo-1556228720-195a672e8a03', eco: true, ecoDetail: 'Microplastic-Free Oral Care' },
    { title: 'Eco Bamboo Charcoal Soft Bristle Toothbrush Pack of 4', slug: 'eco-bamboo-charcoal-toothbrush-4pack', price: 199, compare: 299, stock: 90, img: 'photo-1608571423902-eed4a5ad8108', eco: true, ecoDetail: 'Compostable Bamboo Handle' },
    { title: 'Pure Damask Rose Water Facial Mist Toner 200ml', slug: 'damask-rose-water-facial-mist', price: 399, compare: 550, stock: 40, img: 'photo-1608248543803-ba4f8c70ae0b', eco: true, ecoDetail: '100% Steam Distilled Rose Water' },
    { title: 'Peppermint Organic Beeswax Lip Balm Duo', slug: 'peppermint-beeswax-lip-balm-duo', price: 199, compare: 280, stock: 85, img: 'photo-1556228720-195a672e8a03', eco: true, ecoDetail: 'All-Natural Ingredients' },
    { title: 'Argan Oil Restorative Hair Conditioner 250ml', slug: 'argan-oil-restorative-hair-conditioner', price: 499, compare: 699, stock: 35, img: 'photo-1608571423902-eed4a5ad8108', eco: false },
    { title: 'Daily Mild Clarifying Shampoo 300ml Sulfate-Free', slug: 'daily-mild-clarifying-shampoo', price: 449, compare: 599, stock: 42, img: 'photo-1608248543803-ba4f8c70ae0b', eco: false },
    { title: 'Matte Finish Mineral Sunscreen SPF 50 PA++++ 50g', slug: 'matte-finish-mineral-sunscreen-spf50', price: 599, compare: 799, stock: 48, img: 'photo-1556228720-195a672e8a03', eco: true, ecoDetail: 'Reef-Safe Mineral Zinc Oxide' },
    { title: 'Organic Bamboo Face Towels Soft 3-Pack', slug: 'organic-bamboo-face-towels-3pack', price: 399, compare: 549, stock: 60, img: 'photo-1608571423902-eed4a5ad8108', eco: true, ecoDetail: 'Hypoallergenic Bamboo Fiber' },
    { title: 'Natural Neem Wood Detangling Hair Comb', slug: 'natural-neem-wood-hair-comb', price: 179, compare: 250, stock: 100, img: 'photo-1608248543803-ba4f8c70ae0b', eco: true, ecoDetail: 'Hand-Carved Herbal Neem Wood' },
    { title: 'Micellar Bi-Phase Gentle Makeup Cleansing Water 200ml', slug: 'micellar-makeup-cleansing-water', price: 349, compare: 450, stock: 55, img: 'photo-1556228720-195a672e8a03', eco: false },
    { title: 'Cold-Pressed Pure Sweet Almond Oil 100ml', slug: 'cold-pressed-sweet-almond-oil-100ml', price: 399, compare: 520, stock: 45, img: 'photo-1608571423902-eed4a5ad8108', eco: true, ecoDetail: '100% Pure Virgin Almond Oil' },
    { title: 'Epsom Bath Salts with Lavender Essential Oil 500g', slug: 'epsom-bath-salts-lavender-500g', price: 329, compare: 450, stock: 50, img: 'photo-1608248543803-ba4f8c70ae0b', eco: true, ecoDetail: 'Therapeutic Grade Mineral Salts' },
    { title: 'Activated Charcoal Deep Pore Clay Mask 100g', slug: 'activated-charcoal-deep-pore-clay-mask', price: 449, compare: 599, stock: 38, img: 'photo-1556228720-195a672e8a03', eco: true, ecoDetail: 'Bentonite Clay & Bamboo Charcoal' },
    { title: 'Glycolic Acid 7% Exfoliating Skin Toner 150ml', slug: 'glycolic-acid-exfoliating-toner-150ml', price: 549, compare: 699, stock: 40, img: 'photo-1608571423902-eed4a5ad8108', eco: false },
    { title: 'Natural Volcanic Pumice Stone Foot Scrubber', slug: 'natural-volcanic-pumice-stone', price: 149, compare: 220, stock: 80, img: 'photo-1608248543803-ba4f8c70ae0b', eco: true, ecoDetail: '100% Natural Volcanic Lava Stone' },
    { title: 'Pure Cold-Pressed Castor Oil 200ml for Hair & Brows', slug: 'cold-pressed-castor-oil-200ml', price: 279, compare: 380, stock: 65, img: 'photo-1556228720-195a672e8a03', eco: true, ecoDetail: 'Chemical-Free Hexane-Free' },
    { title: 'Caffeine Under Eye Depuffing Serum with Peptides 30ml', slug: 'caffeine-under-eye-depuffing-serum', price: 599, compare: 799, stock: 35, img: 'photo-1608571423902-eed4a5ad8108', eco: false },
  ];

  personalList.forEach((it, i) => {
    items.push({
      title: it.title,
      slug: it.slug,
      categorySlug: 'personal-care',
      vendorSlug: ['ecoliving-earth-essentials', 'purepaws-naturals'][i % 2],
      price: it.price,
      compareAtPrice: it.compare,
      stock: it.stock,
      rating: Number((4.5 + (i % 5) * 0.1).toFixed(1)),
      numReviews: 15 + (i * 3),
      images: [`https://images.unsplash.com/${it.img}?w=800&auto=format&fit=crop&q=80`],
      sku: `NX-PER-${String(i + 1).padStart(3, '0')}`,
      isEcoFriendly: it.eco,
      ecoDetails: it.ecoDetail,
      isFeatured: i < 3,
      description: `${it.title} formulated with gentle skin-friendly ingredients, non-irritating botanicals, and dermatological quality.`,
    });
  });

  // 9. CLEANING & LAUNDRY (21 products)
  const cleaningList = [
    { title: 'Plant-Powered Concentrated Dishwash Liquid 1L (Citrus)', slug: 'plant-powered-dishwash-liquid-1l', price: 249, compare: 349, stock: 60, img: 'photo-1585421514284-efb74c2b69ba', eco: true, ecoDetail: 'Plant Enzymes, Phosphate Free' },
    { title: 'Hypoallergenic Laundry Detergent Liquid 2L Eco-Safe', slug: 'hypoallergenic-laundry-detergent-2l', price: 499, compare: 699, stock: 40, img: 'photo-1563453392212-326f5e854473', eco: true, ecoDetail: 'Biodegradable, Safe for Septic' },
    { title: 'Lint-Free Microfiber Cleaning Cloths Pack of 6', slug: 'lint-free-microfiber-cloths-pack-of-6', price: 299, compare: 449, stock: 75, img: 'photo-1528740561666-dc2479dc08ab', eco: false },
    { title: 'Plant-Based Multi-Surface Cleaning Spray 500ml', slug: 'plant-based-multi-surface-spray-500ml', price: 229, compare: 320, stock: 55, img: 'photo-1585421514284-efb74c2b69ba', eco: true, ecoDetail: 'Non-Toxic Lemon Myrtle Formulation' },
    { title: 'Natural Walnut Scrubber Sponges Set of 4', slug: 'natural-walnut-scrubber-sponge-set', price: 199, compare: 299, stock: 80, img: 'photo-1563453392212-326f5e854473', eco: true, ecoDetail: 'Crushed Walnut Shell & Cellulose' },
    { title: 'Thick Bleach-Free Toilet Bowl Cleaning Gel 750ml', slug: 'bleach-free-toilet-cleaning-gel', price: 179, compare: 240, stock: 65, img: 'photo-1528740561666-dc2479dc08ab', eco: true, ecoDetail: 'Plant Acid De-scaler' },
    { title: 'Linen & Room Freshener Spray 250ml (Crisp Cotton)', slug: 'linen-room-freshener-crisp-cotton', price: 299, compare: 399, stock: 50, img: 'photo-1585421514284-efb74c2b69ba', eco: true, ecoDetail: 'Essential Oil Infused' },
    { title: 'Extra-Sticky Pet Hair Lint Roller with 2 Refills', slug: 'pet-hair-lint-roller-with-refills', price: 349, compare: 499, stock: 45, img: 'photo-1563453392212-326f5e854473', eco: false },
    { title: 'Concentrated Citrus Floor Cleaner 1L Non-Toxic', slug: 'concentrated-citrus-floor-cleaner-1l', price: 269, compare: 360, stock: 55, img: 'photo-1528740561666-dc2479dc08ab', eco: true, ecoDetail: 'Pet & Child Safe Formulation' },
    { title: 'Heavy Duty Wooden Dish Scrub Brush with Tampico Fiber', slug: 'wooden-dish-scrub-brush-tampico', price: 229, compare: 320, stock: 60, img: 'photo-1585421514284-efb74c2b69ba', eco: true, ecoDetail: 'Beechwood & Plant Agave Fibers' },
    { title: 'Compostable Plant-Based Garbage Bags Medium 30 Count', slug: 'compostable-garbage-bags-medium-30ct', price: 249, compare: 349, stock: 85, img: 'photo-1563453392212-326f5e854473', eco: true, ecoDetail: '100% Cornstarch Biodegradable' },
    { title: 'Streak-Free Glass & Mirror Cleaner Spray 500ml', slug: 'streak-free-glass-cleaner-spray', price: 189, compare: 260, stock: 60, img: 'photo-1528740561666-dc2479dc08ab', eco: false },
    { title: 'Zippered Mesh Laundry Delicates Wash Bags Set of 3', slug: 'mesh-laundry-delicates-bags-set-of-3', price: 299, compare: 420, stock: 70, img: 'photo-1585421514284-efb74c2b69ba', eco: false },
    { title: 'Natural Latex Reusable Household Rubber Cleaning Gloves', slug: 'natural-latex-household-rubber-gloves', price: 199, compare: 299, stock: 75, img: 'photo-1563453392212-326f5e854473', eco: true, ecoDetail: '100% Natural Rubber Latex' },
    { title: 'Bio-Enzymatic Drain Cleaner & Odour Eliminator 500ml', slug: 'bio-enzymatic-drain-cleaner-500ml', price: 349, compare: 499, stock: 40, img: 'photo-1528740561666-dc2479dc08ab', eco: true, ecoDetail: 'Non-Corrosive Bacterial Enzymes' },
    { title: 'Wool Dryer Balls 100% New Zealand Wool Set of 6', slug: 'wool-dryer-balls-new-zealand-set-of-6', price: 599, compare: 849, stock: 35, img: 'photo-1585421514284-efb74c2b69ba', eco: true, ecoDetail: 'Replaces 1000+ Dryer Sheets' },
    { title: 'Oxygen Bleach Stain Remover Powder 1kg', slug: 'oxygen-bleach-stain-remover-powder-1kg', price: 399, compare: 549, stock: 45, img: 'photo-1563453392212-326f5e854473', eco: true, ecoDetail: 'Chlorine-Free Sodium Percarbonate' },
    { title: 'Copper Scouring Pads for Pots and Pans Pack of 4', slug: 'copper-scouring-pads-pack-of-4', price: 249, compare: 350, stock: 60, img: 'photo-1528740561666-dc2479dc08ab', eco: false },
    { title: 'All-Purpose Baking Soda Cleaning Grade 1kg', slug: 'baking-soda-cleaning-grade-1kg', price: 149, compare: 220, stock: 90, img: 'photo-1585421514284-efb74c2b69ba', eco: true, ecoDetail: 'Pure Mineral Sodium Bicarbonate' },
    { title: 'Steam Iron Cleaning & Descaling Solution 250ml', slug: 'steam-iron-descaling-solution-250ml', price: 229, compare: 320, stock: 50, img: 'photo-1563453392212-326f5e854473', eco: false },
    { title: 'Natural Coconut Coir Bottle Cleaning Brush', slug: 'coconut-coir-bottle-cleaning-brush', price: 179, compare: 250, stock: 80, img: 'photo-1528740561666-dc2479dc08ab', eco: true, ecoDetail: 'Biodegradable Coconut Husk Coir' },
  ];

  cleaningList.forEach((it, i) => {
    items.push({
      title: it.title,
      slug: it.slug,
      categorySlug: 'cleaning-laundry',
      vendorSlug: ['purepaws-naturals', 'ecoliving-earth-essentials'][i % 2],
      price: it.price,
      compareAtPrice: it.compare,
      stock: it.stock,
      rating: Number((4.4 + (i % 5) * 0.1).toFixed(1)),
      numReviews: 18 + (i * 3),
      images: [`https://images.unsplash.com/${it.img}?w=800&auto=format&fit=crop&q=80`],
      sku: `NX-CLN-${String(i + 1).padStart(3, '0')}`,
      isEcoFriendly: it.eco,
      ecoDetails: it.ecoDetail,
      isFeatured: i < 3,
      description: `${it.title} formulated for powerful everyday household cleanliness without caustic fumes or harsh residues.`,
    });
  });

  // 10. FITNESS & WELLNESS (21 products - includes cross-vendor comparison items)
  const fitnessList = [
    // Comparison Group 7: Boldfit Yoga Mat 6mm
    { title: 'Boldfit High Density TPE Yoga Mat 6mm with Carrying Strap', slug: 'boldfit-yoga-mat-6mm-pulsefit', vendor: 'pulsefit-gear', price: 1299, compare: 1799, stock: 40, group: 'boldfit-yoga-mat-6mm', img: 'photo-1517836357463-d25dfeac3438', feat: true, eco: true, ecoDetail: 'Eco-Friendly Non-Toxic TPE' },
    { title: 'Boldfit High Density TPE Yoga Mat 6mm (UrbanCraft Offer)', slug: 'boldfit-yoga-mat-6mm-urbancraft', vendor: 'urbancraft-living', price: 1099, compare: 1799, stock: 25, group: 'boldfit-yoga-mat-6mm', img: 'photo-1544367567-0f2fcb009e0b', feat: true, eco: true, ecoDetail: 'Eco-Friendly Non-Toxic TPE' },
    // Other Fitness Products
    { title: 'Resistance Loop Exercise Bands Set of 5 with Pouch', slug: 'resistance-loop-exercise-bands-set-of-5', vendor: 'pulsefit-gear', price: 499, compare: 799, stock: 70, img: 'photo-1517836357463-d25dfeac3438' },
    { title: 'Stainless Steel Protein Shaker Bottle with Wire Whisk 700ml', slug: 'stainless-protein-shaker-bottle-700ml', vendor: 'pulsefit-gear', price: 699, compare: 999, stock: 45, img: 'photo-1579758629938-03607ccdbaba' },
    { title: 'High Density Deep Tissue Foam Roller 45cm', slug: 'deep-tissue-foam-roller-45cm', vendor: 'pulsefit-gear', price: 899, compare: 1299, stock: 35, img: 'photo-1544367567-0f2fcb009e0b' },
    { title: 'Speed Jump Rope with Ball Bearings & Adjustable Cable', slug: 'speed-jump-rope-adjustable-ball-bearings', vendor: 'pulsefit-gear', price: 399, compare: 599, stock: 65, img: 'photo-1517836357463-d25dfeac3438' },
    { title: 'Quick-Dry Antimicrobial Microfiber Gym Towel Set of 2', slug: 'microfiber-gym-towel-set-of-2', vendor: 'pulsefit-gear', price: 449, compare: 649, stock: 55, img: 'photo-1579758629938-03607ccdbaba' },
    { title: 'Adjustable Ankle and Wrist Weights Pair 2kg', slug: 'adjustable-ankle-wrist-weights-pair-2kg', vendor: 'pulsefit-gear', price: 799, compare: 1199, stock: 30, img: 'photo-1544367567-0f2fcb009e0b' },
    { title: 'High Density EVA Foam Yoga Blocks Pair with Strap', slug: 'eva-foam-yoga-blocks-pair-with-strap', vendor: 'pulsefit-gear', price: 549, compare: 799, stock: 48, img: 'photo-1517836357463-d25dfeac3438' },
    { title: 'Adjustable Hand Grip Strength Trainer 10-60kg with Counter', slug: 'hand-grip-strength-trainer-adjustable', vendor: 'pulsefit-gear', price: 349, compare: 499, stock: 80, img: 'photo-1579758629938-03607ccdbaba' },
    { title: 'Running Waist Pack Belt with Water Bottle Holder', slug: 'running-waist-pack-belt-bottle-holder', vendor: 'pulsefit-gear', price: 499, compare: 699, stock: 40, img: 'photo-1544367567-0f2fcb009e0b' },
    { title: 'Multi-Loop Non-Elastic Stretching Strap for Flexibility', slug: 'multi-loop-stretching-strap-flexibility', vendor: 'pulsefit-gear', price: 399, compare: 550, stock: 50, img: 'photo-1517836357463-d25dfeac3438' },
    { title: 'Lacrosse Massage Balls Double Peanut Set for Mobility', slug: 'lacrosse-massage-balls-peanut-set', vendor: 'pulsefit-gear', price: 449, compare: 649, stock: 45, img: 'photo-1579758629938-03607ccdbaba' },
    { title: 'Insulated Sports Water Bottle 1L with Straw & Chug Lid', slug: 'insulated-sports-water-bottle-1l', vendor: 'pulsefit-gear', price: 899, compare: 1299, stock: 38, img: 'photo-1544367567-0f2fcb009e0b' },
    { title: 'A5 Daily Workout and Nutrition Log Notebook (120 Days)', slug: 'daily-workout-nutrition-log-notebook', vendor: 'urbancraft-living', price: 299, compare: 420, stock: 60, img: 'photo-1517836357463-d25dfeac3438' },
    { title: 'Instant Cooling Microfiber Sports Towel 2-Pack', slug: 'instant-cooling-microfiber-sports-towel-2pack', vendor: 'pulsefit-gear', price: 349, compare: 499, stock: 75, img: 'photo-1579758629938-03607ccdbaba' },
    { title: 'Push-Up Bars Stand with Ergonomic Non-Slip Foam Grip', slug: 'push-up-bars-stand-ergonomic-foam', vendor: 'pulsefit-gear', price: 599, compare: 849, stock: 42, img: 'photo-1544367567-0f2fcb009e0b' },
    { title: 'Foam Balance Pad for Physical Therapy & Core Strength', slug: 'foam-balance-pad-physical-therapy', vendor: 'pulsefit-gear', price: 849, compare: 1199, stock: 26, img: 'photo-1517836357463-d25dfeac3438' },
    { title: 'Ab Roller Wheel with Extra Thick Knee Mat for Core Gym', slug: 'ab-roller-wheel-with-knee-mat', vendor: 'pulsefit-gear', price: 699, compare: 999, stock: 35, img: 'photo-1579758629938-03607ccdbaba' },
    { title: 'Heavy Duty Latex Exercise Pull-Up Assist Band (Green)', slug: 'heavy-duty-latex-pull-up-assist-band', vendor: 'pulsefit-gear', price: 799, compare: 1099, stock: 30, img: 'photo-1544367567-0f2fcb009e0b' },
    { title: 'Silicone Grip Ring Hand Exerciser Set of 3 Resistance', slug: 'silicone-grip-ring-hand-exerciser-set', vendor: 'pulsefit-gear', price: 399, compare: 549, stock: 55, img: 'photo-1517836357463-d25dfeac3438' },
  ];

  fitnessList.forEach((it, i) => {
    items.push({
      title: it.title,
      slug: it.slug,
      categorySlug: 'fitness-wellness',
      vendorSlug: it.vendor,
      price: it.price,
      compareAtPrice: it.compare,
      stock: it.stock,
      rating: Number((4.5 + (i % 5) * 0.1).toFixed(1)),
      numReviews: 20 + (i * 3),
      images: [`https://images.unsplash.com/${it.img}?w=800&auto=format&fit=crop&q=80`],
      sku: `NX-FIT-${String(i + 1).padStart(3, '0')}`,
      catalogGroup: it.group || undefined,
      isEcoFriendly: !!it.eco,
      ecoDetails: it.ecoDetail,
      isFeatured: !!it.feat,
      description: `${it.title} engineered to support endurance, daily recovery, and active physical wellness goals.`,
    });
  });

  // 11. PET CARE & TOYS (21 products - includes cross-vendor comparison items)
  const petList = [
    // Comparison Group 8: Pedigree Dentastix Pack
    { title: 'Pedigree Dentastix Daily Dental Chews Medium Dogs 28ct', slug: 'pedigree-dentastix-purepaws', vendor: 'purepaws-naturals', price: 420, compare: 550, stock: 50, group: 'pedigree-dentastix-pack', img: 'photo-1450778869180-41d0601e046e', feat: true },
    { title: 'Pedigree Dentastix Daily Dental Chews (GadgetWorld Superstore)', slug: 'pedigree-dentastix-gadgetworld', vendor: 'gadgetworld-superstore', price: 380, compare: 550, stock: 35, group: 'pedigree-dentastix-pack', img: 'photo-1548199973-03cce0bbc87b', feat: true },
    // Other Pet Products
    { title: 'Natural Cotton Braided Rope Dog Tug Toy 45cm', slug: 'natural-cotton-rope-dog-tug-toy', vendor: 'purepaws-naturals', price: 299, compare: 420, stock: 65, img: 'photo-1450778869180-41d0601e046e', eco: true, ecoDetail: 'Dye-Free 100% Cotton Rope' },
    { title: 'Interactive Feather Teaser Wand with Bell for Cats', slug: 'feather-teaser-wand-bell-cats', vendor: 'purepaws-naturals', price: 249, compare: 350, stock: 70, img: 'photo-1548199973-03cce0bbc87b' },
    { title: 'Non-Skid Stainless Steel Pet Food & Water Bowls Pair', slug: 'non-skid-stainless-pet-bowls-pair', vendor: 'purepaws-naturals', price: 549, compare: 799, stock: 45, img: 'photo-1583337130417-3346a1be7dee' },
    { title: 'Dual-Sided Pet Grooming Undercoat Deshedding Rake Brush', slug: 'dual-sided-pet-grooming-rake-brush', vendor: 'purepaws-naturals', price: 499, compare: 699, stock: 40, img: 'photo-1450778869180-41d0601e046e' },
    { title: 'Hands-Free Dog Training Treat Pouch with Waist Clip', slug: 'hands-free-dog-treat-pouch-waist-clip', vendor: 'purepaws-naturals', price: 399, compare: 549, stock: 50, img: 'photo-1548199973-03cce0bbc87b' },
    { title: 'Organic Catnip Infused Plush Mice Cat Toys 3-Pack', slug: 'organic-catnip-plush-mice-3pack', vendor: 'purepaws-naturals', price: 279, compare: 380, stock: 80, img: 'photo-1583337130417-3346a1be7dee', eco: true, ecoDetail: 'North American Organic Catnip' },
    { title: 'Earth-Friendly Leak-Proof Dog Poop Waste Bags 120ct', slug: 'earth-friendly-dog-poop-bags-120ct', vendor: 'purepaws-naturals', price: 299, compare: 420, stock: 90, img: 'photo-1450778869180-41d0601e046e', eco: true, ecoDetail: 'Cornstarch EPI Biodegradable' },
    { title: 'Padded Reflective Nylon Adjustable Dog Collar (Medium)', slug: 'padded-reflective-nylon-dog-collar', vendor: 'purepaws-naturals', price: 349, compare: 499, stock: 55, img: 'photo-1548199973-03cce0bbc87b' },
    { title: 'Anti-Gulping Slow Feeder Dog Bowl BPA-Free', slug: 'anti-gulping-slow-feeder-dog-bowl', vendor: 'purepaws-naturals', price: 449, compare: 599, stock: 48, img: 'photo-1583337130417-3346a1be7dee' },
    { title: 'Ultra-Soft Fluffy Sherpa Machine Washable Pet Blanket', slug: 'ultra-soft-sherpa-pet-blanket', vendor: 'urbancraft-living', price: 699, compare: 999, stock: 32, img: 'photo-1450778869180-41d0601e046e' },
    { title: 'Two-Way Pet Hair Remover Roller for Furniture & Car', slug: 'two-way-pet-hair-remover-roller', vendor: 'purepaws-naturals', price: 449, compare: 649, stock: 50, img: 'photo-1548199973-03cce0bbc87b' },
    { title: 'Natural Rubber High-Bounce Dog Fetch Balls 2-Pack', slug: 'natural-rubber-dog-fetch-balls-2pack', vendor: 'purepaws-naturals', price: 329, compare: 450, stock: 65, img: 'photo-1583337130417-3346a1be7dee', eco: true, ecoDetail: 'Non-Toxic Natural Rubber' },
    { title: 'Oatmeal & Aloe Vera Soothing Gentle Pet Shampoo 500ml', slug: 'oatmeal-aloe-vera-pet-shampoo-500ml', vendor: 'purepaws-naturals', price: 399, compare: 549, stock: 42, img: 'photo-1450778869180-41d0601e046e', eco: true, ecoDetail: 'Soap-Free Hypoallergenic' },
    { title: 'Portable Collapsible Silicone Travel Pet Bowl with Carabiner', slug: 'collapsible-silicone-pet-travel-bowl', vendor: 'purepaws-naturals', price: 199, compare: 299, stock: 100, img: 'photo-1548199973-03cce0bbc87b' },
    { title: 'Interactive Treat Dispensing Puzzle Game for Dogs', slug: 'interactive-treat-dispensing-puzzle-dog', vendor: 'purepaws-naturals', price: 699, compare: 999, stock: 28, img: 'photo-1583337130417-3346a1be7dee' },
    { title: 'Self-Cleaning Slicker Brush for Dogs & Cats Shedding', slug: 'self-cleaning-slicker-brush-pets', vendor: 'purepaws-naturals', price: 449, compare: 599, stock: 52, img: 'photo-1450778869180-41d0601e046e' },
    { title: 'Durable Squeaky Pineapple Chew Toy for Dogs', slug: 'durable-squeaky-pineapple-chew-toy', vendor: 'purepaws-naturals', price: 399, compare: 550, stock: 45, img: 'photo-1548199973-03cce0bbc87b', eco: true, ecoDetail: 'Non-Toxic Tough Rubber' },
    { title: 'Cat Window Perch Hammock with Heavy Duty Suction Cups', slug: 'cat-window-perch-hammock', vendor: 'urbancraft-living', price: 1199, compare: 1699, stock: 20, img: 'photo-1583337130417-3346a1be7dee' },
    { title: 'Cat Grass Growing Kit Organic with Ceramic Dish', slug: 'cat-grass-growing-kit-organic', vendor: 'purepaws-naturals', price: 349, compare: 480, stock: 55, img: 'photo-1450778869180-41d0601e046e', eco: true, ecoDetail: 'Certified Organic Wheatgrass' },
  ];

  petList.forEach((it, i) => {
    items.push({
      title: it.title,
      slug: it.slug,
      categorySlug: 'pet-care',
      vendorSlug: it.vendor,
      price: it.price,
      compareAtPrice: it.compare,
      stock: it.stock,
      rating: Number((4.5 + (i % 5) * 0.1).toFixed(1)),
      numReviews: 18 + (i * 3),
      images: [`https://images.unsplash.com/${it.img}?w=800&auto=format&fit=crop&q=80`],
      sku: `NX-PET-${String(i + 1).padStart(3, '0')}`,
      catalogGroup: it.group || undefined,
      isEcoFriendly: !!it.eco,
      ecoDetails: it.ecoDetail,
      isFeatured: !!it.feat,
      description: `${it.title} designed for beloved pets with verified non-toxic materials, safety testing, and healthy fun.`,
    });
  });

  // 12. REUSABLE & ECO-FRIENDLY ESSENTIALS (21 products - includes cross-vendor comparison items)
  const ecoList = [
    // Comparison Group 9: Organic Cotton Tote
    { title: 'Organic Cotton Reusable Canvas Shopping Tote (Natural)', slug: 'organic-cotton-tote-ecoliving', vendor: 'ecoliving-earth-essentials', price: 499, compare: 699, stock: 60, group: 'organic-cotton-tote', img: 'photo-1544816155-12df9643f363', feat: true, ecoDetail: 'GOTS Certified Organic Canvas' },
    { title: 'Organic Cotton Reusable Canvas Shopping Tote (UrbanCraft Edition)', slug: 'organic-cotton-tote-urbancraft', vendor: 'urbancraft-living', price: 399, compare: 699, stock: 45, group: 'organic-cotton-tote', img: 'photo-1597484661643-2f5fef640dd1', feat: true, ecoDetail: 'GOTS Certified Organic Canvas' },
    // Other Eco Products
    { title: 'Bamboo Fiber Reusable Travel Coffee Mug with Silicone Lid 400ml', slug: 'bamboo-fiber-travel-coffee-mug-400ml', vendor: 'ecoliving-earth-essentials', price: 449, compare: 649, stock: 55, img: 'photo-1517256064527-09c73fc73e38', ecoDetail: 'Biodegradable Bamboo Composite' },
    { title: 'Organic Cotton Mesh Grocery Produce Bags Set of 6', slug: 'cotton-mesh-produce-bags-set-of-6', vendor: 'ecoliving-earth-essentials', price: 399, compare: 549, stock: 75, img: 'photo-1544816155-12df9643f363', ecoDetail: 'Zero Plastic Produce Netting' },
    { title: 'Natural Beeswax Food Wraps Sustainable Cling-Film Alternative 3-Pack', slug: 'natural-beeswax-food-wraps-3pack', vendor: 'ecoliving-earth-essentials', price: 549, compare: 799, stock: 50, img: 'photo-1556911220-bff31c812dba', ecoDetail: 'Organic Cotton & Local Wax' },
    { title: 'Stainless Steel Extra Wide Reusable Straws Set of 4 with Brush', slug: 'stainless-steel-reusable-straws-set', vendor: 'ecoliving-earth-essentials', price: 299, compare: 420, stock: 90, img: 'photo-1544816155-12df9643f363', ecoDetail: 'Rust-Proof 304 Steel' },
    { title: 'Plant-Based Biodegradable Dental Floss in Refillable Glass Jar', slug: 'biodegradable-dental-floss-glass-jar', vendor: 'ecoliving-earth-essentials', price: 249, compare: 350, stock: 80, img: 'photo-1608571423902-eed4a5ad8108', ecoDetail: 'Cornstarch Fiber & Candelilla Wax' },
    { title: 'Handcrafted Neem Wood Wide Tooth Anti-Static Hair Comb', slug: 'handcrafted-neem-wood-comb', vendor: 'ecoliving-earth-essentials', price: 199, compare: 299, stock: 100, img: 'photo-1608248543803-ba4f8c70ae0b', ecoDetail: 'Herbal Neem Wood Anti-Bacterial' },
    { title: 'Natural Coconut Coir Kitchen Scrubbing Pads 4-Pack', slug: 'coconut-coir-scrubbing-pads-4pack', vendor: 'ecoliving-earth-essentials', price: 229, compare: 320, stock: 85, img: 'photo-1585421514284-efb74c2b69ba', ecoDetail: '100% Compostable Coconut Husk' },
    { title: 'Solid Zero-Waste Dish Washing Soap Bar 150g with Wooden Tray', slug: 'zero-waste-dish-washing-soap-bar', vendor: 'ecoliving-earth-essentials', price: 349, compare: 480, stock: 65, img: 'photo-1563453392212-326f5e854473', ecoDetail: 'Plastic-Free Palm-Free' },
    { title: 'Biodegradable Bamboo Charcoal Dental Floss Picks 50-Pack', slug: 'bamboo-charcoal-floss-picks-50pack', vendor: 'ecoliving-earth-essentials', price: 299, compare: 399, stock: 70, img: 'photo-1608571423902-eed4a5ad8108', ecoDetail: 'Zero Plastic PLA & Bamboo' },
    { title: 'Reusable Silicone Stand-Up Food Storage Pouches 4-Pack', slug: 'reusable-silicone-food-pouches-4pack', vendor: 'ecoliving-earth-essentials', price: 699, compare: 999, stock: 40, img: 'photo-1556912172-45b7abe8b7e1', ecoDetail: 'Food-Grade Platinum Silicone' },
    { title: 'Zero-Waste Natural Deodorant Stick Cardboard Push-Up 75g', slug: 'zero-waste-natural-deodorant-stick', vendor: 'ecoliving-earth-essentials', price: 399, compare: 549, stock: 45, img: 'photo-1608248543803-ba4f8c70ae0b', ecoDetail: 'Aluminum-Free Cardboard Packaging' },
    { title: 'Hand-Carved Coconut Shell Bowls with Wooden Spoons Pair', slug: 'hand-carved-coconut-shell-bowls-pair', vendor: 'ecoliving-earth-essentials', price: 499, compare: 699, stock: 50, img: 'photo-1616486029423-aaa4789e8c9a', ecoDetail: 'Reclaimed Natural Coconut Shell' },
    { title: 'Natural Loofah Body Exfoliator Sponges Pack of 3', slug: 'natural-loofah-body-sponges-3pack', vendor: 'ecoliving-earth-essentials', price: 249, compare: 349, stock: 80, img: 'photo-1556228720-195a672e8a03', ecoDetail: '100% Egyptian Loofah Plant' },
    { title: 'Compostable Bamboo Fiber Bandages 25 Count', slug: 'compostable-bamboo-fiber-bandages-25ct', vendor: 'ecoliving-earth-essentials', price: 299, compare: 399, stock: 60, img: 'photo-1608571423902-eed4a5ad8108', ecoDetail: 'Biodegradable Organic Bamboo' },
    { title: 'Eco-Friendly Laundry Detergent Sheets 60 Loads Plastic-Free', slug: 'eco-laundry-detergent-sheets-60loads', vendor: 'ecoliving-earth-essentials', price: 499, compare: 699, stock: 50, img: 'photo-1563453392212-326f5e854473', ecoDetail: 'Ultra-Concentrated Zero Plastic Jug' },
    { title: 'Wheat Straw Fiber Dinnerware Set for 4 Shatterproof', slug: 'wheat-straw-dinnerware-set-for-4', vendor: 'ecoliving-earth-essentials', price: 899, compare: 1299, stock: 35, img: 'photo-1556911220-bff31c812dba', ecoDetail: 'Natural Agricultural Wheat Byproduct' },
    { title: 'Solar-Powered Ambient LED Garden Lantern Waterproof', slug: 'solar-powered-ambient-garden-lantern', vendor: 'ecoliving-earth-essentials', price: 999, compare: 1399, stock: 30, img: 'photo-1512496015851-a90fb38ba796', ecoDetail: 'Solar Energy Powered' },
    { title: 'Reusable Organic Cotton Makeup Remover Rounds 12-Pack with Mesh Bag', slug: 'reusable-cotton-makeup-remover-rounds', vendor: 'ecoliving-earth-essentials', price: 349, compare: 480, stock: 70, img: 'photo-1556228720-195a672e8a03', ecoDetail: 'Washable & Reusable 1000+ Times' },
    { title: 'Biodegradable Plant-Based Dog Waste Bags with Cornstarch 120ct', slug: 'biodegradable-dog-waste-bags-120ct', vendor: 'ecoliving-earth-essentials', price: 329, compare: 450, stock: 85, img: 'photo-1450778869180-41d0601e046e', ecoDetail: 'TUV Certified Home Compostable' },
  ];

  ecoList.forEach((it, i) => {
    items.push({
      title: it.title,
      slug: it.slug,
      categorySlug: 'eco-friendly',
      vendorSlug: it.vendor,
      price: it.price,
      compareAtPrice: it.compare,
      stock: it.stock,
      rating: Number((4.7 + (i % 3) * 0.1).toFixed(1)),
      numReviews: 25 + (i * 3),
      images: [`https://images.unsplash.com/${it.img}?w=800&auto=format&fit=crop&q=80`],
      sku: `NX-ECO-${String(i + 1).padStart(3, '0')}`,
      catalogGroup: it.group || undefined,
      isEcoFriendly: true,
      ecoDetails: it.ecoDetail,
      isFeatured: !!it.feat,
      description: `${it.title} certified 100% sustainable, plastic-free everyday lifestyle alternative supporting eco-conscious zero-waste habits.`,
    });
  });

  return items;
}

// ==============================================================================
// MAIN IDEMPOTENT SEED EXECUTION
// ==============================================================================
async function main() {
  console.log('🌱 Starting Idempotent NexStore Marketplace Seeding...');
  console.log('🔒 Note: Non-destructive seed. Existing records will be preserved/upserted.\n');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Upsert Core Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { name: 'Pooja Verma (Admin)', role: 'ADMIN', isActive: true },
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Pooja Verma (Admin)',
      phone: '+91 9999900001',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: { name: 'Priya Sharma', role: 'CUSTOMER', isActive: true },
    create: {
      email: 'customer@example.com',
      password: hashedPassword,
      name: 'Priya Sharma',
      phone: '+91 9876543210',
      role: 'CUSTOMER',
      isActive: true,
    },
  });

  // Ensure customer has a cart
  await prisma.cart.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: { userId: customerUser.id },
  });

  // 2. Upsert Customer Saved Delivery Address
  let customerAddress = await prisma.address.findFirst({
    where: { userId: customerUser.id, isDefault: true },
  });
  if (!customerAddress) {
    customerAddress = await prisma.address.create({
      data: {
        userId: customerUser.id,
        fullName: 'Priya Sharma',
        phone: '+91 9876543210',
        street: 'Flat 402, Green Meadows, 12th Main, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
        isDefault: true,
      },
    });
  }

  // 3. Upsert 6 Demo Vendors & their Users
  const vendorMap = new Map<string, any>();
  for (const vData of demoVendorsData) {
    const vUser = await prisma.user.upsert({
      where: { email: vData.email },
      update: { name: vData.name, role: 'VENDOR', isActive: true },
      create: {
        email: vData.email,
        password: hashedPassword,
        name: vData.name,
        phone: vData.phone,
        role: 'VENDOR',
        isActive: true,
      },
    });

    const vendor = await prisma.vendor.upsert({
      where: { slug: vData.slug },
      update: {
        storeName: vData.storeName,
        description: vData.description,
        logo: vData.logo,
        banner: vData.banner,
        status: vData.status,
        trustScore: vData.trustScore,
        rating: vData.rating,
        totalReviews: vData.totalReviews,
        successfulOrders: vData.successfulOrders,
        cancelledOrders: vData.cancelledOrders,
        onTimeDeliveries: vData.onTimeDeliveries,
        isEcoFriendlyCertified: vData.isEcoFriendlyCertified,
      },
      create: {
        userId: vUser.id,
        storeName: vData.storeName,
        slug: vData.slug,
        description: vData.description,
        logo: vData.logo,
        banner: vData.banner,
        phone: vData.phone,
        status: vData.status,
        trustScore: vData.trustScore,
        rating: vData.rating,
        totalReviews: vData.totalReviews,
        successfulOrders: vData.successfulOrders,
        cancelledOrders: vData.cancelledOrders,
        onTimeDeliveries: vData.onTimeDeliveries,
        isEcoFriendlyCertified: vData.isEcoFriendlyCertified,
      },
    });

    vendorMap.set(vData.slug, vendor);
  }
  console.log(`✓ Upserted ${demoVendorsData.length} Demo Vendors.`);

  // 4. Upsert 12 Categories
  const categoryMap = new Map<string, any>();
  for (const cData of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cData.slug },
      update: {
        name: cData.name,
        description: cData.description,
        image: cData.image,
      },
      create: {
        name: cData.name,
        slug: cData.slug,
        description: cData.description,
        image: cData.image,
      },
    });
    categoryMap.set(cData.slug, category);
  }

  // Also support legacy category mappings
  for (const [alias, targetSlug] of Object.entries(categoryAliases)) {
    const target = categoryMap.get(targetSlug);
    if (target) {
      categoryMap.set(alias, target);
    }
  }
  console.log(`✓ Upserted ${categoriesData.length} Marketplace Categories.`);

  // 5. Upsert Promotional Coupons
  const couponsData = [
    {
      code: 'WELCOME10',
      description: '10% discount on entire marketplace cart for new shoppers',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 500,
      maxDiscount: 1000,
      isEcoOnly: false,
    },
    {
      code: 'MEGA500',
      description: 'Flat ₹500 instant discount on multi-vendor carts above ₹3,000',
      discountType: 'FIXED',
      discountValue: 500,
      minOrderAmount: 3000,
      isEcoOnly: false,
    },
    {
      code: 'ECOGREEN15',
      description: 'Extra 15% discount exclusively on eco-friendly certified products',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minOrderAmount: 800,
      maxDiscount: 1500,
      isEcoOnly: true,
    },
    {
      code: 'FREESHIP',
      description: 'Free multi-vendor shipping waiver on orders above ₹1,000',
      discountType: 'FIXED',
      discountValue: 50,
      minOrderAmount: 1000,
      isEcoOnly: false,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }
  console.log(`✓ Upserted ${couponsData.length} Marketplace Coupons.`);

  // 6. Upsert 240+ Products Idempotently
  const rawCatalog = buildCatalog();
  let createdCount = 0;
  let updatedCount = 0;

  for (const prod of rawCatalog) {
    const category = categoryMap.get(prod.categorySlug);
    const vendor = vendorMap.get(prod.vendorSlug);

    if (!category || !vendor) {
      console.warn(`Warning: missing category ${prod.categorySlug} or vendor ${prod.vendorSlug}`);
      continue;
    }

    const discountPercent = prod.compareAtPrice && prod.compareAtPrice > prod.price
      ? Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100)
      : 0;

    const dataPayload = {
      vendorId: vendor.id,
      categoryId: category.id,
      title: prod.title,
      description: prod.description,
      price: prod.price,
      compareAtPrice: prod.compareAtPrice || null,
      discountPercent,
      stock: prod.stock,
      images: JSON.stringify(prod.images),
      sku: prod.sku,
      catalogGroup: prod.catalogGroup || null,
      isEcoFriendly: prod.isEcoFriendly,
      ecoDetails: prod.ecoDetails || null,
      rating: prod.rating,
      numReviews: prod.numReviews,
      isActive: true,
      isFeatured: !!prod.isFeatured,
    };

    const existing = await prisma.product.findUnique({
      where: { slug: prod.slug },
    });

    if (existing) {
      await prisma.product.update({
        where: { slug: prod.slug },
        data: dataPayload,
      });
      updatedCount++;
    } else {
      await prisma.product.create({
        data: {
          slug: prod.slug,
          ...dataPayload,
        },
      });
      createdCount++;
    }
  }

  console.log(`✓ Product seeding finished. Created new: ${createdCount}, Refreshed existing: ${updatedCount}. Total catalog items: ${rawCatalog.length}`);

  // 7. Seed Demo Delivered Order & Consistent Verified Reviews
  // This proves review verification works out-of-the-box for customerUser!
  const sonyProduct = await prisma.product.findUnique({ where: { slug: 'sony-wh1000xm5-electrohub' } });
  const bentoProduct = await prisma.product.findUnique({ where: { slug: 'stainless-steel-bento-box-ecoliving' } });

  if (sonyProduct && bentoProduct && customerAddress) {
    const demoOrderNumber = 'ORD-DEMO-DELIVERED-001';
    let demoOrder = await prisma.order.findUnique({ where: { orderNumber: demoOrderNumber } });

    if (!demoOrder) {
      const vElectro = vendorMap.get('electrohub-direct')!;
      const vEco = vendorMap.get('ecoliving-earth-essentials')!;

      demoOrder = await prisma.order.create({
        data: {
          orderNumber: demoOrderNumber,
          userId: customerUser.id,
          addressId: customerAddress.id,
          subtotal: sonyProduct.price + bentoProduct.price,
          discount: 0,
          shippingFee: 0,
          totalAmount: sonyProduct.price + bentoProduct.price,
          paymentStatus: 'PAID',
          paymentMethod: 'DEMO_SIMULATED',
          orderStatus: 'DELIVERED', // Crucial for qualifying verified purchase
          notes: 'Sample historical delivered order for Priya Sharma to verify reviews',
        },
      });

      // Sub-orders
      const sub1 = await prisma.vendorOrder.create({
        data: {
          orderId: demoOrder.id,
          vendorId: vElectro.id,
          subtotal: sonyProduct.price,
          commission: sonyProduct.price * 0.05,
          vendorEarnings: sonyProduct.price * 0.95,
          status: 'DELIVERED',
          deliveredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.orderItem.create({
        data: {
          orderId: demoOrder.id,
          vendorOrderId: sub1.id,
          productId: sonyProduct.id,
          vendorId: vElectro.id,
          title: sonyProduct.title,
          price: sonyProduct.price,
          quantity: 1,
          subtotal: sonyProduct.price,
          image: JSON.parse(sonyProduct.images)[0],
          isEcoFriendly: false,
        },
      });

      const sub2 = await prisma.vendorOrder.create({
        data: {
          orderId: demoOrder.id,
          vendorId: vEco.id,
          subtotal: bentoProduct.price,
          commission: bentoProduct.price * 0.05,
          vendorEarnings: bentoProduct.price * 0.95,
          status: 'DELIVERED',
          deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.orderItem.create({
        data: {
          orderId: demoOrder.id,
          vendorOrderId: sub2.id,
          productId: bentoProduct.id,
          vendorId: vEco.id,
          title: bentoProduct.title,
          price: bentoProduct.price,
          quantity: 1,
          subtotal: bentoProduct.price,
          image: JSON.parse(bentoProduct.images)[0],
          isEcoFriendly: true,
        },
      });

      // Consistent demo verified review
      await prisma.review.upsert({
        where: {
          userId_productId: {
            userId: customerUser.id,
            productId: sonyProduct.id,
          },
        },
        update: {},
        create: {
          userId: customerUser.id,
          productId: sonyProduct.id,
          rating: 5,
          comment: 'Outstanding noise cancellation and comfortable fit for long flights. Arrived on-time from ElectroHub in perfect condition!',
          isVerifiedPurchase: true,
        },
      });
      console.log('✓ Seeded consistent delivered order & verified customer review.');
    }
  }

  // ==============================================================================
  // CATALOGUE INTEGRITY CHECK (AS REQUIRED BY SPECIFICATION)
  // ==============================================================================
  console.log('\n======================================================');
  console.log('📊 CATALOGUE INTEGRITY AUDIT');
  console.log('======================================================');

  const totalProducts = await prisma.product.count({ where: { isActive: true } });
  const allCategories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: { where: { isActive: true } } },
      },
    },
    orderBy: { name: 'asc' },
  });

  console.log(`Total Active Products in Database: ${totalProducts} (Target: >= 240)`);
  console.log('\nCategory Breakdown:');
  let emptyCategoryCount = 0;
  for (const cat of allCategories) {
    const count = cat._count.products;
    const status = count > 0 ? '✓' : '✗ EMPTY';
    console.log(`  ${status} ${cat.name} (${cat.slug}): ${count} products`);
    if (count === 0) emptyCategoryCount++;
  }

  const comparisonGroups = await prisma.product.groupBy({
    by: ['catalogGroup'],
    where: {
      catalogGroup: { not: null },
      isActive: true,
    },
    _count: { id: true },
  });

  console.log(`\nActive Cross-Vendor Price Comparison Groups: ${comparisonGroups.length}`);
  for (const g of comparisonGroups) {
    console.log(`  • Group "${g.catalogGroup}": ${g._count.id} competing seller listings`);
  }

  console.log('======================================================');
  if (totalProducts < 240) {
    throw new Error(`Catalogue integrity failed: only ${totalProducts} products found, minimum 240 required.`);
  }
  if (emptyCategoryCount > 0) {
    throw new Error(`Catalogue integrity failed: ${emptyCategoryCount} categories have zero products.`);
  }
  console.log('🎉 Catalogue Integrity Verified! All 240+ products and 12 categories are active.\n');
}

main()
  .catch((e) => {
    console.error('Seed execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
