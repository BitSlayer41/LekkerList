<?php

// Fetches the 5 latest message for the dashboard

require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$userId = $_GET['user_id'] ?? null;

if (!$userId) {
    echo json_encode(["success" => false, "error" => "Missing user_id"]);
    exit;
}

$stmt = $conn -> prepare("SELECT m.*, u.firstname, u.lastname FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.sender_id = ? OR m.receiver_id = ? ORDER BY m.created_at DESC LIMIT 5");

$stmt->bind_param("ii", $userId, $userId);

$stmt -> execute();
$result = $stmt -> get_result();
$messages = [];

while ($row = $result -> fetch_assoc()) {
    $messages[] = [
        'id' => $row['id'],
        'name' => $row['firstname'] . ' ' . $row['lastname'],
        'text' => $row['message'],
        'time' => date("M j, H:i", strtotime($row['created_at'])),
    ];
}

echo json_encode(["success" => true, "messages" => $messages]);

$stmt -> close();
$conn -> close();
