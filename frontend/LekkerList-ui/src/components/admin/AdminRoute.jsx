// Guard: admin-only routes
import { Navigate } from "react-router-dom";
import { getUser } from "../../auth";

export default function AdminRoute({ children }) {
  const userInfo = getUser();

  if (!userInfo) return <Navigate to="/backend/pages/login.html" />;

  if (userInfo.role !== "admin") return <Navigate to="/" />;

  return children;
}
