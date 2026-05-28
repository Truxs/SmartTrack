const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const [totalProductsResult] = await db.query(
            'SELECT COUNT(*) as count FROM products WHERE is_active = TRUE'
        );
        const total_products = totalProductsResult[0].count;

        const [lowStockResult] = await db.query(
            'SELECT COUNT(*) as count FROM products WHERE current_qty <= reorder_point AND is_active = TRUE'
        );
        const low_stock = lowStockResult[0].count;

        const [expiringSoonResult] = await db.query(`
            SELECT COUNT(*) as count 
            FROM products 
            WHERE expiry_date IS NOT NULL 
            AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) 
            AND expiry_date >= CURDATE() 
            AND is_active = TRUE
        `);
        const expiring_soon = expiringSoonResult[0].count;

        const [inventoryValueResult] = await db.query(
            'SELECT COALESCE(SUM(current_qty * unit_cost), 0) as total FROM products WHERE is_active = TRUE'
        );
        const inventory_value = inventoryValueResult[0].total;

        const [recentActivity] = await db.query(`
            (SELECT 'adjustment' as type, sa.created_at, p.name as item_name, sa.qty_change as change_qty, sa.reason as detail, NULL as total 
             FROM stock_adjustments sa 
             JOIN products p ON sa.product_id = p.id)
            UNION ALL
            (SELECT 'po' as type, po.created_at, s.name as item_name, NULL as change_qty, po.status as detail, po.total 
             FROM purchase_orders po 
             JOIN suppliers s ON po.supplier_id = s.id)
            ORDER BY created_at DESC LIMIT 5
        `);

        const [lowStockItems] = await db.query(
            'SELECT * FROM products WHERE current_qty <= reorder_point AND is_active = TRUE'
        );

        const [expiredItems] = await db.query(
            'SELECT * FROM products WHERE expiry_date IS NOT NULL AND expiry_date < CURDATE() AND is_active = TRUE'
        );

        const [salesHistory] = await db.query('SELECT * FROM sales_history ORDER BY timestamp DESC');

        const [products] = await db.query('SELECT * FROM products WHERE is_active = TRUE');

        res.json({
            success: true,
            data: {
                total_products: Number(total_products),
                low_stock: Number(low_stock),
                expiring_soon: Number(expiring_soon),
                inventory_value: Number(inventory_value),
                recent_activity: recentActivity,
                low_stock_items: lowStockItems,
                expired_items: expiredItems,
                expiring_soon_items: [],
                sales_history: salesHistory,
                products: products
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
