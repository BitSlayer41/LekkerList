<?php

require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === "OPTIONS") {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$orderId = (int)($data['order_id'] ?? 0);
$userId = (int)($data['user_id'] ?? 0);
$status = trim($data['status'] ?? '');

$allowed = [
    'pending',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
];

if (!$orderId || !$userId || !in_array($status, $allowed)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Invalid request"
    ]);
    exit;
}

// Verify seller owns at least one item in order
$stmt = $conn->prepare(
    "SELECT seller_id FROM order_items WHERE order_id = ? AND seller_id = ? LIMIT 1"
);

$stmt->bind_param("ii", $orderId, $userId);
$stmt->execute();
$result = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$result || (int)$result['seller_id'] !== $userId) {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "error" => "Unauthorized"
    ]);
    exit;
}

// Get current status
$stmt = $conn->prepare(
    "SELECT status FROM orders WHERE order_id = ?"
);


$stmt->bind_param("i", $orderId);
$stmt->execute();
$current = $stmt->get_result()->fetch_assoc();
$stmt->close();

$oldStatus = $current['status'] ?? 'pending';

// Update order
$stmt = $conn->prepare(
    "UPDATE orders SET status = ? WHERE order_id = ?"
);


$stmt->bind_param("si", $status, $orderId);
$success = $stmt->execute();
$stmt->close();

if (!$success) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Failed to update status"
    ]);
    exit;
}

// Save history
$stmt = $conn->prepare(
    "INSERT INTO order_status_history (order_id, changed_by, old_status, new_status) VALUES (?,?,?,?)"
);

$stmt->bind_param(
    "iiss",
    $orderId,
    $userId,
    $oldStatus,
    $status
);

$stmt->execute();
$stmt->close();

$conn->close();

echo json_encode([
    "success" => true,
    "status" => $status
]);
