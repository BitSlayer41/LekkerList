<?php

// Authenticate user and return session data

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


$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Email and password are required"]);
    exit;
}

// Fetches user
$stmt = $conn -> prepare("SELECT id, firstname, lastname, email, role, image, password FROM users WHERE email = ?");

$stmt -> bind_param("s", $email);
$stmt -> execute();
$userInfo = $stmt -> get_result() -> fetch_assoc();
$stmt -> close();

if (!$userInfo || !password_verify($password, $userInfo['password'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Invalid email or password"]);
    exit;
}

// Issue token

$token = bin2hex(random_bytes(16));


echo json_encode(["success" => true, "message" => "Login Successful", "token" => $token, "user" => [
    "id" => $userInfo['id'],
    "firstname" => $userInfo['firstname'],
    "lastname" => $userInfo['lastname'],
    "email" => $userInfo['email'],
    "role" => $userInfo['role'],
    "image" => $userInfo['image'],
],
]);

$conn -> close();
