const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const [categories] = await db.query(
            'SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order, name'
        );
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [categories] = await db.query(
            'SELECT * FROM categories WHERE id = ? AND is_active = TRUE',
            [req.params.id]
        );
        if (categories.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(categories[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
