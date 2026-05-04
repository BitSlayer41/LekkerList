<?php

require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
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

$id = isset($_GET["id"]) ? (int) $_GET["id"] : 0;


if (!$id) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid or missing product ID"]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM products WHERE product_id=?");
$stmt -> bind_param("i", $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows === 0) {
        http_response_code(404);
        echo json_encode(["error" => "Product not found"]);
    } else {
        echo json_encode(["data" => ["message" => "Product deleted successfully"]]);
    }
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to delete product"]);
}

$stmt -> close();
$conn -> close();
