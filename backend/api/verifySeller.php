<?php

require_once 'permissions.php';
require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");

// Permission check
$user = requirePermission(
    $conn,
    $_SESSION['user_id'],
    'verify_sellers'
);

// Read JSON body

$data = json_decode(file_get_contents("php://input"), true);

$userId = intval($data['user_id'] ?? 0);

if (!$userId) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid user ID.'
    ]);
    exit;
}

// Update user verification
$stmt = $conn->prepare("
    UPDATE users
    SET
        is_verified = 1,
        verification_status = 'Verified'
    WHERE id = ?
");

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $conn->error
    ]);
    exit;
}

$stmt->bind_param("i", $userId);

if ($stmt->execute()) {

    echo json_encode([
        'success' => true,
        'message' => 'Seller verified successfully.',
        'affected_rows' => $stmt->affected_rows
    ]);

} else {

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $stmt->error
    ]);
}

$stmt->close();
$conn->close();
