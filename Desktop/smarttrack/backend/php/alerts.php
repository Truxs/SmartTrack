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
    // Low Stock
    $stmt = $pdo->query("
        SELECT p.*, COALESCE(SUM(sb.quantity), 0) as current_stock,
               'LOW_STOCK' as alert_type
        FROM products p
        LEFT JOIN stock_batches sb ON p.id = sb.product_id AND sb.is_depleted = FALSE
        GROUP BY p.id
        HAVING current_stock <= p.reorder_level
        ORDER BY current_stock ASC
    ");
    $lowStock = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Expired
    $stmt = $pdo->query("
        SELECT sb.*, p.name, p.barcode,
               DATEDIFF(CURDATE(), sb.expiry_date) as days_expired,
               'EXPIRED' as alert_type
        FROM stock_batches sb
        JOIN products p ON sb.product_id = p.id
        WHERE sb.quantity > 0 AND sb.is_depleted = FALSE
          AND sb.expiry_date < CURDATE()
        ORDER BY sb.expiry_date ASC
    ");
    $expired = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Expiring in 7 days
    $stmt = $pdo->query("
        SELECT sb.*, p.name, p.barcode,
               DATEDIFF(sb.expiry_date, CURDATE()) as days_until_expiry,
               'EXPIRING_7_DAYS' as alert_type
        FROM stock_batches sb
        JOIN products p ON sb.product_id = p.id
        WHERE sb.quantity > 0 AND sb.is_depleted = FALSE
          AND sb.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
          AND sb.expiry_date >= CURDATE()
        ORDER BY sb.expiry_date ASC
    ");
    $expiring7 = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'low_stock' => $lowStock,
        'expired' => $expired,
        'expiring_7_days' => $expiring7
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
