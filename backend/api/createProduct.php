<?php

// Creates a new product listing
require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$body = json_decode(file_get_contents("php://input"), true);
$p = $body['product'] ?? null;

if (!$p) {
    http_response_code(400);
    echo json_encode(["error" => "No product data"]);
    exit;
}

// Parse fields
$title = trim($p['product_title'] ?? '');
$description = trim($p['product_description'] ?? '');
$category = $p['category_id'] ?? null;
$image = $p['product_image'] ?? null;
$price = isset($p['product_price']) ? (float) $p['product_price'] : 0;
$status = $p['status'] ?? 'active';
$sellerName = trim($p['seller_name'] ?? '');
$sellerId = isset($p['seller_id']) ? (int) $p['seller_id'] : 0;

if ($sellerId <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Missing seller_id"]);
    exit;
}

// Insert
$stmt = $conn->prepare("
INSERT INTO products (product_title, product_description, category_id, product_image, product_price, status, seller_id, seller_name) VALUES (?,?,?,?,?,?,?,?)");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => $conn->error]);
    exit;
}

$stmt -> bind_param("ssssdsis", $title, $description, $category, $image, $price, $status, $sellerId, $sellerName);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Product added"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => $stmt->error]);
}

$stmt -> close();
$conn -> close();
