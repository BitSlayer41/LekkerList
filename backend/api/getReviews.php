<?php

require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$productId = isset($_GET['product_id']) ? (int) $_GET['product_id'] : null;
$sellerId  = isset($_GET['seller_id']) ? (int) $_GET['seller_id'] : null;

try {

    if ($productId) {

        $stmt = $conn->prepare("
            SELECT 
                r.*,
                u.firstname,
                u.lastname,
                u.image AS reviewer_image,
                p.product_title,
                s.firstname AS seller_firstname,
                s.lastname AS seller_lastname
            FROM reviews r
            INNER JOIN users u ON u.id = r.reviewer_id
            INNER JOIN users s ON s.id = r.seller_id
            INNER JOIN products p ON p.product_id = r.product_id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        ");

        $stmt->bind_param("i", $productId);
    } elseif ($sellerId) {

        $stmt = $conn->prepare("
            SELECT 
                r.*,
                u.firstname,
                u.lastname,
                u.image AS reviewer_image,
                p.product_title,
                s.firstname AS seller_firstname,
                s.lastname AS seller_lastname
            FROM reviews r
            INNER JOIN users u ON u.id = r.reviewer_id
            INNER JOIN users s ON s.id = r.seller_id
            INNER JOIN products p ON p.product_id = r.product_id
            WHERE r.seller_id = ?
            ORDER BY r.created_at DESC
        ");

        $stmt->bind_param("i", $sellerId);
    } else {

        $stmt = $conn->prepare("
            SELECT 
                r.*,
                u.firstname,
                u.lastname,
                u.image AS reviewer_image,
                p.product_title,
                s.firstname AS seller_firstname,
                s.lastname AS seller_lastname
            FROM reviews r
            INNER JOIN users u ON u.id = r.reviewer_id
            INNER JOIN users s ON s.id = r.seller_id
            INNER JOIN products p ON p.product_id = r.product_id
            ORDER BY r.created_at DESC
        ");
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $reviews = [];

    while ($row = $result->fetch_assoc()) {
        $reviews[] = $row;
    }

    $stmt->close();

    echo json_encode([
        "success" => true,
        "reviews" => $reviews
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}

$conn->close();
