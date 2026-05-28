import { useEffect, useState } from 'react';
import { getSalesHistory } from '../api/adminApi';
import { ArrowUpDown, Download, Search, ShoppingBag } from 'lucide-react';

const Orders = () => {
  const [sales, setSales] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sales, search, sortField, sortDir, dateFilter]);

  const fetchSales = async () => {
    try {
      const res = await getSalesHistory();
      setSales(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...sales];

    if (dateFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (dateFilter === 'today') cutoff.setHours(0, 0, 0, 0);
      else if (dateFilter === '7d') cutoff.setDate(now.getDate() - 7);
      else if (dateFilter === '30d') cutoff.setDate(now.getDate() - 30);
      result = result.filter((s) => new Date(s.timestamp) >= cutoff);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.product_name.toLowerCase().includes(q) || s.barcode.includes(q));
    }

    result.sort((a, b) => {
      let va = a[sortField],
        vb = b[sortField];
      if (sortField === 'total_price' || sortField === 'quantity_sold') {
        va = parseFloat(va);
        vb = parseFloat(vb);
      }
      if (sortField === 'timestamp') {
        va = new Date(va);
        vb = new Date(vb);
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    setFiltered(result);
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const exportCSV = () => {
    const headers = ['Product', 'Barcode', 'Quantity', 'Total (₱)', 'Date'];
    const rows = filtered.map((s) => [s.product_name, s.barcode, s.quantity_sold, s.total_price, new Date(s.timestamp).toLocaleString()]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smarttrack_sales_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalRevenue = filtered.reduce((sum, s) => sum + parseFloat(s.total_price), 0);
  const totalItems = filtered.reduce((sum, s) => sum + parseInt(s.quantity_sold), 0);
  const uniqueProducts = new Set(filtered.map((s) => s.product_name)).size;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Orders</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Complete sales history</p>
        </div>
        <button
          onClick={exportCSV}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <MiniStat label="Total Orders" value={filtered.length} />
        <MiniStat label="Items Sold" value={totalItems} />
        <MiniStat label="Products" value={uniqueProducts} />
        <MiniStat label="Revenue" value={`₱${totalRevenue.toFixed(2)}`} highlight />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 14px',
            flex: 1,
            maxWidth: '360px',
          }}
        >
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product or barcode..."
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: 'var(--text-primary)', width: '100%', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { v: 'all', l: 'All Time' },
            { v: 'today', l: 'Today' },
            { v: '7d', l: '7 Days' },
            { v: '30d', l: '30 Days' },
          ].map((f) => (
            <button
              key={f.v}
              onClick={() => setDateFilter(f.v)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: dateFilter === f.v ? 'var(--primary-bg)' : 'var(--bg-card)',
                color: dateFilter === f.v ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${dateFilter === f.v ? 'var(--primary)' : 'var(--border)'}`,
              }}
            >
              {f.l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-input)' }}>
              <SortableHeader label="Product" field="product_name" current={sortField} dir={sortDir} onSort={toggleSort} />
              <th style={thStyle}>Barcode</th>
              <SortableHeader label="Qty" field="quantity_sold" current={sortField} dir={sortDir} onSort={toggleSort} />
              <SortableHeader label="Total" field="total_price" current={sortField} dir={sortDir} onSort={toggleSort} />
              <SortableHeader label="Date" field="timestamp" current={sortField} dir={sortDir} onSort={toggleSort} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((sale) => (
              <tr key={sale.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--text-primary)' }}>{sale.product_name}</td>
                <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>{sale.barcode}</td>
                <td style={tdStyle}>
                  <span style={{ background: 'var(--bg-input)', padding: '2px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>{sale.quantity_sold}</span>
                </td>
                <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--text-primary)' }}>₱{parseFloat(sale.total_price).toFixed(2)}</td>
                <td style={{ ...tdStyle, fontSize: '13px', color: 'var(--text-muted)' }}>
                  <div>
                    <span>{new Date(sale.timestamp).toLocaleDateString()}</span>
                    <br />
                    <span style={{ fontSize: '11px' }}>{new Date(sale.timestamp).toLocaleTimeString()}</span>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                  <ShoppingBag size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                  <p>{loading ? 'Loading...' : 'No orders found'}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .table-row-hover:hover { background: var(--bg-card-hover); }
      `}</style>
    </div>
  );
};

const thStyle = { padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '14px 24px', fontSize: '14px', color: 'var(--text-secondary)' };

const SortableHeader = ({ label, field, current, dir, onSort }) => (
  <th style={{ ...thStyle, cursor: 'pointer', userSelect: 'none' }} onClick={() => onSort(field)}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {label}
      <ArrowUpDown size={12} style={{ opacity: current === field ? 1 : 0.3 }} />
    </div>
  </th>
);

const MiniStat = ({ label, value, highlight }) => (
  <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)' }}>
    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px' }}>{label}</p>
    <p style={{ fontSize: '22px', fontWeight: 700, color: highlight ? 'var(--primary)' : 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</p>
  </div>
);

export default Orders;

