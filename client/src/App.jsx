import { Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage";
import CustomerHomePage from "./pages/customer/CustomerHomePage";
import CustomerShopPage from "./pages/customer/CustomerShopPage";
import CustomerCartPage from "./pages/customer/CustomerCartPage";
import CustomerOrdersPage from "./pages/customer/CustomerOrdersPage";
import CustomerOrderDetailPage from "./pages/customer/CustomerOrderDetailPage";
import OwnerDashboardPage from "./pages/owner/OwnerDashboardPage";
import OwnerProductsPage from "./pages/owner/OwnerProductsPage";
import OwnerProfilePage from "./pages/owner/OwnerProfilePage";
import OwnerOrdersPage from "./pages/owner/OwnerOrdersPage";
import AgentHomePage from "./pages/agent/AgentHomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { getHomeByRole, getRoleFromToken } from "./utils/auth";

export default function App() {
  const role = getRoleFromToken();
  const authRedirect = getHomeByRole(role);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={authRedirect} replace />} />
      <Route
        path="/login"
        element={role ? <Navigate to={authRedirect} replace /> : <AuthPage mode="login" />}
      />
      <Route
        path="/register"
        element={role ? <Navigate to={authRedirect} replace /> : <AuthPage mode="register" />}
      />

      <Route
        path="/home"
        element={
          <ProtectedRoute role="customer">
            <CustomerHomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop/:id"
        element={
          <ProtectedRoute role="customer">
            <CustomerShopPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute role="customer">
            <CustomerCartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute role="customer">
            <CustomerOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order/:id"
        element={
          <ProtectedRoute role="customer">
            <CustomerOrderDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute role="shop_owner">
            <OwnerDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/products"
        element={
          <ProtectedRoute role="shop_owner">
            <OwnerProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/profile"
        element={
          <ProtectedRoute role="shop_owner">
            <OwnerProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/orders"
        element={
          <ProtectedRoute role="shop_owner">
            <OwnerOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/home"
        element={
          <ProtectedRoute role="delivery_agent">
            <AgentHomePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
