import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { WishlistProvider } from './context/WishlistContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { ComparisonProvider } from './context/ComparisonContext.js';
import { PriceWatchProvider } from './context/PriceWatchContext.js';
import { ProductComparisonDrawer } from './components/customer/ProductComparisonDrawer.js';

// Common Components
import { Navbar } from './components/common/Navbar.js';
import { Footer } from './components/common/Footer.js';

// Public & Customer Pages
import { Home } from './pages/Home.js';
import { Products } from './pages/Products.js';
import { ProductDetail } from './pages/ProductDetail.js';
import { Cart } from './pages/Cart.js';
import { Checkout } from './pages/Checkout.js';
import { Orders } from './pages/Orders.js';
import { OrderDetail } from './pages/OrderDetail.js';
import { Wishlist } from './pages/Wishlist.js';
import { Login } from './pages/Login.js';
import { Signup } from './pages/Signup.js';
import { NotFound } from './pages/NotFound.js';

// Vendor Pages
import { VendorDashboard } from './pages/vendor/VendorDashboard.js';
import { VendorProducts } from './pages/vendor/VendorProducts.js';
import { VendorProductForm } from './pages/vendor/VendorProductForm.js';
import { VendorOrders } from './pages/vendor/VendorOrders.js';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { AdminVendors } from './pages/admin/AdminVendors.js';
import { AdminOrders } from './pages/admin/AdminOrders.js';
import { AdminReviews } from './pages/admin/AdminReviews.js';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${returnUrl}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              <ComparisonProvider>
                <PriceWatchProvider>
                  <div className="min-h-screen flex flex-col bg-slate-50">
                    <Navbar />
                    <div className="flex-1">
                      <Routes>
                        {/* Public Storefront */}
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/:slug" element={<ProductDetail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        {/* Customer Protected */}
                        <Route path="/cart" element={<Cart />} />
                        <Route
                          path="/checkout"
                          element={
                            <ProtectedRoute allowedRoles={['CUSTOMER']}>
                              <Checkout />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/orders"
                          element={
                            <ProtectedRoute allowedRoles={['CUSTOMER']}>
                              <Orders />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/orders/:id"
                          element={
                            <ProtectedRoute>
                              <OrderDetail />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/wishlist"
                          element={
                            <ProtectedRoute allowedRoles={['CUSTOMER']}>
                              <Wishlist />
                            </ProtectedRoute>
                          }
                        />

                        {/* Vendor Dashboard */}
                        <Route
                          path="/vendor/dashboard"
                          element={
                            <ProtectedRoute allowedRoles={['VENDOR']}>
                              <VendorDashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/products"
                          element={
                            <ProtectedRoute allowedRoles={['VENDOR']}>
                              <VendorProducts />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/products/new"
                          element={
                            <ProtectedRoute allowedRoles={['VENDOR']}>
                              <VendorProductForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/products/edit/:id"
                          element={
                            <ProtectedRoute allowedRoles={['VENDOR']}>
                              <VendorProductForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/vendor/orders"
                          element={
                            <ProtectedRoute allowedRoles={['VENDOR']}>
                              <VendorOrders />
                            </ProtectedRoute>
                          }
                        />

                        {/* Admin Dashboard */}
                        <Route
                          path="/admin/dashboard"
                          element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                              <AdminDashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/vendors"
                          element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                              <AdminVendors />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/orders"
                          element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                              <AdminOrders />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/reviews"
                          element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                              <AdminReviews />
                            </ProtectedRoute>
                          }
                        />

                        {/* Fallback 404 */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                    <Footer />
                    <ProductComparisonDrawer />
                  </div>
                </PriceWatchProvider>
              </ComparisonProvider>
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
