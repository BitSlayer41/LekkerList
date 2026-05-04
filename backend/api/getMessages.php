<?php

// Fetch order-scoped messages for a user
require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$orderId = (int) ($_GET['order_id'] ?? 0);
$userId = (int) ($_GET['user_id'] ?? 0);

if (!$orderId || !$userId) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing params"]);
    exit;
}

// Verifies order exist and gets customer and seller IDs from order_items
$stmt = $conn -> prepare("SELECT customer_id, status FROM orders WHERE order_id = ?");
$stmt->bind_param("i", $orderId);
$stmt->execute();

$order = $stmt->get_result() -> fetch_assoc();
$stmt -> close();

if (!$order) {
    http_response_code(404);
    echo json_encode(["success" => false, "error" => "Order not found"]);
    exit;
}

$customerId = (int) $order['customer_id'];
$status = $order['status'] ?? "pending";


// Gets a distinct Sellers ID from order_items
$stmt = $conn -> prepare("SELECT DISTINCT seller_id FROM order_items WHERE order_id = ?");
$stmt -> bind_param("i", $orderId);
$stmt -> execute();

$result = $stmt -> get_result();
$sellerIds = [];

while ($row = $result -> fetch_assoc()) {
    if ((int) $row['seller_id'] > 0) {
        $sellerIds[] = (int) $row['seller_id'];
    }
}

$stmt -> close();

// Access check for a seller or customer and not a the admin or guest
if ($customerId !== $userId && !in_array($userId, $sellerIds)) {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Unauthorized"]);
    exit;
}

// Fetches messages
$stmt = $conn -> prepare("SELECT m.id, m.order_id, m.sender_id, m.receiver_id, m.message, m.is_read, m.created_at, u.firstname, u.lastname FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.order_id = ? AND (m.sender_id = ? OR m.receiver_id =?) ORDER BY m.created_at ASC");

$stmt -> bind_param("iii", $orderId, $userId, $userId);
$stmt -> execute();

$result = $stmt -> get_result();
$messages = [];

while ($row = $result -> fetch_assoc()) {
    $messages[] = [
        'id' => (int) $row['id'],
        'order_id' => (int) $row['order_id'],
        'sender_id' => (int) $row['sender_id'],
        'message' => $row['message'],
        'is_read' => (bool) $row['is_read'],
        'created_at' => $row['created_at'],
        'firstname' => $row['firstname'],
        'lastname' => $row['lastname'],
    ];
}

$stmtRead = $conn->prepare("
    UPDATE messages
    SET is_read = 1
    WHERE order_id = ?
    AND receiver_id =?
    AND is_read = 0
");

$stmtRead->bind_param("ii", $orderId, $userId);
$stmtRead->execute();
$stmtRead->close();

echo json_encode(["success" => true, "messages" => $messages, "customer_id" => $customerId, "seller_ids" => array_values($sellerIds), "status" => $status]);

$stmt -> close();
$conn -> close();
