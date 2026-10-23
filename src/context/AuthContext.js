import React, { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";
import { registerForPush } from "../services/notifications";
import { getStorageItem, setStorageItem, deleteStorageItem } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await getStorageItem("auth_token");
        if (saved) {
          setToken(saved);
          try {
            const { data } = await client.get("/user");
            setUser(data);
            registerForPush().catch(() => {});
          } catch {
            await deleteStorageItem("auth_token");
            setToken(null);
          }
        }
      } catch (err) {
        console.warn("Error reading auth token:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await client.post("/login", { email, password });
    const authToken = data.token || data.access_token;
    if (authToken) {
      await setStorageItem("auth_token", authToken);
      setToken(authToken);
    }
    setUser(data.user);
    registerForPush().catch(() => {});
    return data;
  };

  const register = async (payload) => {
    const { data } = await client.post("/register", payload);
    const authToken = data.token || data.access_token;
    if (authToken) {
      await setStorageItem("auth_token", authToken);
      setToken(authToken);
    }
    setUser(data.user);
    registerForPush().catch(() => {});
    return data;
  };

  const logout = async () => {
    try {
      await client.post("/logout");
    } catch {}
    await deleteStorageItem("auth_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
