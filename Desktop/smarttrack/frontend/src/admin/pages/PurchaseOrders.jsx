import { useState, useEffect } from 'react';
import { Plus, FileText, X, Package, CheckCircle2 } from 'lucide-react';
import { getProducts, getSuppliers, getPurchaseOrders } from '../api/adminApi';
import adminApi from '../api/adminApi';
import Modal from '../../components/ui/Modal';
import InputField from '../../components/ui/InputField';

// Category data matching UserDashboard, sorted alphabetically
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

const PurchaseOrders = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [items, setItems] = useState([]);

  const fetchData = async () => {
    try {
      const sups = await getSuppliers();
      const prods = await getProducts();
      const pos = await getPurchaseOrders();
      setSuppliers(sups || []);
      setProducts(prods || []);
      setPurchaseOrders(pos || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (showNew || purchaseOrders.length === 0) {
      fetchData();
    }
  }, [showNew]);

  const addItem = () => setItems([...items, { product_id: '', qty_ordered: 1, unit_price: 0 }]);

  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const updateItem = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setItems(newItems);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSupplier || items.length === 0) return alert('Select supplier and add at least one item!');

    const validItems = items.filter(i => i.product_id);
    if (validItems.length === 0) return alert('Please select at least one product!');

    adminApi.post('/purchase-orders', { 
      supplier_id: Number(selectedSupplier), 
      items: validItems.map(i => ({ ...i, product_id: Number(i.product_id) })) 
    }).then(() => {
      setShowNew(false);
      setSelectedSupplier('');
      setItems([]);
      fetchData(); // Refresh the list
      alert('Purchase order created!');
    }).catch(err => {
      console.error(err);
      alert(`Failed to create purchase order: ${err.response?.data?.error || err.message}`);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Purchase Orders</h1>
        <button
          onClick={() => setShowNew(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '10px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          <Plus size={18} />
          New PO
        </button>
      </div>

      {purchaseOrders.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <FileText size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>No Purchase Orders Yet</p>
          <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Create your first PO using the button above!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {purchaseOrders.map((po) => (
            <div
              key={po.id}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Package size={32} style={{ color: 'var(--primary)' }} />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    PO #{po.id} - {po.supplier_name}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, marginTop: '4px' }}>
                    Created: {new Date(po.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  ₱{Number(po.total_amount || 0).toFixed(2)}
                </span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: po.status === 'received' ? '#dcfce7' : po.status === 'sent' ? '#fef9c3' : '#f3f4f6',
                  color: po.status === 'received' ? '#166534' : po.status === 'sent' ? '#854d0e' : '#4b5563'
                }}>
                  {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <Modal title="Create New Purchase Order" onClose={() => setShowNew(false)}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Supplier</label>
              <select 
                value={selectedSupplier} 
                onChange={(e) => setSelectedSupplier(e.target.value)} 
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
                required
              >
                <option value="">Select a supplier...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Filter by Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)} 
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Items</label>
                <button type="button" onClick={addItem} style={{ fontSize: '13px', color: 'var(--primary)', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>
                  + Add Item
                </button>
              </div>

              {items.map((item, idx) => {
                const filteredProducts = products.filter(p => productMatchesCategoryId(p, selectedCategory));
                return (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                    <select 
                      value={item.product_id} 
                      onChange={(e) => updateItem(idx, 'product_id', e.target.value)} 
                      style={{
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px',
                        fontSize: '14px',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="">Select a product...</option>
                      {filteredProducts.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>

                    <InputField label="Qty" type="number" min="1" value={item.qty_ordered} onChange={(v) => updateItem(idx, 'qty_ordered', Number(v))} required />
                    <InputField label="Unit Price" type="number" step="0.01" min="0" value={item.unit_price} onChange={(v) => updateItem(idx, 'unit_price', Number(v))} required />

                    <button type="button" onClick={() => removeItem(idx)} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>
                      <X size="18" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
              <button type="button" onClick={() => setShowNew(false)} style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'white', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Create PO
              </button>
            </div>
          </form>
        </Modal>
      )}
      <style>{`
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

export default PurchaseOrders;

