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
export const getProducts         = async (params = {}) => {
    const response = await API.get('/products', { params });
    // Some legacy UI code expects an axios-like shape (result.data),
    // while other parts expect the raw array/object. Provide both without touching UI.
    const data = response.data;
    if (data && typeof data === 'object' && !('data' in data)) {
        try { data.data = data; } catch { /* ignore non-extensible */ }
    }
    return data;
};
export const getProductByBarcode = async (barcode) => {
    const response = await API.get(`/products/barcode/${barcode}`);
    return response.data;
};
export const getProductById = async (id) => {
    const response = await API.get(`/products/${id}`);
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
        const data = response.data;
        if (data && typeof data === 'object' && !('data' in data)) {
            try { data.data = data; } catch { /* ignore */ }
        }
        return data;
    } catch (e) {
        return { low_stock: [], expired: [], expiring_soon: [] };
    }
};

/* ---------- Suppliers ---------- */
export const getSuppliers = async () => {
    const response = await API.get('/suppliers');
    return response.data;
};
export const getSupplierById = async (id) => {
    const response = await API.get(`/suppliers/${id}`);
    return response.data;
};
export const createSupplier = async (data) => {
    const response = await API.post('/suppliers', data);
    return response.data;
};
export const updateSupplier = async (id, data) => {
    const response = await API.put(`/suppliers/${id}`, data);
    return response.data;
};
export const deleteSupplier = async (id) => {
    const response = await API.delete(`/suppliers/${id}`);
    return response.data;
};

/* ---------- Purchase Orders ---------- */
export const getPurchaseOrders = async (status) => {
    const response = await API.get('/purchase-orders' + (status ? `?status=${status}` : ''));
    return response.data;
};
export const getPurchaseOrderById = async (id) => {
    const response = await API.get(`/purchase-orders/${id}`);
    return response.data;
};
export const createPurchaseOrder = async (data) => {
    const response = await API.post('/purchase-orders', data);
    return response.data;
};
export const updatePurchaseOrder = async (id, data) => {
    const response = await API.put(`/purchase-orders/${id}`, data);
    return response.data;
};
export const updatePurchaseOrderStatus = async (id, data) => {
    const response = await API.put(`/purchase-orders/${id}/status`, data);
    return response.data;
};
export const receivePurchaseOrder = async (id, data) => {
    const response = await API.put(`/purchase-orders/${id}?action=receive`, data);
    return response.data;
};

/* ---------- Stock Adjustments ---------- */
export const getStockAdjustments = async (params = {}) => {
    const response = await API.get('/stock-adjustments', { params });
    return response.data;
};
export const createStockAdjustment = async (data) => {
    const response = await API.post('/stock-adjustments', data);
    return response.data;
};

/* ---------- Orders ---------- */
export const getOrders = async (status) => {
    const response = await API.get('/orders' + (status ? `?status=${status}` : ''));
    return response.data;
};
export const getOrderById = async (id) => {
    const response = await API.get(`/orders/${id}`);
    return response.data;
};
export const updateOrder = async (id, data) => {
    const response = await API.put(`/orders/${id}`, data);
    return response.data;
};
export const deleteOrder = async (id) => {
    const response = await API.delete(`/orders/${id}`);
    return response.data;
};

/* ---------- Checkout ---------- */
export const processCheckout = async (data) => {
    const response = await API.post('/checkout', data);
    return response.data;
};
export const getTransactionHistory = async () => {
    const response = await API.get('/checkout');
    return response.data;
};

/* ---------- Dashboard ---------- */
export const getDashboardStats = async () => {
    const response = await API.get('/dashboard');
    return response.data;
};

/* ---------- User-Facing APIs ---------- */
export const getCategories = async () => {
    const response = await API.get('/categories');
    return response.data;
};
export const getCategoryById = async (id) => {
    const response = await API.get(`/categories/${id}`);
    return response.data;
};

export const getCart = async (params = {}) => {
    const response = await API.get('/cart', { params });
    return response.data;
};
export const addToCart = async (data) => {
    const response = await API.post('/cart/items', data);
    return response.data;
};
export const updateCartItem = async (itemId, data) => {
    const response = await API.put(`/cart/items/${itemId}`, data);
    return response.data;
};
export const removeFromCart = async (itemId) => {
    const response = await API.delete(`/cart/items/${itemId}`);
    return response.data;
};
export const clearCart = async (params = {}) => {
    const response = await API.delete('/cart', { params });
    return response.data;
};

export const getUserOrders = async (params = {}) => {
    const response = await API.get('/user-orders', { params });
    return response.data;
};
export const getUserOrderById = async (id) => {
    const response = await API.get(`/user-orders/${id}`);
    return response.data;
};

export default API;
