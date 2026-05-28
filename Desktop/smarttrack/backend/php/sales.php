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
        $stmt = $pdo->query("SELECT * FROM sales_history ORDER BY timestamp DESC");
        $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($sales);
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("
                SELECT p.*, COALESCE(SUM(sb.quantity), 0) as total_stock
                FROM products p
                LEFT JOIN stock_batches sb ON p.id = sb.product_id AND sb.is_depleted = FALSE
                WHERE p.id = ? OR p.barcode = ?
                GROUP BY p.id
            ");
            $stmt->execute([$data['product_id'] ?? null, $data['barcode'] ?? null]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$product) {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
                exit();
            }

            $qty = $data['quantity'] ?? 1;
            if ($product['total_stock'] < $qty) {
                http_response_code(400);
                echo json_encode(['error' => 'Not enough stock']);
                exit();
            }

            // Subtract stock
            $remaining = $qty;
            $stmt = $pdo->prepare("
                SELECT * FROM stock_batches 
                WHERE product_id = ? AND is_depleted = FALSE 
                ORDER BY expiry_date ASC
            ");
            $stmt->execute([$product['id']]);
            $batches = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($batches as $batch) {
                if ($remaining <= 0) break;
                $reduce = min($batch['quantity'], $remaining);
                $newQty = $batch['quantity'] - $reduce;

                if ($newQty == 0) {
                    $stmt = $pdo->prepare("UPDATE stock_batches SET is_depleted = TRUE, quantity = 0 WHERE id = ?");
                    $stmt->execute([$batch['id']]);
                } else {
                    $stmt = $pdo->prepare("UPDATE stock_batches SET quantity = ? WHERE id = ?");
                    $stmt->execute([$newQty, $batch['id']]);
                }
                $remaining -= $reduce;
            }

            // Record sale
            $total = $qty * $product['price'];
            $stmt = $pdo->prepare("
                INSERT INTO sales_history 
                (product_id, product_name, barcode, quantity_sold, total_price) 
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $product['id'],
                $product['name'],
                $product['barcode'],
                $qty,
                $total
            ]);

            $pdo->commit();
            echo json_encode(['status' => 'success', 'sale_id' => $pdo->lastInsertId()]);
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
