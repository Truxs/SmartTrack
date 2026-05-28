<?php
header('Access-Control-Allow-Origin: http://localhost:5175');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $product_id = isset($_GET['product_id']) ? (int)$_GET['product_id'] : null;
        $reason = isset($_GET['reason']) ? $_GET['reason'] : null;
        $date_from = isset($_GET['date_from']) ? $_GET['date_from'] : null;
        $date_to = isset($_GET['date_to']) ? $_GET['date_to'] : null;

        $sql = "
            SELECT sa.*, p.name as product_name
            FROM stock_adjustments sa
            JOIN products p ON sa.product_id = p.id
            WHERE 1=1
        ";
        $params = [];

        if ($product_id) {
            $sql .= " AND sa.product_id = ?";
            $params[] = $product_id;
        }
        if ($reason) {
            $sql .= " AND sa.reason = ?";
            $params[] = $reason;
        }
        if ($date_from) {
            $sql .= " AND DATE(sa.created_at) >= ?";
            $params[] = $date_from;
        }
        if ($date_to) {
            $sql .= " AND DATE(sa.created_at) <= ?";
            $params[] = $date_to;
        }

        $sql .= " ORDER BY sa.created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $adjustments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($adjustments);
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $pdo->beginTransaction();

        try {
            $stmt = $pdo->prepare("SELECT current_qty FROM products WHERE id = ?");
            $stmt->execute([$data['product_id']]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$product) {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
                exit();
            }

            $new_qty = $product['current_qty'] + $data['qty_change'];
            if ($new_qty < 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Insufficient stock for this adjustment']);
                exit();
            }

            $stmt = $pdo->prepare("
                INSERT INTO stock_adjustments (product_id, qty_change, reason, note) 
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([
                $data['product_id'],
                $data['qty_change'],
                $data['reason'],
                $data['note'] ?? null
            ]);
            $id = $pdo->lastInsertId();

            $stmt = $pdo->prepare("UPDATE products SET current_qty = ? WHERE id = ?");
            $stmt->execute([$new_qty, $data['product_id']]);

            $pdo->commit();
            echo json_encode(['id' => $id, ...$data]);
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
