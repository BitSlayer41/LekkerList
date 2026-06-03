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

// Checks if user is admin
$stmt = $conn -> prepare("SELECT role FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$userRole = $stmt->get_result()->fetch_assoc();
$stmt->close();


$isAdmin = ($userRole['role'] ?? '') === 'admin';


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

// Access Control
if (
    !$isAdmin && $customerId !== $userId && !in_array($userId, $sellerIds)
) {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Forbidden"]);
    exit;
}

// Fetches messages
if ($isAdmin) {
    $stmt = $conn -> prepare("
        SELECT 
            m.id, 
            m.order_id, 
            m.sender_id, 
            m.receiver_id, 
            m.message, 
            m.is_read, 
            m.created_at, 
            u1.firstname as senderFirstname, 
            u1.lastname as senderLastname, 
            u2.firstname as receiverFirstname, 
            u2.lastname as receiverLastname 
        FROM messages m 
        LEFT JOIN users u1 ON m.sender_id = u1.id 
        LEFT JOIN users u2 ON m.receiver_id = u2.id 
        WHERE m.order_id = ? 
        ORDER BY m.created_at ASC
    ");

    $stmt -> bind_param("i", $orderId);
} else {
    $stmt = $conn -> prepare("
        SELECT 
            m.id, 
            m.order_id, 
            m.sender_id, 
            m.receiver_id, 
            m.message, 
            m.is_read, 
            m.created_at, 
            u.firstname, 
            u.lastname 
        FROM messages m 
        JOIN users u ON u.id = m.sender_id 
        WHERE m.order_id = ? AND (m.sender_id = ? OR m.receiver_id =?) 
        ORDER BY m.created_at ASC
    ");

    $stmt -> bind_param("iii", $orderId, $userId, $userId);
}

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

$stmt -> close();


if (!$isAdmin) {
    // Mark messages as read for this user
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
}


$orderItems = [];

$stmt = $conn->prepare("
    SELECT
        oi.product_id,
        p.product_title
    FROM order_items oi
    JOIN products p ON p.product_id = oi.product_id
    WHERE oi.order_id = ?
");

$stmt->bind_param("i", $orderId);
$stmt->execute();

$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $orderItems[] = [
        "product_id" => (int)$row["product_id"],
        "product_title" => $row["product_title"]
    ];
}

$stmt->close();



echo json_encode([
    "success" => true,
    "messages" => $messages,
    "customer_id" => $customerId,
    "seller_ids" => array_values($sellerIds),
    "order_status" => $status,
    "order_items" => $orderItems
]);


$conn -> close();
