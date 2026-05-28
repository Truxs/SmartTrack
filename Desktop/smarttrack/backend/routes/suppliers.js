const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const [suppliers] = await db.query('SELECT * FROM suppliers ORDER BY name');
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [suppliers] = await db.query('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
        if (suppliers.length === 0) {
            return res.status(404).json({ error: 'Supplier not found' });
        }
        const supplier = suppliers[0];

        const [products] = await db.query(
            'SELECT id, name, current_qty, reorder_point, unit_cost FROM products WHERE supplier_id = ? AND is_active = TRUE',
            [req.params.id]
        );
        supplier.products = products;

        const [purchaseOrders] = await db.query(
            'SELECT id, status, total, created_at FROM purchase_orders WHERE supplier_id = ?',
            [req.params.id]
        );
        supplier.purchase_orders = purchaseOrders;

        res.json(supplier);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { name, contact_name, contact_person, email, phone, notes, address } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO suppliers (name, contact_person, email, phone, address, notes) VALUES (?, ?, ?, ?, ?, ?)',
            [name, contact_name || contact_person || null, email || null, phone || null, address || null, notes || null]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        console.error('Supplier add error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { name, contact_name, contact_person, email, phone, notes, address } = req.body;
    try {
        await db.query(
            'UPDATE suppliers SET name=?, contact_person=?, email=?, phone=?, address=?, notes=? WHERE id=?',
            [name, contact_name || contact_person || null, email || null, phone || null, address || null, notes || null, req.params.id]
        );
        res.json({ message: 'Supplier updated' });
    } catch (err) {
        console.error('Supplier update error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [countResult] = await db.query(
            'SELECT COUNT(*) as count FROM products WHERE supplier_id = ? AND is_active = TRUE',
            [req.params.id]
        );
        if (countResult[0].count > 0) {
            return res.status(400).json({ error: 'Cannot delete supplier with active products' });
        }

        await db.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
        res.json({ message: 'Supplier deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
