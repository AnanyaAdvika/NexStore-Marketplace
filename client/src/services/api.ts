const configuredApiUrl = String((import.meta as any).env?.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

// Robust API Base URL resolution:
// 1. If VITE_API_BASE_URL is provided in environment variables, normalize and use it.
// 2. Otherwise default to '/api', which works seamlessly with the Vite local proxy in dev
//    and with reverse-proxy / same-domain deployments in production.
// NEVER fall back to dead, stale preview URLs.
const BASE_URL =
  configuredApiUrl && configuredApiUrl !== '/api'
    ? (configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`)
    : '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      `Cannot connect to the marketplace API at ${BASE_URL || '/api'}. Please verify the backend server is running.`
    );
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      `The API returned an unexpected non-JSON response (${response.status}) from ${BASE_URL}${endpoint}. Check the backend service configuration.`
    );
  }

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Auth
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),
  updateProfile: (data: any) => request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Products
  getProducts: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return request<any>(`/products${query}`);
  },
  getProduct: (idOrSlug: string) => request<any>(`/products/${idOrSlug}`),
  getFeaturedProducts: () => request<any>('/products/featured'),
  getCategories: () => request<any>('/products/categories'),
  getProductDeals: (id: string) => request<any>(`/products/deals/${id}`),

  // Deals
  getBestDeals: () => request<any>('/deals/best-deals'),

  // Cart
  getCart: () => request<any>('/cart'),
  addToCart: (productId: string, quantity = 1) =>
    request<any>('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateCartQty: (itemId: string, quantity: number) =>
    request<any>(`/cart/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeCartItem: (itemId: string) => request<any>(`/cart/items/${itemId}`, { method: 'DELETE' }),
  clearCart: () => request<any>('/cart', { method: 'DELETE' }),
  switchVendor: (cartItemId: string, targetProductId: string) =>
    request<any>('/cart/switch-vendor', { method: 'POST', body: JSON.stringify({ cartItemId, targetProductId }) }),

  // Orders
  createOrder: (orderData: any) =>
    request<any>('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getCustomerOrders: () => request<any>('/orders'),
  getOrderById: (id: string) => request<any>(`/orders/${id}`),
  cancelOrder: (id: string) => request<any>(`/orders/${id}/cancel`, { method: 'POST' }),

  // Coupons
  getActiveCoupons: () => request<any>('/coupons/active'),
  validateCoupon: (code: string, orderAmount: number, hasEcoItems: boolean) =>
    request<any>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, orderAmount, hasEcoItems }),
    }),

  // Reviews
  addReview: (productId: string, rating: number, comment: string) =>
    request<any>('/reviews', { method: 'POST', body: JSON.stringify({ productId, rating, comment }) }),
  getProductReviews: (productId: string) => request<any>(`/reviews/product/${productId}`),
  checkReviewEligibility: (productId: string) => request<any>(`/reviews/eligibility/${productId}`),

  // Addresses
  getAddresses: () => request<any>('/addresses'),
  addAddress: (data: any) => request<any>('/addresses', { method: 'POST', body: JSON.stringify(data) }),
  deleteAddress: (id: string) => request<any>(`/addresses/${id}`, { method: 'DELETE' }),

  // Wishlist
  getWishlist: () => request<any>('/wishlist'),
  toggleWishlist: (productId: string) =>
    request<any>('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ productId }) }),

  // Vendors (Public)
  getVendors: () => request<any>('/vendors'),
  getVendorBySlug: (slug: string) => request<any>(`/vendors/${slug}`),

  // Vendor Dashboard
  getVendorAnalytics: () => request<any>('/vendors/dashboard/analytics'),
  getVendorProducts: () => request<any>('/vendors/dashboard/products'),
  createVendorProduct: (data: any) =>
    request<any>('/vendors/dashboard/products', { method: 'POST', body: JSON.stringify(data) }),
  updateVendorProduct: (id: string, data: any) =>
    request<any>(`/vendors/dashboard/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVendorProduct: (id: string) =>
    request<any>(`/vendors/dashboard/products/${id}`, { method: 'DELETE' }),
  getVendorOrders: () => request<any>('/vendors/dashboard/orders'),
  updateVendorOrderStatus: (id: string, data: { status: string; trackingNumber?: string; shippingCarrier?: string }) =>
    request<any>(`/vendors/dashboard/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Admin Dashboard
  getAdminAnalytics: () => request<any>('/admin/analytics'),
  getAdminVendors: () => request<any>('/admin/vendors'),
  updateVendorStatus: (id: string, payload: string | { status?: string; isEcoFriendlyCertified?: boolean }) =>
    request<any>(`/admin/vendors/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(typeof payload === 'string' ? { status: payload } : payload),
    }),
  getAdminCustomers: () => request<any>('/admin/customers'),
  toggleCustomerStatus: (id: string) =>
    request<any>(`/admin/customers/${id}/status`, { method: 'PUT' }),
  getAdminOrders: () => request<any>('/admin/orders'),
  getAdminReviews: () => request<any>('/admin/reviews'),
  deleteReview: (id: string) => request<any>(`/admin/reviews/${id}`, { method: 'DELETE' }),
  createCategory: (data: any) =>
    request<any>('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),

  // System
  getHealth: () => request<any>('/health'),
};
