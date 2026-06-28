import { create } from "zustand";

const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem("authUser");
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getStoredUser(),

  login: (user) => {
    localStorage.setItem("authUser", JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem("authUser");
    localStorage.removeItem("accessToken");
    set({ user: null });
  },
}));
