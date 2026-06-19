import type { User, UserData } from "./types";

const USERS_KEY = "bt:users";
const SESSION_KEY = "bt:session";
const dataKey = (uid: string) => `bt:data:${uid}`;

export const isBrowser = () => typeof window !== "undefined";

export function getUsers(): User[] {
  if (!isBrowser()) return [];
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]"); } catch { return []; }
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
  if (!isBrowser()) return { bets: [], transactions: [] };
  try {
    const raw = localStorage.getItem(dataKey(uid));
    if (!raw) return { bets: [], transactions: [] };
    return JSON.parse(raw);
  } catch { return { bets: [], transactions: [] }; }
}
export function saveUserData(uid: string, data: UserData) {
  localStorage.setItem(dataKey(uid), JSON.stringify(data));
}
