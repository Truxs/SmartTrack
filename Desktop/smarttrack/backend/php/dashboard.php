<?php
header('Access-Control-Allow-Origin: http://localhost:5175');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

try {
    // Total Products
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM products WHERE is_active = TRUE");
    $total_products = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Low Stock Items
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM products WHERE current_qty <= reorder_point AND is_active = TRUE");
    $low_stock = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Expiring Soon
    $stmt = $pdo->query("
        SELECT COUNT(*) as count 
        FROM products 
        WHERE expiry_date IS NOT NULL 
        AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) 
        AND expiry_date >= CURDATE() 
        AND is_active = TRUE
    ");
    $expiring_soon = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Total Inventory Value
    $stmt = $pdo->query("SELECT COALESCE(SUM(current_qty * unit_cost), 0) as total FROM products WHERE is_active = TRUE");
    $inventory_value = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Recent Activity
    $stmt = $pdo->query("
        (SELECT 'adjustment' as type, sa.created_at, p.name as item_name, sa.qty_change as change_qty, sa.reason as detail, NULL as total 
         FROM stock_adjustments sa 
         JOIN products p ON sa.product_id = p.id)
        UNION ALL
        (SELECT 'po' as type, po.created_at, s.name as item_name, NULL as change_qty, po.status as detail, po.total 
         FROM purchase_orders po 
         JOIN suppliers s ON po.supplier_id = s.id)
        ORDER BY created_at DESC LIMIT 5
    ");
    $recent_activity = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Alerts for frontend (existing alerts.php uses these)
    $stmt = $pdo->query("SELECT * FROM products WHERE current_qty <= reorder_point AND is_active = TRUE");
    $low_stock_items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->query("SELECT * FROM products WHERE expiry_date IS NOT NULL AND expiry_date < CURDATE() AND is_active = TRUE");
    $expired_items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->query("SELECT * FROM sales_history ORDER BY timestamp DESC");
    $sales_history = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->query("SELECT * FROM products WHERE is_active = TRUE");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => [
            'total_products' => (int)$total_products,
            'low_stock' => (int)$low_stock,
            'expiring_soon' => (int)$expiring_soon,
            'inventory_value' => (float)$inventory_value,
            'recent_activity' => $recent_activity,
            'low_stock_items' => $low_stock_items,
            'expired_items' => $expired_items,
            'expiring_soon_items' => [],
            'sales_history' => $sales_history,
            'products' => $products
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
