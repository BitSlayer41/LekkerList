<?php

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/permissions.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "DELETE") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// Get product ID

$id = isset($_GET["id"]) ? (int) $_GET["id"] : 0;

if (!$id) {
    http_response_code(400);
    echo json_encode(["error" => "Product ID is required"]);
    exit;
}

//Get request body

$body = json_decode(file_get_contents("php://input"), true);

// accept both naming styles
$requestingId = (int)(
    $body["requesting_id"] ??
    $body["requestingId"] ??
    0
);

if (!$requestingId) {
    http_response_code(401);
    echo json_encode(["error" => "Requesting user ID is required"]);
    exit;
}

// Fetch user role

$userStmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
$userStmt->bind_param("i", $requestingId);
$userStmt->execute();
$user = $userStmt->get_result()->fetch_assoc();
$userStmt->close();

if (!$user) {
    http_response_code(403);
    echo json_encode(["error" => "Invalid user"]);
    exit;
}

// Fetch product owner

$productStmt = $conn->prepare("SELECT seller_id FROM products WHERE product_id = ?");
$productStmt->bind_param("i", $id);
$productStmt->execute();
$product = $productStmt->get_result()->fetch_assoc();
$productStmt->close();

if (!$product) {
    http_response_code(404);
    echo json_encode(["error" => "Product not found"]);
    exit;
}

$sellerId = (int)$product["seller_id"];
$isOwner = ($sellerId === $requestingId);
$isAdmin = ($user["role"] === "admin");

// Permission check

if (!$isOwner && !$isAdmin) {
    http_response_code(403);
    echo json_encode(["error" => "Not authorized to delete this product"]);
    exit;
}

// Admin permission check
if ($isAdmin) {
    requirePermission($conn, $requestingId, "manage_products");
}

// Delete product

$stmt = $conn->prepare("DELETE FROM products WHERE product_id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {

    if ($stmt->affected_rows === 0) {
        http_response_code(404);
        echo json_encode(["error" => "Product not found"]);
    } else {
        echo json_encode([
            "success" => true,
            "message" => "Product deleted successfully"
        ]);
    }

} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to delete product"]);
}

$stmt->close();
$conn->close();
