import { useState, useEffect } from 'react';
import { getProducts, getAlerts } from '../../api/api';
import { Search, Package, AlertCircle, Filter, ImageIcon, Tag, TrendingDown, ShoppingBag, ChevronRight } from 'lucide-react';

const StoreFront = () => {
    const [products, setProducts] = useState([]);
    const [alerts, setAlerts] = useState({ low_stock: [], expired: [], expiring_soon: [] });
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, alertsRes] = await Promise.all([getProducts(), getAlerts()]);
            setProducts(productsRes.data);
            setAlerts(alertsRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

    const filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
        const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
        return matchSearch && matchCat;
    });

    const totalStock = products.reduce((s, p) => s + (parseInt(p.total_stock) || 0), 0);
    const lowStockCount = alerts.low_stock?.length || 0;
    const expiringCount = (alerts.expiring_soon?.length || 0) + (alerts.expired?.length || 0);

    const getStockInfo = (p) => {
        const s = parseInt(p.total_stock) || 0;
        if (s === 0) return { label: 'Out of Stock', color: '#ef4444', bg: '#fef2f2', icon: '⊘' };
        if (s <= p.reorder_level) return { label: 'Low Stock', color: '#f59e0b', bg: '#fffbeb', icon: '⚠' };
        return { label: 'Available', color: '#10b981', bg: '#f0fdf4', icon: '✓' };
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Welcome Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #2563eb, #3b82f6, #60a5fa)',
                borderRadius: 'var(--radius-xl)', padding: '28px 32px',
                color: 'white', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
                        Welcome to SmartTrack Store
                    </h1>
                    <p style={{ fontSize: '14px', opacity: 0.85, maxWidth: '500px' }}>
                        Browse products, check stock levels, and find what you need in your inventory.
                    </p>
                </div>
                {/* Decorative */}
                <div style={{
                    position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
                    width: '120px', height: '120px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)', zIndex: 0
                }} />
                <div style={{
                    position: 'absolute', right: '80px', top: '10%',
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)', zIndex: 0
                }} />
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                <QuickStat icon={Package} label="Products" value={products.length} color="var(--primary)" bg="var(--primary-bg)" />
                <QuickStat icon={ShoppingBag} label="Total Stock" value={`${totalStock} units`} color="#10b981" bg="rgba(16,185,129,0.08)" />
                <QuickStat icon={TrendingDown} label="Low Stock" value={lowStockCount} color={lowStockCount > 0 ? '#f59e0b' : '#10b981'} bg={lowStockCount > 0 ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)'} />
                <QuickStat icon={AlertCircle} label="Expiring" value={expiringCount} color={expiringCount > 0 ? '#ef4444' : '#10b981'} bg={expiringCount > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)'} />
            </div>

            {/* Search & Filter Bar */}
            <div style={{
                background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'var(--bg-input)', borderRadius: 'var(--radius-md)',
                    padding: '10px 16px', flex: 1, minWidth: '240px',
                    border: '1px solid var(--border)'
                }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search products by name or barcode..."
                        style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', color: 'var(--text-primary)', width: '100%', fontFamily: 'inherit' }} />
                </div>

                {/* Category Pills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                            padding: '8px 16px', borderRadius: 'var(--radius-full)',
                            border: selectedCategory === cat ? '2px solid var(--primary)' : '1px solid var(--border)',
                            background: selectedCategory === cat ? 'var(--primary-bg)' : 'var(--bg-card)',
                            color: selectedCategory === cat ? 'var(--primary)' : 'var(--text-secondary)',
                            fontSize: '13px', fontWeight: selectedCategory === cat ? 600 : 500,
                            cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit'
                        }}>{cat}</button>
                    ))}
                </div>

                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: 'auto' }}>
                    {filtered.length} products
                </span>
            </div>

            {/* Product Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {filtered.map(product => {
                    const info = getStockInfo(product);
                    return (
                        <div key={product.id} onClick={() => setSelectedProduct(product)}
                            className="store-product-card" style={{
                                background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border)', overflow: 'hidden',
                                cursor: 'pointer', transition: 'all 0.2s ease'
                            }}>

                            {/*
                                ===== PRODUCT IMAGE =====
                                Replace this placeholder with:
                                <img src={product.image_url} alt={product.name}
                                     style={{ width:'100%', height:'180px', objectFit:'cover' }} />
                                ==========================
                            */}
                            <div style={{
                                width: '100%', height: '180px', background: 'var(--bg-input)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                borderBottom: '1px solid var(--border-light)', color: '#cbd5e1', position: 'relative'
                            }}>
                                <ImageIcon size={40} strokeWidth={1.5} />
                                <span style={{ fontSize: '11px', marginTop: '6px' }}>No image</span>

                                {/* Status Badge */}
                                <span style={{
                                    position: 'absolute', top: '10px', right: '10px',
                                    fontSize: '11px', fontWeight: 600, color: info.color, background: info.bg,
                                    padding: '4px 10px', borderRadius: 'var(--radius-full)',
                                    border: `1px solid ${info.color}20`
                                }}>{info.label}</span>

                                {/* Category Tag */}
                                <span style={{
                                    position: 'absolute', top: '10px', left: '10px',
                                    fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)',
                                    background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                                    padding: '3px 10px', borderRadius: 'var(--radius-full)',
                                    border: '1px solid var(--border)'
                                }}>{product.category}</span>
                            </div>

                            <div style={{ padding: '16px' }}>
                                <h3 style={{
                                    fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)',
                                    marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}>{product.name}</h3>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                                    <span style={{
                                        fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)',
                                        letterSpacing: '-0.02em'
                                    }}>₱{parseFloat(product.price).toFixed(2)}</span>

                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{
                                            fontSize: '14px', fontWeight: 600,
                                            color: info.color
                                        }}>{product.total_stock || 0}</p>
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>in stock</p>
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-light)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                        {product.barcode}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontSize: '12px', fontWeight: 500 }}>
                                        Details <ChevronRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && !loading && (
                    <div style={{
                        gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center',
                        background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border)'
                    }}>
                        <Package size={40} style={{ margin: '0 auto 12px', color: 'var(--text-muted)', opacity: 0.4 }} />
                        <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>No products found</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Try adjusting your search or filter.</p>
                    </div>
                )}
            </div>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div onClick={() => setSelectedProduct(null)} style={{
                    position: 'fixed', inset: 0, zIndex: 50,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '16px', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)'
                }}>
                    <div onClick={e => e.stopPropagation()} className="animate-slide-in" style={{
                        background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--border)', width: '100%', maxWidth: '440px',
                        boxShadow: 'var(--shadow-xl)', overflow: 'hidden'
                    }}>
                        {/*
                            ===== PRODUCT IMAGE =====
                            Replace this with an <img> tag for the product.
                            ==========================
                        */}
                        <div style={{
                            width: '100%', height: '200px', background: 'var(--bg-input)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1'
                        }}>
                            <ImageIcon size={48} strokeWidth={1.5} />
                        </div>

                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div>
                                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--primary)', background: 'var(--primary-bg)', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>
                                        {selectedProduct.category}
                                    </span>
                                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }}>
                                        {selectedProduct.name}
                                    </h2>
                                </div>
                                <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
                                    ₱{parseFloat(selectedProduct.price).toFixed(2)}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <InfoBox label="Barcode" value={selectedProduct.barcode} />
                                <InfoBox label="Category" value={selectedProduct.category} />
                                <InfoBox label="In Stock" value={`${selectedProduct.total_stock || 0} units`} highlight={getStockInfo(selectedProduct).color} />
                                <InfoBox label="Reorder At" value={`${selectedProduct.reorder_level} units`} />
                            </div>

                            <button onClick={() => setSelectedProduct(null)} style={{
                                width: '100%', padding: '12px', borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)', background: 'var(--bg-card)',
                                color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, cursor: 'pointer'
                            }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .store-product-card:hover {
                    box-shadow: var(--shadow-lg);
                    transform: translateY(-3px);
                }
            `}</style>
        </div>
    );
};

/* ---- Sub-Components ---- */
const QuickStat = ({ icon: Icon, label, value, color, bg }) => (
    <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)', padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: '14px',
        boxShadow: 'var(--shadow-sm)'
    }}>
        <div style={{
            width: '40px', height: '40px', borderRadius: '10px', background: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
            <Icon size={20} color={color} />
        </div>
        <div>
            <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>{label}</p>
        </div>
    </div>
);

const InfoBox = ({ label, value, highlight }) => (
    <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: 'var(--radius-sm)' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</p>
        <p style={{ fontSize: '14px', fontWeight: 600, color: highlight || 'var(--text-primary)' }}>{value}</p>
    </div>
);

export default StoreFront;
