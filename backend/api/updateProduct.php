<?php

// Update an existing product

require_once __DIR__ . '/../config/database.php';

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
    echo json_encode(["error" => "method not allowed"]);
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

if (!$p) {
    http_response_code(400);
    echo json_encode(["error" => "No product data provided"]);
    exit;
}

// Parse fields
$title = $p['product_title'] ?? '';
$description = $p['product_description'] ?? '';
$category = $p['category_id'] ?? '';
$image = $p['product_image'] ?? '';
$price = $p['product_price'] ?? 0;
$status = $p['status'] ?? '';
$sellerId = $p['seller_id'] ?? 0;


//Update
$stmt = $conn -> prepare("UPDATE products SET product_title = ?, product_description = ?, category_id = ?, product_image = ?, product_price = ?, status = ?, seller_id = ?, WHERE product_id = ?");

$stmt -> bind_param("ssssdsii", $title, $description, $category, $image, $price, $status, $sellerId, $id);

if ($stmt -> execute()) {
    if ($stmt -> affected_rows === 0) {
        http_response_code(404);
        echo json_encode(["error" => "Product not found"]);
    } else {
        // Returns updated products so Redux can synce state
        $result = $conn -> query("SELECT * FROM products WHERE product_id = ?");
        $row = $result -> fetch_assoc();

        echo json_encode([
            "data" => [
                "product" => [
                    "_id" => (int) $row['product_id'],
                    "title" => $row['product_title'],
                    "description" => $row['product_description'],
                    "price" => (float) $row['product_price'],
                    "category" => $row ['category_id'],
                    "image" => $row['product_image'],
                    "status" => $row['status'],
                    "seller_id" => (int) $row['seller_id'],
            ],
            "message" => "Product updated sucessfully",
            ],
        ]);
    }
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to update product"]);
}

$stmt -> close();
$conn -> close();
