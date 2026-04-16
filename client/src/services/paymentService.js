import { getToken } from "../utils/auth";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

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

export const createRazorpayOrder = (amount) =>
  req("/payment/create-order", "POST", { amount });

export const verifyAndPlace = (payload) => req("/payment/verify", "POST", payload);

export const submitReview = (payload) => req("/customer/reviews", "POST", payload);
