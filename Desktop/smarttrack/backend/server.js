const express = require('express');
const cors = require('cors');
const path = require('path');
const { router: authRouter, authenticate } = require('./routes/auth');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/products', require('./routes/products'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/purchase-orders', require('./routes/purchaseOrders'));
app.use('/api/stock-adjustments', require('./routes/stockAdjustments'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/checkout', require('./routes/checkout'));

// User-facing routes
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/user-orders', require('./routes/userOrders'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', database: 'grocery_inventory' });
});

app.listen(PORT, () => {
    console.log(`🚀 SmartTrack Server running on http://localhost:${PORT}`);
});