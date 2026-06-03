<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . "/permissions.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$body = json_decode(file_get_contents("php://input"), true);

$requestingId = (int) (
    $_GET['requestingId']
    ?? $body['requestingId']
    ?? 0
);

if (!$requestingId) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Unauthorized: Missing requesting user id"]);
    exit;
}

// GET all users — super_admin only
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    requirePermission($conn, $requestingId, 'manage_users');

    $result = $conn->query("
        SELECT id, firstname, lastname, email, role, admin_role, image, is_verified
        FROM users
        ORDER BY id DESC
    ");

    $users = [];
    while ($row = $result->fetch_assoc()) {
        $row['is_verified'] = (int) $row['is_verified'];
        $users[] = $row;
    }

    echo json_encode(["success" => true, "users" => $users]);
    exit;
}

// DELETE a user — super_admin only
if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    requirePermission($conn, $requestingId, 'manage_users');

    $id = (int) ($body["id"] ?? 0);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing user id"]);
        exit;
    }

    // Prevent self-deletion
    if ($id === $requestingId) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "You cannot delete your own account"]);
        exit;
    }

    // Verify requester is super_admin
    $stmt = $conn->prepare("SELECT role, admin_role FROM users WHERE id = ?");
    $stmt->bind_param("i", $requestingId);
    $stmt->execute();
    $admin = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!($admin["role"] === "admin" && $admin["admin_role"] === "super_admin")) {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "Only Super Admin can delete users"]);
        exit;
    }

    // Get target role
    $stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $target = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$target) {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "User not found"]);
        exit;
    }

    // If seller — delete their products first
    if ($target["role"] === "seller") {
        $prodStmt = $conn->prepare("DELETE FROM products WHERE seller_id = ?");
        $prodStmt->bind_param("i", $id);
        if (!$prodStmt->execute()) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Failed to delete seller products"]);
            exit;
        }
        $prodStmt->close();
    }

    $del = $conn->prepare("DELETE FROM users WHERE id = ?");
    $del->bind_param("i", $id);

    if ($del->execute()) {
        echo json_encode(["success" => true, "message" => "User and related data deleted successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to delete user"]);
    }

    $del->close();
    exit;
}

// PATCH — update role, verify, or self-switch role
if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {

    $data     = $body ?? [];
    $targetId = (int) ($data['id'] ?? 0);

    if (!$targetId) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing id"]);
        exit;
    }

    // Self role-switch (customer ↔ seller)
    if (!empty($data['switchRole']) && $targetId === $requestingId) {

        $stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->bind_param("i", $targetId);
        $stmt->execute();
        $current = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$current) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "User not found"]);
            exit;
        }

        /* Only customer and seller switch is allowed */
        $switchMap = ['customer' => 'seller', 'seller' => 'customer'];

        if (!isset($switchMap[$current['role']])) {
            http_response_code(403);
            echo json_encode(["success" => false, "error" => "Role switch not available for your current role"]);
            exit;
        }

        $newRole = $switchMap[$current['role']];

        $stmt = $conn->prepare("UPDATE users SET role = ?, admin_role = NULL WHERE id = ?");
        $stmt->bind_param("si", $newRole, $targetId);
        $stmt->execute();
        $stmt->close();

        echo json_encode([
            "success"  => true,
            "message"  => "Role switched to {$newRole}",
            "new_role" => $newRole,
        ]);
        exit;
    }

    // Verify / unverify user
    if (array_key_exists('is_verified', $data)) {
        requirePermission($conn, $requestingId, 'manage_users');

        $isVerified = (int) !!$data['is_verified'];

        $stmt = $conn->prepare("UPDATE users SET is_verified = ? WHERE id = ?");
        $stmt->bind_param("ii", $isVerified, $targetId);
        $stmt->execute();

        echo json_encode(["success" => true, "message" => "User verification updated"]);
        exit;
    }

    // Update role / admin_role
    if (array_key_exists('role', $data)) {
        requirePermission($conn, $requestingId, 'assign_admin_roles');

        $newRole   =  $data['role']       ?? null;
        $adminRole =  $data['admin_role'] ?? null;

        $allowedRoles      = ['customer', 'seller', 'admin'];
        $allowedAdminRoles = ['super_admin', 'finance_admin', 'content_admin', null];

        if (!in_array($newRole, $allowedRoles) || !in_array($adminRole, $allowedAdminRoles)) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Invalid role or admin_role"]);
            exit;
        }

        if ($newRole !== 'admin') {
            $adminRole = null;
        }

        $stmt = $conn->prepare("UPDATE users SET role = ?, admin_role = ? WHERE id = ?");
        $stmt->bind_param("ssi", $newRole, $adminRole, $targetId);
        $stmt->execute();

        echo json_encode(["success" => true, "message" => "User role updated"]);
        exit;
    }

    http_response_code(400);
    echo json_encode(["success" => false, "error" => "No valid fields provided"]);
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "error" => "Method not allowed"]);
