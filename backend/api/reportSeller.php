<?php

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

$orderId = (int)($data['order_id'] ?? 0);
$reporterId = (int)($data['reporter_id'] ?? 0);
$reportedUserId = (int)($data['reported_user_id'] ?? 0);
$reason = trim($data['reason'] ?? '');

if (!$orderId || !$reporterId || !$reportedUserId || !$reason) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Missing required fields"
    ]);
    exit;
}

$check = $conn->prepare("
    SELECT o.order_id FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.order_id
    WHERE o.order_id = ?
    AND (o.customer_id = ? OR oi.seller_id = ?)
    LIMIT 1
");

$check->bind_param("iii", $orderId, $reporterId, $reporterId);
$check->execute();
$valid = $check->get_result()->fetch_assoc();
$check->close();

if (!$valid) {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "error" => "You are not involved in this order"
    ]);
    exit;
}

// Insert report
$stmt = $conn->prepare("
    INSERT INTO seller_reports (Order_id, reporter_id, reported_user_id, reason)
    VALUES (?,?,?,?)
");

$stmt->bind_param("iiis", $orderId, $reporterId, $reportedUserId, $reason);

if ($stmt->execute()) {
    $conn->close();
    echo json_encode([
        "success" => true,
        "message" => "Report submitted. Our team will review it"
    ]);
} else {
    http_response_code(500);
    $conn->close();
    echo json_encode([
        "success" => false,
        "error" => $stmt->error
    ]);
}
