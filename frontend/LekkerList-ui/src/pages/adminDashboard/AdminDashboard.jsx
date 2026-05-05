// Admin Dashboard: view and delete users
import { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { Spin } from "antd";
import PersonIcon from "../../images/user.svg?react";
import AdminIcon from "../../images/lock.svg?react";
import SellerIcon from "../../images/money-bill-wave.svg?react";
import BuyerIcon from "../../images/shopping-cart.svg?react";

const ROLE_BADGE_CLASS = {
  admin: "adminRoleBadgeAdmin",
  seller: "adminRoleBadgeSeller",
  customer: "adminRoleBadgeCustomer",
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(
        "http://localhost/LekkerList/backend/api/users.php",
      );

      const data = await res.json();
      setUsers(data.users ?? []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    await fetch("http://localhost/LekkerList/backend/api/users.php", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Derived stats
  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalSellers = users.filter((u) => u.role === "seller").length;
  const totalBuyers = users.filter((u) => u.role === "customer").length;

  const STATS = [
    {
      label: "Total Users",
      value: totalUsers,
      mod: "Orange",
      icon: <PersonIcon className="Icon" />,
    },
    {
      label: "Admins",
      value: totalAdmins,
      mod: "Dark",
      icon: <AdminIcon className="Icon" />,
    },
    {
      label: "Sellers",
      value: totalSellers,
      mod: "Teal",
      icon: <SellerIcon className="Icon" />,
    },
    {
      label: "Customers",
      value: totalBuyers,
      mod: "Gray",
      icon: <BuyerIcon className="Icon" />,
    },
  ];

  return (
    <div className="adminPage">
      {/* Header */}
      <div className="adminHeader">
        <div>
          <h1 className="adminTitle">Admin Dashboard</h1>
          <p className="adminSubtitle">Manage all LekkerList users</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="adminStatsRow">
        {STATS.map((s) => (
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

      {/* Users Table*/}
      <div className="adminTableCard">
        <div className="adminTableHeader">
          <h2 className="adminSectionTitle">All Users</h2>
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
                <th>Avatar</th>
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

                  {/* Name and Email */}
                  <td>
                    <div className="adminUserName">
                      {u.firstname} {u.lastname}
                    </div>
                    <div className="adminUserEmail">{u.email}</div>
                  </td>

                  {/* Email */}
                  <td>{u.email}</td>

                  {/* Role Badge */}
                  <td>
                    <span
                      className={`adminRoleBadge ${ROLE_BADGE_CLASS[u.role] ?? "adminRoleBadgeCustomer"}`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td>#{u.id}</td>

                  {/* Delete */}
                  <td>
                    <button
                      className="adminDeleteBtn"
                      onClick={() => deleteUser(u.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
