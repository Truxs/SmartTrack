import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './admin/context/AdminAuthContext';

/* Admin (isolated) */
import AdminLayout from './admin/layouts/AdminLayout';

import AdminDashboard from './admin/pages/Dashboard';
import AdminProducts from './admin/pages/Products';
import AdminOrders from './admin/pages/Orders';
import AdminCheckout from './admin/pages/Checkout';
import AdminSuppliers from './admin/pages/Suppliers';
import AdminSupplierDetail from './admin/pages/SupplierDetail';
import AdminPurchaseOrders from './admin/pages/PurchaseOrders';
import AdminStockAdjustments from './admin/pages/StockAdjustments';
import AdminReports from './admin/pages/Reports';

// Report sub-pages
import InventoryValuation from './admin/pages/reports/InventoryValuation';
import StockMovement from './admin/pages/reports/StockMovement';
import LowStockReport from './admin/pages/reports/LowStockReport';
import ExpiryReport from './admin/pages/reports/ExpiryReport';
import WasteAnalysis from './admin/pages/reports/WasteAnalysis';

/* User Pages - Keep untouched! */
import Login from './pages/Login';
import StoreFront from './pages/user/StoreFront';
import UserDashboard from './pages/user/UserDashboard';
import UserCheckout from './pages/user/Checkout';

/* Route guard — redirects based on auth state */
const ProtectedRoute = ({ children, requireAdmin }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', border: '3px solid #dbeafe', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading...</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!user) return <Navigate to="/login" />;
    if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" />;
    if (!requireAdmin && user.role === 'admin') return <Navigate to="/admin" />;
    return children;
};

const AdminProtectedRoute = ({ children }) => {
    const { adminUser, loading } = useAdminAuth();

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', border: '3px solid #dbeafe', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading...</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!adminUser) return <Navigate to="/login" />;
    if (adminUser.role !== 'admin') return <Navigate to="/dashboard" />;
    return children;
};

const UserAuthProviderRoute = () => (
    <AuthProvider>
        <Outlet />
    </AuthProvider>
);

const AdminAuthProviderRoute = () => (
    <AdminAuthProvider>
        <Outlet />
    </AdminAuthProvider>
);

function App() {
    return (
        <Router>
            <Routes>
                {/* User app tree (kept untouched except for provider placement) */}
                <Route element={<UserAuthProviderRoute />}>
                    {/* Public */}
                    <Route path="/login" element={<Login />} />

                    {/* User Routes */}
                    <Route path="/" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute><UserCheckout /></ProtectedRoute>} />
                    <Route path="/store" element={<ProtectedRoute><StoreFront /></ProtectedRoute>} />
                    <Route path="/wishlist" element={<ProtectedRoute><div style={{ padding: '24px' }}><h1 style={{ fontSize: '24px', fontWeight: 700 }}>Wishlist</h1></div></ProtectedRoute>} />
                </Route>

                {/* Admin app tree (fully isolated under src/admin/) */}
                <Route element={<AdminAuthProviderRoute />}>
                    <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="suppliers" element={<AdminSuppliers />} />
                        <Route path="suppliers/new" element={<div>Add Supplier Form</div>} />
                        <Route path="suppliers/:id" element={<AdminSupplierDetail />} />
                        <Route path="suppliers/:id/edit" element={<div>Edit Supplier Form</div>} />
                        <Route path="purchase-orders" element={<AdminPurchaseOrders />} />
                        <Route path="stock-adjustments" element={<AdminStockAdjustments />} />
                        <Route path="reports" element={<AdminReports />}>
                            <Route index element={<Navigate to="inventory" replace />} />
                            <Route path="inventory" element={<InventoryValuation />} />
                            <Route path="movement" element={<StockMovement />} />
                            <Route path="low-stock" element={<LowStockReport />} />
                            <Route path="expiry" element={<ExpiryReport />} />
                            <Route path="waste" element={<WasteAnalysis />} />
                        </Route>
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="checkout" element={<AdminCheckout />} />
                    </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;