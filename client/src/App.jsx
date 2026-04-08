import { Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage";
import CustomerHomePage from "./pages/customer/CustomerHomePage";
import OwnerDashboardPage from "./pages/owner/OwnerDashboardPage";
import AgentHomePage from "./pages/agent/AgentHomePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />

      <Route path="/home" element={<CustomerHomePage />} />
      <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
      <Route path="/agent/home" element={<AgentHomePage />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
