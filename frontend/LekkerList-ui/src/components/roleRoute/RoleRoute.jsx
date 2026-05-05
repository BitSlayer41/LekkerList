// Guard: role-restricted routes
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RoleRoute({ children, allowedRoles = [] }) {
  const authData = useSelector((state) => state.authentication?.authData);
  const stored = localStorage.getItem("profile");
  const userInfo = authData || (stored ? JSON.parse(stored) : null);
  const role = userInfo?.user?.role;

  if (!userInfo) return <Navigate to="/" replace />;

  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;

  return children;
}
