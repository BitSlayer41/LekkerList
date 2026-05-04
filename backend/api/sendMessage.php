<?php

// Send a message on a order thread

require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$orderId = (int) ($data['order_id'] ?? 0);
$sender = (int) ($data['sender_id'] ?? 0);
$receiver = (int) ($data['receiver_id'] ?? 0);
$message = trim($data['message'] ?? '');

if (!$orderId || !$sender || !$receiver || !$message) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

// Verify sender has access to this order
$stmt = $conn -> prepare("SELECT customer_id FROM orders WHERE order_id = ?");
$stmt -> bind_param("i", $orderId);
$stmt -> execute();
$order = $stmt -> get_result() -> fetch_assoc();
$stmt -> close();


if (!$order) {
    http_response_code(404);
    echo json_encode(["success" => false, "error" => "Order not found"]);
    exit;
}

$cart = json_decode($order['cart_json'], true) ?? [];
$sellerIds = array_unique(array_map(fn ($i) => (int) ($i['sender_id'] ?? 0), $cart));

if ((int) $order['customer_id'] !== $sender && !in_array($sender, $sellerIds)) {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Unauthorized"]);
    exit;
}

// Insert message
$stmt = $conn -> prepare("INSERT INTO messages (order_id, sender_id, receiver_id, message) VALUES (?, ?, ?, ?)");
$stmt -> bind_param("iiis", $orderId, $sender, $receiver, $message);


if ($stmt -> execute()) {
    echo json_encode(["success" => true, "messageId" => $conn->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $conn->error]);
}

$stmt -> close();
$conn -> close();
