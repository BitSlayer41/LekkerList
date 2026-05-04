<?php


require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$userId = isset($_GET['user_id']) ? (int) $_GET['user_id'] : 0;
$role = $_GET['role'] ?? 'customer';


if (!$userId && $role !== 'admin') {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing user_id"]);
    exit;
}

try {

    // Admin and all orders
    if ($role === 'admin') {
        $stmt = $conn -> prepare("SELECT o.order_id, o.customer_firstname, o.customer_lastname, o.customer_email, o.status, o.created_at, o.ship_city, o.ship_province, oi.product_id, oi.seller_id, oi.title, oi.price, oi.qty, oi.image FROM orders o INNER JOIN order_items oi ON o.order_id = oi.order_id ORDER BY o.created_at DESC");

        $stmt -> execute();
    }

    // Seller and their sales
    elseif ($role === 'seller') {
        $stmt = $conn -> prepare("SELECT o.order_id, o.customer_firstname, o.customer_lastname, o.customer_email, o.status, o.created_at, o.ship_city, o.ship_province, oi.product_id, oi.seller_id, oi.title, oi.price, oi.qty, oi.image FROM orders o INNER JOIN order_items oi ON o.order_id = oi.order_id WHERE oi.seller_id = ? ORDER BY o.created_at DESC");

        $stmt -> bind_param("i", $userId);
        $stmt -> execute();
    }

    // Customer and their orders
    else {
        $stmt = $conn -> prepare("SELECT o.order_id, o.status, o.created_at, o.ship_city, o.ship_province, oi.product_id, oi.title, oi.price, oi.qty, oi.image FROM orders o INNER JOIN order_items oi ON o.order_id = oi.order_id WHERE o.customer_id = ? ORDER BY o.created_at DESC");

        $stmt -> bind_param("i", $userId);
        $stmt -> execute();

    }


    $result = $stmt -> get_result();

    // response

    $orderMap = [];

    while ($row = $result -> fetch_assoc()) {
        $id = $row['order_id'];

        if (!isset($orderMap[$id])) {

            $orderMap[$id] = [
                'order_id' => $id,
                'customer' => isset($row['customer_firstname']) ? trim($row['customer_firstname'] . ' ' . $row['customer_lastname']) : null,
                'email' => $row['customer_email'] ?? null,
                'status' => $row['status'],
                'created_at' => $row['created_at'],
                'city' => $row['ship_city'],
                'province' => $row['ship_province'],
                'items' => [],
                'total' => 0
            ];
        }

        $orderMap[$id]['items'][] = [
            'product_id' => $row['product_id'],
            'title' => $row['title'],
            'price' => (float) $row['price'],
            'qty' => (int) $row['qty'],
            'image' => $row['image']
        ];

        $orderMap[$id]['total'] += ((float) $row['price'] * (int) $row['qty']);
    }

    $stmt -> close();
    $conn -> close();

    echo json_encode(["success" => true, "transactions" => array_values($orderMap)]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e -> getMessage()]);
}
