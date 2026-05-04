<?php

// Fetches all messages for a user
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
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "user_id is required"]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT m.*, u1.firstname AS senderFirstname, u1.lastname AS senderLastname, u2.firstname AS receiverFirstname, u2.lastname AS receiverLastname FROM messages m LEFT JOIN users u1 ON m.sender_id = u1.id LEFT JOIN users u2 ON m.receiver_id = u2.id WHERE m.sender_id = ? OR m.receiver_id = ? ORDER BY m.created_at ASC");

    $stmt->bind_param("ii", $userId, $userId);
    $stmt-> execute();

    $result = $stmt->get_result();
    $messages = [];

    while ($row = $result-> fetch_assoc()) {
        $messages[] = $row;
    }

    echo json_encode(["success" => true, "messages" => $messages]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

$stmt -> close();
$conn -> close();
