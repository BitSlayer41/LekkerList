// Admin Dashboard: view and delete users
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { getUser } from "../../auth";
import useAdminRole from "../../components/hooks/useAdminRole";
import Products from "../../components/products/Products";
import Earnings from "../../components/earnings/Earnings";
import Orders from "../../components/orders/Orders";
import SellerReports from "../../components/reports/SellerReports";
import "./AdminDashboard.css";
import { Spin } from "antd";
import PersonIcon from "../../images/user.svg?react";
import AdminIcon from "../../images/lock.svg?react";
import SellerIcon from "../../images/user.svg?react";
import BuyerIcon from "../../images/shopping-cart.svg?react";
import OrderIcon from "../../images/coins.svg?react";
import MoneyIcon from "../../images/money-bill-wave.svg?react";

const ADMIN_ROLE_LABELS = {
  super_admin: "Super Admin",
  finance_admin: "Finance Admin",
  content_admin: "Content Admin",
};

export default function AdminDashboard() {
  const admin = getUser();

  const {
    canManageAdmins,
    canManageProducts,
    canManageOrders,
    canViewEarnings,
    adminRole,
  } = useAdminRole(admin);

  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reports] = useState([]);

  const adminId = admin?.user?.id || admin?.id;

  const isFinanceAdmin = adminRole === "finance_admin";
  const isSuperAdmin = adminRole === "super_admin";
  const isContentAdmin = adminRole === "content_admin";

  const usersRef = useRef(null);
  const productsRef = useRef(null);
  const ordersRef = useRef(null);
  const earningsRef = useRef(null);
  const reportsRef = useRef(null);

  // Fetch orders (finance / super)
  useEffect(() => {
    const fetchOrders = async () => {
      if (!canManageOrders) return;

      const res = await fetch(
        `http://localhost/LekkerList/backend/api/users.php?requestingId=${adminId}&role=admin`,
      );
      const data = await res.json();

      setOrders(data.orders || []);
    };

    fetchOrders();
  }, [canManageOrders, adminId, adminRole]);

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => {
      return sum + Number(order.total ?? 0);
    }, 0);
  }, [orders]);

  // Fetch Users (super only)
  const fetchUsers = useCallback(async () => {
    if (!adminId || !canManageAdmins) return;

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost/LekkerList/backend/api/users.php?requestingId=${adminId}&role=admin`,
      );

      const data = await res.json();

      if (!data.success) {
        console.error("Users API errror: ", data.error);
        setUsers([]);
        return;
      }

      setUsers(data.users ?? []);
    } catch (err) {
      console.log(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [adminId, canManageAdmins]);

  useEffect(() => {
    if (!adminId || !canManageAdmins) return;

    fetchUsers();
  }, [fetchUsers, adminId, canManageAdmins]);

  // Delete User
  const deleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?",
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        "http://localhost/LekkerList/backend/api/users.php",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, requestingId: adminId }),
        },
      );

      const data = await res.json();

      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert("Failed to delete user: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // Update user role labels for display
  const updateUserRole = async (id, value) => {
    try {
      let role = value;
      let admin_role = null;

      if (["super_admin", "finance_admin", "content_admin"].includes(value)) {
        role = "admin";
        admin_role = value;
      }

      const res = await fetch(
        "http://localhost/LekkerList/backend/api/users.php",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            role,
            admin_role,
            requestingId: adminId,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        fetchUsers();
      } else {
        alert("Failed to update user role: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error updating user role:", err);
    }
  };

  // Verify User
  const toggleVerifyUser = async (id, current) => {
    try {
      const res = await fetch(
        "http://localhost/LekkerList/backend/api/users.php",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            is_verified: current ? 0 : 1,
            requestingId: adminId,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === id
              ? {
                  ...u,
                  is_verified: current ? 0 : 1,
                }
              : u,
          ),
        );
      } else {
        alert(data.error || "Failed to verify user");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick scroll
  const scrollToSection = (ref) => {
    ref?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Derived stats
  const visibleStats = useMemo(() => {
    const rolePermissions = {
      super_admin: {
        stats: ["users", "admins", "sellers", "customers"],
      },
      finance_admin: {
        stats: ["orders", "earnings"],
      },
      content_admin: {
        stats: ["sellers"],
      },
    };
    const allowedStats = rolePermissions[adminRole]?.stats || [];
    const stats = [];

    if (allowedStats.includes("users")) {
      stats.push({
        label: "Total Users",
        value: users.length,
        mod: "Orange",
        icon: <PersonIcon className="Icon" />,
      });
    }

    if (allowedStats.includes("admins")) {
      stats.push({
        label: "Admins",
        value: users.filter((u) => u.role === "admin").length,
        mod: "Dark",
        icon: <AdminIcon className="Icon" />,
      });
    }

    if (allowedStats.includes("sellers")) {
      stats.push({
        label: "Sellers",
        value: users.filter((u) => u.role === "seller").length,
        mod: "Teal",
        icon: <SellerIcon className="Icon" />,
      });
    }

    if (allowedStats.includes("customers")) {
      stats.push({
        label: "Customers",
        value: users.filter((u) => u.role === "customer").length,
        mod: "Gray",
        icon: <BuyerIcon className="Icon" />,
      });
    }

    if (allowedStats.includes("orders")) {
      stats.push({
        label: "Orders",
        value: orders.length,
        mod: "Orange",
        icon: <OrderIcon className="Icon" />,
      });
    }

    if (allowedStats.includes("earnings")) {
      stats.push({
        label: "Revenue",
        value: totalRevenue,
        mod: "Green",
        icon: <MoneyIcon className="Icon" />,
      });
    }

    return stats;
  }, [users, adminRole, orders.length, totalRevenue]);

  const pendingReports = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="adminPage">
      {/* Header */}
      <div className="adminHeader">
        <div>
          <h1 className="adminTitle">Admin Dashboard</h1>
          <p className="adminSubtitle">
            {adminRole === "super_admin" &&
              "Full platform administration access"}

            {adminRole === "finance_admin" &&
              "Manage orders, payments and earnings"}

            {adminRole === "content_admin" && "Manage products and listings"}
          </p>
        </div>
      </div>
      {isSuperAdmin && pendingReports > 0 && (
        <div
          className="adminReportAlert"
          onClick={() => scrollToSection(reportsRef)}
        >
          <AdminIcon className="Icon" />
          <span>
            {pendingReports} pending seller report
            {pendingReports !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Stats row */}
      {canManageAdmins && (
        <div className="adminStatsRow">
          {visibleStats.map((s) => (
            <div key={s.label} className="adminStatCard">
              <div className={`adminStatIcon adminStatIcon${s.mod}`}>
                {s.icon}
              </div>
              <div>
                <div className="adminStatValue">{loading ? "-" : s.value}</div>
                <div className="adminStatLabel">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="adminQuickActions">
        {canManageAdmins && (
          <button
            className="adminQuickBtn"
            onClick={() => scrollToSection(usersRef)}
          >
            Manage Users
          </button>
        )}

        {canManageProducts && (
          <button
            className="adminQuickBtn"
            onClick={() => scrollToSection(productsRef)}
          >
            Manage Products
          </button>
        )}

        {canManageOrders && (
          <button
            className="adminQuickBtn"
            onClick={() => scrollToSection(ordersRef)}
          >
            Manage Orders
          </button>
        )}

        {canViewEarnings && (
          <button
            className="adminQuickBtn"
            onClick={() => scrollToSection(earningsRef)}
          >
            View Earnings
          </button>
        )}

        {isSuperAdmin && (
          <button
            className="adminQuickBtn adminQuickBtnAlert"
            onClick={() => scrollToSection(reportsRef)}
          >
            Seller Reports{" "}
            {pendingReports > 0 && (
              <span className="adminReportBadge">({pendingReports})</span>
            )}
          </button>
        )}
      </div>

      {/* Super Admin: Users Table*/}
      {canManageAdmins && (
        <div ref={usersRef} className="adminTableCard">
          <div className="adminTableHeader">
            <h2 className="adminSectionTitle">User Management</h2>
          </div>

          {loading ? (
            <Spin size="large" description="Loading admin page..." />
          ) : users.length === 0 ? (
            <div className="adminEmpty">
              <span>
                <PersonIcon className="Icon" />
              </span>
              <p>No users found</p>
            </div>
          ) : (
            <table className="adminTable">
              <thead>
                <tr>
                  {!isFinanceAdmin && !isContentAdmin && <th>Avatar</th>}
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>ID</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    {/* Avatar */}
                    {!isFinanceAdmin && !isContentAdmin && (
                      <td>
                        {u.image ? (
                          <img
                            src={`http://localhost/LekkerList/backend/${u.image}`}
                            alt={u.firstname}
                            className="adminAvatar"
                          />
                        ) : (
                          <div className="adminAvatarPlaceholder">
                            {u.firstname?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                        )}
                      </td>
                    )}

                    {/* Name */}
                    <td>
                      <div className="adminUserName">
                        {u.firstname} {u.lastname}
                        {Number(u.is_verified) === 1 && (
                          <span className="verifiedBadge">Verified</span>
                        )}
                      </div>
                    </td>

                    {/* Email */}
                    <td>
                      <div className="adminUserEmail">{u.email}</div>
                    </td>

                    {/* Role Badge */}
                    <td>
                      <select
                        className="adminRoleSelect"
                        value={u.role === "admin" ? u.admin_role : u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value)}
                      >
                        <option value="customer">Customer</option>
                        <option value="seller">Seller</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="finance_admin">Finance Admin</option>
                        <option value="content_admin">Content Admin</option>
                      </select>
                    </td>

                    {/* ID */}
                    <td>#{u.id}</td>

                    {/* Actions */}
                    <td>
                      <button
                        className="adminDeleteBtn"
                        onClick={() => deleteUser(u.id)}
                      >
                        Delete
                      </button>
                      <button
                        className="adminVerifyBtn"
                        onClick={() =>
                          toggleVerifyUser(u.id, Number(u.is_verified) === 1)
                        }
                      >
                        {u.is_verified ? "Unverify" : "Verify"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Content Admin: Product Management */}
      {canManageProducts && (
        <div ref={productsRef} className="adminTableCard">
          <div className="adminTableHeader">
            <h2 className="adminSectionTitle">Product Management</h2>
          </div>
          <div className="adminSectionContent">
            <Products />
          </div>
        </div>
      )}

      {/* Finance Admin: Order Management */}
      {canManageOrders && (
        <div ref={ordersRef} className="adminTableCard">
          <div className="adminTableHeader">
            <h2 className="adminSectionTitle">Order Management</h2>
          </div>
          <div className="adminSectionContent">
            <Orders />
          </div>
        </div>
      )}

      {/* Sellers Reported */}
      {canManageAdmins && adminRole === "super_admin" && (
        <div ref={reportsRef} className="adminTableCard">
          <div className="adminTableHeader">
            <h2 className="adminSectionTitle">
              Notifications of Sellers Reported
            </h2>
          </div>

          <div className="adminSectionContent">
            <SellerReports
              adminId={adminId}
              isSuperAdmin={isSuperAdmin}
              setUsers={setUsers}
            />
          </div>
        </div>
      )}

      {canViewEarnings && (
        <div ref={earningsRef} className="adminTableCard">
          <div className="adminTableHeader" ref={earningsRef}>
            <h2 className="adminSectionTitle">Earnings</h2>
          </div>
          <div className="adminSectionContent">
            <Earnings />
          </div>
        </div>
      )}
    </div>
  );
}
