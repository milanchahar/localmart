const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const request = async (path, data, token) => {
  const res = await fetch(`${apiBase}${path}`, {
    method: data ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body.message || "Request failed");
  }

  return body;
};

export const registerUser = (payload) => request("/auth/register", payload);
export const loginUser = (payload) => request("/auth/login", payload);
export const getMe = (token) => request("/auth/me", null, token);
