const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get cart (by session_id or customer_id)
router.get('/', async (req, res) => {
    try {
        const { session_id, customer_id } = req.query;
        
        let cart;
        if (customer_id) {
            const [carts] = await db.query(
                'SELECT * FROM carts WHERE customer_id = ?',
                [customer_id]
            );
            cart = carts[0];
        } else if (session_id) {
            const [carts] = await db.query(
                'SELECT * FROM carts WHERE session_id = ?',
                [session_id]
            );
            cart = carts[0];
        }

        if (!cart) {
            return res.json({ id: null, items: [] });
        }

        const [items] = await db.query(`
            SELECT ci.*, p.name as product_name, p.sale_price as unit_price, p.image_url, p.current_qty as stock_qty
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
        `, [cart.id]);

        res.json({ ...cart, items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add item to cart
router.post('/items', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { session_id, customer_id, product_id, qty } = req.body;
        
        let cart;
        if (customer_id) {
            const [carts] = await connection.query(
                'SELECT * FROM carts WHERE customer_id = ?',
                [customer_id]
            );
            if (carts.length === 0) {
                const [result] = await connection.query(
                    'INSERT INTO carts (customer_id) VALUES (?)',
                    [customer_id]
                );
                cart = { id: result.insertId, customer_id };
            } else {
                cart = carts[0];
            }
        } else if (session_id) {
            const [carts] = await connection.query(
                'SELECT * FROM carts WHERE session_id = ?',
                [session_id]
            );
            if (carts.length === 0) {
                const [result] = await connection.query(
                    'INSERT INTO carts (session_id) VALUES (?)',
                    [session_id]
                );
                cart = { id: result.insertId, session_id };
            } else {
                cart = carts[0];
            }
        } else {
            await connection.rollback();
            return res.status(400).json({ error: 'Either session_id or customer_id is required' });
        }

        const [products] = await connection.query(
            'SELECT * FROM products WHERE id = ? AND is_active = TRUE AND current_qty > 0',
            [product_id]
        );
        if (products.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Product not found or out of stock' });
        }

        const [existingItems] = await connection.query(
            'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
            [cart.id, product_id]
        );

        if (existingItems.length > 0) {
            await connection.query(
                'UPDATE cart_items SET qty = qty + ? WHERE id = ?',
                [qty || 1, existingItems[0].id]
            );
        } else {
            await connection.query(
                'INSERT INTO cart_items (cart_id, product_id, qty) VALUES (?, ?, ?)',
                [cart.id, product_id, qty || 1]
            );
        }

        await connection.commit();

        const [items] = await connection.query(`
            SELECT ci.*, p.name as product_name, p.sale_price as unit_price, p.image_url, p.current_qty as stock_qty
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
        `, [cart.id]);

        res.json({ ...cart, items });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// Update cart item quantity
router.put('/items/:itemId', async (req, res) => {
    try {
        const { qty } = req.body;
        await db.query(
            'UPDATE cart_items SET qty = ? WHERE id = ?',
            [qty, req.params.itemId]
        );
        res.json({ message: 'Cart item updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Remove item from cart
router.delete('/items/:itemId', async (req, res) => {
    try {
        await db.query('DELETE FROM cart_items WHERE id = ?', [req.params.itemId]);
        res.json({ message: 'Cart item removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Clear entire cart
router.delete('/', async (req, res) => {
    try {
        const { session_id, customer_id } = req.query;
        let cartId;

        if (customer_id) {
            const [carts] = await db.query(
                'SELECT * FROM carts WHERE customer_id = ?',
                [customer_id]
            );
            if (carts.length > 0) cartId = carts[0].id;
        } else if (session_id) {
            const [carts] = await db.query(
                'SELECT * FROM carts WHERE session_id = ?',
                [session_id]
            );
            if (carts.length > 0) cartId = carts[0].id;
        }

        if (cartId) {
            await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
        }

        res.json({ message: 'Cart cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
