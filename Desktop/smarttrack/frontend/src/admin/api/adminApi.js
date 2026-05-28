import axios from 'axios';

const adminAPI = axios.create({ baseURL: 'http://localhost:5000/api' });

adminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ---------- Products ---------- */
export const getProducts = async (params = {}) => (await adminAPI.get('/products', { params })).data;
export const getProductByBarcode = async (barcode) => (await adminAPI.get(`/products/barcode/${barcode}`)).data;
export const deleteProduct = async (id) => (await adminAPI.delete(`/products/${id}`)).data;

/* ---------- Stock / Batches ---------- */
export const getStock = async () => {
  try {
    return (await adminAPI.get('/stock')).data;
  } catch {
    return [];
  }
};
export const createBatch = (data) => adminAPI.post('/stock', data);
export const updateBatch = (id, data) => adminAPI.put(`/stock/${id}`, data);
export const deleteBatch = (id) => adminAPI.delete(`/stock/${id}`);

/* ---------- Sales ---------- */
export const checkout = (barcode, quantity) => adminAPI.post('/sales/checkout', { barcode, quantity });
export const getSalesHistory = async () => {
  try {
    return (await adminAPI.get('/sales/history')).data;
  } catch {
    return [];
  }
};

/* ---------- Alerts ---------- */
export const getAlerts = async () => {
  try {
    return (await adminAPI.get('/alerts')).data;
  } catch {
    return { low_stock: [], expired: [], expiring_soon: [] };
  }
};

/* ---------- Suppliers ---------- */
export const getSuppliers = async () => (await adminAPI.get('/suppliers')).data;
export const getSupplierById = async (id) => (await adminAPI.get(`/suppliers/${id}`)).data;
export const createSupplier = async (data) => (await adminAPI.post('/suppliers', data)).data;
export const updateSupplier = async (id, data) => (await adminAPI.put(`/suppliers/${id}`, data)).data;
export const deleteSupplier = async (id) => (await adminAPI.delete(`/suppliers/${id}`)).data;

/* ---------- Purchase Orders ---------- */
export const getPurchaseOrders = async (params = {}) => (await adminAPI.get('/purchase-orders', { params })).data;
export const getPurchaseOrderById = async (id) => (await adminAPI.get(`/purchase-orders/${id}`)).data;

export default adminAPI;

