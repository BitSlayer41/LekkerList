<?php

// Reset users password
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
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$confirmPassword = $data['confirmPassword'] ?? '';

$response = ["success" => false, "errors" => []];


// Validation
if (empty($email)) {
    $response['errors'][] = "Email is required";
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $response['errors'][] = "Invalid email format";
}

if (empty($password)) {
    $response['errors'][] = "Password is required";
} elseif (strlen($password) < 8 || !preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) || !preg_match('/[0-9]/', $password)) {
    $response['errors'][] = "Passwords must be atleast 8 characters and inlcude uppercase, and lowercase and a number";
}

if (empty($confirmPassword)) {
    $response['errors'][] = "Please confirm your password";
} elseif ($password !== $confirmPassword) {
    $response['errors'][] = "Passwords do not match";
}

if (!empty($response['errors'])) {
    echo json_encode($response);
    exit;
}

// Check email exists
$check = $conn -> prepare("SELECT id FROM users WHERE email = ?");
$check -> bind_param("s", $email);
$check -> execute();
$check -> store_result();


if ($check -> num_rows === 0) {
    $response['errors'][] = "No account found with that email";
    echo json_encode($response);
    exit;
}

$check -> close();


// Update Password
$hashed = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn -> prepare("UPDATE users SET password = ? WHERE email = ?");
$stmt -> bind_param("ss", $hashed, $email);

if ($stmt -> execute()) {
    $response["success"] = true;
} else {
    $response['errors'][] = "Database error: " . $conn->error;
}


$stmt -> close();
$conn -> close();
