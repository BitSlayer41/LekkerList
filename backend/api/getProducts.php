<?php


require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204);
    exit;
}

$result = $conn -> query("SELECT * FROM products");

$products = [];

while ($row = $result -> fetch_assoc()) {
    $products[] = ["_id" => (int) $row["product_id"], "title" => $row["product_title"], "description" => $row["product_description"], "price" => (float) $row["product_price"], "category" => $row['category_id'], "image" => $row["product_image"], "status" => $row["status"], "seller_id" => (int) $row["seller_id"], "seller_name" => $row["seller_name"],
    ];
}

echo json_encode(["data" => ["products" => $products]]);

$conn -> close();
