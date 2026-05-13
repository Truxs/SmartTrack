const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all products with total stock
router.get('/', async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT p.*, COALESCE(SUM(sb.quantity), 0) as total_stock
            FROM products p
            LEFT JOIN stock_batches sb ON p.id = sb.product_id AND sb.is_depleted = FALSE
            GROUP BY p.id
            ORDER BY p.name
        `);
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET product by barcode
router.get('/barcode/:barcode', async (req, res) => {
    try {
        const [products] = await db.query(
            `SELECT p.*, COALESCE(SUM(sb.quantity), 0) as total_stock
             FROM products p
             LEFT JOIN stock_batches sb ON p.id = sb.product_id AND sb.is_depleted = FALSE
             WHERE p.barcode = ?
             GROUP BY p.id`,
            [req.params.barcode]
        );
        if (products.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json(products[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create product
router.post('/', async (req, res) => {
    const { barcode, name, category, price, reorder_level } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO products (barcode, name, category, price, reorder_level) VALUES (?, ?, ?, ?, ?)',
            [barcode, name, category, price, reorder_level || 10]
        );
        res.status(201).json({ id: result.insertId, barcode, name, category, price, reorder_level });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update product
router.put('/:id', async (req, res) => {
    const { barcode, name, category, price, reorder_level } = req.body;
    try {
        await db.query(
            'UPDATE products SET barcode=?, name=?, category=?, price=?, reorder_level=? WHERE id=?',
            [barcode, name, category, price, reorder_level, req.params.id]
        );
        res.json({ message: 'Product updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE product
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;