const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const { product_id, reason, date_from, date_to } = req.query;
        
        let sql = `
            SELECT sa.*, p.name as product_name
            FROM stock_adjustments sa
            JOIN products p ON sa.product_id = p.id
            WHERE 1=1
        `;
        const params = [];

        if (product_id) {
            sql += " AND sa.product_id = ?";
            params.push(Number(product_id));
        }
        if (reason) {
            sql += " AND sa.reason = ?";
            params.push(reason);
        }
        if (date_from) {
            sql += " AND DATE(sa.created_at) >= ?";
            params.push(date_from);
        }
        if (date_to) {
            sql += " AND DATE(sa.created_at) <= ?";
            params.push(date_to);
        }

        sql += " ORDER BY sa.created_at DESC";
        const [adjustments] = await db.query(sql, params);
        res.json(adjustments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [productResult] = await connection.query(
            'SELECT current_qty FROM products WHERE id = ?',
            [req.body.product_id]
        );
        if (productResult.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = productResult[0];
        const newQty = product.current_qty + req.body.qty_change;
        if (newQty < 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Insufficient stock for this adjustment' });
        }

        const [result] = await connection.query(
            'INSERT INTO stock_adjustments (product_id, qty_change, reason, note) VALUES (?, ?, ?, ?)',
            [req.body.product_id, req.body.qty_change, req.body.reason, req.body.note || null]
        );

        await connection.query(
            'UPDATE products SET current_qty = ? WHERE id = ?',
            [newQty, req.body.product_id]
        );

        await connection.commit();
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
