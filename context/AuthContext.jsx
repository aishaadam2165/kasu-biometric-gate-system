"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    axios
      .get("/api/auth/me")
      .then(({ data }) => {
        if (isMounted) setAdmin(data.admin);
      })
      .catch(() => {
        if (isMounted) setAdmin(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(email, password) {
    const { data } = await axios.post("/api/auth/login", { email, password });
    setAdmin(data.admin);
    return data.admin;
  }

  async function logout() {
    await axios.post("/api/auth/logout");
    setAdmin(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}
