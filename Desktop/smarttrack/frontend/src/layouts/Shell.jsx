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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-body)' }}>

      {/* Sidebar slot (pinned) */}
      <div style={{ width: 'var(--sidebar-width)', flexShrink: 0 }}>{sidebar}</div>

      {/* Main column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top Bar (shared) */}
        <header style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          padding: '12px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 30,
          gap: '24px'
        }}>
          {headerContent}
        </header>

        {/* Page content slot */}
        <main style={{ flex: 1, padding: '28px 32px', maxWidth: '1400px', width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Shell;
