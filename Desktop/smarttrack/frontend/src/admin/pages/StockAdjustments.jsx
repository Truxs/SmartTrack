
import { useState, useEffect } from 'react';
import { Sliders } from 'lucide-react';
import adminApi from '../api/adminApi';

const StockAdjustments = () => {
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
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Stock Adjustments</h1>

      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-input)' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Product</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Change</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Reason</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Note</th>
            </tr>
          </thead>
          <tbody>
            {adjustments.map(adj => (
            <tr key={adj.id}>
              <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', fontSize: '14px', color: 'var(--text-primary)' }}>
                {new Date(adj.created_at || adj.date).toLocaleDateString()}
              </td>
              <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', fontSize: '14px', color: 'var(--text-primary)' }}>
                {adj.product_name || 'Product'}
              </td>
              <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', fontSize: '14px', color: adj.qty_change > 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                {adj.qty_change > 0 ? '+' : ''}{adj.qty_change}
              </td>
              <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {adj.reason}
              </td>
              <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                {adj.note || '-'}
              </td>
            </tr>
            ))}
            {adjustments.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No stock adjustments recorded yet!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockAdjustments;
