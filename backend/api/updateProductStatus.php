<?php

// Bulk update product status after purchase

require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

$body = json_decode(file_get_contents("php://input"), true);

$productIds = $body['product_ids'] ?? [];
$status = $body['status'] ?? 'sold';

// Validation
if (!is_array($productIds) || count($productIds) === 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "No product IDs provided"]);
    exit;
}

// Only allows know status values
$allowedStatuses = ['active', 'inactive', 'sold'];
if (!in_array($status, $allowedStatuses)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid status"]);
    exit;
}

// Casts all IDs to int and strip zeroes
$productIds = array_values(array_filter(array_map('intval', $productIds)));


if (count($productIds) === 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "No valid product IDs"]);
    exit;
}

$placeholders = implode(',', array_fill(0, count($productIds), '?'));
$types = str_repeat('i', count($productIds));

$stmt = $conn -> prepare("UPDATE products SET status = ? WHERE product_id IN ($placeholders)");


// Binds status and all IDs
$stmt -> bind_param('s' . $types, $status, ...$productIds);


if ($stmt -> execute()) {
    echo json_encode(["success" => true, "updated" => $stmt->affected_rows, "message" => "Product status updated to '{$status}'",]);

} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $stmt->error]);

}

$stmt -> close();
$conn -> close();
