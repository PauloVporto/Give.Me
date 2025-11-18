import React, { createContext, useState, useEffect } from "react";
import { ACCESS_TOKEN } from "../constants";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/api/user/profile/");
        setUser(response.data);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        localStorage.removeItem(ACCESS_TOKEN);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem(ACCESS_TOKEN, token);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login }}>
      {children}
    </AuthContext.Provider>
  );
};