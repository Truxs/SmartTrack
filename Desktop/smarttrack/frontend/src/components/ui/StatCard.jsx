import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, trendUp, color, bgColor }) => (
    <div className="stat-card" style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.2s ease',
        cursor: 'default'
    }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '8px' }}>
                    {label}
                </p>
                <p style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1
                }}>{value}</p>
                {trend && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px' }}>
                        {trendUp ?
                            <ArrowUpRight size={14} color="var(--success)" /> :
                            <ArrowDownRight size={14} color="var(--warning)" />
                        }
                        <span style={{
                            fontSize: '12px',
                            fontWeight: 500,
                            color: trendUp ? 'var(--success)' : 'var(--warning)'
                        }}>{trend}</span>
                    </div>
                )}
            </div>
            <div style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: bgColor || 'var(--primary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon size={22} color={color || 'var(--primary)'} />
            </div>
        </div>

        <style>{`
            .stat-card:hover {
                box-shadow: var(--shadow-md);
                transform: translateY(-1px);
            }
        `}</style>
    </div>
);

export default StatCard;
