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
        if ($id) {
            // Get single supplier with nested data
            $stmt = $pdo->prepare("SELECT * FROM suppliers WHERE id = ?");
            $stmt->execute([$id]);
            $supplier = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$supplier) {
                http_response_code(404);
                echo json_encode(['error' => 'Supplier not found']);
                exit();
            }

            // Get products for this supplier
            $stmt = $pdo->prepare("
                SELECT id, name, current_qty, reorder_point, unit_cost 
                FROM products 
                WHERE supplier_id = ? AND is_active = TRUE
            ");
            $stmt->execute([$id]);
            $supplier['products'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get purchase orders for this supplier
            $stmt = $pdo->prepare("
                SELECT id, status, total, created_at 
                FROM purchase_orders 
                WHERE supplier_id = ?
            ");
            $stmt->execute([$id]);
            $supplier['purchase_orders'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode($supplier);
        } else {
            // Get all suppliers
            $stmt = $pdo->query("SELECT * FROM suppliers ORDER BY name");
            $suppliers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($suppliers);
        }
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        $stmt = $pdo->prepare("
            INSERT INTO suppliers (name, contact_name, email, phone, notes) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['name'],
            $data['contact_name'] ?? null,
            $data['email'] ?? null,
            $data['phone'] ?? null,
            $data['notes'] ?? null
        ]);
        $id = $pdo->lastInsertId();
        echo json_encode(['id' => $id, ...$data]);
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);

        $stmt = $pdo->prepare("
            UPDATE suppliers 
            SET name=?, contact_name=?, email=?, phone=?, notes=?
            WHERE id=?
        ");
        $stmt->execute([
            $data['name'],
            $data['contact_name'] ?? null,
            $data['email'] ?? null,
            $data['phone'] ?? null,
            $data['notes'] ?? null,
            $id
        ]);
        echo json_encode(['message' => 'Supplier updated']);
    } elseif ($method === 'DELETE') {
        // Check for active products before deleting
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM products WHERE supplier_id = ? AND is_active = TRUE");
        $stmt->execute([$id]);
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

        if ($count > 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Cannot delete supplier with active products']);
            exit();
        }

        $stmt = $pdo->prepare("DELETE FROM suppliers WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['message' => 'Supplier deleted']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
