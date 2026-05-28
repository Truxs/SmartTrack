<?php
header('Access-Control-Allow-Origin: http://localhost:5175');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    if ($method === 'GET') {
        $stmt = $pdo->query("
            SELECT sb.*, p.name as product_name, p.barcode
            FROM stock_batches sb
            JOIN products p ON sb.product_id = p.id
            ORDER BY sb.received_date DESC
        ");
        $stock = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($stock);
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("
            INSERT INTO stock_batches 
            (product_id, quantity, unit_price, received_date, expiry_date, is_depleted) 
            VALUES (?, ?, ?, ?, ?, FALSE)
        ");
        $stmt->execute([
            $data['product_id'],
            $data['quantity'],
            $data['unit_price'] ?? 0,
            date('Y-m-d'),
            $data['expiry_date'] ?? null
        ]);
        $id = $pdo->lastInsertId();
        echo json_encode(['id' => $id, ...$data]);
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("
            UPDATE stock_batches 
            SET quantity=?, expiry_date=? 
            WHERE id=?
        ");
        $stmt->execute([
            $data['quantity'],
            $data['expiry_date'],
            $id
        ]);
        echo json_encode(['message' => 'Stock batch updated']);
    } elseif ($method === 'DELETE') {
        $stmt = $pdo->prepare("DELETE FROM stock_batches WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['message' => 'Stock batch deleted']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
