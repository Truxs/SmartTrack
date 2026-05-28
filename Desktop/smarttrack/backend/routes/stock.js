const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all stock batches
router.get('/', async (req, res) => {
    try {
        const [batches] = await db.query(`
            SELECT sb.*, p.name as product_name, p.barcode
            FROM stock_batches sb
            JOIN products p ON sb.product_id = p.id
            ORDER BY sb.expiry_date ASC
        `);
        res.json(batches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET batches for specific product
router.get('/product/:productId', async (req, res) => {
    try {
        const [batches] = await db.query(
            `SELECT * FROM stock_batches 
             WHERE product_id = ? AND is_depleted = FALSE
             ORDER BY expiry_date ASC`,
            [req.params.productId]
        );
        res.json(batches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST add stock batch
router.post('/', async (req, res) => {
    const { product_id, quantity, expiry_date } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO stock_batches (product_id, quantity, expiry_date, date_received, is_depleted) VALUES (?, ?, ?, NOW(), FALSE)',
            [product_id, quantity, expiry_date]
        );
        res.status(201).json({ id: result.insertId, product_id, quantity, expiry_date });
    } catch (err) {
        console.error('Stock add error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT update batch
router.put('/:id', async (req, res) => {
    const { quantity, expiry_date } = req.body;
    try {
        await db.query(
            'UPDATE stock_batches SET quantity=?, expiry_date=? WHERE id=?',
            [quantity, expiry_date, req.params.id]
        );
        res.json({ message: 'Batch updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE batch
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM stock_batches WHERE id = ?', [req.params.id]);
        res.json({ message: 'Batch deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;