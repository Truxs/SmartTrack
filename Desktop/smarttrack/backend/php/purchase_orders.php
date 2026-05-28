<?php
header('Access-Control-Allow-Origin: http://localhost:5175');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$action = isset($_GET['action']) ? $_GET['action'] : null;

try {
    if ($method === 'GET') {
        if ($id) {
            $stmt = $pdo->prepare("
                SELECT po.*, s.name as supplier_name
                FROM purchase_orders po
                JOIN suppliers s ON po.supplier_id = s.id
                WHERE po.id = ?
            ");
            $stmt->execute([$id]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                http_response_code(404);
                echo json_encode(['error' => 'Purchase order not found']);
                exit();
            }

            $stmt = $pdo->prepare("
                SELECT poi.*, p.name as product_name, (poi.qty_ordered * poi.unit_price) as subtotal
                FROM po_line_items poi
                JOIN products p ON poi.product_id = p.id
                WHERE poi.po_id = ?
            ");
            $stmt->execute([$id]);
            $order['line_items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode($order);
        } else {
            $status = isset($_GET['status']) ? $_GET['status'] : null;
            
            $sql = "
                SELECT po.*, s.name as supplier_name
                FROM purchase_orders po
                JOIN suppliers s ON po.supplier_id = s.id
            ";
            $params = [];

            if ($status) {
                $sql .= " WHERE po.status = ?";
                $params[] = $status;
            }

            $sql .= " ORDER BY po.created_at DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($orders);
        }
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $pdo->beginTransaction();

        try {
            $total = 0;
            foreach ($data['items'] as $item) {
                $total += $item['unit_price'] * $item['qty_ordered'];
            }

            $stmt = $pdo->prepare("
                INSERT INTO purchase_orders (supplier_id, status, total_amount) 
                VALUES (?, 'draft', ?)
            ");
            $stmt->execute([$data['supplier_id'], $total]);
            $po_id = $pdo->lastInsertId();

            foreach ($data['items'] as $item) {
                $stmt = $pdo->prepare("
                    INSERT INTO po_line_items (po_id, product_id, qty_ordered, unit_price) 
                    VALUES (?, ?, ?, ?)
                ");
                $stmt->execute([
                    $po_id,
                    $item['product_id'],
                    $item['qty_ordered'],
                    $item['unit_price']
                ]);
            }

            $pdo->commit();
            echo json_encode(['id' => $po_id, 'supplier_id' => $data['supplier_id'], 'status' => 'draft', 'total_amount' => $total]);
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);

        if ($action === 'receive') {
            $pdo->beginTransaction();
            try {
                $stmt = $pdo->prepare("UPDATE purchase_orders SET status = 'received' WHERE id = ?");
                $stmt->execute([$id]);

                if (isset($data['items'])) {
                    foreach ($data['items'] as $item) {
                        $stmt = $pdo->prepare("
                            UPDATE po_line_items SET qty_received = ? WHERE id = ?
                        ");
                        $stmt->execute([$item['qty_received'], $item['id']]);

                        if ($item['qty_received'] > 0) {
                            $stmt = $pdo->prepare("
                                UPDATE products SET current_qty = current_qty + ? WHERE id = ?
                            ");
                            $stmt->execute([$item['qty_received'], $item['product_id']]);

                            $stmt = $pdo->prepare("
                                INSERT INTO stock_adjustments (product_id, qty_change, reason, note)
                                VALUES (?, ?, 'received', ?)
                            ");
                            $stmt->execute([
                                $item['product_id'],
                                $item['qty_received'],
                                "PO #$id received"
                            ]);
                        }
                    }
                }

                $pdo->commit();
                echo json_encode(['message' => 'Purchase order received']);
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
        } else {
            $stmt = $pdo->prepare("
                UPDATE purchase_orders SET status = ? WHERE id = ?
            ");
            $stmt->execute([$data['status'] ?? 'sent', $id]);
            echo json_encode(['message' => 'Purchase order updated']);
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
