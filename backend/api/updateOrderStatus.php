<?php

require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "error" => "Method not allowed"
    ]);

    exit;
}

// Read JSON body
$body = json_decode(file_get_contents("php://input"), true);

$orderId = (int)($body['order_id'] ?? 0);

//Accept BOTH names for compatibility
$requestingId = (int)(
    $body['requesting_id']
    ?? $body['user_id']
    ?? 0
);

$newStatus = trim($body['status'] ?? '');

// Validate required fields
if (!$orderId || !$requestingId || !$newStatus) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "error" => "Missing required fields"
    ]);

    exit;
}

// Fetch user
$userStmt = $conn->prepare("SELECT role, admin_role FROM users WHERE id = ?");
$userStmt->bind_param("i", $requestingId);
$userStmt->execute();
$user = $userStmt->get_result()->fetch_assoc();
$userStmt->close();

if (!$user) {
    http_response_code(404);
    echo json_encode(["success" => false, "error" => "User not found"]);
    exit;
}


// Fetch order and seller ID
$orderStmt = $conn->prepare("
    SELECT o.customer_id, o.status,
        GROUP_CONCAT(DISTINCT oi.seller_id) AS seller_ids
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.order_id
    WHERE o.order_id = ?
    GROUP BY o.order_id
");

$orderStmt->bind_param("i", $orderId);
$orderStmt->execute();
$order = $orderStmt->get_result()->fetch_assoc();
$orderStmt->close();

if (!$order) {
    http_response_code(404);
    echo json_encode([
        "success" => false,
        "error" => "Order not found"
        ]);
    exit;
}

$currentStatus = $order['status'];
$sellerIds = array_map('intval', explode(',', $order['seller_ids'] ?? ''));

// Role Flags
$isAdmin = $user['role'] === 'admin';
$adminRole = $user['admin_role'] ?? '';
$isSeller = $user['role'] === 'seller' && in_array($requestingId, $sellerIds);
$isCustomer = (int) $order['customer_id'] === $requestingId;

// Permission rules
$sellerProgressions = ['paid' => 'processing', 'processing' => "shipped"];
$isSellerAdvance = $isSeller && isset($sellerProgressions[$currentStatus]) && $sellerProgressions[$currentStatus] === $newStatus;
$isCustomerDelivery = $isCustomer && $newStatus === 'delivered' && $currentStatus === 'shipped';
$isAdminCancelRefund = $isAdmin && in_array($adminRole, ['super_admin', 'finance_admin']) && in_array($newStatus, ['cancelled', 'refunded']);

if (!$isSellerAdvance && !$isCustomerDelivery && !$isAdminCancelRefund) {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "error" => "Permission denied"
    ]);
    exit;
}

// Validate status
$allowedStatuses = ['paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
if (!in_array($newStatus, $allowedStatuses)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Invalid status value"
    ]);
    exit;
}

// Log history
try {
    $hist = $conn->prepare("
        INSERT INTO order_status_history (order_id, changed_by, old_status, new_status)
        VALUES (?,?,?,?)
    ");

    if ($hist) {
        $hist->bind_param("iiss", $orderId, $requestingId, $currentStatus, $newStatus);
        $hist->execute();
        $hist->close();
    }
} catch (Exception $e) {
    // Ignore
}

// Reactivate product if refunded
if ($newStatus === 'refunded') {
    $itemStmt = $conn->prepare("
        SELECT product_id FROM order_items WHERE order_id = ?
    ");
    $itemStmt->bind_param("i", $orderId);
    $itemStmt->execute();
    $itemResult = $itemStmt->get_result();

    while ($item = $itemResult->fetch_assoc()) {
        $productId = (int) $item['product_id'];
        $reactivate = $conn->prepare("
            UPDATE products SET status = 'active' WHERE product_id = ?
        ");

        if ($reactivate) {
            $reactivate->bind_param("i", $productId);
            $reactivate->execute();
            $reactivate->close();
        }
    }
    $itemStmt->close();
}

// Update order status
$update = $conn->prepare("UPDATE orders SET status = ? WHERE order_id = ?");
$update->bind_param("si", $newStatus, $orderId);

if ($update->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Order status updated to '{$newStatus}'",
        "order_id" => $orderId,
        "status" => $newStatus
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $update->error
    ]);
}

$update->close();
$conn->close();
