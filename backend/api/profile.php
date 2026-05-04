<?php

// Get or update a user's profile

require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


$uploadDir = __DIR__ . '/../uploads/';

// Get profile
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing user id"]);
        exit;
    }

    $stmt = $conn -> prepare("SELECT id, firstname, lastname, email, role, image FROM users WHERE id = ?");
    $stmt -> bind_param("i", $id);
    $stmt -> execute();

    $userInfo = $stmt -> get_result() -> fetch_assoc();

    if (!$userInfo) {
        http_response_code(404);
        echo json_encode(["error" => "User not found"]);
        exit;
    }


    echo json_encode(["success" => true, "user" => $userInfo]);
    exit;
}

// Update user (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => 'Missing user id']);
        exit;
    }

    // Fetches the current image path
    $stmt = $conn -> prepare("SELECT image FROM users WHERE id = ?");
    $stmt -> bind_param("i", $id);
    $stmt -> execute();
    $old = $stmt -> get_result() -> fetch_assoc();
    $oldImage = $old['image'] ?? null;


    // Delete image
    if (isset($_POST['deleteAvatar'])) {
        if ($oldImage && file_exists(__DIR__ . '/../' . $oldImage)) {
            unlink(__DIR__ . '/../' . $oldImage);
        }

        $stmt = $conn -> prepare("UPDATE users SET image = NULL WHERE id = ?");
        $stmt -> bind_param("i", $id);
        $stmt -> execute();
    }

    // Upload image
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        if ($oldImage && file_exists(__DIR__ . '/../' . $oldImage)) {
            unlink(__DIR__ . '/../' . $oldImage);
        }

        $fileName = time() . '_' . basename($_FILES['avatar']['name']);
        $target = $uploadDir . $fileName;
        $imagePath = 'uploads/' . $fileName;

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        if (move_uploaded_file($_FILES['avatar']['tmp_name'], $target)) {
            $stmt = $conn -> prepare("UPDATE users SET image = ? WHERE id = ?");
            $stmt -> bind_param("si", $imagePath, $id);
            $stmt -> execute();
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to upload image"]);
            exit;
        }
    }

    // Update text fields
    if (isset($_POST['firstname'])) {
        $stmt = $conn -> prepare("UPDATE users SET firstname = ?, lastname = ?, email = ? WHERE id = ?");
        $stmt -> bind_param("sssi", $_POST['firstname'], $_POST['lastname'], $_POST['email'], $id);
        $stmt -> execute();
    }

    // Return updated user
    $stmt = $conn -> prepare("SELECT id, firstname, lastname, email, role, image FROM users WHERE id = ?");
    $stmt -> bind_param("i", $id);
    $stmt -> execute();
    $userInfo = $stmt -> get_result() -> fetch_assoc();


    echo json_encode(["success" => true, "user" => $userInfo]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
