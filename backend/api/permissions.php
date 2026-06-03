<?php

// Permissions map per admin_role
const PERMISSIONS = [
    'super_admin' => [
        'view_dashboard',
        'manage_users',
        'assign_admin_roles',
        'view_orders',
        'manage_order_status',
        'view_earnings',
        'manage_products',
        'view_products',
        'verify_sellers',
        'manage_delivery',
        'view_messages',
    ],
    'finance_admin' => [
        'view_dashboard',
        'view_orders',
        'manage_order_status',
        'view_earnings',
        'manage_transactions',
    ],
    'content_admin' => [
        'view_dashboard',
        'manage_products',
        'view_products',
    ],
];

// Check if the user has the required permission
function hasPermission(string $adminRole, string $permission): bool
{
    return in_array($permission, PERMISSIONS[$adminRole] ?? []);
}

// Fetch admin_role from Database and check permissions
function requirePermission(mysqli $conn, int $userId, string $permission): array
{
    $stmt = $conn->prepare("SELECT id, firstname, lastname,role, admin_role FROM users WHERE id = ? LIMIT 1");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'User not found.']);
        exit;
    }

    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Access denied. User is not an admin.']);
        exit;
    }


    $adminRole = $user['admin_role'] ?? '';

    if (!hasPermission($adminRole, $permission)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Access denied. Insufficient permissions.',
            'required_permission' => $permission,
            "your_role" => $adminRole
        ]);
        exit;
    }
    return $user;
}
