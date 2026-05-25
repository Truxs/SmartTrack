import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

/* Layouts */
import AdminLayout from './layouts/AdminLayout';

/* Pages */
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import AdminCheckout from './pages/admin/Checkout';
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

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<Login />} />

                    {/* Admin Routes (nested under AdminLayout) */}
                    <Route path="/admin" element={
                        <ProtectedRoute requireAdmin>
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="products" element={<Products />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="checkout" element={<AdminCheckout />} />
                    </Route>

                    {/* User Routes */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <UserDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <UserDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                        <ProtectedRoute>
                            <UserCheckout />
                        </ProtectedRoute>
                    } />
                    <Route path="/store" element={
                        <ProtectedRoute>
                            <StoreFront />
                        </ProtectedRoute>
                    } />
                    <Route path="/wishlist" element={
                        <ProtectedRoute>
                            <div style={{ padding: '24px' }}><h1 style={{ fontSize: '24px', fontWeight: 700 }}>Wishlist</h1></div>
                        </ProtectedRoute>
                    } />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;