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
    try {
        const fields = [];
        const values = [];
        const placeholders = [];
        
        // Handle both JSON and FormData
        let data = req.body;
        if (req.is('multipart/form-data')) {
            data = { ...req.body };
        }
        
        if (data.barcode) { fields.push('barcode'); values.push(data.barcode); placeholders.push('?'); }
        if (data.name) { fields.push('name'); values.push(data.name); placeholders.push('?'); }
        if (data.category) { fields.push('category'); values.push(data.category); placeholders.push('?'); }
        if (data.price) { fields.push('price'); values.push(parseFloat(data.price)); placeholders.push('?'); }
        if (data.reorder_level) { fields.push('reorder_level'); values.push(parseInt(data.reorder_level)); placeholders.push('?'); }
        if (data.is_on_sale !== undefined) { fields.push('is_on_sale'); values.push(data.is_on_sale ? 1 : 0); placeholders.push('?'); }
        if (data.image_url) { fields.push('image_url'); values.push(data.image_url); placeholders.push('?'); }
        
        if (fields.length === 0) {
            return res.status(400).json({ error: 'No data provided' });
        }
        
        const [result] = await db.query(
            `INSERT INTO products (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`,
            values
        );
        res.status(201).json({ id: result.insertId, ...data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update product
router.put('/:id', async (req, res) => {
    try {
        const fields = [];
        const values = [];
        
        // Handle both JSON and FormData
        let data = req.body;
        if (req.is('multipart/form-data')) {
            data = { ...req.body };
        }
        
        if (data.barcode !== undefined) { fields.push('barcode = ?'); values.push(data.barcode); }
        if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
        if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category); }
        if (data.price !== undefined) { fields.push('price = ?'); values.push(parseFloat(data.price)); }
        if (data.reorder_level !== undefined) { fields.push('reorder_level = ?'); values.push(parseInt(data.reorder_level)); }
        if (data.is_on_sale !== undefined) { fields.push('is_on_sale = ?'); values.push(data.is_on_sale ? 1 : 0); }
        if (data.image_url !== undefined) { fields.push('image_url = ?'); values.push(data.image_url); }
        
        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        values.push(req.params.id);
        
        await db.query(
            `UPDATE products SET ${fields.join(', ')} WHERE id=?`,
            values
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