import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, CreditCard, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentSuccess, setPaymentSuccess] = useState(null);
    const [processing, setProcessing] = useState(false);
    
    const cart = location.state?.cart || [];
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const handlePayment = () => {
        setProcessing(true);
        setTimeout(() => {
            const success = Math.random() > 0.3; // 70% success chance
            setPaymentSuccess(success);
            setProcessing(false);
        }, 1500);
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'var(--bg-body)', 
            padding: '40px 32px',
            maxWidth: '900px',
            margin: '0 auto'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{ 
                        background: 'var(--bg-card)', 
                        border: '1px solid var(--border)',
                        borderRadius: '10px', 
                        padding: '10px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <ArrowLeft size={20} style={{ color: 'var(--text-secondary)' }} />
                </button>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Checkout</h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>Review your order and complete payment</p>
                </div>
            </div>

            {paymentSuccess === null ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Order Summary */}
                    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShoppingCart size={20} /> Order Summary
                        </h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                            {cart.map(item => (
                                <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ 
                                        width: '60px', height: '60px', 
                                        background: 'var(--bg-input)', 
                                        borderRadius: '10px', 
                                        overflow: 'hidden', 
                                        flexShrink: 0 
                                    }}>
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : null}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>{item.name}</h4>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, marginTop: '4px' }}>Qty: {item.qty}</p>
                                    </div>
                                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>₱{(item.price * item.qty).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total</span>
                            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>₱{total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment */}
                    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CreditCard size={20} /> Payment
                        </h2>

                        <div style={{ 
                            background: 'var(--bg-input)', 
                            border: '1px solid var(--border)', 
                            borderRadius: '12px', 
                            padding: '20px', 
                            marginBottom: '24px'
                        }}>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, marginBottom: '8px' }}>Demo Payment</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                                This is a demo checkout. No real payment information is required.
                            </p>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={processing}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                color: 'white',
                                border: 'none',
                                fontSize: '15px',
                                fontWeight: 700,
                                cursor: processing ? 'not-allowed' : 'pointer',
                                opacity: processing ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {processing ? (
                                <>
                                    <div style={{ 
                                        width: '18px', height: '18px', 
                                        border: '2px solid rgba(255,255,255,0.3)', 
                                        borderTopColor: 'white', 
                                        borderRadius: '50%', 
                                        animation: 'spin 0.8s linear infinite' 
                                    }} />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard size={18} />
                                    Pay ₱{total.toFixed(2)}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ 
                    background: 'var(--bg-card)', 
                    borderRadius: '16px', 
                    border: '1px solid var(--border)', 
                    padding: '48px 32px', 
                    textAlign: 'center' 
                }}>
                    {paymentSuccess ? (
                        <>
                            <div style={{ 
                                width: '80px', height: '80px', 
                                borderRadius: '50%', 
                                background: '#dcfce7', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                margin: '0 auto 24px'
                            }}>
                                <CheckCircle2 size={48} style={{ color: '#10b981' }} />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Payment Successful!</h2>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>Your order has been placed successfully.</p>
                        </>
                    ) : (
                        <>
                            <div style={{ 
                                width: '80px', height: '80px', 
                                borderRadius: '50%', 
                                background: '#fee2e2', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                margin: '0 auto 24px'
                            }}>
                                <XCircle size={48} style={{ color: '#ef4444' }} />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Payment Failed</h2>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Something went wrong. Please try again.</p>
                            <button
                                onClick={() => setPaymentSuccess(null)}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    background: 'var(--primary-bg)',
                                    color: 'var(--primary)',
                                    border: '1px solid var(--primary)',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Try Again
                            </button>
                        </>
                    )}
                </div>
            )}
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Checkout;
