<?php

// Admin: list or delete users

require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get all users
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn -> query("SELECT id, firstname, lastname, email, role, image FROM users ORDER BY id DESC");

    $users = [];

    while ($row = $result -> fetch_assoc()) {
        $users[] = $row;
    }

    echo json_encode(["success" => true, "users" => $users]);
    exit;
}

// Delete a user
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? null;


    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing user id"]);
        exit;
    }

    $stmt = $conn -> prepare("DELETE FROM users WHERE id = ?");
    $stmt -> bind_param("i", $id);
    $stmt -> execute();

    echo json_encode(["success" => true, "message" => "User deleted"]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not alllowed"]);
