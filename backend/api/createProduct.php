<?php

// Create a new product listing
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
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}


$data = json_decode(file_get_contents("php://input"), true);

$product = $data['product'] ?? [];

$sellerId = (int)($product['seller_id'] ?? 0);
$sellerName = $product['seller_name'] ?? '';
$title = trim($product['product_title'] ?? '');
$description = trim($product['product_description'] ?? '');
$price = (float)($product['product_price'] ?? 0);
$category = $product['category_id'] ?? '';
$image = $product['product_image'] ?? null;
$status = $product['status'] ?? 'active';

$requestingId = (int)($data['requesting_id'] ?? $sellerId);


if (!$sellerId || !$title || !$price || !$category) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

// Fetch requester info and check permissions
$userStmt = $conn->prepare("SELECT role, admin_role, is_blocked FROM users WHERE id = ?");
$userStmt->bind_param("i", $requestingId);
$userStmt->execute();
$requester = $userStmt->get_result()->fetch_assoc();
$userStmt->close();

// GLOBAL BLOCK CHECK
if (!empty($requester['is_blocked']) && (int)$requester['is_blocked'] === 1) {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "User is blocked from performing this action"
    ]);
    exit;
}

$isAdmin = ($requester['role'] ?? '') === 'admin';

if ($isAdmin) {
    // Admins can manage products — check permission
    requirePermission($conn, $requestingId, 'manage_products');
} else {
    // check if seller is blocked before allowing listing
    $sellerStmt = $conn->prepare("SELECT is_blocked FROM users WHERE id = ? AND role = 'seller'");
    $sellerStmt->bind_param("i", $sellerId);
    $sellerStmt->execute();
    $seller = $sellerStmt->get_result()->fetch_assoc();
    $sellerStmt->close();

    if (!$seller) {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "Seller account not found"]);
        exit;
    }

    if ((int) $seller['is_blocked'] === 1) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "error"   => "Your account has been blocked from listing new products. Please contact the admin.",
        ]);
        exit;
    }
}

// Validate status
$allowedStatuses = ['active', 'inactive', 'sold'];
if (!in_array($status, $allowedStatuses)) {
    $status = 'active';
}

// Insert product into database
$stmt = $conn->prepare("
    INSERT INTO products
        (seller_id, seller_name, product_title, product_description,
         product_price, category_id, product_image, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
");
$stmt->bind_param(
    "isssdsss",
    $sellerId,
    $sellerName,
    $title,
    $description,
    $price,
    $category,
    $image,
    $status
);

if ($stmt->execute()) {
    $newId = $conn->insert_id;
    $stmt->close();
    $conn->close();
    echo json_encode([
        "success"    => true,
        "message"    => "Product created successfully",
        "product_id" => $newId,
    ]);
} else {
    $err = $stmt->error;
    $stmt->close();
    $conn->close();
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $err]);
}
