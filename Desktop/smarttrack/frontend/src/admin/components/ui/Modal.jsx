import { X } from 'lucide-react';

const Modal = ({ title, children, onClose }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
    }}
  >
    <div
      className="animate-slide-in"
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        width: '100%',
        maxWidth: '480px',
        boxShadow: 'var(--shadow-xl)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
        <button
          onClick={onClose}
          style={{
            padding: '6px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--bg-input)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={18} />
        </button>
      </div>
      <div style={{ padding: '24px' }}>{children}</div>
    </div>
  </div>
);

export default Modal;

