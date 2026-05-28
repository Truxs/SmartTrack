import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Users, FileText, Search, ArrowUpDown } from 'lucide-react';
import { createSupplier, deleteSupplier, getProducts, getSuppliers, updateSupplier } from '../api/adminApi';
import Modal from '../../components/ui/Modal';
import InputField from '../../components/ui/InputField';
import { useNavigate } from 'react-router-dom';

const Suppliers = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [suRes, prRes] = await Promise.all([getSuppliers(), getProducts()]);
      setSuppliers(suRes || []);
      setProducts(prRes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Supplier name is required';
    if (!formData.phone.trim()) return 'Phone is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      if (editingSupplier) await updateSupplier(editingSupplier.id, formData);
      else await createSupplier(formData);

      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDeleteSupplier = async () => {
    if (!showDeleteConfirm) return;
    try {
      await deleteSupplier(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      notes: supplier.notes || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingSupplier(null);
    setFormData({ name: '', contact_person: '', phone: '', email: '', address: '', notes: '' });
    setFormError(null);
  };

  const handleSort = (column) => {
    if (sortBy === column) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedSuppliers = [...suppliers]
    .filter((supplier) => supplier.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      if (sortOrder === 'asc') return aVal.toString().localeCompare(bVal.toString());
      return bVal.toString().localeCompare(aVal.toString());
    });

  const totalPages = Math.ceil(filteredAndSortedSuppliers.length / itemsPerPage);
  const paginatedSuppliers = filteredAndSortedSuppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <FileText size={20} />
          <strong>Error loading suppliers</strong>
        </div>
        <p>{error}</p>
        <button onClick={fetchData} style={{ marginTop: '12px', padding: '8px 16px', border: '1px solid #b91c1c', background: 'white', borderRadius: '8px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Suppliers</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          <Plus size={18} />
          Add Supplier
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search by supplier name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-input)' }}>
              {[
                { key: 'name', label: 'Supplier' },
                { key: 'contact_person', label: 'Contact Person' },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
              ].map((col) => (
                <th
                  key={col.key}
                  style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort(col.key)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {col.label}
                    <ArrowUpDown size={12} />
                  </div>
                </th>
              ))}
              <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSuppliers.map((supplier) => (
              <tr key={supplier.id} onClick={() => navigate(`/admin/suppliers/${supplier.id}`)} style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={18} color="var(--primary)" />
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{supplier.name}</p>
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{supplier.contact_person || '-'}</p>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{supplier.phone || '-'}</p>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{supplier.email || '-'}</p>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(supplier);
                      }}
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm({ id: supplier.id, name: supplier.name });
                      }}
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedSuppliers.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Users size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
                  <p style={{ fontSize: '14px' }}>No suppliers found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid var(--border-light)' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedSuppliers.length)} of {filteredAndSortedSuppliers.length} suppliers
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: currentPage === 1 ? 'var(--bg-input)' : 'var(--bg-card)', color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-secondary)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: currentPage === page ? 'var(--primary)' : 'transparent', color: currentPage === page ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: currentPage === page ? 600 : 500 }}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: currentPage === totalPages ? 'var(--bg-input)' : 'var(--bg-card)', color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-secondary)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <Modal title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formError && <div style={{ padding: '10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '13px' }}>{formError}</div>}
            <InputField label="Supplier Name *" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} placeholder="Enter supplier name" required />
            <InputField label="Contact Person" value={formData.contact_person} onChange={(v) => setFormData({ ...formData, contact_person: v })} placeholder="Enter contact person name" />
            <InputField label="Phone *" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} placeholder="Enter phone number" required />
            <InputField label="Email" type="email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} placeholder="Enter email address" />
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Address</label>
              <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Enter supplier address" rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="e.g., Delivery on Tuesdays, payment due in 14 days" rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'white', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary)', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showDeleteConfirm && (
        <Modal title="Confirm Delete" onClose={() => setShowDeleteConfirm(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={20} color="#ef4444" />
              </div>
              <div>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>Are you sure you want to delete this supplier?</p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  <strong>{showDeleteConfirm.name}</strong>
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowDeleteConfirm(null)} style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleDeleteSupplier} style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: '#ef4444', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Suppliers;

