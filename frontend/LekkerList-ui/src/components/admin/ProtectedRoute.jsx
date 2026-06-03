// Guard: authenticated routes
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import localStorage from "redux-persist/es/storage";

export default function ProtectedRoute({ children }) {
  const authData = useSelector((state) => state.authentication?.authData);
  const stored = localStorage.getItem("profile");
  const userInfo = authData || (stored ? JSON.parse(stored) : null);

  if (!userInfo) return <Navigate to="/" replace />;
  return children;
}
