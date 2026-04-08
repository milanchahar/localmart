import { getToken } from "../utils/auth";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const req = async (path, method = "GET", data) => {
  const token = getToken();

  const res = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || "Request failed");
  }
  return body;
};

export const getOwnerDashboard = () => req("/owner/dashboard");
export const getOwnerShop = () => req("/owner/shop");
export const updateOwnerShop = (payload) => req("/owner/shop", "PATCH", payload);
export const getOwnerProducts = () => req("/owner/products");
export const addOwnerProduct = (payload) => req("/owner/products", "POST", payload);
export const editOwnerProduct = (id, payload) => req(`/owner/products/${id}`, "PATCH", payload);
export const removeOwnerProduct = (id) => req(`/owner/products/${id}`, "DELETE");
