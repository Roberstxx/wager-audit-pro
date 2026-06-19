import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "./auth";
import type { Bet, Transaction, UserData } from "./types";
import { getUserData, saveUserData } from "./storage";

interface DataCtx {
  data: UserData;
  addBet: (b: Omit<Bet, "id" | "createdAt">) => void;
  updateBet: (id: string, patch: Partial<Bet>) => void;
  deleteBet: (id: string) => void;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  resetAll: () => void;
}

const Ctx = createContext<DataCtx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<UserData>({ bets: [], transactions: [] });

  useEffect(() => {
    if (user) setData(getUserData(user.id));
    else setData({ bets: [], transactions: [] });
  }, [user]);

  const persist = useCallback((next: UserData) => {
    setData(next);
    if (user) saveUserData(user.id, next);
  }, [user]);

  const api = useMemo<DataCtx>(() => ({
    data,
    addBet: (b) => persist({ ...data, bets: [{ ...b, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...data.bets] }),
    updateBet: (id, patch) => persist({ ...data, bets: data.bets.map((x) => x.id === id ? { ...x, ...patch } : x) }),
    deleteBet: (id) => persist({ ...data, bets: data.bets.filter((x) => x.id !== id) }),
    addTransaction: (t) => persist({ ...data, transactions: [{ ...t, id: crypto.randomUUID() }, ...data.transactions] }),
    deleteTransaction: (id) => persist({ ...data, transactions: data.transactions.filter((x) => x.id !== id) }),
    resetAll: () => persist({ bets: [], transactions: [] }),
  }), [data, persist]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useData must be used within DataProvider");
  return v;
}
