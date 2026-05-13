const express = require('express');
const cors = require('cors');
const { router: authRouter, authenticate } = require('./routes/auth');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/products', authenticate, require('./routes/products'));
app.use('/api/stock', authenticate, require('./routes/stock'));
app.use('/api/sales', authenticate, require('./routes/sales'));
app.use('/api/alerts', authenticate, require('./routes/alerts'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', database: 'grocery_inventory' });
});

app.listen(PORT, () => {
    console.log(`🚀 SmartTrack Server running on http://localhost:${PORT}`);
});