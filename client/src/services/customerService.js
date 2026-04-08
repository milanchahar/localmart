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
  if (!res.ok) {
    throw new Error(body.message || "Request failed");
  }
  return body;
};

export const getCustomerProfile = () => req("/customer/me");
export const getShops = (params = {}) => {
  const sp = new URLSearchParams();
  if (params.pincode) sp.set("pincode", params.pincode);
  if (params.category) sp.set("category", params.category);
  if (params.q) sp.set("q", params.q);
  const q = sp.toString();
  return req(`/customer/shops${q ? `?${q}` : ""}`);
};
export const getShopById = (id, q = "") => {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  return req(`/customer/shops/${id}${qs}`);
};
export const placeCustomerOrder = (payload) => req("/customer/orders", "POST", payload);
