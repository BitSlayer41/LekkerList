<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/permissions.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

if (!$id) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid or missing product ID"]);
    exit;
}

$body = json_decode(file_get_contents("php://input"), true);
$p = $body['product'] ?? null;

$requestingId = (int)($p['seller_id'] ?? 0);

if (!$p || !$requestingId) {
    http_response_code(400);
    echo json_encode(["error" => "Missing product or seller ID"]);
    exit;
}

// Check user role (Seller only)

$stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
$stmt->bind_param("i", $requestingId);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user || $user['role'] !== 'seller') {
    http_response_code(403);
    echo json_encode(["error" => "Only sellers can update products"]);
    exit;
}

//Check ownership edited
$stmt = $conn->prepare("SELECT * FROM products WHERE product_id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$product = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$product) {
    http_response_code(404);
    echo json_encode(["error" => "Product not found"]);
    exit;
}

if ((int)$product['seller_id'] !== $requestingId) {
    http_response_code(403);
    echo json_encode(["error" => "You can only update your own products"]);
    exit;
}

// Save update edited

$title = $p['product_title'] ?? $product['product_title'];
$description = $p['product_description'] ?? $product['product_description'];
$category = $p['category_id'] ?? $product['category_id'];
$image = $p['product_image'] ?? $product['product_image'];
$price = isset($p['product_price']) ? (float)$p['product_price'] : (float)$product['product_price'];
$status = $p['status'] ?? $product['status'];


$stmt = $conn->prepare("
    UPDATE products
    SET product_title = ?,
        product_description = ?,
        category_id = ?,
        product_image = ?,
        product_price = ?,
        status = ?
    WHERE product_id = ?
");

$stmt->bind_param(
    "ssssdsi",
    $title,
    $description,
    $category,
    $image,
    $price,
    $status,
    $id
);

if ($stmt->execute()) {

    $sel = $conn->prepare("SELECT * FROM products WHERE product_id = ?");
    $sel->bind_param("i", $id);
    $sel->execute();
    $row = $sel->get_result()->fetch_assoc();
    $sel->close();

    //edited
    echo json_encode([
        "success" => true,
        "message" => "Product updated successfully",
        "data" => [
            "product" => [
                "product_id" => (int)$row['product_id'],
                "product_title" => $row['product_title'],
                "product_description" => $row['product_description'],
                "product_price" => (float)$row['product_price'],
                "product_image" => $row['product_image'],
                "category_id" => $row['category_id'],
                "status" => $row['status'],
                "seller_id" => (int)$row['seller_id']
            ]
        ]
    ]);


} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to update product"]);
}

$stmt->close();
$conn->close();
