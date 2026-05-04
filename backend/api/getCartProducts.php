<?php

// Fetches product details for cart ID

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
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

$ids = $data['ids'] ?? null;

if (!is_array($ids)) {
    http_response_code(400);
    echo json_encode(["error" => "ids must be an array"]);
    exit;
}

// Strip invalid values
$ids = array_values(array_filter($ids, fn ($id) => isset($id) && $id !== null && $id !== ''));

if (count($ids) === 0) {
    echo json_encode(["success" => true, "products" => []]);
    exit;
}

$placeholders = implode(',', array_fill(0, count($ids), '?'));
$types = str_repeat('s', count($ids));

$stmt = $conn->prepare(
    "SELECT product_id, product_title, product_price, product_image, seller_id FROM products WHERE product_id IN ($placeholders)"
);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Query prepare failed: " .$conn->error]);
    exit;
}

$stmt->bind_param($types, ...$ids);
$stmt->execute();

$result = $stmt->get_result();
$products = [];

while ($row = $result -> fetch_assoc()) {
    $products[] = $row;
}

echo json_encode(["success" => true, "products" => $products]);

$stmt->close();
$conn -> close();
