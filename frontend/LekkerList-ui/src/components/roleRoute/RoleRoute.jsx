// Guard: role-restricted routes

import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RoleRoute({ children, allowedRoles = [] }) {
  const authData = useSelector((state) => state.authentication?.authData);

  let userInfo = authData;

  // Fallback to localStorage
  if (!userInfo) {
    try {
      const stored = localStorage.getItem("profile");

      if (stored) {
        userInfo = JSON.parse(stored);
      }
    } catch (err) {
      console.error("Failed to parse stored profile:", err);
    }
  }

  // Not logged in
  if (!userInfo?.user) {
    return <Navigate to="/" replace />;
  }

  const user = userInfo.user;

  const role = user.role;
  const adminRole = user.admin_role;

  let effectiveRole = role;

  // Convert admin -> subtype
  if (role === "admin" && adminRole) {
    effectiveRole = adminRole;
  }

  // Unauthorized
  if (!allowedRoles.includes(effectiveRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
