import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { env } from "../../config/env";

const ACCESS_TOKEN_KEY = "portfolio_admin_token";
const REFRESH_TOKEN_KEY = "portfolio_admin_refresh_token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const savedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (savedToken) setToken(savedToken);
    if (savedRefreshToken) setRefreshToken(savedRefreshToken);

    setAuthLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    const res = await fetch(`${env.apiBase}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(json?.detail || "Login failed");
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, json.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, json.refresh_token);

    setToken(json.access_token);
    setRefreshToken(json.refresh_token);

    return json;
  };

  const register = async ({ email, password }) => {
    const res = await fetch(`${env.apiBase}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(json?.detail || "Registration failed");
    }

    return json;
  };

  const forgotPassword = async (email) => {
    const res = await fetch(`${env.apiBase}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(json?.detail || "Failed to send reset email");
    }

    return json;
  };

  const resetPassword = async ({ token, newPassword }) => {
    const res = await fetch(`${env.apiBase}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        new_password: newPassword,
      }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(json?.detail || "Failed to reset password");
    }

    return json;
  };

  const refreshAccessToken = async () => {
    const savedRefreshToken =
      refreshToken || localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!savedRefreshToken) {
      throw new Error("Missing refresh token");
    }

    const res = await fetch(`${env.apiBase}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: savedRefreshToken,
      }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      logout();
      throw new Error(json?.detail || "Failed to refresh token");
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, json.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, json.refresh_token);

    setToken(json.access_token);
    setRefreshToken(json.refresh_token);

    return json.access_token;
  };

  const logout = async () => {
    const savedRefreshToken =
      refreshToken || localStorage.getItem(REFRESH_TOKEN_KEY);

    try {
      if (savedRefreshToken) {
        await fetch(`${env.apiBase}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh_token: savedRefreshToken,
          }),
        });
      }
    } catch (_) {
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setToken("");
      setRefreshToken("");
    }
  };

  const value = useMemo(
    () => ({
      token,
      refreshToken,
      authLoading,
      isAuthenticated: !!token,
      login,
      register,
      forgotPassword,
      resetPassword,
      refreshAccessToken,
      logout,
    }),
    [token, refreshToken, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
