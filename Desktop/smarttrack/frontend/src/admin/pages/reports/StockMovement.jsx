
import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import adminApi from '../../api/adminApi';

const StockMovement = () => {
  const [adjustments, setAdjustments] = useState([]);
  
  useEffect(() => {
    const fetchAdjustments = async () => {
      try {
        const data = await adminApi.get('/stock-adjustments');
        setAdjustments(data.data || data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAdjustments();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Stock Movement</h1>

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
              <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Product</th>
              <th style={{ textAlign: 'right', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Change</th>
              <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Reason</th>
              <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Note</th>
            </tr>
          </thead>
          <tbody>
            {adjustments.map(adj => (
            <tr key={adj.id} style={{ transition: 'background 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', fontSize: '14px', color: 'var(--text-primary)' }}>
                {new Date(adj.created_at || adj.date).toLocaleString()}
              </td>
              <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', fontSize: '14px', color: 'var(--text-primary)' }}>
                {adj.product_name || 'Product'}
              </td>
              <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', textAlign: 'right', fontSize: '14px', color: Number(adj.qty_change) > 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                {Number(adj.qty_change) > 0 ? '+' : ''}{Number(adj.qty_change)}
              </td>
              <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {adj.reason}
              </td>
              <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                {adj.note || '-'}
              </td>
            </tr>
            ))}
            {adjustments.length ===0 && (
              <tr>
                <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No stock movements yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMovement;
