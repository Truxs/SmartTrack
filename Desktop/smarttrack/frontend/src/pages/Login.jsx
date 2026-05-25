import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, register as registerApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, LogIn, UserPlus } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError]     = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (isRegister) {
                await registerApi({ email: formData.email, password: formData.password });
                setSuccess('Account created successfully! You can now sign in.');
                setIsRegister(false);
                setFormData({ email: formData.email, password: '' });
            } else {
                const res = await loginApi({ email: formData.email, password: formData.password });
                login({ token: res.token, user: res.user });
                navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Operation failed. Check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* ── Left Panel: Hero Image ── */}
            <div className="login-hero" style={{
                flex: 1, position: 'relative', overflow: 'hidden', display: 'none'
            }}>
                <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85"
                    alt="Fresh grocery store"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(160deg, rgba(15,23,60,0.75) 0%, rgba(37,99,235,0.55) 100%)'
                }} />
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '48px 52px 60px',
                    background: 'linear-gradient(to top, rgba(8,12,35,0.9) 0%, transparent 100%)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                        <div style={{
                            width: '50px', height: '50px',
                            background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
                            borderRadius: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 20px rgba(37,99,235,0.5)'
                        }}>
                            <ShoppingCart size={24} color="white" />
                        </div>
                        <span style={{ fontSize: '28px', fontWeight: 800, color: 'white', letterSpacing: '-0.03em' }}>SmartTrack</span>
                    </div>
                    <h2 style={{
                        fontSize: '36px', fontWeight: 800, color: 'white',
                        lineHeight: 1.2, marginBottom: '14px', letterSpacing: '-0.02em'
                    }}>
                        Shop Smart,<br />Stay on Track.
                    </h2>
                </div>
            </div>

            {/* ── Right Panel: Form ── */}
            <div style={{
                width: '100%', maxWidth: '480px', flexShrink: 0,
                background: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '48px 40px',
                boxShadow: '-8px 0 48px rgba(0,0,0,0.07)'
            }}>
                <div style={{ width: '100%', maxWidth: '380px' }}>

                    {/* Top brand mark */}
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                            <div style={{
                                width: '46px', height: '46px',
                                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                borderRadius: '13px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 16px rgba(37,99,235,0.3)'
                            }}>
                                <ShoppingCart size={22} color="white" />
                            </div>
                            <div>
                                <p style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>SmartTrack</p>
                                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginTop: '3px' }}>Inventory System</p>
                            </div>
                        </div>
                        <h1 style={{
                            fontSize: '28px', fontWeight: 800, color: '#0f172a',
                            letterSpacing: '-0.03em', marginBottom: '8px'
                        }}>
                            {isRegister ? 'Start your journey' : 'Welcome back'}
                        </h1>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>
                            {isRegister ? 'Create your account' : 'Sign in to your account to continue'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={inputStyle}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                style={inputStyle}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {error && (
                            <div style={{
                                background: '#fef2f2', border: '1px solid #fecaca',
                                color: '#dc2626', padding: '12px 16px',
                                borderRadius: '10px', fontSize: '13px', fontWeight: 500
                            }}>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div style={{
                                background: '#f0fdf4', border: '1px solid #bbf7d0',
                                color: '#16a34a', padding: '12px 16px',
                                borderRadius: '10px', fontSize: '13px', fontWeight: 500
                            }}>
                                {success}
                            </div>
                        )}

                        <button type="submit" disabled={loading} style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                            color: 'white', fontWeight: 700, padding: '14px',
                            borderRadius: '12px', border: 'none', fontSize: '15px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            opacity: loading ? 0.7 : 1,
                            boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
                            transition: 'all 0.2s ease',
                            marginTop: '4px'
                        }}>
                            {loading ? (isRegister ? 'Creating account...' : 'Signing in...') :
                             isRegister ? <><UserPlus size={18} /> Sign Up</> : <><LogIn size={18} /> Sign In</>}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '12px' }}>
                            <button
                                type="button"
                                onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
                                style={{
                                    fontSize: '14px', color: '#2563eb', fontWeight: 600,
                                    background: 'transparent', border: 'none', cursor: 'pointer'
                                }}
                            >
                                {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                            </button>
                        </div>
                    </form>

                </div>
            </div>

            <style>{`
                @media (min-width: 768px) {
                    .login-hero { display: flex !important; }
                }
                input:focus {
                    border-color: #2563eb !important;
                    box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important;
                }
            `}</style>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '13px 16px',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box'
};

export default Login;
