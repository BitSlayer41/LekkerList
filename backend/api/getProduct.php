<?php

require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$id) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Missing product ID"
    ]);
    exit;
}

$stmt = $conn->prepare("
    SELECT *
    FROM products
    WHERE product_id = ?
");

$stmt->bind_param("i", $id);
$stmt->execute();

$result = $stmt->get_result();
$product = $result->fetch_assoc();

if (!$product) {
    http_response_code(404);
    echo json_encode([
        "success" => false,
        "error" => "Product not found"
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "data" => [
        "product" => $product
    ]
]);

$stmt->close();
$conn->close();
