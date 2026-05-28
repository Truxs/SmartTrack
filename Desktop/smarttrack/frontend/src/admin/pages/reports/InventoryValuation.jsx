
import { useState, useEffect } from 'react';
import { TrendingUp, Package } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import adminApi from '../../api/adminApi';

const InventoryValuation = () => {
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

  const totalValuation = products.reduce((sum, p) => {
    const qty = Number(p.total_stock || p.current_qty || 0);
    const cost = Number(p.unit_cost || 0);
    return sum + (qty * cost);
  }, 0);

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + Number(p.total_stock || p.current_qty || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Inventory Valuation</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <StatCard 
          label="Total Inventory Value"
          value={`₱${totalValuation.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={TrendingUp}
        />
        <StatCard 
          label="Total Products"
          value={totalProducts}
          icon={Package}
        />
        <StatCard 
          label="Total Stock Units"
          value={totalStock}
          icon={Package}
        />
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
              <th style={{ textAlign: 'right', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Stock</th>
              <th style={{ textAlign: 'right', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Unit Cost</th>
              <th style={{ textAlign: 'right', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Total Value</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const stock = p.total_stock || p.current_qty || 0;
              const unitCost = p.unit_cost || 0;
              const value = stock * unitCost;
              return (
                <tr key={p.id} style={{ transition: 'background 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', fontSize: '14px', color: 'var(--text-primary)' }}>{p.name}</td>
                  <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', fontSize: '14px', color: 'var(--text-secondary)' }}>{p.category || 'N/A'}</td>
                  <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', textAlign: 'right', fontSize: '14px', color: 'var(--text-primary)' }}>{stock}</td>
                  <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', textAlign: 'right', fontSize: '14px', color: 'var(--text-primary)' }}>₱{unitCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: 'var(--primary)' }}>₱{value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryValuation;
