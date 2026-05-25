import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProducts } from '../../api/api';
import {
    PackageOpen, Tag, Filter, ArrowUpDown, X, Plus, Minus, Trash2, ShoppingCart, LogOut,
    Globe, Home, Package, Fish, Snowflake, Microwave, ChefHat, Thermometer, Utensils,
    ShoppingBag, Layers, Coffee, HeartPulse, PawPrint, ShieldCheck, Search, Settings, User
} from 'lucide-react';
import UserLayout from '../../layouts/UserLayout';

/* Map product name/category → real Unsplash photo */
const getProductImage = (name = '', category = '') => {
    const n = name.toLowerCase();
    const c = category.toLowerCase();
    if (n.includes('tuna') || n.includes('sardine'))  return 'https://images.unsplash.com/photo-1608685581781-a3b0e07dd224?auto=format&fit=crop&w=400&q=80';
    if (n.includes('cheese'))                         return 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=400&q=80';
    if (n.includes('chicken'))                        return 'https://images.unsplash.com/photo-1604503468506-a8da13d11bea?auto=format&fit=crop&w=400&q=80';
    if (n.includes('coca') || n.includes('cola'))     return 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=400&q=80';
    if (n.includes('egg'))                            return 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=400&q=80';
    if (n.includes('juice') || n.includes('orange'))  return 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=400&q=80';
    if (n.includes('chip') || n.includes('snack'))    return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80';
    if (n.includes('bread'))                          return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80';
    if (n.includes('milk'))                           return 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80';
    if (n.includes('yogurt') || n.includes('yoghurt'))return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80';
    if (n.includes('rice'))                           return 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=400&q=80';
    if (n.includes('water'))                          return 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=400&q=80';
    if (n.includes('coffee'))                         return 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=400&q=80';
    if (n.includes('chocolate'))                      return 'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?auto=format&fit=crop&w=400&q=80';
    if (n.includes('butter'))                         return 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80';
    if (c.includes('dairy'))                          return 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80';
    if (c.includes('meat'))                           return 'https://images.unsplash.com/photo-1604503468506-a8da13d11bea?auto=format&fit=crop&w=400&q=80';
    if (c.includes('beverage') || c.includes('drink'))return 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=400&q=80';
    if (c.includes('bakery'))                         return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80';
    if (c.includes('snack'))                          return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80';
    if (c.includes('canned'))                         return 'https://images.unsplash.com/photo-1608685581781-a3b0e07dd224?auto=format&fit=crop&w=400&q=80';
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
};

const CATEGORIES = [
    { id: 'only-sm', name: 'Only in SmartTrack', icon: Globe },
    { id: 'complete-home', name: 'Complete Home', icon: Home },
    { id: 'fresh-produce', name: 'Fresh Produce', icon: Package },
    { id: 'fresh-meat', name: 'Fresh Meat & Seafood', icon: Fish },
    { id: 'frozen', name: 'Frozen Goods', icon: Snowflake },
    { id: 'ready-heat', name: 'Ready to Heat & Eat', icon: Microwave },
    { id: 'ready-cook', name: 'Ready to Cook', icon: ChefHat },
    { id: 'chilled-dairy', name: 'Chilled & Dairy', icon: Thermometer },
    { id: 'bakery', name: 'Bakery', icon: Utensils },
    { id: 'international', name: 'International Goods', icon: ShoppingBag },
    { id: 'pantry', name: 'Pantry', icon: Layers },
    { id: 'snacks', name: 'Snacks', icon: PackageOpen },
    { id: 'beverages', name: 'Beverages', icon: Coffee },
    { id: 'health-beauty', name: 'Health & Beauty', icon: HeartPulse },
    { id: 'home-care', name: 'Home Care', icon: Home },
    { id: 'pet-care', name: 'Pet Care', icon: PawPrint },
    { id: 'health-hygiene', name: 'Health & Hygiene Essentials', icon: ShieldCheck },
];

/* Cart Sidebar */
const CartSidebar = ({ isOpen, onClose, cart, onUpdateQty, onRemoveItem, onCheckout }) => {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    
    if (!isOpen) return null;
    
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.5)' }} onClick={onClose} />
            <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '420px', background: 'var(--bg-card)', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Your Cart</h2>
                    <button onClick={onClose} style={{ padding: '8px', borderRadius: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '14px', marginTop: '12px' }}>Your cart is empty</div>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '12px', background: 'var(--bg-input)', borderRadius: '12px' }}>
                                <div style={{ width: '80px', height: '80px', background: 'var(--bg-card)', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: 0.4 }}>
                                            <PackageOpen size={24} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>{item.name}</h4>
                                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>₱{item.price.toFixed(2)}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button 
                                                onClick={() => onUpdateQty(item.id, item.qty - 1)}
                                                style={{ width: '28px', height: '28px', borderRadius: '9999px', background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span style={{ width: '32px', textAlign: 'center', fontWeight: 700, color: 'var(--text-primary)' }}>{item.qty}</span>
                                            <button 
                                                onClick={() => onUpdateQty(item.id, item.qty + 1)}
                                                style={{ width: '28px', height: '28px', borderRadius: '9999px', background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button onClick={() => onRemoveItem(item.id)} style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                {cart.length > 0 && (
                    <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total</span>
                            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>₱{total.toFixed(2)}</span>
                        </div>
                        <button onClick={onCheckout} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>
                            Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const UserDashboardWrapper = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('only-sm');
    const [topTab, setTopTab] = useState('All');
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getProducts();
                const productsWithImages = data.map(p => ({
                    ...p,
                    id: p.id,
                    name: p.name,
                    category: p.category?.toLowerCase() || 'pantry',
                    price: Number(p.price),
                    stock: Number(p.stock),
                    image: getProductImage(p.name, p.category)
                }));
                setProducts(productsWithImages);
            } catch (err) {
                console.error('Failed to load products', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredProducts = products.filter(p => {
        let matchesCategory = selectedCategory === 'only-sm' || p.category === selectedCategory;
        if (selectedCategory === 'only-sm') {
            matchesCategory = true;
        } else if (selectedCategory === 'chilled-dairy' && p.category === 'dairy') {
            matchesCategory = true;
        } else if (selectedCategory === 'fresh-meat' && p.category === 'meat') {
            matchesCategory = true;
        } else if (selectedCategory === 'fresh-produce' && p.category === 'produce') {
            matchesCategory = true;
        } else if (selectedCategory === 'complete-home' && p.category === 'home-care') {
            matchesCategory = true;
        } else if (selectedCategory === 'health-hygiene' && p.category === 'health-beauty') {
            matchesCategory = true;
        }
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleAddToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
        setIsCartOpen(true);
    };

    const handleUpdateQty = (id, qty) => {
        if (qty <= 0) {
            setCart(prev => prev.filter(item => item.id !== id));
        } else {
            setCart(prev => prev.map(item => item.id === id ? { ...item, qty } : item));
        }
    };

    const handleRemoveItem = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

    // Create sidebar
    const userSidebar = (
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
                            User Portal
                        </p>
                    </div>
                </div>
            </div>

            {/* Nav Links */}
            <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
                <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Categories
                </div>
                {CATEGORIES.map((item) => {
                    const isActive = selectedCategory === item.id;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setSelectedCategory(item.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '11px 16px',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                background: isActive ? 'var(--primary-bg)' : 'transparent',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                border: 'none',
                                cursor: 'pointer',
                                width: '100%',
                                textAlign: 'left'
                            }}
                        >
                            <Icon size={20} />
                            {item.name}
                        </button>
                    );
                })}
            </nav>

            {/* User Section */}
            <div style={{ padding: '16px', borderTop: '1px solid var(--border-light)', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 600, color: 'white'
                    }}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.name || 'User'}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                            Customer
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
    );

    return (
        <UserLayout sidebar={userSidebar}>
            {/* Top Navbar */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '20px 24px',
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border)'
            }}>
                {/* Search */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '10px 16px'
                }}>
                    <Search size={18} style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search products by name or category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            fontSize: '14px',
                            color: 'var(--text-primary)'
                        }}
                    />
                </div>

                {/* Top Tabs */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['All', 'New', 'Sale'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setTopTab(tab)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '9999px',
                                border: topTab === tab ? '1px solid var(--primary)' : '1px solid var(--border)',
                                background: topTab === tab ? 'var(--primary-bg)' : 'transparent',
                                color: topTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                                fontSize: '13px',
                                fontWeight: topTab === tab ? 600 : 500,
                                cursor: 'pointer'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Filters & Sort */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}>
                        <Filter size={16} />
                        Filters
                    </button>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-card)'
                    }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Sort by</span>
                        <select style={{
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            fontSize: '13px',
                            fontWeight: 600,
                            outline: 'none',
                            cursor: 'pointer'
                        }}>
                            <option>Popularity</option>
                            <option>Price: Low → High</option>
                            <option>Price: High → Low</option>
                        </select>
                        <ArrowUpDown size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                </div>

                {/* Cart Button */}
                <button onClick={() => setIsCartOpen(true)} style={{
                    position: 'relative',
                    width: '42px', height: '42px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                }}>
                    <ShoppingCart size={20} style={{ color: 'var(--text-secondary)' }} />
                    {cartCount > 0 && (
                        <div style={{
                            position: 'absolute', top: '-6px', right: '-6px',
                            minWidth: '20px', height: '20px',
                            background: 'var(--primary)',
                            color: 'white',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {cartCount}
                        </div>
                    )}
                </button>
            </div>

            {/* Main Content */}
            <div style={{ padding: '24px' }}>
                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Home</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {CATEGORIES.find(c => c.id === selectedCategory)?.name || 'All Products'}
                    </span>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {CATEGORIES.find(c => c.id === selectedCategory)?.name || 'All Products'}
                    </h2>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                        {[1,2,3,4].map(i => (
                            <div key={i} style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '16px',
                                padding: '16px',
                                height: '320px'
                            }} />
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                        {filteredProducts.map(product => {
                            const isFav = favorites.includes(product.id);
                            return (
                                <div key={product.id} style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'box-shadow 0.2s ease'
                                }}>
                                    {/* Image */}
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            width: '100%', aspectRatio: '1/1',
                                            background: 'var(--bg-input)'
                                        }}>
                                            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <button onClick={() => setFavorites(prev => prev.includes(product.id) ? prev.filter(x => x !== product.id) : [...prev, product.id])} style={{
                                            position: 'absolute',
                                            top: '12px', right: '12px',
                                            width: '34px', height: '34px',
                                            borderRadius: '9999px',
                                            border: 'none',
                                            background: 'rgba(255,255,255,0.95)',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'transform 0.15s ease'
                                        }}>
                                            <HeartPulse size={18} style={{ color: isFav ? '#ef4444' : '#94a3b8' }} fill={isFav ? '#ef4444' : 'none'} />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                                                {product.name}
                                            </h3>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                                                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                                    {product.category} • Stock: {product.stock}
                                                </span>
                                                <span style={{
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    padding: '4px 8px',
                                                    borderRadius: '9999px',
                                                    background: '#dcfce7',
                                                    color: '#16a34a'
                                                }}>
                                                    In Stock
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                                                ₱{product.price.toFixed(2)}
                                            </span>
                                        </div>

                                        <button onClick={() => handleAddToCart(product)} style={{
                                            width: '100%', padding: '11px',
                                            borderRadius: '10px',
                                            border: '1px solid var(--primary)',
                                            background: 'var(--primary-bg)',
                                            color: 'var(--primary)',
                                            fontSize: '14px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            marginTop: '4px'
                                        }}>
                                            <ShoppingCart size={16} />
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <CartSidebar
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                onUpdateQty={handleUpdateQty}
                onRemoveItem={handleRemoveItem}
                onCheckout={() => {
                    setIsCartOpen(false);
                    navigate('/checkout', { state: { cart } });
                }}
            />
        </UserLayout>
    );
};

const UserDashboard = () => {
    return <UserDashboardWrapper />;
};

export default UserDashboard;
