import { getToken } from "../utils/auth";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const req = async (path, method = "GET", data) => {
  const res = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Request failed");
  return body;
};

export const getAvailableOrders = () => req("/agent/orders/available");
export const acceptDelivery = (id) => req(`/agent/orders/${id}/accept`, "POST");
export const updateDeliveryStatus = (id, status) =>
  req(`/agent/orders/${id}/status`, "PATCH", { status });
export const getActiveDelivery = () => req("/agent/orders/active");
export const getDeliveryHistory = () => req("/agent/orders/history");
