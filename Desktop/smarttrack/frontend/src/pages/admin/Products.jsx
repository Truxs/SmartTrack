import { useState, useEffect } from 'react';
import { getProducts, getStock, createProduct, updateProduct, deleteProduct, createBatch, updateBatch, deleteBatch } from '../../api/api';
import Modal from '../../components/ui/Modal';
import InputField from '../../components/ui/InputField';
import { Plus, Trash2, Edit3, Package, Eye, ImageIcon, X } from 'lucide-react';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [stock, setStock] = useState([]);
    const [tab, setTab] = useState('products');
    const [showProduct, setShowProduct] = useState(false);
    const [showBatch, setShowBatch] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingBatch, setEditingBatch] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewProduct, setViewProduct] = useState(null);

    const emptyProduct = { barcode: '', name: '', category: '', price: '', reorder_level: 10 };
    const emptyBatch = { product_id: '', quantity: '', expiry_date: '' };
    const [pForm, setPForm] = useState(emptyProduct);
    const [bForm, setBForm] = useState(emptyBatch);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        const [pr, st] = await Promise.all([getProducts(), getStock()]);
        setProducts(pr.data);
        setStock(st.data);
    };

    /* ---- Product CRUD ---- */
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...pForm, price: parseFloat(pForm.price), reorder_level: parseInt(pForm.reorder_level) };
        if (editingProduct) {
            await updateProduct(editingProduct.id, payload);
        } else {
            await createProduct(payload);
        }
        closeProductModal();
        fetchData();
    };

    const handleDeleteProduct = async (id) => {
        if (confirm('Delete this product? All associated batches will also be removed.')) {
            await deleteProduct(id);
            fetchData();
        }
    };

    const openEditProduct = (p) => {
        setEditingProduct(p);
        setPForm({ barcode: p.barcode, name: p.name, category: p.category, price: p.price, reorder_level: p.reorder_level });
        setShowProduct(true);
    };

    const closeProductModal = () => {
        setShowProduct(false);
        setEditingProduct(null);
        setPForm(emptyProduct);
    };

    /* ---- Batch CRUD ---- */
    const handleBatchSubmit = async (e) => {
        e.preventDefault();
        if (editingBatch) {
            await updateBatch(editingBatch.id, { quantity: parseInt(bForm.quantity), expiry_date: bForm.expiry_date });
        } else {
            await createBatch({ product_id: parseInt(bForm.product_id), quantity: parseInt(bForm.quantity), expiry_date: bForm.expiry_date });
        }
        closeBatchModal();
        fetchData();
    };

    const handleDeleteBatch = async (id) => {
        if (confirm('Delete this batch?')) { await deleteBatch(id); fetchData(); }
    };

    const openEditBatch = (b) => {
        setEditingBatch(b);
        setBForm({ product_id: b.product_id, quantity: b.quantity, expiry_date: b.expiry_date });
    };

    const closeBatchModal = () => {
        setShowBatch(false);
        setEditingBatch(null);
        setBForm(emptyBatch);
    };

    /* ---- Helpers ---- */
    const stockStatus = (p) => {
        const s = parseInt(p.total_stock) || 0;
        if (s === 0) return { l: 'Out of Stock', c: '#ef4444', bg: '#fef2f2' };
        if (s <= p.reorder_level) return { l: 'Low Stock', c: '#f59e0b', bg: '#fffbeb' };
        return { l: 'In Stock', c: '#10b981', bg: '#f0fdf4' };
    };

    const expiryStatus = (d) => {
        const days = Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
        if (days < 0) return { c: '#ef4444', bg: '#fef2f2', l: `${Math.abs(days)}d expired` };
        if (days <= 5) return { c: '#f59e0b', bg: '#fffbeb', l: `${days}d left` };
        return { c: '#10b981', bg: '#f0fdf4', l: `${days}d left` };
    };

    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm);
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Get batches for the currently viewed product
    const productBatches = viewProduct ? stock.filter(b => b.product_id === viewProduct.id) : [];

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Products</h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Manage your store inventory</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {tab === 'products' && <ActionBtn onClick={() => setShowProduct(true)} label="Add Product" />}
                    {tab === 'batches' && <ActionBtn onClick={() => setShowBatch(true)} label="Add Batch" />}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid var(--border)' }}>
                <TabBtn active={tab === 'products'} onClick={() => setTab('products')} label="Products" count={products.length} />
                <TabBtn active={tab === 'batches'} onClick={() => setTab('batches')} label="Batches" count={stock.length} />
            </div>

            {/* ======== PRODUCTS TAB ======== */}
            {tab === 'products' && (
                <>
                    {/* Category filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                                padding: '7px 16px', borderRadius: 'var(--radius-full)',
                                border: selectedCategory === cat ? '2px solid var(--primary)' : '1px solid var(--border)',
                                background: selectedCategory === cat ? 'var(--primary-bg)' : 'var(--bg-card)',
                                color: selectedCategory === cat ? 'var(--primary)' : 'var(--text-secondary)',
                                fontSize: '13px', fontWeight: selectedCategory === cat ? 600 : 500,
                                cursor: 'pointer', fontFamily: 'inherit'
                            }}>{cat}</button>
                        ))}
                    </div>

                    {/* Product grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                        {filteredProducts.map(p => {
                            const s = stockStatus(p);
                            return (
                                <div key={p.id} className="product-card" style={{
                                    background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--border)', overflow: 'hidden',
                                    transition: 'all 0.2s ease', cursor: 'default'
                                }}>
                                    {/*
                                        ===== PRODUCT IMAGE =====
                                        Replace the placeholder below with an <img> tag:
                                        <img src={p.image_url || '/placeholder.png'} alt={p.name}
                                             style={{ width:'100%', height:'160px', objectFit:'cover' }} />
                                        Or use a dynamic backend path:
                                        src={`http://localhost:5000/uploads/${p.image}`}
                                        ==========================
                                    */}
                                    <div style={{
                                        width: '100%', height: '160px', background: 'var(--bg-input)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        borderBottom: '1px solid var(--border-light)', color: '#cbd5e1'
                                    }}>
                                        <ImageIcon size={36} strokeWidth={1.5} />
                                        <span style={{ fontSize: '11px', marginTop: '6px' }}>No image</span>
                                    </div>

                                    <div style={{ padding: '14px 16px' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h3>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>{p.category} • Stock: {p.total_stock || 0}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>₱{parseFloat(p.price).toFixed(2)}</span>
                                            <span style={{ fontSize: '11px', fontWeight: 600, color: s.c, background: s.bg, padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>{s.l}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', background: 'var(--bg-input)', padding: '3px 8px', borderRadius: '4px', flex: 1 }}>{p.barcode}</span>
                                            <button onClick={() => setViewProduct(p)} style={iconBtn} title="View Details"><Eye size={14} /></button>
                                            <button onClick={() => openEditProduct(p)} style={iconBtn} title="Edit"><Edit3 size={14} /></button>
                                            <button onClick={() => handleDeleteProduct(p.id)} style={{ ...iconBtn, color: '#ef4444' }} title="Delete"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Add Item Card */}
                        <div onClick={() => setShowProduct(true)} className="add-card" style={{
                            background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)',
                            border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', minHeight: '280px',
                            cursor: 'pointer', color: 'var(--text-muted)', gap: '8px'
                        }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Plus size={22} color="var(--text-secondary)" />
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Add an Item</span>
                        </div>
                    </div>
                </>
            )}

            {/* ======== BATCHES TAB ======== */}
            {tab === 'batches' && (
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-input)' }}>
                                {['Product', 'Qty', 'Expiry', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={thStyle}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {stock.map(b => {
                                const e = expiryStatus(b.expiry_date);
                                return (
                                    <tr key={b.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-light)', opacity: b.quantity === 0 ? 0.5 : 1 }}>
                                        <td style={tdStyle}>
                                            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{b.product_name}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{b.barcode}</p>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ background: 'var(--bg-input)', padding: '3px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{b.quantity}</span>
                                        </td>
                                        <td style={{ ...tdStyle, color: 'var(--text-secondary)', fontSize: '13px' }}>{b.expiry_date}</td>
                                        <td style={tdStyle}>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: e.c, background: e.bg, padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>{e.l}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button onClick={() => openEditBatch(b)} style={tableAction} title="Edit"><Edit3 size={14} /></button>
                                                <button onClick={() => handleDeleteBatch(b.id)} style={{ ...tableAction, color: '#ef4444' }} title="Delete"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {stock.length === 0 && (
                                <tr><td colSpan="5" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                                    <Package size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                                    <p>No batches found</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ======== PRODUCT DETAIL MODAL ======== */}
            {viewProduct && (
                <Modal title={viewProduct.name} onClose={() => setViewProduct(null)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <DetailItem label="Barcode" value={viewProduct.barcode} />
                            <DetailItem label="Category" value={viewProduct.category} />
                            <DetailItem label="Price" value={`₱${parseFloat(viewProduct.price).toFixed(2)}`} />
                            <DetailItem label="Stock" value={`${viewProduct.total_stock || 0} units`} />
                            <DetailItem label="Reorder Level" value={viewProduct.reorder_level} />
                            <DetailItem label="Status" value={stockStatus(viewProduct).l} />
                        </div>
                        {productBatches.length > 0 && (
                            <div>
                                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Active Batches</p>
                                {productBatches.map(b => (
                                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13px' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Qty: {b.quantity}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>Exp: {b.expiry_date}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* ======== ADD/EDIT PRODUCT MODAL ======== */}
            {showProduct && (
                <Modal title={editingProduct ? 'Edit Product' : 'Add Product'} onClose={closeProductModal}>
                    <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <InputField label="Barcode" value={pForm.barcode} onChange={v => setPForm({ ...pForm, barcode: v })} placeholder="Enter barcode" required />
                        <InputField label="Product Name" value={pForm.name} onChange={v => setPForm({ ...pForm, name: v })} placeholder="e.g. Canned Sardines" required />
                        <InputField label="Category" value={pForm.category} onChange={v => setPForm({ ...pForm, category: v })} placeholder="e.g. Canned Goods" required />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <InputField label="Price (₱)" type="number" step="0.01" value={pForm.price} onChange={v => setPForm({ ...pForm, price: v })} placeholder="0.00" required />
                            <InputField label="Reorder Level" type="number" value={pForm.reorder_level} onChange={v => setPForm({ ...pForm, reorder_level: v })} required />
                        </div>
                        {/*
                            ===== PRODUCT IMAGE UPLOAD =====
                            Add an image upload input here:
                            <div>
                                <label>Product Image</label>
                                <input type="file" accept="image/*"
                                    onChange={(e) => setPForm({...pForm, image: e.target.files[0]})} />
                            </div>
                            Then update handleProductSubmit to use FormData.
                            ================================
                        */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
                            <CancelBtn onClick={closeProductModal} />
                            <SubmitBtn label={editingProduct ? 'Update' : 'Add Product'} />
                        </div>
                    </form>
                </Modal>
            )}

            {/* ======== ADD/EDIT BATCH MODAL ======== */}
            {(showBatch || editingBatch) && (
                <Modal title={editingBatch ? 'Edit Batch' : 'Add Batch'} onClose={closeBatchModal}>
                    <form onSubmit={handleBatchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {!editingBatch && (
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Product</label>
                                <select value={bForm.product_id} onChange={e => setBForm({ ...bForm, product_id: e.target.value })}
                                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'inherit' }} required>
                                    <option value="">Select a product...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        )}
                        <InputField label="Quantity" type="number" value={bForm.quantity} onChange={v => setBForm({ ...bForm, quantity: v })} placeholder="Enter quantity" required />
                        <InputField label="Expiry Date" type="date" value={bForm.expiry_date} onChange={v => setBForm({ ...bForm, expiry_date: v })} required />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
                            <CancelBtn onClick={closeBatchModal} />
                            <SubmitBtn label={editingBatch ? 'Update' : 'Add Batch'} />
                        </div>
                    </form>
                </Modal>
            )}

            <style>{`
                .product-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
                .add-card:hover { border-color: var(--primary); background: rgba(37, 99, 235, 0.03); }
                .table-row-hover:hover { background: var(--bg-card-hover); }
            `}</style>
        </div>
    );
};

/* ---- Small Sub-Components ---- */
const thStyle = { padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '14px 24px', fontSize: '14px', color: 'var(--text-secondary)' };
const iconBtn = { padding: '6px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const tableAction = { padding: '6px', borderRadius: '6px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' };

const ActionBtn = ({ onClick, label }) => (
    <button onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'var(--primary)', color: 'white', padding: '10px 20px',
        borderRadius: 'var(--radius-md)', border: 'none', fontSize: '13px', fontWeight: 600,
        cursor: 'pointer', boxShadow: '0 1px 3px rgba(37,99,235,0.3)'
    }}><Plus size={16} /> {label}</button>
);

const TabBtn = ({ active, onClick, label, count }) => (
    <button onClick={onClick} style={{
        padding: '12px 20px', fontSize: '14px', fontWeight: active ? 600 : 500,
        color: active ? 'var(--primary)' : 'var(--text-muted)', background: 'transparent',
        border: 'none', borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
        cursor: 'pointer', marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit'
    }}>
        {label}
        <span style={{ fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: active ? 'var(--primary-bg)' : 'var(--bg-input)', color: active ? 'var(--primary)' : 'var(--text-muted)' }}>{count}</span>
    </button>
);

const CancelBtn = ({ onClick }) => (
    <button type="button" onClick={onClick} style={{
        padding: '10px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
        background: 'white', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer'
    }}>Cancel</button>
);

const SubmitBtn = ({ label }) => (
    <button type="submit" style={{
        display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'white',
        padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', fontSize: '13px', fontWeight: 600,
        cursor: 'pointer', boxShadow: '0 1px 3px rgba(37,99,235,0.3)'
    }}>{label}</button>
);

const DetailItem = ({ label, value }) => (
    <div style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</p>
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</p>
    </div>
);

export default Products;
