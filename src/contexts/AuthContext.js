import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { verifyToken as verifyTokenApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("adminUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem("adminToken"));

  const isAuthenticated = !!token && !!user;

  const handleLogin = useCallback((newToken, userData) => {
    localStorage.setItem("adminToken", newToken);
    localStorage.setItem("adminUser", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setToken(null);
    setUser(null);
  }, []);

  // Listen for forced logouts from the API service
  useEffect(() => {
    const onForceLogout = () => handleLogout();
    window.addEventListener("auth:logout", onForceLogout);
    return () => window.removeEventListener("auth:logout", onForceLogout);
  }, [handleLogout]);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    verifyTokenApi()
      .then(() => { if (!cancelled) setIsLoading(false); })
      .catch(() => {
        if (!cancelled) {
          handleLogout();
          setIsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, isLoading, handleLogin, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
