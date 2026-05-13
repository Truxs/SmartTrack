const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        // Low Stock
        const [lowStock] = await db.query(`
            SELECT p.*, COALESCE(SUM(sb.quantity), 0) as current_stock,
                   'LOW_STOCK' as alert_type
            FROM products p
            LEFT JOIN stock_batches sb ON p.id = sb.product_id AND sb.is_depleted = FALSE
            GROUP BY p.id
            HAVING current_stock <= p.reorder_level
            ORDER BY current_stock ASC
        `);

        // Expiring Soon (≤ 5 days)
        const [expiringSoon] = await db.query(`
            SELECT sb.*, p.name, p.barcode,
                   DATEDIFF(sb.expiry_date, CURDATE()) as days_until_expiry,
                   'EXPIRING_SOON' as alert_type
            FROM stock_batches sb
            JOIN products p ON sb.product_id = p.id
            WHERE sb.quantity > 0 AND sb.is_depleted = FALSE
              AND sb.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 5 DAY)
              AND sb.expiry_date >= CURDATE()
            ORDER BY sb.expiry_date ASC
        `);

        // Expired
        const [expired] = await db.query(`
            SELECT sb.*, p.name, p.barcode,
                   DATEDIFF(CURDATE(), sb.expiry_date) as days_expired,
                   'EXPIRED' as alert_type
            FROM stock_batches sb
            JOIN products p ON sb.product_id = p.id
            WHERE sb.quantity > 0 AND sb.is_depleted = FALSE
              AND sb.expiry_date < CURDATE()
            ORDER BY sb.expiry_date ASC
        `);

        res.json({
            low_stock: lowStock,
            expiring_soon: expiringSoon,
            expired: expired,
            total_alerts: lowStock.length + expiringSoon.length + expired.length
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;