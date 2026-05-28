import { useEffect, useRef, useState } from 'react';
import { checkout as checkoutApi, getProductByBarcode, getProducts } from '../api/adminApi';
import { AlertCircle, Check, Minus, Plus, ScanBarcode, Search, ShoppingCart, Trash2, X } from 'lucide-react';

const Checkout = () => {
  const [barcode, setBarcode] = useState('');
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [products, setProducts] = useState([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    inputRef.current?.focus();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const lookupProduct = async (code) => {
    if (!code.trim()) return;
    try {
      const product = await getProductByBarcode(code.trim());
      addToCart(product);
      setBarcode('');
      setMessage(null);
    } catch {
      setMessage({ type: 'error', text: 'Product not found for this barcode.' });
      setBarcode('');
    }
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      })
    );
  };

  const removeItem = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.qty, 0);

  const processCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    setMessage(null);

    const results = [];
    const errors = [];

    for (const item of cart) {
      try {
        const res = await checkoutApi(item.barcode, item.qty);
        results.push(res.data);
      } catch (err) {
        errors.push({ product: item.name, error: err.response?.data?.error || 'Checkout failed' });
      }
    }

    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.map((e) => `${e.product}: ${e.error}`).join('; ') });
    }

    if (results.length > 0) {
      const total = results.reduce((s, r) => s + parseFloat(r.total_price), 0);
      setLastReceipt({ items: results, total, date: new Date() });

      const soldBarcodes = results.map((r) => r.product.barcode);
      setCart((prev) => prev.filter((item) => !soldBarcodes.includes(item.barcode)));

      if (errors.length === 0) setMessage({ type: 'success', text: `Sale completed! Total: ₱${total.toFixed(2)}` });
    }

    setProcessing(false);
    fetchProducts();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      lookupProduct(barcode);
    }
  };

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(pickerSearch.toLowerCase()) || p.barcode.includes(pickerSearch));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Checkout</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Scan barcode or search products to process a sale</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScanBarcode size={16} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Scan Barcode</h3>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                ref={inputRef}
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Scan or type barcode here..."
                autoFocus
                style={{
                  flex: 1,
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  fontSize: '15px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                }}
              />
              <button
                onClick={() => lookupProduct(barcode)}
                style={{
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--primary)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Search size={16} /> Look up
              </button>
              <button
                onClick={() => setShowProductPicker(!showProductPicker)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Browse products"
              >
                <ShoppingCart size={16} />
              </button>
            </div>
          </div>

          {showProductPicker && (
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Search size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search products..."
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: 'var(--text-primary)', flex: 1, fontFamily: 'inherit' }}
                />
                <button onClick={() => setShowProductPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      addToCart(p);
                      setShowProductPicker(false);
                      setPickerSearch('');
                    }}
                    className="picker-item"
                    style={{
                      padding: '12px 20px',
                      borderBottom: '1px solid var(--border-light)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {p.barcode} • Stock: {p.total_stock || 0}
                      </p>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>₱{parseFloat(p.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {message && (
            <div
              style={{
                padding: '14px 20px',
                borderRadius: 'var(--radius-md)',
                background: message.type === 'error' ? 'var(--danger-bg)' : 'var(--success-bg)',
                border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                color: message.type === 'error' ? 'var(--danger)' : 'var(--success)',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {message.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
              {message.text}
            </div>
          )}

          {lastReceipt && (
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Last Receipt</h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lastReceipt.date.toLocaleString()}</span>
              </div>
              {lastReceipt.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {item.product.name} × {item.quantity_sold}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₱{parseFloat(item.total_price).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                <span>Total</span>
                <span>₱{lastReceipt.total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: '92px' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Cart</h3>
            <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-bg)', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>
              {cart.length} items
            </span>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {cart.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <ShoppingCart size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                <p style={{ fontSize: '13px' }}>Cart is empty</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>Scan a barcode to start</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>₱{parseFloat(item.price).toFixed(2)} each</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} style={{ padding: '4px', borderRadius: '6px', border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                      <button onClick={() => updateQty(item.id, -1)} style={qtyBtn}>
                        <Minus size={14} />
                      </button>
                      <span style={{ padding: '4px 14px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', minWidth: '32px', textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} style={qtyBtn}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>₱{(parseFloat(item.price) * item.qty).toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ padding: '20px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-input)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total</span>
              <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>₱{cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={processCheckout}
              disabled={cart.length === 0 || processing}
              style={{
                width: '100%',
                padding: '14px',
                background: cart.length === 0 ? 'var(--border)' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                color: cart.length === 0 ? 'var(--text-muted)' : 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '15px',
                fontWeight: 700,
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: cart.length > 0 ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
              }}
            >
              {processing ? 'Processing...' : (
                <>
                  <Check size={18} /> Process Sale
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .picker-item:hover { background: var(--bg-card-hover); }
      `}</style>
    </div>
  );
};

const qtyBtn = { padding: '6px 10px', border: 'none', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' };

export default Checkout;

