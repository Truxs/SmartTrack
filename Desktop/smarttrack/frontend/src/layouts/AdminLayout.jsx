import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    Search,
    Bell,
    ShoppingCart,
    LogOut,
    Receipt,
    ScanBarcode
} from 'lucide-react';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { path: '/admin/products', label: 'Products', icon: Package },
        { path: '/admin/orders', label: 'Orders', icon: Receipt },
        { path: '/admin/checkout', label: 'Checkout', icon: ScanBarcode },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-body)' }}>

            {/* ---- Sidebar ---- */}
            <aside style={{
                width: 'var(--sidebar-width)',
                background: 'var(--bg-card)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0, left: 0, bottom: 0,
                zIndex: 40,
                boxShadow: '2px 0 8px rgba(0,0,0,0.03)'
            }}>
                {/* Logo */}
                <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '42px', height: '42px',
                            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                            borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                        }}>
                            <ShoppingCart size={22} color="white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                SmartTrack
                            </h1>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                                Inventory System
                            </p>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className="sidebar-link"
                                style={({ isActive }) => ({
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '11px 16px',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    fontWeight: isActive ? 600 : 500,
                                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                    background: isActive ? 'var(--primary-bg)' : 'transparent',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                })}
                            >
                                <Icon size={20} />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div style={{ padding: '16px', borderTop: '1px solid var(--border-light)', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)'
                        }}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.name || 'Admin'}
                            </p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'capitalize' }}>
                                {user?.role || 'admin'}
                            </p>
                        </div>
                        <button onClick={logout} title="Sign Out" style={{
                            padding: '6px', borderRadius: '8px', border: 'none',
                            background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center'
                        }}>
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ---- Main Content ---- */}
            <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

                {/* Top Bar */}
                <header style={{
                    background: 'var(--bg-card)',
                    borderBottom: '1px solid var(--border)',
                    padding: '0 32px',
                    height: 'var(--topbar-height)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'sticky', top: 0, zIndex: 30,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'var(--bg-input)', border: '1px solid var(--border)',
                        borderRadius: '10px', padding: '8px 16px', width: '360px'
                    }}>
                        <Search size={16} color="var(--text-muted)" />
                        <input type="text" placeholder="Search items"
                            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: 'var(--text-primary)', width: '100%', fontFamily: 'inherit' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button style={{
                            position: 'relative', padding: '8px', borderRadius: '10px',
                            border: '1px solid var(--border)', background: 'var(--bg-card)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)'
                        }}>
                            <Bell size={18} />
                            <span style={{
                                position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px',
                                background: 'var(--danger)', borderRadius: '50%', border: '2px solid white'
                            }} />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ flex: 1, padding: '28px 32px', maxWidth: '1400px', width: '100%' }}>
                    <Outlet />
                </main>
            </div>

            <style>{`
                .sidebar-link:hover {
                    background: rgba(37, 99, 235, 0.05) !important;
                    color: var(--primary) !important;
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
