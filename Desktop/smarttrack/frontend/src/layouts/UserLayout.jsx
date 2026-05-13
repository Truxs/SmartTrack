import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, LogOut, User } from 'lucide-react';

const UserLayout = () => {
    const { user, logout } = useAuth();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>

            {/* ---- Top Navigation Bar ---- */}
            <nav style={{
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border)',
                position: 'sticky',
                top: 0,
                zIndex: 40,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 24px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '38px', height: '38px',
                            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                            borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
                        }}>
                            <ShoppingCart size={20} color="white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                SmartTrack
                            </h1>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                Store
                            </p>
                        </div>
                    </div>

                    {/* User info + logout */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: 'var(--primary-bg)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <User size={16} color="var(--primary)" />
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                {user?.name || 'User'}
                            </span>
                        </div>
                        <button onClick={logout} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 14px', borderRadius: '8px',
                            border: '1px solid var(--border)', background: 'var(--bg-card)',
                            color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', fontWeight: 500
                        }}>
                            <LogOut size={15} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            {/* ---- Page Content ---- */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;
