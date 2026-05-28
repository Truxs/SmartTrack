const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        let sql = 'SELECT * FROM customer_orders WHERE 1=1';
        const params = [];

        if (status) {
            sql += " AND status = ?";
            params.push(status);
        }
        sql += " ORDER BY created_at DESC";

        const [orders] = await db.query(sql, params);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [orders] = await db.query('SELECT * FROM customer_orders WHERE id = ?', [req.params.id]);
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orders[0];
        const [items] = await db.query(`
            SELECT coi.*, p.name as product_name
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

router.put('/:id', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [orderResult] = await connection.query('SELECT * FROM customer_orders WHERE id = ?', [req.params.id]);
        if (orderResult.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Order not found' });
        }

        const oldOrder = orderResult[0];
        const newStatus = req.body.status;

        const [items] = await connection.query(`
            SELECT coi.*, p.name as product_name
            FROM customer_order_items coi
            JOIN products p ON coi.product_id = p.id
            WHERE coi.order_id = ?
        `, [req.params.id]);

        if (oldOrder.status !== 'completed' && newStatus === 'completed') {
            for (const item of items) {
                await connection.query(
                    'UPDATE products SET current_qty = current_qty - ? WHERE id = ?',
                    [item.qty, item.product_id]
                );
            }
        } else if (oldOrder.status !== 'cancelled' && newStatus === 'cancelled') {
            for (const item of items) {
                await connection.query(
                    'UPDATE products SET current_qty = current_qty + ? WHERE id = ?',
                    [item.qty, item.product_id]
                );
            }
        }

        await connection.query('UPDATE customer_orders SET status = ? WHERE id = ?', [newStatus, req.params.id]);

        await connection.commit();
        res.json({ message: 'Order updated' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

router.delete('/:id', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [orderResult] = await connection.query('SELECT * FROM customer_orders WHERE id = ?', [req.params.id]);
        if (orderResult.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderResult[0];
        if (order.status !== 'cancelled') {
            const [items] = await connection.query(`
                SELECT coi.*, p.name as product_name
                FROM customer_order_items coi
                JOIN products p ON coi.product_id = p.id
                WHERE coi.order_id = ?
            `, [req.params.id]);

            for (const item of items) {
                await connection.query(
                    'UPDATE products SET current_qty = current_qty + ? WHERE id = ?',
                    [item.qty, item.product_id]
                );
            }

            await connection.query('UPDATE customer_orders SET status = ? WHERE id = ?', ['cancelled', req.params.id]);
        }

        await connection.commit();
        res.json({ message: 'Order cancelled' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
