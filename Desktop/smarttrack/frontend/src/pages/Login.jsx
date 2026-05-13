import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, LogIn } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await loginApi(credentials);
            login(res.data);
            navigate(res.data.user.role === 'admin' ? '/admin' : '/store');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #dbeafe 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
            <div style={{
                width: '100%', maxWidth: '420px',
                background: '#ffffff', borderRadius: '24px',
                border: '1px solid var(--border)', padding: '40px 36px',
                boxShadow: 'var(--shadow-xl)'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '60px', height: '60px',
                        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                        borderRadius: '16px', marginBottom: '16px',
                        boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)'
                    }}>
                        <ShoppingCart size={28} color="white" />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        SmartTrack
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Inventory Management System
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Username
                        </label>
                        <input
                            type="text"
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            style={inputStyle}
                            placeholder="Enter username"
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            style={inputStyle}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: 'var(--danger-bg)', border: '1px solid #fecaca',
                            color: 'var(--danger)', padding: '12px 16px',
                            borderRadius: '12px', fontSize: '13px', fontWeight: 500
                        }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading} style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                        color: 'white', fontWeight: 600, padding: '13px',
                        borderRadius: '12px', border: 'none', fontSize: '14px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        opacity: loading ? 0.7 : 1,
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                        transition: 'all 0.2s ease'
                    }}>
                        {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p>Admin: admin / admin123</p>
                    <p>User: user / user123</p>
                </div>
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '14px',
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box'
};

export default Login;
