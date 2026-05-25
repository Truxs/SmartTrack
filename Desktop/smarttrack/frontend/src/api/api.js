/* ========================================
   API Service Layer
   All backend communication goes through here.
   ======================================== */

import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Attach JWT token to every outgoing request (if used elsewhere)
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/* ---------- Auth ---------- */
export const login    = async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
};
export const register = async (credentials) => {
    const response = await API.post('/auth/register', credentials);
    return response.data;
};

/* ---------- Products ---------- */
export const getProducts         = async () => {
    const response = await API.get('/products');
    return response.data;
};
export const getProductByBarcode = async (barcode) => {
    const response = await API.get(`/products/barcode/${barcode}`);
    return response.data;
};
export const createProduct       = async (data) => {
    const response = await API.post('/products', data);
    return response.data;
};
export const updateProduct       = async (id, data) => {
    const response = await API.put(`/products/${id}`, data);
    return response.data;
};
export const deleteProduct       = async (id) => {
    const response = await API.delete(`/products/${id}`);
    return response.data;
};

/* ---------- Stock / Batches ---------- */
export const getStock            = async () => {
    try {
        const response = await API.get('/stock');
        return response.data;
    } catch (e) {
        return [];
    }
};
export const getStockByProduct   = (productId)  => API.get(`/stock/product/${productId}`);
export const createBatch         = (data)       => API.post('/stock', data);
export const updateBatch         = (id, data)   => API.put(`/stock/${id}`, data);
export const deleteBatch         = (id)         => API.delete(`/stock/${id}`);

/* ---------- Sales ---------- */
export const checkout            = (barcode, quantity) => API.post('/sales/checkout', { barcode, quantity });
export const getSalesHistory     = async () => {
    try {
        const response = await API.get('/sales/history');
        return response.data;
    } catch (e) {
        return [];
    }
};

/* ---------- Alerts ---------- */
export const getAlerts           = async () => {
    try {
        const response = await API.get('/alerts');
        return response.data;
    } catch (e) {
        return { low_stock: [], expired: [], expiring_soon: [] };
    }
};

export default API;
