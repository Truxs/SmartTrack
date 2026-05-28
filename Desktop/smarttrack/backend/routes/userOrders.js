const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const { customer_id, customer_email, customer_phone } = req.query;
        let sql = 'SELECT * FROM customer_orders WHERE 1=1';
        const params = [];

        if (customer_id) {
            sql += ' AND customer_id = ?';
            params.push(customer_id);
        }
        if (customer_email) {
            sql += ' AND customer_email = ?';
            params.push(customer_email);
        }
        if (customer_phone) {
            sql += ' AND customer_phone = ?';
            params.push(customer_phone);
        }

        sql += ' ORDER BY created_at DESC';
        const [orders] = await db.query(sql, params);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [orders] = await db.query(
            'SELECT * FROM customer_orders WHERE id = ?',
            [req.params.id]
        );
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orders[0];
        const [items] = await db.query(`
            SELECT coi.*, p.name as product_name, p.image_url
            FROM customer_order_items coi
            JOIN products p ON coi.product_id = p.id
            WHERE coi.order_id = ?
        `, [req.params.id]);
        order.items = items;

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
