<?php

// Save a completed order

require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$body = json_decode(file_get_contents("php://input"), true);

if (!$body) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid request body"]);
    exit;
}

// Parse payload
$customer = $body['customer'] ?? [];
$shipping = $body['shipping'] ?? [];
$cart = $body['cart'] ?? [];
$total = (float) ($body['total'] ?? 0);
$customerId = $body['customer_id'] ?? null;

if (empty($customer['email']) || empty($cart)) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required order data"]);
    exit;
}

$firstname = $customer['firstName'] ?? '';
$lastname = $customer['lastName'] ?? '';
$email = $customer['email'] ?? '';
$phone = $customer['phone'] ?? '';

$street = $shipping['street'] ?? '';
$suburb = $shipping['suburb'] ?? '';
$city = $shipping['city'] ?? '';
$postal = $shipping['postal'] ?? '';
$province = $shipping['province'] ?? '';

$cartJson = json_encode($cart);


// Validats carts items before reaching out to the Database
foreach ($cart as $item) {
    $productId = (int) ($item['_id'] ?? $item['product_id'] ?? 0);
    $sellerId = (int) ($item['seller_id'] ?? 0);

    if ($productId <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "Cart item missing product ID"]);
        exit;
    }

    if ($sellerId <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "Cart item missing seller ID for product"]);
        exit;
    }
}

$conn -> begin_transaction();


try {
    // Insert order
    $stmt = $conn -> prepare("INSERT INTO orders (customer_firstname, customer_lastname, customer_email, customer_phone, ship_street, ship_suburb, ship_city, ship_postal, ship_province, total, customer_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending') ");

    $stmt -> bind_param("sssssssssdi", $firstname, $lastname, $email, $phone, $street, $suburb, $city, $postal, $province, $total, $customerId);

    $stmt -> execute();


    $orderId = $conn -> insert_id;
    $stmt -> close();

    $itemStmt = $conn -> prepare("INSERT INTO order_items (order_id, product_id, seller_id, title, price, qty, image) VALUES (?, ?, ?, ?, ?, ?,?)");

    foreach ($cart as $item) {
        $productId = (int) ($item['_id'] ?? $item['product_id'] ?? 0);
        $sellerId = (int) ($item['seller_id'] ?? 0);
        $title = $item['title'] ?? '';
        $price = (float) ($item['price'] ?? 0);
        $qty = (int) ($item['qty'] ?? 1);
        $image = $item['image'] ?? null;

        $itemStmt -> bind_param(
            "iiisdis",
            $orderId,
            $productId,
            $sellerId,
            $title,
            $price,
            $qty,
            $image
        );

        $itemStmt -> execute();
    }

    $itemStmt -> close();
    $conn -> commit();


    echo json_encode(["success" => true, "order_id" => $conn -> insert_id, "message" => "Order placed sucessfully"]);

} catch (Exception $e) {
    $conn -> rollback();

    http_response_code(500);
    echo json_encode(["error" => "Failed to save order: " . $e->getMessage()]);
}

$conn -> close();
