<?php

// Admin: list, delete, assign roles, block/unblock users
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
        SELECT id, firstname, lastname, email, role, admin_role,
               image, is_verified, is_blocked
        FROM users
        ORDER BY id DESC
    ");

    $users = [];
    while ($row = $result->fetch_assoc()) {
        $row['is_verified'] = (int) $row['is_verified'];
        $row['is_blocked']  = (int) $row['is_blocked'];
        $users[] = $row;
    }

    echo json_encode(["success" => true, "users" => $users]);
    exit;
}

/* ── DELETE a user — super_admin only ── */
if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    requirePermission($conn, $requestingId, 'manage_users');

    $id = (int) ($body["id"] ?? 0);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing user id"]);
        exit;
    }

    if ($id === $requestingId) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "You cannot delete your own account"]);
        exit;
    }

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
        echo json_encode(["success" => true, "message" => "User deleted successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to delete user"]);
    }

    $del->close();
    exit;
}

/* ── PATCH — update role / verify / block / switchRole ── */
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

        $stmt = $conn->prepare("SELECT role, is_blocked FROM users WHERE id = ?");
        $stmt->bind_param("i", $targetId);
        $stmt->execute();
        $current = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$current) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "User not found"]);
            exit;
        }

        /* Blocked sellers cannot switch to seller role */
        if ((int) $current['is_blocked'] === 1 && $current['role'] === 'customer') {
            http_response_code(403);
            echo json_encode([
                "success" => false,
                "error"   => "Your seller account has been blocked. Contact admin to restore selling access."
            ]);
            exit;
        }

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

    // Block / unblock user — super_admin only
    if (array_key_exists('is_blocked', $data)) {
        requirePermission($conn, $requestingId, 'manage_users');

        $isBlocked = (int) !!$data['is_blocked'];

        $stmt = $conn->prepare("UPDATE users SET is_blocked = ? WHERE id = ?");
        $stmt->bind_param("ii", $isBlocked, $targetId);
        $stmt->execute();
        $stmt->close();

        $action = $isBlocked ? "blocked" : "unblocked";
        echo json_encode([
            "success"    => true,
            "message"    => "User {$action} successfully",
            "is_blocked" => $isBlocked,
        ]);
        exit;
    }

    // Verify / unverify
    if (array_key_exists('is_verified', $data)) {
        requirePermission($conn, $requestingId, 'manage_users');

        $isVerified = (int) !!$data['is_verified'];

        $stmt = $conn->prepare("UPDATE users SET is_verified = ? WHERE id = ?");
        $stmt->bind_param("ii", $isVerified, $targetId);
        $stmt->execute();
        $stmt->close();

        echo json_encode(["success" => true, "message" => "User verification updated"]);
        exit;
    }

    // Update role / admin_role
    if (array_key_exists('role', $data)) {
        requirePermission($conn, $requestingId, 'assign_admin_roles');

        $newRole   = $data['role']       ?? null;
        $adminRole = $data['admin_role'] ?? null;

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
        $stmt->close();

        echo json_encode(["success" => true, "message" => "User role updated"]);
        exit;
    }

    http_response_code(400);
    echo json_encode(["success" => false, "error" => "No valid fields provided"]);
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "error" => "Method not allowed"]);
