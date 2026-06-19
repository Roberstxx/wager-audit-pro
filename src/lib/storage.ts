import { DEFAULT_CURRENCY } from "./bet-utils";
import type { User, UserData } from "./types";

const USERS_KEY = "bt:users";
const SESSION_KEY = "bt:session";
const dataKey = (uid: string) => `bt:data:${uid}`;
const emptyUserData = (): UserData => ({ bets: [], transactions: [], currency: DEFAULT_CURRENCY });
const normalizeUserData = (data: Partial<UserData> | null | undefined): UserData => ({
  bets: Array.isArray(data?.bets) ? data.bets : [],
  transactions: Array.isArray(data?.transactions) ? data.transactions : [],
  currency: data?.currency === "USD" ? "USD" : DEFAULT_CURRENCY,
});

export const isBrowser = () => typeof window !== "undefined";

export function getUsers(): User[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
export function getSession(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(SESSION_KEY);
}
export function setSession(uid: string | null) {
  if (uid) localStorage.setItem(SESSION_KEY, uid);
  else localStorage.removeItem(SESSION_KEY);
}

export function getUserData(uid: string): UserData {
  if (!isBrowser()) return emptyUserData();
  try {
    const raw = localStorage.getItem(dataKey(uid));
    if (!raw) return emptyUserData();
    return normalizeUserData(JSON.parse(raw));
  } catch {
    return emptyUserData();
  }
}
export function saveUserData(uid: string, data: UserData) {
  localStorage.setItem(dataKey(uid), JSON.stringify(data));
}
