<?php
header('Access-Control-Allow-Origin: http://localhost:5175');
header('Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS');
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
            $stmt = $pdo->prepare("SELECT * FROM customer_orders WHERE id = ?");
            $stmt->execute([$id]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found']);
                exit();
            }

            $stmt = $pdo->prepare("
                SELECT coi.*, p.name as product_name
                FROM customer_order_items coi
                JOIN products p ON coi.product_id = p.id
                WHERE coi.order_id = ?
            ");
            $stmt->execute([$id]);
            $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode($order);
        } else {
            $status = isset($_GET['status']) ? $_GET['status'] : null;
            
            $sql = "SELECT * FROM customer_orders WHERE 1=1";
            $params = [];

            if ($status) {
                $sql .= " AND status = ?";
                $params[] = $status;
            }

            $sql .= " ORDER BY created_at DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($orders);
        }
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        $pdo->beginTransaction();

        try {
            $stmt = $pdo->prepare("SELECT * FROM customer_orders WHERE id = ?");
            $stmt->execute([$id]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found']);
                exit();
            }

            $old_status = $order['status'];
            $new_status = $data['status'];

            $stmt = $pdo->prepare("
                SELECT coi.*, p.name as product_name
                FROM customer_order_items coi
                JOIN products p ON coi.product_id = p.id
                WHERE coi.order_id = ?
            ");
            $stmt->execute([$id]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($old_status !== 'completed' && $new_status === 'completed') {
                foreach ($items as $item) {
                    $stmt = $pdo->prepare("
                        UPDATE products SET current_qty = current_qty - ? WHERE id = ?
                    ");
                    $stmt->execute([$item['qty'], $item['product_id']]);
                }
            } elseif ($old_status !== 'cancelled' && $new_status === 'cancelled') {
                foreach ($items as $item) {
                    $stmt = $pdo->prepare("
                        UPDATE products SET current_qty = current_qty + ? WHERE id = ?
                    ");
                    $stmt->execute([$item['qty'], $item['product_id']]);
                }
            }

            $stmt = $pdo->prepare("UPDATE customer_orders SET status = ? WHERE id = ?");
            $stmt->execute([$new_status, $id]);

            $pdo->commit();
            echo json_encode(['message' => 'Order updated']);
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    } elseif ($method === 'DELETE') {
        $pdo->beginTransaction();

        try {
            $stmt = $pdo->prepare("SELECT * FROM customer_orders WHERE id = ?");
            $stmt->execute([$id]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found']);
                exit();
            }

            if ($order['status'] !== 'cancelled') {
                $stmt = $pdo->prepare("
                    SELECT coi.*, p.name as product_name
                    FROM customer_order_items coi
                    JOIN products p ON coi.product_id = p.id
                    WHERE coi.order_id = ?
                ");
                $stmt->execute([$id]);
                $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

                foreach ($items as $item) {
                    $stmt = $pdo->prepare("
                        UPDATE products SET current_qty = current_qty + ? WHERE id = ?
                    ");
                    $stmt->execute([$item['qty'], $item['product_id']]);
                }

                $stmt = $pdo->prepare("UPDATE customer_orders SET status = 'cancelled' WHERE id = ?");
                $stmt->execute([$id]);
            }

            $pdo->commit();
            echo json_encode(['message' => 'Order cancelled']);
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
