import { useEffect, useState } from 'react';
import { createBatch, deleteBatch, deleteProduct, getProducts, getStock, updateBatch } from '../api/adminApi';
import adminAPI from '../api/adminApi';
import Modal from '../../components/ui/Modal';
import InputField from '../../components/ui/InputField';
import { Edit3, Eye, Package, PackagePlus, Plus, Trash2, X, Scale, Search, Filter, ArrowUpDown } from 'lucide-react';

const getProductImage = (name = '', category = '') => {
  const n = name.toLowerCase();
  const c = category.toLowerCase();
  if (n.includes('tuna') || n.includes('sardine')) return 'https://images.unsplash.com/photo-1608685581781-a3b0e07dd224?auto=format&fit=crop&w=400&q=80';
  if (n.includes('cheese')) return 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=400&q=80';
  if (n.includes('chicken')) return 'https://images.unsplash.com/photo-1604503468506-a8da13d11bea?auto=format&fit=crop&w=400&q=80';
  if (n.includes('coca') || n.includes('cola')) return 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=400&q=80';
  if (n.includes('egg')) return 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=400&q=80';
  if (n.includes('juice') || n.includes('orange')) return 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=400&q=80';
  if (n.includes('chip') || n.includes('snack')) return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80';
  if (n.includes('bread')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80';
  if (n.includes('milk')) return 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80';
  if (n.includes('yogurt') || n.includes('yoghurt')) return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80';
  if (n.includes('rice')) return 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=400&q=80';
  if (n.includes('water')) return 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=400&q=80';
  if (n.includes('coffee')) return 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=400&q=80';
  if (n.includes('chocolate')) return 'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?auto=format&fit=crop&w=400&q=80';
  if (n.includes('butter')) return 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80';
  if (c.includes('dairy')) return 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80';
  if (c.includes('meat')) return 'https://images.unsplash.com/photo-1604503468506-a8da13d11bea?auto=format&fit=crop&w=400&q=80';
  if (c.includes('beverage') || c.includes('drink')) return 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=400&q=80';
  if (c.includes('bakery')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80';
  if (c.includes('snack')) return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80';
  if (c.includes('canned')) return 'https://images.unsplash.com/photo-1608685581781-a3b0e07dd224?auto=format&fit=crop&w=400&q=80';
  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
};

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
  const [preselectedProduct, setPreselectedProduct] = useState(null);
  const [showStockAdjustment, setShowStockAdjustment] = useState(false);
  const [adjustmentProduct, setAdjustmentProduct] = useState(null);
  const [adjustmentQty, setAdjustmentQty] = useState(1);
  const [adjustmentReason, setAdjustmentReason] = useState('manual');
  const [adjustmentNote, setAdjustmentNote] = useState('');
  const [topTab, setTopTab] = useState('All');
  const [sortBy, setSortBy] = useState('Popularity');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedFilterCategories, setSelectedFilterCategories] = useState([]);

  // All available categories from UserDashboard, sorted alphabetically
  // Category data matching UserDashboard
  const CATEGORIES = [
    { id: 'bakery', name: 'Bakery' },
    { id: 'beverages', name: 'Beverages' },
    { id: 'chilled-dairy', name: 'Chilled & Dairy' },
    { id: 'complete-home', name: 'Complete Home' },
    { id: 'fresh-meat', name: 'Fresh Meat & Seafood' },
    { id: 'fresh-produce', name: 'Fresh Produce' },
    { id: 'frozen', name: 'Frozen Goods' },
    { id: 'health-beauty', name: 'Health & Beauty' },
    { id: 'health-hygiene', name: 'Health & Hygiene Essentials' },
    { id: 'home-care', name: 'Home Care' },
    { id: 'international', name: 'International Goods' },
    { id: 'pantry', name: 'Pantry' },
    { id: 'pet-care', name: 'Pet Care' },
    { id: 'ready-cook', name: 'Ready to Cook' },
    { id: 'ready-heat', name: 'Ready to Heat & Eat' },
    { id: 'snacks', name: 'Snacks' },
  ].sort((a, b) => a.name.localeCompare(b.name));

  const productMatchesCategoryId = (product, categoryId) => {
    if (categoryId === 'All') return true;
    if (categoryId === 'chilled-dairy' && product.category === 'dairy') return true;
    if (categoryId === 'fresh-meat' && product.category === 'meat') return true;
    if (categoryId === 'fresh-produce' && product.category === 'produce') return true;
    if (categoryId === 'complete-home' && product.category === 'home-care') return true;
    if (categoryId === 'health-hygiene' && product.category === 'health-beauty') return true;
    return product.category === categoryId;
  };

  const emptyProduct = { barcode: '', name: '', category: '', price: '', reorder_level: 10, image_file: null, is_on_sale: false };
  const emptyBatch = { product_id: '', quantity: '', expiry_date: '' };
  const [pForm, setPForm] = useState(emptyProduct);
  const [bForm, setBForm] = useState(emptyBatch);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [pr, st] = await Promise.all([getProducts(), getStock()]);
    setProducts(pr || []);
    setStock(st || []);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('barcode', pForm.barcode);
    formData.append('name', pForm.name);
    formData.append('category', pForm.category);
    formData.append('price', parseFloat(pForm.price));
    formData.append('reorder_level', parseInt(pForm.reorder_level));
    formData.append('is_on_sale', pForm.is_on_sale);

    if (pForm.image_file) formData.append('image_file', pForm.image_file);

    try {
      if (editingProduct) {
        await adminAPI.put(`/products/${editingProduct.id}`, formData);
      } else {
        await adminAPI.post('/products', formData);
      }
      closeProductModal();
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(`Error saving product: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Delete this product? All associated batches will also be removed.')) {
      await deleteProduct(id);
      fetchData();
    }
  };

  const openEditProduct = (p) => {
    setEditingProduct(p);
    setPForm({ 
      barcode: p.barcode, 
      name: p.name, 
      category: p.category, 
      price: p.price, 
      reorder_level: p.reorder_level, 
      image_file: null,
      is_on_sale: !!p.is_on_sale
    });
    setShowProduct(true);
  };

  const closeProductModal = () => {
    setShowProduct(false);
    setEditingProduct(null);
    setPForm(emptyProduct);
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    if (editingBatch) await updateBatch(editingBatch.id, { quantity: parseInt(bForm.quantity), expiry_date: bForm.expiry_date });
    else await createBatch({ product_id: parseInt(bForm.product_id), quantity: parseInt(bForm.quantity), expiry_date: bForm.expiry_date });
    closeBatchModal();
    fetchData();
  };

  const handleDeleteBatch = async (id) => {
    if (confirm('Delete this batch?')) {
      await deleteBatch(id);
      fetchData();
    }
  };

  const openEditBatch = (b) => {
    setEditingBatch(b);
    setBForm({ product_id: b.product_id, quantity: b.quantity, expiry_date: b.expiry_date });
  };

  const openAddStockForProduct = (product) => {
    setEditingBatch(null);
    setBForm({ product_id: product.id, quantity: '', expiry_date: '' });
    setPreselectedProduct(product);
    setShowBatch(true);
  };

  const openStockAdjustment = (product) => {
    setAdjustmentProduct(product);
    setAdjustmentQty(1);
    setAdjustmentReason('manual');
    setAdjustmentNote('');
    setShowStockAdjustment(true);
  };

  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.post('/stock-adjustments', {
        product_id: adjustmentProduct.id,
        qty_change: adjustmentQty,
        reason: adjustmentReason,
        note: adjustmentNote
      });
      setShowStockAdjustment(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to adjust stock!');
    }
  };

  const closeBatchModal = () => {
    setShowBatch(false);
    setEditingBatch(null);
    setBForm(emptyBatch);
    setPreselectedProduct(null);
  };

  const toggleFilterCategory = (cat) => {
    setSelectedFilterCategories(prev => 
      prev.includes(cat) ? prev.filter(x => x !== cat) : [...prev, cat]
    );
  };

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

  const categories = ['All', ...CATEGORIES.map(c => c.id)];
  const categoryDisplayNames = {
    'All': 'All',
    ...Object.fromEntries(CATEGORIES.map(c => [c.id, c.name]))
  };

  let filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm);
    let matchesTopTab = true;
    if (topTab === 'New') {
      // For admin, "New" could just be random, or maybe based on some date
      matchesTopTab = true;
    } else if (topTab === 'Sale') {
      matchesTopTab = !!p.is_on_sale;
    }

    let matchesFilterCategories = true;
    if (selectedFilterCategories.length > 0) {
      matchesFilterCategories = selectedFilterCategories.some(cat => productMatchesCategoryId(p, cat));
    }

    return matchesSearch && matchesTopTab && matchesFilterCategories;
  });

  if (sortBy === 'Price: Low → High') {
    filteredProducts = [...filteredProducts].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (sortBy === 'Price: High → Low') {
    filteredProducts = [...filteredProducts].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  }

  const filteredStock = stock.filter((b) => {
    const matchesSearch = b.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || b.barcode.includes(searchTerm);
    return matchesSearch;
  });

  const productBatches = viewProduct ? stock.filter((b) => b.product_id === viewProduct.id) : [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* New Header (like user side) */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        width: '100%'
      }}>
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => setIsFilterModalOpen(true)} style={{
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
            {selectedFilterCategories.length > 0 && (
              <span style={{ 
                background: 'var(--primary)', 
                color: 'white', 
                padding: '2px 8px', 
                borderRadius: '9999px', 
                fontSize: '11px', 
                fontWeight: 700 
              }}>
                {selectedFilterCategories.length}
              </span>
            )}
          </button>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)'
          }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Sort by</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option>Popularity</option>
              <option>Price: Low → High</option>
              <option>Price: High → Low</option>
            </select>
            <ArrowUpDown size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {tab === 'products' && <ActionBtn onClick={() => setShowProduct(true)} label="Add Product" />}
          {tab === 'batches' && <ActionBtn onClick={() => { setPreselectedProduct(null); setBForm(emptyBatch); setShowBatch(true); }} label="Add Stock" icon={<PackagePlus size={16} />} />}
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '2px solid var(--border)' }}>
        <TabBtn active={tab === 'products'} onClick={() => setTab('products')} label="Products" count={filteredProducts.length} />
        <TabBtn active={tab === 'batches'} onClick={() => setTab('batches')} label="Stock Batches" count={filteredStock.length} />
      </div>

      {tab === 'products' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {filteredProducts.map((p) => {
              const s = stockStatus(p);
              return (
                <div
                  key={p.id}
                  className="product-card"
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    cursor: 'default',
                  }}
                >
                  <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={p.image_url || getProductImage(p.name, p.category)}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={(e) => {
                        e.target.src = getProductImage(p.name, p.category);
                      }}
                    />
                  </div>

                  <div style={{ padding: '14px 16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>{p.category} • Stock: {p.total_stock || 0}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>₱{parseFloat(p.price).toFixed(2)}</span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!p.is_on_sale} onChange={async (e) => {
                          try {
                            // Use JSON instead of FormData for this simple toggle
                            await adminAPI.put(`/products/${p.id}`, {
                              is_on_sale: e.target.checked ? 1 : 0
                            });
                            fetchData();
                          } catch (err) {
                            console.error('Failed to update sale status', err);
                            alert('Failed to update sale status');
                          }
                        }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>On Sale</span>
                      </label>
                    </div>
                    <button
                      onClick={() => openAddStockForProduct(p)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid var(--primary)',
                        background: 'var(--primary-bg)',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        fontFamily: 'inherit',
                        marginBottom: '8px',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--primary)';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--primary-bg)';
                        e.currentTarget.style.color = 'var(--primary)';
                      }}
                      title="Add Stock"
                    >
                      <PackagePlus size={13} /> Add Stock
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', background: 'var(--bg-input)', padding: '3px 8px', borderRadius: '4px', flex: 1 }}>{p.barcode}</span>
                      <button onClick={() => setViewProduct(p)} style={iconBtn} title="View Details">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => openEditProduct(p)} style={iconBtn} title="Edit">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} style={{ ...iconBtn, color: '#ef4444' }} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div
              onClick={() => setShowProduct(true)}
              className="add-card"
              style={{
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-lg)',
                border: '2px dashed #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '280px',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                gap: '8px',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={22} color="var(--text-secondary)" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Add an Item</span>
            </div>
          </div>
        </>
      )}

      {tab === 'batches' && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-input)' }}>
                {['Product', 'Qty', 'Expiry', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={thStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStock.map((b) => {
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
                        <button onClick={() => openEditBatch(b)} style={tableAction} title="Edit">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDeleteBatch(b.id)} style={{ ...tableAction, color: '#ef4444' }} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStock.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    <Package size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                    <p>No batches found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {viewProduct && (
        <Modal title={viewProduct.name} onClose={() => setViewProduct(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <DetailItem label="Barcode" value={viewProduct.barcode} />
              <DetailItem label="Category" value={categoryDisplayNames[viewProduct.category] || viewProduct.category} />
              <DetailItem label="Price" value={`₱${parseFloat(viewProduct.price).toFixed(2)}`} />
              <DetailItem label="Stock" value={`${viewProduct.total_stock || 0} units`} />
              <DetailItem label="Reorder Level" value={viewProduct.reorder_level} />
              <DetailItem label="Status" value={stockStatus(viewProduct).l} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setViewProduct(null);
                  openAddStockForProduct(viewProduct);
                }}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit' }}
              >
                <PackagePlus size={15} /> Add Stock for this Product
              </button>
              <button
                onClick={() => {
                  setViewProduct(null);
                  openStockAdjustment(viewProduct);
                }}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit' }}
              >
                <Scale size={15} /> Adjust Stock
              </button>
            </div>

            {productBatches.length > 0 ? (
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Active Batches</p>
                {productBatches.map((b) => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Qty: {b.quantity}</span>
                    <span style={{ color: 'var(--text-muted)' }}>Exp: {b.expiry_date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '12px 0' }}>No stock batches yet.</p>
            )}
          </div>
        </Modal>
      )}

      {showStockAdjustment && (
        <Modal title="Adjust Stock" onClose={() => setShowStockAdjustment(false)}>
          <form onSubmit={handleStockAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Product</label>
              <div style={{ padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--text-primary)' }}>
                {adjustmentProduct?.name}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InputField 
                label="Quantity Change" 
                type="number" 
                value={adjustmentQty} 
                onChange={(v) => setAdjustmentQty(Number(v))} 
                placeholder="E.g. 5 (add) or -3 (remove)" 
                required 
              />
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Reason</label>
                <select 
                  value={adjustmentReason} 
                  onChange={(e) => setAdjustmentReason(e.target.value)} 
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    fontSize: '14px',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="manual">Manual Adjustment</option>
                  <option value="received">Received</option>
                  <option value="sold">Sold</option>
                  <option value="damage">Damaged</option>
                  <option value="return">Returned</option>
                  <option value="expired">Expired</option>
                  <option value="theft">Theft</option>
                  <option value="correction">Correction</option>
                </select>
              </div>
            </div>
            <InputField 
              label="Note (optional)" 
              value={adjustmentNote} 
              onChange={(v) => setAdjustmentNote(v)} 
              placeholder="Add a note about this adjustment" 
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
              <button type="button" onClick={() => setShowStockAdjustment(false)} style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'white', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Submit Adjustment</button>
            </div>
          </form>
        </Modal>
      )}

      {isFilterModalOpen && (
        <Modal title="Filters" onClose={() => setIsFilterModalOpen(false)}>
          <div style={{ padding: '16px 0', overflowY: 'auto', maxHeight: '60vh' }}>
            {categories.map((cat) => (
              <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', cursor: 'pointer', borderBottom: '1px solid var(--border-light)' }}>
                <input 
                  type="checkbox" 
                  checked={selectedFilterCategories.includes(cat)} 
                  onChange={() => toggleFilterCategory(cat)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{categoryDisplayNames[cat]}</span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button onClick={() => setIsFilterModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
              Close
            </button>
          </div>
        </Modal>
      )}

      {showProduct && (
        <Modal title={editingProduct ? 'Edit Product' : 'Add Product'} onClose={closeProductModal}>
          <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <InputField label="Barcode" value={pForm.barcode} onChange={(v) => setPForm({ ...pForm, barcode: v })} placeholder="Enter barcode" required />
            <InputField label="Product Name" value={pForm.name} onChange={(v) => setPForm({ ...pForm, name: v })} placeholder="e.g. Canned Sardines" required />

            {/* Category Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Category</label>
              <select 
                value={pForm.category} 
                onChange={(e) => setPForm({ ...pForm, category: e.target.value })} 
                style={{ 
                  width: '100%', 
                  background: 'var(--bg-input)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '10px 14px', 
                  fontSize: '14px', 
                  color: 'var(--text-primary)', 
                  fontFamily: 'inherit', 
                  cursor: 'pointer'
                }}
                required
                aria-haspopup="listbox"
                dir="ltr"
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Product Image (Optional)</label>
              <div style={{ border: '2px dashed var(--border)', borderRadius: '10px', padding: '20px', textAlign: 'center', background: 'var(--bg-input)', cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => document.getElementById('admin-product-image-input').click()}>
                {pForm.image_file ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <img src={URL.createObjectURL(pForm.image_file)} alt="Preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '8px' }} />
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{pForm.image_file.name}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Click to upload an image (PNG, JPG)</p>
                  </div>
                )}
                <input
                  id="admin-product-image-input"
                  type="file"
                  accept="image/png, image/jpeg"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setPForm({ ...pForm, image_file: e.target.files[0] });
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InputField label="Price (₱)" type="number" step="0.01" value={pForm.price} onChange={(v) => setPForm({ ...pForm, price: v })} placeholder="0.00" required />
              <InputField label="Reorder Level" type="number" value={pForm.reorder_level} onChange={(v) => setPForm({ ...pForm, reorder_level: v })} required />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--bg-input)', borderRadius: '10px' }}>
              <input
                id="admin-is-on-sale"
                type="checkbox"
                checked={pForm.is_on_sale}
                onChange={(e) => setPForm({ ...pForm, is_on_sale: e.target.checked })}
                style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
              />
              <label htmlFor="admin-is-on-sale" style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, cursor: 'pointer' }}>
                Mark as On Sale
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
              <CancelBtn onClick={closeProductModal} />
              <SubmitBtn label={editingProduct ? 'Update' : 'Add Product'} />
            </div>
          </form>
        </Modal>
      )}

      {(showBatch || editingBatch) && (
        <Modal title={editingBatch ? 'Edit Stock Batch' : preselectedProduct ? `Add Stock — ${preselectedProduct.name}` : 'Add Stock'} onClose={closeBatchModal}>
          <form onSubmit={handleBatchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!editingBatch && (
              preselectedProduct ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--primary-bg)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '10px', padding: '12px 16px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Package size={18} color="white" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{preselectedProduct.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {preselectedProduct.category} • Current stock: {preselectedProduct.total_stock || 0}
                    </p>
                  </div>
                  <button type="button" onClick={() => { setPreselectedProduct(null); setBForm({ ...bForm, product_id: '' }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }} title="Change product">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Product</label>
                  <select value={bForm.product_id} onChange={(e) => setBForm({ ...bForm, product_id: e.target.value })} style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'inherit' }} required>
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock: {p.total_stock || 0})
                      </option>
                    ))}
                  </select>
                </div>
              )
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InputField label="Quantity to Add" type="number" min="1" value={bForm.quantity} onChange={(v) => setBForm({ ...bForm, quantity: v })} placeholder="e.g. 50" required />
              <InputField label="Expiry Date" type="date" value={bForm.expiry_date} onChange={(v) => setBForm({ ...bForm, expiry_date: v })} required />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
              <CancelBtn onClick={closeBatchModal} />
              <SubmitBtn label={editingBatch ? 'Update Batch' : 'Add Stock'} />
            </div>
          </form>
        </Modal>
      )}

      <style>{`
        .product-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
        .add-card:hover { border-color: var(--primary); background: rgba(37, 99, 235, 0.03); }
        .table-row-hover:hover { background: var(--bg-card-hover); }
        /* Style all select elements consistently */
        select {
          display: block;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          padding-right: 36px;
        }
        select::-webkit-calendar-picker-indicator {
          display: none;
        }
      `}</style>
    </div>
  );
};

const thStyle = { padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '14px 24px', fontSize: '14px', color: 'var(--text-secondary)' };
const iconBtn = { padding: '6px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const tableAction = { padding: '6px', borderRadius: '6px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' };

const ActionBtn = ({ onClick, label, icon }) => (
  <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 3px rgba(37,99,235,0.3)' }}>
    {icon || <Plus size={16} />} {label}
  </button>
);

const TabBtn = ({ active, onClick, label, count }) => (
  <button onClick={onClick} style={{ padding: '12px 20px', fontSize: '14px', fontWeight: active ? 600 : 500, color: active ? 'var(--primary)' : 'var(--text-muted)', background: 'transparent', border: 'none', borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit' }}>
    {label}
    <span style={{ fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: active ? 'var(--primary-bg)' : 'var(--bg-input)', color: active ? 'var(--primary)' : 'var(--text-muted)' }}>{count}</span>
  </button>
);

const CancelBtn = ({ onClick }) => (
  <button type="button" onClick={onClick} style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'white', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' }}>
    Cancel
  </button>
);

const SubmitBtn = ({ label }) => (
  <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 3px rgba(37,99,235,0.3)' }}>
    {label}
  </button>
);

const DetailItem = ({ label, value }) => (
  <div style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</p>
    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</p>
  </div>
);

export default Products;

