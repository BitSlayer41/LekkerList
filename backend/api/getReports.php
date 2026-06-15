<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/permissions.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$requestingId = (int) ($_GET['requesting_id'] ?? 0);

if (!$requestingId) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Missing requesting_id"]);
    exit;
}

// GET REPORTS — super_admin only
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    requirePermission($conn, $requestingId, 'manage_users');

    $stmt = $conn->prepare("
        SELECT
            sr.id, sr.order_id, sr.reason, sr.status, sr.created_at,
            r.firstname AS reporter_firstname,
            r.lastname AS reporter_lastname,
            r.email AS reporter_email,

            rep.id AS reported_id,
            rep.firstname AS reported_firstname,
            rep.lastname AS reported_lastname,
            rep.email AS reported_email,
            rep.role AS reported_role,
            rep.is_blocked AS reported_is_blocked

        FROM seller_reports sr
        INNER JOIN users r ON r.id = sr.reporter_id
        INNER JOIN users rep ON rep.id = sr.reported_user_id
        ORDER BY sr.created_at DESC
    ");

    $stmt->execute();
    $result = $stmt->get_result();

    $reports = [];
    while ($row = $result->fetch_assoc()) {
        $reports[] = $row;
    }

    $stmt->close();
    $conn->close();

    echo json_encode([
        "success" => true,
        "reports" => $reports
    ]);
    exit;
}

// PATCH REPORT — super_admin only
if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {

    requirePermission($conn, $requestingId, 'manage_users');

    $body = json_decode(file_get_contents("php://input"), true);

    $reportId = (int)($body['id'] ?? 0);
    $status = trim($body['status'] ?? '');

    $allowed = ['reviewed', 'dismissed'];

    if (!$reportId || !in_array($status, $allowed)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "error" => "Invalid fields"
        ]);
        exit;
    }

    $stmt = $conn->prepare("
        UPDATE seller_reports
        SET status = ?
        WHERE id = ?
    ");

    $stmt->bind_param("si", $status, $reportId);
    $stmt->execute();

    $stmt->close();
    $conn->close();

    echo json_encode([
        "success" => true,
        "message" => "report marked as {$status}"
    ]);
    exit;
}

http_response_code(405);
echo json_encode([
    "success" => false,
    "error" => "Method not allowed"
]);
