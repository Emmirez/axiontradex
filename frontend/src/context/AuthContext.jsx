import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      const { kyc, ...rest } = user;
      const safeUser = {
        ...rest,
        kyc: kyc
          ? {
              ...kyc,
              documentUrl: undefined,
              backUrl: undefined,
              selfieUrl: undefined,
            }
          : kyc,
      };
      localStorage.setItem("user", JSON.stringify(safeUser));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    }
  }, [user]);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      // Decode and check expiry
      try {
        const { exp } = JSON.parse(atob(token.split(".")[1]));
        const isExpired = Date.now() >= exp * 1000;

        if (isExpired) {
          // Try to refresh
          try {
            const res = await authService.refreshToken(); // call your refresh endpoint
            const { accessToken } = res.data;
            localStorage.setItem("accessToken", accessToken);
          } catch {
            // Refresh failed — log the user out
            setUser(null);
          }
        }
      } catch {
        setUser(null); // bad token format
      }
    };

    checkToken();
  }, []); // runs once on app load

  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.register(formData);
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, totpToken = null) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password, totpToken);
      if (res.data?.requires2FA) return { requires2FA: true };

      const { accessToken, user: userData } = res.data;
      localStorage.setItem("accessToken", accessToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      throw new Error(msg);
    } finally {
      setLoading(false); // ← always runs, no need to call it in try/catch
    }
  };

  const logout = async () => {
    setUser(null); // clear immediately
    authService.logout().catch(() => {}); // fire and forget
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getProfile();

      // Check the response structure
      if (res?.user) {
        setUser(res.user);
      } else if (res?.data?.user) {
        setUser(res.data.user);
      } else {
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        refreshUser,
        updateUser,
        clearError,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin" || user?.role === "superadmin",
        isSuperAdmin: user?.role === "superadmin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
