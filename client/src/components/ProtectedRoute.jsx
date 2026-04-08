import { Navigate } from "react-router-dom";
import { getHomeByRole, getRoleFromToken } from "../utils/auth";

export default function ProtectedRoute({ role, children }) {
  const userRole = getRoleFromToken();

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to={getHomeByRole(userRole)} replace />;
  }

  return children;
}
