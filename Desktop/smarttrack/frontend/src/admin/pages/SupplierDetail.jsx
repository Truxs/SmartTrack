import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSupplierById } from '../api/adminApi';
import { ArrowLeft, Users } from 'lucide-react';

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getSupplierById(id);
        setSupplier(res);
      } catch (err) {
        setError(err?.message || 'Failed to load supplier');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', color: '#b91c1c' }}>
        <strong>Error loading supplier</strong>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: '12px', padding: '8px 16px', border: '1px solid #b91c1c', background: 'white', borderRadius: '8px', cursor: 'pointer' }}>
          Go back
        </button>
      </div>
    );
  }

  if (!supplier) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{supplier.name}</h1>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={16} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Supplier Details</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Detail label="Contact Person" value={supplier.contact_person || '-'} />
          <Detail label="Phone" value={supplier.phone || '-'} />
          <Detail label="Email" value={supplier.email || '-'} />
          <Detail label="Address" value={supplier.address || '-'} />
        </div>
        {supplier.notes ? (
          <div style={{ marginTop: '12px' }}>
            <Detail label="Notes" value={supplier.notes} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</p>
    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</p>
  </div>
);

export default SupplierDetail;

