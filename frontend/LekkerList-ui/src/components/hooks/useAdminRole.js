import { useMemo } from "react";

export default function useAdminRole(admin) {
  const adminRole = admin?.admin_role || null;

  const permissions = useMemo(() => {
    const map = {
      super_admin: [
        "manage_users",
        "assign_admin_roles",
        "view_orders",
        "manage_order_status",
        "view_earnings",
        "manage_products",
      ],

      finance_admin: ["view_orders", "view_earnings", "manage_order_status"],

      content_admin: ["manage_products"],
    };

    return map[adminRole] || [];
  }, [adminRole]);

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  return {
    adminRole,
    permissions,
    hasPermission,

    // role helpers
    isSuperAdmin: adminRole === "super_admin",
    isFinanceAdmin: adminRole === "finance_admin",
    isContentAdmin: adminRole === "content_admin",

    // dashboard permissions
    canManageAdmins:
      permissions.includes("manage_users") ||
      permissions.includes("assign_admin_roles"),

    canManageProducts: permissions.includes("manage_products"),

    canManageOrders:
      permissions.includes("view_orders") ||
      permissions.includes("manage_order_status"),

    canViewEarnings: permissions.includes("view_earnings"),
  };
}
