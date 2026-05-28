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
        $stmt = $pdo->query("
            SELECT t.*, co.customer_name, co.total as order_total
            FROM transactions t
            LEFT JOIN customer_orders co ON t.order_id = co.id
            ORDER BY t.created_at DESC
        ");
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($transactions);
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $pdo->beginTransaction();

        try {
            $total = 0;
            $receipt_items = [];

            foreach ($data['items'] as $item) {
                $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ? AND is_active = TRUE");
                $stmt->execute([$item['product_id']]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$product) {
                    http_response_code(404);
                    echo json_encode(['error' => "Product not found: {$item['product_id']}"]);
                    exit();
                }

                if ($product['current_qty'] < $item['qty']) {
                    http_response_code(400);
                    echo json_encode(['error' => "Insufficient stock for {$product['name']}"]);
                    exit();
                }

                $item_total = $item['qty'] * $product['sale_price'];
                $total += $item_total;
                $receipt_items[] = [
                    'product_id' => $product['id'],
                    'product_name' => $product['name'],
                    'qty' => $item['qty'],
                    'unit_price' => $product['sale_price'],
                    'subtotal' => $item_total
                ];
            }

            $stmt = $pdo->prepare("
                INSERT INTO customer_orders (customer_name, customer_phone, total, status)
                VALUES (?, ?, ?, 'completed')
            ");
            $stmt->execute([
                $data['customer_name'] ?? null,
                $data['customer_phone'] ?? null,
                $total
            ]);
            $order_id = $pdo->lastInsertId();

            foreach ($receipt_items as $item) {
                $stmt = $pdo->prepare("
                    INSERT INTO customer_order_items (order_id, product_id, qty, unit_price)
                    VALUES (?, ?, ?, ?)
                ");
                $stmt->execute([
                    $order_id,
                    $item['product_id'],
                    $item['qty'],
                    $item['unit_price']
                ]);

                $stmt = $pdo->prepare("
                    UPDATE products SET current_qty = current_qty - ? WHERE id = ?
                ");
                $stmt->execute([$item['qty'], $item['product_id']]);

                $stmt = $pdo->prepare("
                    INSERT INTO stock_adjustments (product_id, qty_change, reason, note)
                    VALUES (?, ?, 'correction', ?)
                ");
                $stmt->execute([
                    $item['product_id'],
                    -$item['qty'],
                    "Checkout sale #$order_id"
                ]);

                $stmt = $pdo->prepare("
                    INSERT INTO sales_history (product_id, product_name, barcode, quantity_sold, total_price)
                    VALUES (?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $item['product_id'],
                    $item['product_name'],
                    $product['barcode'] ?? null,
                    $item['qty'],
                    $item['subtotal']
                ]);
            }

            $amount_received = $data['amount_received'] ?? $total;
            $change_due = $amount_received - $total;

            $stmt = $pdo->prepare("
                INSERT INTO transactions (order_id, payment_method, amount_received, change_due)
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([
                $order_id,
                $data['payment_method'] ?? 'cash',
                $amount_received,
                $change_due
            ]);
            $transaction_id = $pdo->lastInsertId();

            $pdo->commit();
            echo json_encode([
                'transaction_id' => $transaction_id,
                'order_id' => $order_id,
                'total' => $total,
                'change_due' => $change_due,
                'receipt_data' => $receipt_items
            ]);
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
