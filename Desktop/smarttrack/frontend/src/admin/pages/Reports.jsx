
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BarChart2, TrendingUp, AlertTriangle, Calendar, TrendingDown } from 'lucide-react';

const Reports = () => {
  const location = useLocation();
  
  const reportTabs = [
    { path: '/admin/reports/inventory', label: 'Inventory Valuation', icon: TrendingUp },
    { path: '/admin/reports/movement', label: 'Stock Movement', icon: BarChart2 },
    { path: '/admin/reports/low-stock', label: 'Low Stock', icon: AlertTriangle },
    { path: '/admin/reports/expiry', label: 'Expiry', icon: Calendar },
    { path: '/admin/reports/waste', label: 'Waste Analysis', icon: TrendingDown },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Reports</h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {reportTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Reports;
