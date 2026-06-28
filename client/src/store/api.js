const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const getAccessToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("accessToken");
};

const apiRequest = async (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  const token = getAccessToken();

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};

export const loginUser = (username, password) =>
  apiRequest("/auth/signin", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const getAdminDashboard = () => apiRequest("/admin/dashboard");

export const getAdminUsers = () => apiRequest("/admin/users");

export const createAdminUser = (user) =>
  apiRequest("/admin/users", {
    method: "POST",
    body: JSON.stringify(user),
  });

export const updateAdminUser = (id, user) =>
  apiRequest(`/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(user),
  });

export const deleteAdminUser = (id) =>
  apiRequest(`/admin/users/${id}`, {
    method: "DELETE",
  });

export const lockAdminUser = (id) =>
  apiRequest(`/admin/users/${id}/lock`, {
    method: "PATCH",
  });

export const unlockAdminUser = (id) =>
  apiRequest(`/admin/users/${id}/unlock`, {
    method: "PATCH",
  });

export const changeAdminUserRole = (id, role) =>
  apiRequest(`/admin/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

export const resetAdminUserPassword = (id, newPassword) =>
  apiRequest(`/admin/users/${id}/reset-password`, {
    method: "PATCH",
    body: JSON.stringify({ newPassword }),
  });
