<?php

require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Get products with seller verification info

$sql = "
    SELECT 
        p.product_id,
        p.product_title,
        p.product_description,
        p.product_price,
        p.category_id,
        p.product_image,
        p.status,
        p.seller_id,
        u.firstname,
        u.lastname,
        u.is_verified,
        u.avg_rating,
        u.review_count
    FROM products p
    LEFT JOIN users u ON p.seller_id = u.id
";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $conn->error
    ]);
    exit;
}

$products = [];

while ($row = $result->fetch_assoc()) {

    $products[] = [
        "_id" => (int) $row["product_id"],
        "title" => $row["product_title"],
        "description" => $row["product_description"],
        "price" => (float) $row["product_price"],
        "category" => $row["category_id"],
        "image" => $row["product_image"],
        "status" => $row["status"],
        "seller_id" => (int) $row["seller_id"],

        // seller info
        "seller_name" => trim($row["firstname"] . " " . $row["lastname"]),
        "is_verified" => (int) $row["is_verified"],

        "avg_rating" => (float)($row["avg_rating"] ?? 0),
        "review_count" => (int)($row["review_count"] ?? 0)
    ];
}

echo json_encode([
    "success" => true,
    "data" => [
        "products" => $products
    ]
]);

$conn->close();
