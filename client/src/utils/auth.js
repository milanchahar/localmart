const tokenKey = "localmart_token";

export const saveToken = (token) => {
  localStorage.setItem(tokenKey, token);
};

export const getToken = () => {
  return localStorage.getItem(tokenKey);
};

export const clearToken = () => {
  localStorage.removeItem(tokenKey);
};

export const decodeToken = (token) => {
  try {
    const base64 = token.split(".")[1];
    if (!base64) {
      return null;
    }
    const payload = JSON.parse(atob(base64));
    return payload;
  } catch (err) {
    return null;
  }
};

export const getRoleFromToken = () => {
  const token = getToken();
  if (!token) {
    return "";
  }
  const payload = decodeToken(token);
  return payload?.role || "";
};

export const getHomeByRole = (role) => {
  if (role === "customer") {
    return "/home";
  }
  if (role === "shop_owner") {
    return "/owner/dashboard";
  }
  if (role === "delivery_agent") {
    return "/agent/home";
  }
  return "/login";
};
