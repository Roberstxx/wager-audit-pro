export type BetType = "simple" | "parlay";
export type BetStatus = "won" | "lost" | "pending";

export interface Bet {
  id: string;
  date: string; // ISO
  event: string;
  type: BetType;
  stake: number;
  odds: number;
  status: BetStatus;
  createdAt: string;
}

export type TransactionType = "deposit" | "withdrawal";
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  note?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // local-only (not secure, demo)
  createdAt: string;
}

export interface UserData {
  bets: Bet[];
  transactions: Transaction[];
}
