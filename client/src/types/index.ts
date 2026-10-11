export type UserRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive?: boolean;
  vendor?: Vendor;
}

export interface TrustMetrics {
  trustScore: number;
  badge: 'TOP_RATED' | 'VERIFIED' | 'STANDARD';
  badgeLabel: string;
  ratingScore: number;
  fulfillmentRate: number;
  onTimeRate: number;
}

export interface Vendor {
  id: string;
  userId?: string;
  storeName: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  banner?: string | null;
  phone?: string | null;
  address?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  trustScore: number;
  rating: number;
  totalReviews: number;
  successfulOrders: number;
  cancelledOrders: number;
  onTimeDeliveries: number;
  isEcoFriendlyCertified: boolean;
  trustMetrics?: TrustMetrics;
  user?: {
    name: string;
    email: string;
    createdAt?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  vendorId: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  discountPercent: number;
  stock: number;
  images: string[];
  sku?: string | null;
  catalogGroup?: string | null;
  isEcoFriendly: boolean;
  ecoDetails?: string | null;
  rating: number;
  numReviews: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  vendor: {
    id: string;
    storeName: string;
    slug: string;
    trustScore: number;
    rating: number;
    isEcoFriendlyCertified?: boolean;
    trustMetrics?: TrustMetrics;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  dealsComparison?: DealsComparison;
  reviews?: Review[];
}

export interface VendorAlternative {
  productId: string;
  vendorId: string;
  storeName: string;
  vendorTrustScore: number;
  vendorRating: number;
  vendorBadge: string;
  price: number;
  compareAtPrice?: number | null;
  discountPercent: number;
  stock: number;
  isEcoFriendly: boolean;
  isCurrentItem: boolean;
  isBestDeal: boolean;
  savingsVsCurrent: number;
}

export interface DealsComparison {
  currentProduct: Product;
  deals: VendorAlternative[];
  bestDealPrice: number;
  maxPossibleSavings: number;
}

export interface CompetitiveDealItem {
  groupName: string;
  title: string;
  category: string;
  cheapestPrice: number;
  highestPrice: number;
  maxSavings: number;
  savingsPercent: number;
  cheapestVendor: {
    id: string;
    storeName: string;
    trustMetrics: TrustMetrics;
  };
  cheapestProduct: {
    id: string;
    slug: string;
    images: string[];
    isEcoFriendly: boolean;
  };
  totalVendorsCompeting: number;
}

export interface CartItemProduct {
  id: string;
  productId: string;
  quantity: number;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  isEcoFriendly: boolean;
  ecoDetails?: string | null;
  images: string[];
  subtotal: number;
}

export interface CartVendorGroup {
  vendor: {
    id: string;
    storeName: string;
    slug: string;
    trustMetrics: TrustMetrics;
  };
  items: CartItemProduct[];
  subtotal: number;
}

export interface SmartCartSavingItem {
  cartItemId: string;
  currentProductId: string;
  productTitle: string;
  currentVendorId: string;
  currentVendorName: string;
  currentPrice: number;
  quantity: number;
  cheaperAlternative: {
    productId: string;
    productTitle: string;
    vendorId: string;
    vendorName: string;
    price: number;
    pricePerUnitDiff: number;
    totalSavings: number;
    vendorTrustScore: number;
    vendorBadge: string;
  } | null;
}

export interface SmartCartSavingsSummary {
  items: SmartCartSavingItem[];
  totalAlternativeSavings: number;
  hasCheaperAlternatives: boolean;
  recommendedCoupons: Array<{
    code: string;
    description: string | null;
    estimatedDiscount: number;
  }>;
}

export interface CartResponse {
  cartId: string;
  grandSubtotal: number;
  totalItemsCount: number;
  hasEcoFriendlyItems: boolean;
  vendorGroups: CartVendorGroup[];
  savingsAnalysis: SmartCartSavingsSummary;
}

export interface OrderItem {
  id: string;
  orderId: string;
  vendorOrderId?: string | null;
  productId: string;
  vendorId: string;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
  image?: string | null;
  isEcoFriendly: boolean;
  product?: {
    id: string;
    slug: string;
  };
}

export interface VendorOrder {
  id: string;
  orderId: string;
  vendorId: string;
  subtotal: number;
  shippingFee: number;
  commission: number;
  vendorEarnings: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  trackingNumber?: string | null;
  shippingCarrier?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  vendor: {
    id: string;
    storeName: string;
    slug: string;
    trustScore: number;
    logo?: string | null;
    phone?: string | null;
  };
  orderItems: OrderItem[];
  order?: {
    orderNumber: string;
    createdAt: string;
    paymentStatus: string;
    paymentMethod: string;
    address?: Address;
    user?: {
      name: string;
      email: string;
      phone?: string | null;
    };
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  addressId?: string | null;
  subtotal: number;
  discount: number;
  couponCode?: string | null;
  tax: number;
  shippingFee: number;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  paymentMethod: string;
  orderStatus: 'PLACED' | 'PROCESSING' | 'PARTIALLY_SHIPPED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  notes?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  address?: Address | null;
  vendorOrders: VendorOrder[];
  orderItems?: OrderItem[];
  payment?: {
    id: string;
    amount: number;
    provider: string;
    transactionId?: string | null;
    status: string;
  } | null;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  isActive: boolean;
  isEcoOnly: boolean;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: Product;
}
