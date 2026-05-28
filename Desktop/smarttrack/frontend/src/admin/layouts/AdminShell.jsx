import React from 'react';

const AdminShell = ({ sidebar, headerContent, children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-body)' }}>
      <div style={{ width: 'var(--sidebar-width)', flexShrink: 0 }}>{sidebar}</div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {headerContent ? (
          <header
            style={{
              background: 'var(--bg-card)',
              borderBottom: '1px solid var(--border)',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              zIndex: 30,
              gap: '24px',
            }}
          >
            {headerContent}
          </header>
        ) : null}

        <main style={{ flex: 1, padding: '28px 32px', width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminShell;

