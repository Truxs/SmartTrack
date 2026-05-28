const AlertPanel = ({ title, items, icon: Icon, emptyText, color }) => (
  <div
    style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}
  >
    <div
      style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: color === '#ef4444' ? 'var(--danger-bg)' : 'var(--warning-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={14} color={color} />
      </div>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
      <span
        style={{
          marginLeft: 'auto',
          background: items.length > 0 ? (color === '#ef4444' ? 'var(--danger-bg)' : 'var(--warning-bg)') : 'var(--success-bg)',
          color: items.length > 0 ? color : 'var(--success)',
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        {items.length}
      </span>
    </div>

    <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
      {items.length === 0 ? (
        <p style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>{emptyText || 'None'}</p>
      ) : (
        <div>
          {items.map((item, i) => (
            <div
              key={i}
              className="alert-item"
              style={{
                padding: '12px 20px',
                borderBottom: i < items.length - 1 ? '1px solid var(--border-light)' : 'none',
                transition: 'background 0.15s ease',
                cursor: 'default',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{item.name}</span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    fontFamily: "'SF Mono', 'Cascadia Code', monospace",
                    background: 'var(--bg-input)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {item.barcode}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
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
      .alert-item:hover { background: var(--bg-card-hover); }
    `}</style>
  </div>
);

export default AlertPanel;

