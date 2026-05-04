<?php

// Register new user

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

// Parse FormData
$firstname = trim($_POST['firstname'] ?? '');
$lastname = trim($_POST['lastname'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirm = $_POST['confirmPassword'] ?? '';
$adminCode = $_POST['adminCode'] ?? '';
$accountType = $_POST['accountType'] ?? 'customer';

// Validation
$errors = [];

if (!$firstname) {
    $errors[] = "First name required";
}

if (!$lastname) {
    $errors[] = "Last name required";
}

if (!$email) {
    $errors[] = "Email required";
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Invalid email";
}

if (!$password) {
    $errors[] = "Password required";
} elseif (
    strlen($password) < 8 || !preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) || !preg_match('/[0-9]/', $password)
) {
    $errors[] = 'Weak password';
}

if ($password !== $confirm) {
    $errors[] = "Passwords do not match";
}

if (!empty($errors)) {
    echo json_encode(["success" => false, "errors" => $errors]);
    exit;
}

// Duplicate email check
$stmt = $conn -> prepare("SELECT id FROM users WHERE email = ?");
$stmt -> bind_param("s", $email);
$stmt -> execute();
$stmt -> store_result();


if ($stmt -> num_rows > 0) {
    echo json_encode(["success" => false, "errors" => ["Email already exists"]]);
    exit;
}

$stmt -> close();

// Determine role
$allowedRoles = ['customer', 'seller'];
$role = $adminCode === 'LEKKERLIST-ADMIN-2026' ? 'admin' : (in_array($accountType, $allowedRoles) ? $accountType : 'customer');

//Insert
$hashed = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn -> prepare("INSERT INTO users (firstname, lastname, email, password, role) VALUES (?, ?, ?, ?, ?)");
$stmt -> bind_param("sssss", $firstname, $lastname, $email, $hashed, $role);


if ($stmt -> execute()) {
    echo json_encode(["success" => true, "message" => "User registered successfully"]);
} else {
    echo json_encode(["success" => false, "error" => "Database insert failed"]);
}

$stmt -> close();
$conn -> close();
