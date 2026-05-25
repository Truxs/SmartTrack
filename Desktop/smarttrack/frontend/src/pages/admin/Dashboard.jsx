import { useState, useEffect } from 'react';
import { getAlerts, getSalesHistory, getProducts, getStock } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/ui/StatCard';
import AlertPanel from '../../components/ui/AlertPanel';
import {
    Package, DollarSign, TrendingDown, ShoppingBag,
    AlertTriangle, Clock, BarChart3, Tag
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({ products: 0, batches: 0, lowStock: 0, expired: 0, revenue: 0, totalSales: 0 });
    const [recentSales, setRecentSales] = useState([]);
    const [allSales, setAllSales] = useState([]);
    const [alerts, setAlerts] = useState({ low_stock: [], expired: [], expiring_soon: [] });
    const [chartData, setChartData] = useState([]);
    const [chartRange, setChartRange] = useState('7d');
    const [products, setProducts] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        buildChartData(allSales, chartRange);
    }, [allSales, chartRange]);

    const fetchData = async () => {
        try {
            const [alertsRes, salesRes, productsRes, stockRes] = await Promise.all([
                getAlerts(), getSalesHistory(), getProducts(), getStock()
            ]).catch(err => {
                console.warn('Some endpoints not yet implemented, using defaults');
                return [
                    { low_stock: [], expired: [], expiring_soon: [] },
                    [],
                    [],
                    []
                ];
            });

            const sales = salesRes || [];
            const revenue = sales.reduce((sum, s) => sum + parseFloat(s.total_price || 0), 0);
            const totalSales = sales.reduce((sum, s) => sum + parseInt(s.quantity_sold || 0), 0);

            setAlerts(alertsRes || { low_stock: [], expired: [], expiring_soon: [] });
            setAllSales(sales);
            setRecentSales(sales.slice(0, 8));
            setProducts(productsRes || []);
            setStats({
                products: (productsRes || []).length,
                batches: (stockRes || []).length,
                lowStock: (alertsRes?.low_stock || []).length,
                expired: (alertsRes?.expired || []).length,
                revenue,
                totalSales
            });
        } catch (err) { console.error('Dashboard fetch error:', err); }
    };

    /* Build chart data from actual sales, grouped by date */
    const buildChartData = (sales, range) => {
        const now = new Date();
        const days = range === '30d' ? 30 : range === '14d' ? 14 : 7;
        const dateMap = {};

        // Initialize all dates in range
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            dateMap[key] = { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), sales: 0, revenue: 0 };
        }

        // Fill from real sales data
        sales.forEach(sale => {
            const saleDate = new Date(sale.timestamp).toISOString().split('T')[0];
            if (dateMap[saleDate]) {
                dateMap[saleDate].sales += parseInt(sale.quantity_sold);
                dateMap[saleDate].revenue += parseFloat(sale.total_price);
            }
        });

        setChartData(Object.values(dateMap));
    };

    // Compute top selling products from sales data
    const topProducts = (() => {
        const map = {};
        allSales.forEach(s => {
            if (!map[s.product_name]) map[s.product_name] = { name: s.product_name, qty: 0, revenue: 0 };
            map[s.product_name].qty += parseInt(s.quantity_sold);
            map[s.product_name].revenue += parseFloat(s.total_price);
        });
        return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5);
    })();

    // Category breakdown from products
    const categoryBreakdown = (() => {
        const map = {};
        products.forEach(p => {
            const cat = p.category || 'Uncategorized';
            if (!map[cat]) map[cat] = { name: cat, count: 0, stock: 0 };
            map[cat].count++;
            map[cat].stock += parseInt(p.total_stock) || 0;
        });
        return Object.values(map).sort((a, b) => b.count - a.count);
    })();

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Welcome */}
            <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    Dashboard
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Welcome back, {user?.name}. Here's what's happening in your store.
                </p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <StatCard icon={Package} label="Total Products" value={stats.products}
                    trend={`${stats.batches} batches`} trendUp={true}
                    color="#2563eb" bgColor="rgba(37, 99, 235, 0.08)" />
                <StatCard icon={ShoppingBag} label="Total Items Sold" value={stats.totalSales}
                    trend={`${recentSales.length} recent`} trendUp={true}
                    color="#10b981" bgColor="rgba(16, 185, 129, 0.08)" />
                <StatCard icon={TrendingDown} label="Low Stock" value={stats.lowStock}
                    trend={stats.lowStock > 0 ? 'Needs attention' : 'All good'}
                    trendUp={stats.lowStock === 0}
                    color={stats.lowStock > 0 ? '#f59e0b' : '#10b981'}
                    bgColor={stats.lowStock > 0 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)'} />
                <StatCard icon={DollarSign} label="Total Revenue" value={`₱${stats.revenue.toFixed(2)}`}
                    trend={`${allSales.length} transactions`} trendUp={true}
                    color="#8b5cf6" bgColor="rgba(139, 92, 246, 0.08)" />
            </div>

            {/* Sales Chart + Top Products */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

                {/* Sales Chart (FUNCTIONAL - from real data) */}
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BarChart3 size={16} color="var(--primary)" />
                            </div>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Sales Overview</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {['7d', '14d', '30d'].map(r => (
                                <button key={r} onClick={() => setChartRange(r)} style={{
                                    padding: '5px 12px', borderRadius: '6px', border: 'none',
                                    background: chartRange === r ? 'var(--primary-bg)' : 'transparent',
                                    color: chartRange === r ? 'var(--primary)' : 'var(--text-muted)',
                                    fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                                }}>{r === '7d' ? '7 Days' : r === '14d' ? '14 Days' : '30 Days'}</button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.15} />
                                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                                formatter={(value, name) => [name === 'revenue' ? `₱${value.toFixed(2)}` : value, name === 'revenue' ? 'Revenue' : 'Items Sold']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#salesGradient)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Selling Products */}
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Tag size={14} color="#10b981" />
                        </div>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Top Sellers</h3>
                    </div>
                    <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                        {topProducts.length === 0 ? (
                            <p style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No sales data yet</p>
                        ) : topProducts.map((p, i) => (
                            <div key={i} className="top-product-item" style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{
                                        width: '24px', height: '24px', borderRadius: '6px',
                                        background: i === 0 ? '#fef3c7' : i === 1 ? '#f1f5f9' : i === 2 ? '#fff7ed' : 'var(--bg-input)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '11px', fontWeight: 700,
                                        color: i === 0 ? '#d97706' : i === 1 ? '#64748b' : i === 2 ? '#ea580c' : 'var(--text-muted)'
                                    }}>{i + 1}</span>
                                    <div>
                                        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</p>
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.qty} sold</p>
                                    </div>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>₱{p.revenue.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Alerts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <AlertPanel title="Low Stock" items={alerts.low_stock} icon={AlertTriangle}
                    emptyText="All items well stocked" color="#f59e0b" />
                <AlertPanel title="Expired" items={alerts.expired} icon={AlertTriangle}
                    emptyText="No expired items" color="#ef4444" />

                {/* Category Breakdown */}
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={14} color="#06b6d4" />
                        </div>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Categories</h3>
                        <span style={{ marginLeft: 'auto', background: 'var(--info-bg)', color: 'var(--info)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600 }}>
                            {categoryBreakdown.length}
                        </span>
                    </div>
                    <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                        {categoryBreakdown.length === 0 ? (
                            <p style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No categories</p>
                        ) : categoryBreakdown.map((cat, i) => (
                            <div key={i} style={{ padding: '10px 20px', borderBottom: i < categoryBreakdown.length - 1 ? '1px solid var(--border-light)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{cat.name}</p>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cat.count} products</p>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '3px 10px', borderRadius: '6px' }}>
                                    {cat.stock} units
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Sales Table */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={16} color="var(--primary)" />
                        </div>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Sales</h3>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, padding: '4px 10px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                        Last {recentSales.length} transactions
                    </span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-input)' }}>
                            {['Product', 'Barcode', 'Qty', 'Total', 'Time'].map(h => (
                                <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {recentSales.map(sale => (
                            <tr key={sale.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{sale.product_name}</td>
                                <td style={{ padding: '14px 24px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{sale.barcode}</td>
                                <td style={{ padding: '14px 24px' }}>
                                    <span style={{ background: 'var(--bg-input)', padding: '2px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                        {sale.quantity_sold}
                                    </span>
                                </td>
                                <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>₱{sale.total_price}</td>
                                <td style={{ padding: '14px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                    {new Date(sale.timestamp).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {recentSales.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                                    <ShoppingBag size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                                    <p>No sales recorded yet</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .table-row-hover:hover { background: var(--bg-card-hover); }
                .top-product-item:hover { background: var(--bg-card-hover); }
            `}</style>
        </div>
    );
};

export default Dashboard;
