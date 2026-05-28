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
        $group_by = isset($_GET['group_by']) ? trim($_GET['group_by']) : null;
        
        if ($group_by === 'category') {
            // Group by category for reports
            $stmt = $pdo->query("
                SELECT 
                    COALESCE(c.name, 'Uncategorized') as category_name,
                    COALESCE(SUM(p.current_qty), 0) as total_qty,
                    COALESCE(SUM(p.current_qty * p.unit_cost), 0) as total_value
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.is_active = TRUE
                GROUP BY c.name
            ");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($data);
            exit();
        }

        if ($id) {
            // Get single product
            $stmt = $pdo->prepare("
                SELECT p.*, s.name as supplier_name, c.name as category_name
                FROM products p
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.id = ? AND p.is_active = TRUE
            ");
            $stmt->execute([$id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$product) {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
                exit();
            }
            echo json_encode($product);
        } else {
            // Get all products with filters
            $search = isset($_GET['search']) ? trim($_GET['search']) : '';
            $category = isset($_GET['category']) ? trim($_GET['category']) : '';
            $supplier_id = isset($_GET['supplier_id']) ? (int)$_GET['supplier_id'] : null;
            $low_stock = isset($_GET['low_stock']) ? true : false;
            $expiring_soon = isset($_GET['expiring_soon']) ? true : false;

            $sql = "
                SELECT p.*, s.name as supplier_name, c.name as category_name
                FROM products p
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.is_active = TRUE
            ";
            $params = [];

            if ($search) {
                $sql .= " AND (p.name LIKE ? OR p.barcode LIKE ?)";
                $params[] = "%$search%";
                $params[] = "%$search%";
            }
            if ($category && $category !== 'All') {
                $sql .= " AND (p.category = ? OR c.name = ?)";
                $params[] = $category;
                $params[] = $category;
            }
            if ($supplier_id) {
                $sql .= " AND p.supplier_id = ?";
                $params[] = $supplier_id;
            }
            if ($low_stock) {
                $sql .= " AND p.current_qty <= p.reorder_point";
            }
            if ($expiring_soon) {
                $sql .= " AND p.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)";
            }

            $sql .= " ORDER BY p.name";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($products);
        }
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        $stmt = $pdo->prepare("
            INSERT INTO products (barcode, name, description, category, category_id, unit_cost, sale_price, current_qty, reorder_point, expiry_date, image_url, supplier_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['barcode'] ?? null,
            $data['name'],
            $data['description'] ?? null,
            $data['category'] ?? null,
            $data['category_id'] ?? null,
            $data['unit_cost'] ?? 0,
            $data['sale_price'] ?? $data['price'] ?? 0,
            $data['current_qty'] ?? 0,
            $data['reorder_point'] ?? $data['reorder_level'] ?? 10,
            $data['expiry_date'] ?? null,
            $data['image_url'] ?? null,
            $data['supplier_id'] ?? null
        ]);
        $id = $pdo->lastInsertId();
        echo json_encode(['id' => $id, ...$data]);
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);

        $stmt = $pdo->prepare("
            UPDATE products 
            SET barcode=?, name=?, description=?, category=?, category_id=?, unit_cost=?, sale_price=?, current_qty=?, reorder_point=?, expiry_date=?, image_url=?, supplier_id=?
            WHERE id=? AND is_active = TRUE
        ");
        $stmt->execute([
            $data['barcode'] ?? null,
            $data['name'],
            $data['description'] ?? null,
            $data['category'] ?? null,
            $data['category_id'] ?? null,
            $data['unit_cost'] ?? 0,
            $data['sale_price'] ?? $data['price'] ?? 0,
            $data['current_qty'] ?? 0,
            $data['reorder_point'] ?? $data['reorder_level'] ?? 10,
            $data['expiry_date'] ?? null,
            $data['image_url'] ?? null,
            $data['supplier_id'] ?? null,
            $id
        ]);
        echo json_encode(['message' => 'Product updated']);
    } elseif ($method === 'DELETE') {
        // Soft delete: set is_active = FALSE
        $stmt = $pdo->prepare("UPDATE products SET is_active = FALSE WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['message' => 'Product deleted']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
