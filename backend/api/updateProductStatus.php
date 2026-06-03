<?php

require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "error" => "Method not allowed"
    ]);
    exit;
}

// Read JSON body
$data = json_decode(file_get_contents("php://input"), true);

$productIds = $data['product_ids'] ?? [];
$status = $data['status'] ?? null;

if (empty($productIds) || !$status) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Missing product_ids or status"
    ]);
    exit;
}

// Clean IDs
$productIds = array_map('intval', $productIds);
$placeholders = implode(',', array_fill(0, count($productIds), '?'));

// Build query (assumes your table has `status` column)
$sql = "UPDATE products SET status = ? WHERE product_id IN ($placeholders)";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Prepare failed"
    ]);
    exit;
}

// Bind params dynamically
$types = str_repeat('i', count($productIds));
$stmt->bind_param("s" . $types, $status, ...$productIds);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "updated" => count($productIds),
        "status" => $status
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Update failed"
    ]);
}

$stmt->close();
