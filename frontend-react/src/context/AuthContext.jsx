import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  logoutUser,
  registerUser,
  getCurrentUser,
} from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const data =
        await getCurrentUser();

      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(
    email,
    password
  ) {
    const data =
      await loginUser({
        email,
        password,
      });

    if (data.token) {
      localStorage.setItem(
        "token",
        data.token
      );
    }

    await loadUser();

    return data;
  }

  async function register(
    formData
  ) {
    const data =
      await registerUser(
        formData
      );

    if (data.token) {
      localStorage.setItem(
        "token",
        data.token
      );
    }

    await loadUser();

    return data;
  }

  async function logout() {
    try {
      await logoutUser();
    } catch {}

    localStorage.removeItem(
      "token"
    );

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(
    AuthContext
  );
}