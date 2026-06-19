import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "./types";
import { getSession, getUsers, saveUsers, setSession } from "./storage";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (username: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sid = getSession();
    if (sid) {
      const u = getUsers().find((x) => x.id === sid);
      if (u) setUser(u);
    }
    setLoading(false);
  }, []);

  const login: AuthCtx["login"] = (email, password) => {
    const u = getUsers().find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!u) return { ok: false, error: "Usuario no encontrado" };
    if (u.password !== password) return { ok: false, error: "Contraseña incorrecta" };
    setSession(u.id);
    setUser(u);
    return { ok: true };
  };

  const register: AuthCtx["register"] = (username, email, password) => {
    const users = getUsers();
    if (users.some((x) => x.email.toLowerCase() === email.toLowerCase()))
      return { ok: false, error: "Ese email ya está registrado" };
    const u: User = {
      id: crypto.randomUUID(),
      username, email, password,
      createdAt: new Date().toISOString(),
    };
    users.push(u);
    saveUsers(users);
    setSession(u.id);
    setUser(u);
    return { ok: true };
  };

  const logout = () => { setSession(null); setUser(null); };

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
