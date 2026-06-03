<?php


require_once __DIR__ . '/../config/database.php';

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
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}


$data = json_decode(file_get_contents("php://input"), true);
$orderId = (int)($data['order_id'] ?? 0);
$productId = (int)($data['product_id'] ?? 0);
$reviewerId = (int)($data['reviewer_id'] ?? 0);
$sellerId = (int)($data['seller_id'] ?? 0);
$rating = (int)($data['rating'] ?? 0);
$comment = trim($data['comment'] ?? '');

if (!$orderId || !$productId || !$reviewerId || !$sellerId || $rating < 1 || $rating > 5) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Invalid review data"
    ]);
    exit;
}

$check = $conn->prepare("
    SELECT 1
    FROM order_items oi
    INNER JOIN orders o ON o.order_id = oi.order_id
    WHERE oi.order_id = ?
      AND oi.product_id = ?
      AND o.customer_id = ?
      AND o.status = 'delivered'
    LIMIT 1
");

$check->bind_param("iii", $orderId, $productId, $reviewerId);
$check->execute();
$valid =  $check->get_result()->fetch_assoc();


error_log("Validation Query Result:");
error_log(print_r($valid, true));

$check->close();

if (!$valid) {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "error" => "You can only review products from delivered orders"
    ]);
    exit;
}

// Insert review (Only allows customer to write one review per product/order)
$stmt = $conn->prepare("
    INSERT INTO reviews (order_id, product_id, reviewer_id, seller_id, rating, comment)
    VALUES (?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)
");
$stmt->bind_param("iiiiis", $orderId, $productId, $reviewerId, $sellerId, $rating, $comment);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $stmt->error
    ]);
    exit;
}

$stmt->close();

// Update product average rating and review count

$upd = $conn->prepare("
    UPDATE users
    SET 
        avg_rating = (
            SELECT COALESCE(ROUND(AVG(rating), 2), 0)
            FROM reviews
            WHERE seller_id = ?
        ),
        review_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE seller_id = ?
        )
    WHERE id = ?
");

$upd->bind_param("iii", $sellerId, $sellerId, $sellerId);
$upd->execute();
$upd->close();

$conn->close();

echo json_encode([
    "success" => true,
    "message" => "Review submitted successfully"
]);
