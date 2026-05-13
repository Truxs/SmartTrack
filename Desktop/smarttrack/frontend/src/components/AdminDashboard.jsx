import { useState, useEffect } from 'react';
import { getAlerts, getSalesHistory, getProducts, getStock } from '../api/api';
import { useAuth } from '../context/AuthContext';
import {
    BarChart3, Package, AlertTriangle, DollarSign,
    TrendingDown, TrendingUp, Clock, ShoppingBag,
    ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ products: 0, batches: 0, lowStock: 0, expired: 0, revenue: 0 });
    const [recentSales, setRecentSales] = useState([]);
    const [alerts, setAlerts] = useState({ low_stock: [], expired: [] });
    const { user } = useAuth();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [alertsRes, salesRes, productsRes, stockRes] = await Promise.all([
                getAlerts(), getSalesHistory(), getProducts(), getStock()
            ]);
            const sales = salesRes.data;
            const revenue = sales.reduce((sum, s) => sum + parseFloat(s.total_price), 0);
            setAlerts(alertsRes.data);
            setRecentSales(sales.slice(0, 5));
            setStats({
                products: productsRes.data.length,
                batches: stockRes.data.length,
                lowStock: alertsRes.data.low_stock.length,
                expired: alertsRes.data.expired.length,
                revenue
            });
        } catch (err) { console.error(err); }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Welcome Header */}
            <div>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#0f172a',
                    letterSpacing: '-0.02em'
                }}>Dashboard</h1>
                <p style={{
                    fontSize: '14px',
                    color: '#94a3b8',
                    marginTop: '4px'
                }}>Welcome back, {user?.name}. Here's what's happening in your store.</p>
            </div>

            {/* Stat Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px'
            }}>
                <StatCard
                    icon={Package}
                    label="Total Products"
                    value={stats.products}
                    trend="+12%"
                    trendUp={true}
                    color="#2563eb"
                    bgColor="rgba(37, 99, 235, 0.08)"
                />
                <StatCard
                    icon={ShoppingBag}
                    label="Stock Batches"
                    value={stats.batches}
                    trend="Active"
                    trendUp={true}
                    color="#10b981"
                    bgColor="rgba(16, 185, 129, 0.08)"
                />
                <StatCard
                    icon={TrendingDown}
                    label="Low Stock"
                    value={stats.lowStock}
                    trend={stats.lowStock > 0 ? "Needs attention" : "All good"}
                    trendUp={stats.lowStock === 0}
                    color={stats.lowStock > 0 ? "#f59e0b" : "#10b981"}
                    bgColor={stats.lowStock > 0 ? "rgba(245, 158, 11, 0.08)" : "rgba(16, 185, 129, 0.08)"}
                />
                <StatCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={`₱${stats.revenue.toFixed(2)}`}
                    trend="+8.2%"
                    trendUp={true}
                    color="#8b5cf6"
                    bgColor="rgba(139, 92, 246, 0.08)"
                />
            </div>

            {/* Two Column Layout */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
            }}>
                {/* Low Stock Alerts */}
                <AlertPanel
                    title="Low Stock Alerts"
                    items={alerts.low_stock}
                    icon={AlertTriangle}
                    emptyText="All items are well stocked"
                    color="#f59e0b"
                />
                {/* Expired Items */}
                <AlertPanel
                    title="Expired Items"
                    items={alerts.expired}
                    icon={AlertTriangle}
                    emptyText="No expired items found"
                    color="#ef4444"
                />
            </div>

            {/* Recent Sales Table */}
            <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(37, 99, 235, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Clock size={16} color="#2563eb" />
                        </div>
                        <h3 style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#0f172a'
                        }}>Recent Sales</h3>
                    </div>
                    <span style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        fontWeight: 500,
                        padding: '4px 10px',
                        background: '#f8fafc',
                        borderRadius: '6px'
                    }}>Last 5 transactions</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={thStyle}>Product</th>
                            <th style={thStyle}>Qty</th>
                            <th style={thStyle}>Total</th>
                            <th style={thStyle}>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentSales.map(sale => (
                            <tr key={sale.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                                className="table-row-hover">
                                <td style={tdStyle}>
                                    <span style={{ fontWeight: 500, color: '#0f172a' }}>{sale.product_name}</span>
                                </td>
                                <td style={tdStyle}>
                                    <span style={{
                                        background: '#f1f5f9',
                                        padding: '2px 10px',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        color: '#475569'
                                    }}>{sale.quantity_sold}</span>
                                </td>
                                <td style={{ ...tdStyle, fontWeight: 600, color: '#0f172a' }}>₱{sale.total_price}</td>
                                <td style={{ ...tdStyle, color: '#94a3b8', fontSize: '13px' }}>
                                    {new Date(sale.timestamp).toLocaleTimeString()}
                                </td>
                            </tr>
                        ))}
                        {recentSales.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{
                                    padding: '40px',
                                    textAlign: 'center',
                                    color: '#94a3b8',
                                    fontSize: '14px'
                                }}>
                                    <ShoppingBag size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                                    <p>No sales recorded yet</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .table-row-hover:hover {
                    background: #f8fafc;
                }
            `}</style>
        </div>
    );
};

const thStyle = {
    padding: '12px 24px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

const tdStyle = {
    padding: '14px 24px',
    fontSize: '14px',
    color: '#475569'
};

const StatCard = ({ icon: Icon, label, value, trend, trendUp, color, bgColor }) => (
    <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        transition: 'all 0.2s ease',
        cursor: 'default'
    }}
        className="stat-card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
                <p style={{
                    fontSize: '13px',
                    color: '#94a3b8',
                    fontWeight: 500,
                    marginBottom: '8px'
                }}>{label}</p>
                <p style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                    lineHeight: 1
                }}>{value}</p>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '10px'
                }}>
                    {trendUp ?
                        <ArrowUpRight size={14} color="#10b981" /> :
                        <ArrowDownRight size={14} color="#f59e0b" />
                    }
                    <span style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: trendUp ? '#10b981' : '#f59e0b'
                    }}>{trend}</span>
                </div>
            </div>
            <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon size={22} color={color} />
            </div>
        </div>
    </div>
);

const AlertPanel = ({ title, items, icon: Icon, emptyText, color }) => (
    <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    }}>
        <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        }}>
            <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: color === '#ef4444' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon size={14} color={color} />
            </div>
            <h3 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#0f172a'
            }}>{title}</h3>
            <span style={{
                marginLeft: 'auto',
                background: items.length > 0 ? (color === '#ef4444' ? '#fef2f2' : '#fffbeb') : '#f0fdf4',
                color: items.length > 0 ? color : '#10b981',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600
            }}>{items.length}</span>
        </div>
        <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {items.length === 0 ? (
                <p style={{
                    padding: '32px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '13px'
                }}>{emptyText}</p>
            ) : (
                <div>
                    {items.map((item, i) => (
                        <div key={i} style={{
                            padding: '12px 20px',
                            borderBottom: i < items.length - 1 ? '1px solid #f8fafc' : 'none',
                            transition: 'background 0.15s ease',
                            cursor: 'default'
                        }}
                            className="alert-item-hover">
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: '#0f172a'
                                }}>{item.name}</span>
                                <span style={{
                                    fontSize: '11px',
                                    color: '#94a3b8',
                                    fontFamily: "'SF Mono', 'Cascadia Code', monospace",
                                    background: '#f8fafc',
                                    padding: '2px 8px',
                                    borderRadius: '4px'
                                }}>{item.barcode}</span>
                            </div>
                            <p style={{
                                fontSize: '12px',
                                color: '#94a3b8',
                                marginTop: '4px'
                            }}>
                                {item.current_stock !== undefined
                                    ? `${item.current_stock} units remaining (reorder at ${item.reorder_level})`
                                    : item.days_expired !== undefined
                                        ? `Expired ${item.days_expired} days ago`
                                        : `Expires in ${item.days_until_expiry} days`}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <style>{`
            .alert-item-hover:hover {
                background: #f8fafc;
            }
            .stat-card:hover {
                box-shadow: 0 4px 12px rgba(0,0,0,0.06);
                transform: translateY(-1px);
            }
        `}</style>
    </div>
);

export default AdminDashboard;