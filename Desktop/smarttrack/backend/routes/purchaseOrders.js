const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        let sql = `
            SELECT po.*, s.name as supplier_name
            FROM purchase_orders po
            JOIN suppliers s ON po.supplier_id = s.id
        `;
        const params = [];

        if (status) {
            sql += " WHERE po.status = ?";
            params.push(status);
        }
        sql += " ORDER BY po.created_at DESC";

        const [orders] = await db.query(sql, params);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT po.*, s.name as supplier_name
            FROM purchase_orders po
            JOIN suppliers s ON po.supplier_id = s.id
            WHERE po.id = ?
        `, [req.params.id]);
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Purchase order not found' });
        }

        const order = orders[0];
        const [lineItems] = await db.query(`
            SELECT poi.*, p.name as product_name, (poi.qty_ordered * poi.unit_price) as subtotal
            FROM po_line_items poi
            JOIN products p ON poi.product_id = p.id
            WHERE poi.po_id = ?
        `, [req.params.id]);
        order.line_items = lineItems;

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        let total = 0;
        for (const item of req.body.items) {
            total += item.unit_price * item.qty_ordered;
        }

        const [poResult] = await connection.query(
            'INSERT INTO purchase_orders (supplier_id, status, total_amount) VALUES (?, ?, ?)',
            [req.body.supplier_id, 'draft', total]
        );
        const poId = poResult.insertId;

        for (const item of req.body.items) {
            await connection.query(
                'INSERT INTO po_line_items (po_id, product_id, qty_ordered, unit_price) VALUES (?, ?, ?, ?)',
                [poId, item.product_id, item.qty_ordered, item.unit_price]
            );
        }

        await connection.commit();
        res.status(201).json({ id: poId, supplier_id: req.body.supplier_id, status: 'draft', total_amount: total });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

router.put('/:id', async (req, res) => {
    const { action } = req.query;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        if (action === 'receive') {
            await connection.query('UPDATE purchase_orders SET status = ? WHERE id = ?', ['received', req.params.id]);
            
            if (req.body.items) {
                for (const item of req.body.items) {
                    await connection.query(
                        'UPDATE po_line_items SET qty_received = ? WHERE id = ?',
                        [item.qty_received, item.id]
                    );

                    if (item.qty_received > 0) {
                        await connection.query(
                            'UPDATE products SET current_qty = current_qty + ? WHERE id = ?',
                            [item.qty_received, item.product_id]
                        );

                        await connection.query(
                            'INSERT INTO stock_adjustments (product_id, qty_change, reason, note) VALUES (?, ?, ?, ?)',
                            [item.product_id, item.qty_received, 'received', `PO #${req.params.id} received`]
                        );
                    }
                }
            }
        } else {
            await connection.query('UPDATE purchase_orders SET status = ? WHERE id = ?', [req.body.status || 'sent', req.params.id]);
        }

        await connection.commit();
        res.json({ message: 'Purchase order updated' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
