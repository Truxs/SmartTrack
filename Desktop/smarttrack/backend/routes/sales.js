const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /checkout - FIFO sale
router.post('/checkout', async (req, res) => {
    const { barcode, quantity } = req.body;
    const qtyToSell = parseInt(quantity) || 1;
    
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        // 1. Find product
        const [products] = await connection.query(
            'SELECT * FROM products WHERE barcode = ?', [barcode]
        );
        
        if (products.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const product = products[0];

        // 2. Get batches ordered by expiry (FIFO)
        const [batches] = await connection.query(
            `SELECT * FROM stock_batches 
             WHERE product_id = ? AND quantity > 0 AND is_depleted = FALSE
             AND expiry_date >= CURDATE()
             ORDER BY expiry_date ASC, date_received ASC`,
            [product.id]
        );

        const totalAvailable = batches.reduce((sum, b) => sum + b.quantity, 0);
        
        if (totalAvailable < qtyToSell) {
            await connection.rollback();
            return res.status(400).json({ 
                error: 'Insufficient stock',
                requested: qtyToSell,
                available: totalAvailable
            });
        }

        // 3. FIFO Deduction
        let remainingQty = qtyToSell;
        const deductedBatches = [];
        let totalPrice = 0;

        for (const batch of batches) {
            if (remainingQty <= 0) break;

            const deductQty = Math.min(remainingQty, batch.quantity);
            const newQty = batch.quantity - deductQty;
            
            await connection.query(
                `UPDATE stock_batches 
                 SET quantity = ?, is_depleted = ?
                 WHERE id = ?`,
                [newQty, newQty === 0, batch.id]
            );

            deductedBatches.push({
                batch_id: batch.id,
                expiry_date: batch.expiry_date,
                deducted: deductQty,
                remaining: newQty
            });

            remainingQty -= deductQty;
        }

        totalPrice = qtyToSell * product.price;

        // 4. Record sale
        await connection.query(
            'INSERT INTO sales (product_id, quantity_sold, total_price) VALUES (?, ?, ?)',
            [product.id, qtyToSell, totalPrice]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Sale completed (FIFO)',
            product: { name: product.name, barcode: product.barcode, price: product.price },
            quantity_sold: qtyToSell,
            total_price: totalPrice,
            batches_used: deductedBatches
        });

    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// GET sales history
router.get('/history', async (req, res) => {
    try {
        const [sales] = await db.query(`
            SELECT s.*, p.name as product_name, p.barcode
            FROM sales s
            JOIN products p ON s.product_id = p.id
            ORDER BY s.timestamp DESC
            LIMIT 100
        `);
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;