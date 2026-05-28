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
            HAVING current_stock <= p.reorder_point
            ORDER BY current_stock ASC
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

        // Expiring in 7 days
        const [expiring7Days] = await db.query(`
            SELECT sb.*, p.name, p.barcode,
                   DATEDIFF(sb.expiry_date, CURDATE()) as days_until_expiry,
                   'EXPIRING_7_DAYS' as alert_type
            FROM stock_batches sb
            JOIN products p ON sb.product_id = p.id
            WHERE sb.quantity > 0 AND sb.is_depleted = FALSE
              AND sb.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
              AND sb.expiry_date >= CURDATE()
            ORDER BY sb.expiry_date ASC
        `);

        // Expiring in 14 days
        const [expiring14Days] = await db.query(`
            SELECT sb.*, p.name, p.barcode,
                   DATEDIFF(sb.expiry_date, CURDATE()) as days_until_expiry,
                   'EXPIRING_14_DAYS' as alert_type
            FROM stock_batches sb
            JOIN products p ON sb.product_id = p.id
            WHERE sb.quantity > 0 AND sb.is_depleted = FALSE
              AND sb.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 14 DAY)
              AND sb.expiry_date > DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            ORDER BY sb.expiry_date ASC
        `);

        // Expiring in 30 days
        const [expiring30Days] = await db.query(`
            SELECT sb.*, p.name, p.barcode,
                   DATEDIFF(sb.expiry_date, CURDATE()) as days_until_expiry,
                   'EXPIRING_30_DAYS' as alert_type
            FROM stock_batches sb
            JOIN products p ON sb.product_id = p.id
            WHERE sb.quantity > 0 AND sb.is_depleted = FALSE
              AND sb.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
              AND sb.expiry_date > DATE_ADD(CURDATE(), INTERVAL 14 DAY)
            ORDER BY sb.expiry_date ASC
        `);

        // The user-facing frontend expects `expiring_soon` as a single list.
        const expiringSoon = [...expiring7Days, ...expiring14Days, ...expiring30Days];

        res.json({
            low_stock: lowStock,
            expired: expired,
            expiring_soon: expiringSoon,
            // Keep the detailed buckets for admin/diagnostics
            expiring_7_days: expiring7Days,
            expiring_14_days: expiring14Days,
            expiring_30_days: expiring30Days,
            total_alerts: lowStock.length + expired.length + expiringSoon.length
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;