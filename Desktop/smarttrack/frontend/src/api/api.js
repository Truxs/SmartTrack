/* ========================================
   API Service Layer
   All backend communication goes through here.
   Base URL: http://localhost:5000/api
   ======================================== */

import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Attach JWT token to every outgoing request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/* ---------- Auth ---------- */
export const login = (credentials) => API.post('/auth/login', credentials);

/* ---------- Products ---------- */
export const getProducts      = ()           => API.get('/products');
export const getProductByBarcode = (barcode) => API.get(`/products/barcode/${barcode}`);
export const createProduct    = (data)       => API.post('/products', data);
export const updateProduct    = (id, data)   => API.put(`/products/${id}`, data);
export const deleteProduct    = (id)         => API.delete(`/products/${id}`);

/* ---------- Stock / Batches ---------- */
export const getStock         = ()           => API.get('/stock');
export const getStockByProduct = (productId) => API.get(`/stock/product/${productId}`);
export const createBatch      = (data)       => API.post('/stock', data);
export const updateBatch      = (id, data)   => API.put(`/stock/${id}`, data);
export const deleteBatch      = (id)         => API.delete(`/stock/${id}`);

/* ---------- Sales ---------- */
export const checkout         = (barcode, quantity) => API.post('/sales/checkout', { barcode, quantity });
export const getSalesHistory  = ()           => API.get('/sales/history');

/* ---------- Alerts ---------- */
export const getAlerts        = ()           => API.get('/alerts');

export default API;