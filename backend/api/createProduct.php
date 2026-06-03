<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/permissions.php';

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
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// Parse request
$body = json_decode(file_get_contents("php://input"), true);

if (!$body) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON body"]);
    exit;
}

$p = $body['product'] ?? null;

if (!$p) {
    http_response_code(400);
    echo json_encode(["error" => "No product data"]);
    exit;
}

// Auth check
$requestingId = (int)($body['requesting_id'] ?? 0);

if (!$requestingId) {
    http_response_code(400);
    echo json_encode(["error" => "Missing requesting_id"]);
    exit;
}

// Get user
$userStmt = $conn->prepare("SELECT role, is_verified, firstname FROM users WHERE id = ?");
$userStmt->bind_param("i", $requestingId);
$userStmt->execute();
$user = $userStmt->get_result()->fetch_assoc();
$userStmt->close();

if (!$user) {
    http_response_code(403);
    echo json_encode(["error" => "Invalid user"]);
    exit;
}

// Role check
if ($user['role'] !== 'seller') {
    http_response_code(403);
    echo json_encode(["error" => "Only sellers can create products"]);
    exit;
}

// Product fields
$title = trim($p['product_title'] ?? '');
$description = trim($p['product_description'] ?? '');
$category = $p['category_id'] ?? null;
$image = $p['product_image'] ?? null;
$price = isset($p['product_price']) ? (float)$p['product_price'] : 0;
$status = $p['status'] ?? 'active';

$sellerId = $requestingId;
$sellerName = $user['firstname'] ?? '';

// Insert product
$stmt = $conn->prepare("
    INSERT INTO products 
    (product_title, product_description, category_id, product_image, product_price, status, seller_id, seller_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => $conn->error]);
    exit;
}

$stmt->bind_param(
    "ssssdsis",
    $title,
    $description,
    $category,
    $image,
    $price,
    $status,
    $sellerId,
    $sellerName
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Product added successfully"
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => $stmt->error]);
}

$stmt->close();
$conn->close();
