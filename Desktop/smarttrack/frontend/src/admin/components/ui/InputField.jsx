const InputField = ({ label, type = 'text', ...props }) => (
  <div>
    <label
      style={{
        display: 'block',
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--text-secondary)',
        marginBottom: '6px',
      }}
    >
      {label}
    </label>
    <input
      type={type}
      {...props}
      onChange={(e) => props.onChange(e.target.value)}
      style={{
        width: '100%',
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        fontSize: '14px',
        color: 'var(--text-primary)',
        outline: 'none',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s ease',
        boxSizing: 'border-box',
      }}
    />
  </div>
);

export default InputField;

