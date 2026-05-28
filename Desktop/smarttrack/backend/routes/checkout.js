const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const [transactions] = await db.query(`
            SELECT t.*, co.customer_name, co.total as order_total
            FROM transactions t
            LEFT JOIN customer_orders co ON t.order_id = co.id
            ORDER BY t.created_at DESC
        `);
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        let total = 0;
        const receiptItems = [];

        for (const item of req.body.items) {
            const [productResult] = await connection.query(
                'SELECT * FROM products WHERE id = ? AND is_active = TRUE',
                [item.product_id]
            );
            if (productResult.length === 0) {
                await connection.rollback();
                return res.status(404).json({ error: `Product not found: ${item.product_id}` });
            }

            const product = productResult[0];
            if (product.current_qty < item.qty) {
                await connection.rollback();
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }

            const itemTotal = item.qty * product.sale_price;
            total += itemTotal;
            receiptItems.push({
                product_id: product.id,
                product_name: product.name,
                qty: item.qty,
                unit_price: product.sale_price,
                subtotal: itemTotal
            });
        }

        const [orderResult] = await connection.query(
            'INSERT INTO customer_orders (customer_name, customer_phone, total, status) VALUES (?, ?, ?, ?)',
            [req.body.customer_name || null, req.body.customer_phone || null, total, 'completed']
        );
        const orderId = orderResult.insertId;

        for (const item of receiptItems) {
            await connection.query(
                'INSERT INTO customer_order_items (order_id, product_id, qty, unit_price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.qty, item.unit_price]
            );

            await connection.query(
                'UPDATE products SET current_qty = current_qty - ? WHERE id = ?',
                [item.qty, item.product_id]
            );

            await connection.query(
                'INSERT INTO stock_adjustments (product_id, qty_change, reason, note) VALUES (?, ?, ?, ?)',
                [item.product_id, -item.qty, 'correction', `Checkout sale #${orderId}`]
            );

            await connection.query(
                'INSERT INTO sales_history (product_id, product_name, barcode, quantity_sold, total_price) VALUES (?, ?, ?, ?, ?)',
                [item.product_id, item.product_name, product.barcode || null, item.qty, item.subtotal]
            );
        }

        const amountReceived = req.body.amount_received || total;
        const changeDue = amountReceived - total;

        const [transactionResult] = await connection.query(
            'INSERT INTO transactions (order_id, payment_method, amount_received, change_due) VALUES (?, ?, ?, ?)',
            [orderId, req.body.payment_method || 'cash', amountReceived, changeDue]
        );
        const transactionId = transactionResult.insertId;

        await connection.commit();
        res.json({
            transaction_id: transactionId,
            order_id: orderId,
            total: total,
            change_due: changeDue,
            receipt_data: receiptItems
        });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
