import React from 'react';

/**
 * Shell — shared layout shell used by Admin and User layouts.
 * Props:
 * - sidebar: React node to render inside the left aside
 * - headerContent: React node to render inside the header (instead of just right side)
 * - children: main page content (rendered inside Outlet area)
 */
const Shell = ({ sidebar, headerContent, children }) => {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: 'var(--bg-body)',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>

      {/* Sidebar slot (pinned) */}
      <div style={{ 
        width: 'var(--sidebar-width)', 
        flexShrink: 0,
        margin: 0,
        padding: 0
      }}>{sidebar}</div>

      {/* Main column */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        margin: 0,
        padding: 0
      }}>
        {/* Top Bar (shared) */}
        {headerContent ? (
          <header style={{
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
            margin: 0,
            boxSizing: 'border-box'
          }}>
            {headerContent}
          </header>
        ) : null}

        {/* Page content slot */}
        <main style={{ 
          flex: 1, 
          padding: '28px 32px', 
          width: '100%',
          margin: 0,
          boxSizing: 'border-box'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Shell;
