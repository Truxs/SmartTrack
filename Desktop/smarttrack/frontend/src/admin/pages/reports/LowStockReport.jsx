
import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import adminApi from '../../api/adminApi';

const LowStockReport = () => {
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

  const lowStockProducts = products.filter(p => {
    const stock = Number(p.total_stock || p.current_qty || 0);
    const reorderLevel = Number(p.reorder_level || p.reorder_point || 10);
    return stock <= reorderLevel;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Low Stock Report</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '10px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
        <AlertTriangle style={{ color: '#f97316' }} />
        <p style={{ fontSize: '14px', color: '#ea580c', margin:0 }}>
          {lowStockProducts.length} {lowStockProducts.length ===1 ? 'product' : 'products'} need to be restocked!
        </p>
      </div>

      <div style={{ 
        background: 'var(--bg-card)', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border)', 
        overflowX: 'auto',
        padding: '20px'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead style={{ background: 'var(--bg-input)' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Product</th>
              <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Category</th>
              <th style={{ textAlign: 'right', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Current Stock</th>
              <th style={{ textAlign: 'right', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Reorder Level</th>
              <th style={{ textAlign: 'right', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Shortage</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.map(p => {
              const stock = Number(p.total_stock || p.current_qty || 0);
              const reorderLevel = Number(p.reorder_level || p.reorder_point || 10);
              const shortage = Math.max(0, reorderLevel - stock);
              return (
                <tr key={p.id} style={{ transition: 'background 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', fontSize: '14px', color: 'var(--text-primary)' }}>{p.name}</td>
                  <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', fontSize: '14px', color: 'var(--text-secondary)' }}>{p.category || 'N/A'}</td>
                  <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', textAlign: 'right', fontSize: '14px', color: '#dc2626', fontWeight:600 }}>{stock}</td>
                  <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', textAlign: 'right', fontSize: '14px', color: 'var(--text-primary)' }}>{reorderLevel}</td>
                  <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', textAlign: 'right', fontSize: '14px', color: '#ea580c', fontWeight:600 }}>{shortage}</td>
                </tr>
              );
            })}
            {lowStockProducts.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Great! No products are low in stock!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStockReport;
