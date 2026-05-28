
import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import adminApi from '../../api/adminApi';

const ExpiryReport = () => {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await adminApi.get('/products');
        setProducts(data.data || data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const today = new Date();
  const expiringSoon = products.filter(p => {
    if (!p.expiry_date) return false;
    const expiryDate = new Date(p.expiry_date);
    const daysDiff = (expiryDate - today) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30 && daysDiff > 0;
  }).sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));

  const expired = products.filter(p => {
    if (!p.expiry_date) return false;
    const expiryDate = new Date(p.expiry_date);
    return expiryDate < today;
  }).sort((a, b) => new Date(b.expiry_date) - new Date(a.expiry_date));

  const getDaysLeft = (expiryDate) => {
    const exp = new Date(expiryDate);
    return Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Expiry Report</h1>

      {/* Expiring Soon */}
      {expiringSoon.length > 0 && (
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Expiring in 30 Days or Less
          </h3>
          <div style={{ 
            background: 'var(--bg-card)', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--border)', 
            overflowX: 'auto',
            padding: '20px',
            marginBottom: '16px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead style={{ background: 'var(--bg-input)' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Product</th>
                  <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Expiry Date</th>
                  <th style={{ textAlign: 'right', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Stock</th>
                  <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {expiringSoon.map(p => {
                  const daysLeft = getDaysLeft(p.expiry_date);
                  const stock = Number(p.total_stock || p.current_qty || 0);
                  return (
                    <tr key={p.id} style={{ transition: 'background 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', fontSize: '14px', color: 'var(--text-primary)' }}>{p.name}</td>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', fontSize: '14px', color: 'var(--text-secondary)' }}>{new Date(p.expiry_date).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', textAlign: 'right', fontSize: '14px', color: 'var(--text-primary)' }}>{stock}</td>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', fontSize: '13px', fontWeight: 600, color: daysLeft <=7 ? '#dc2626' : '#ea580c' }}>
                        {daysLeft} days left
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expired */}
      {expired.length > 0 && (
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#dc2626', marginBottom: '12px' }}>
            Expired Products
          </h3>
          <div style={{ 
            background: 'var(--bg-card)', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid rgba(220,38,38,0.2)', 
            overflowX: 'auto',
            padding: '20px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead style={{ background: 'rgba(220,38,38,0.1)' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: '#dc2626', borderBottom: '1px solid rgba(220,38,38,0.2)' }}>Product</th>
                  <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: '#dc2626', borderBottom: '1px solid rgba(220,38,38,0.2)' }}>Expiry Date</th>
                  <th style={{ textAlign: 'right', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: '#dc2626', borderBottom: '1px solid rgba(220,38,38,0.2)' }}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {expired.map(p => {
                  const stock = Number(p.total_stock || p.current_qty || 0);
                  return (
                    <tr key={p.id} style={{ transition: 'background 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid rgba(220,38,38,0.1)', fontSize: '14px', color: 'var(--text-primary)' }}>{p.name}</td>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid rgba(220,38,38,0.1)', fontSize: '14px', color: '#dc2626' }}>{new Date(p.expiry_date).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid rgba(220,38,38,0.1)', textAlign: 'right', fontSize: '14px', color: '#dc2626', fontWeight:600 }}>{stock}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {expiringSoon.length === 0 && expired.length === 0 && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Calendar size={48} style={{ opacity: 0.4, marginBottom: '12px' }} />
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Great! No products are expiring or expired!</p>
        </div>
      )}
    </div>
  );
};

export default ExpiryReport;
