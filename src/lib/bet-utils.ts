import type { Bet, Transaction } from "./types";

export const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n || 0);

export const fmtPct = (n: number) => `${(n || 0).toFixed(2)}%`;

export function betProfit(b: Bet): number {
  if (b.status === "won") return b.stake * b.odds - b.stake;
  if (b.status === "lost") return -b.stake;
  return 0;
}

export interface Metrics {
  totalDeposited: number;
  totalWithdrawn: number;
  initialCapital: number;
  totalStaked: number;
  netProfit: number;
  currentBalance: number;
  roi: number;
  wonCount: number;
  lostCount: number;
  pendingCount: number;
  winRate: number;
  maxBalance: number;
  drawdown: number;
  drawdownPct: number;
  losingStreak: number;
}

export function computeMetrics(bets: Bet[], txs: Transaction[]): Metrics {
  const totalDeposited = txs.filter((t) => t.type === "deposit").reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = txs.filter((t) => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0);
  const initialCapital = totalDeposited > 0
    ? txs.filter((t) => t.type === "deposit").sort((a, b) => a.date.localeCompare(b.date))[0].amount
    : 0;

  const settled = bets.filter((b) => b.status !== "pending");
  const totalStaked = settled.reduce((s, b) => s + b.stake, 0);
  const netProfit = settled.reduce((s, b) => s + betProfit(b), 0);
  const currentBalance = totalDeposited - totalWithdrawn + netProfit;
  const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0;
  const wonCount = bets.filter((b) => b.status === "won").length;
  const lostCount = bets.filter((b) => b.status === "lost").length;
  const pendingCount = bets.filter((b) => b.status === "pending").length;
  const settledCount = wonCount + lostCount;
  const winRate = settledCount > 0 ? (wonCount / settledCount) * 100 : 0;

  // Balance evolution -> max balance + drawdown
  const evo = buildBalanceSeries(bets, txs);
  const maxBalance = evo.length ? Math.max(...evo.map((p) => p.balance)) : 0;
  const drawdown = Math.max(0, maxBalance - currentBalance);
  const drawdownPct = maxBalance > 0 ? (drawdown / maxBalance) * 100 : 0;

  // Losing streak (recent consecutive losses on settled bets, ordered by date)
  const recent = [...settled].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (const b of recent) {
    if (b.status === "lost") streak++;
    else break;
  }

  return {
    totalDeposited, totalWithdrawn, initialCapital, totalStaked,
    netProfit, currentBalance, roi, wonCount, lostCount, pendingCount,
    winRate, maxBalance, drawdown, drawdownPct, losingStreak: streak,
  };
}

export interface SeriesPoint { date: string; balance: number; }

export function buildBalanceSeries(bets: Bet[], txs: Transaction[]): SeriesPoint[] {
  type Ev = { date: string; delta: number };
  const events: Ev[] = [];
  for (const t of txs) events.push({ date: t.date, delta: t.type === "deposit" ? t.amount : -t.amount });
  for (const b of bets) if (b.status !== "pending") events.push({ date: b.date, delta: betProfit(b) });
  events.sort((a, b) => a.date.localeCompare(b.date));
  const out: SeriesPoint[] = [];
  let bal = 0;
  for (const e of events) {
    bal += e.delta;
    out.push({ date: e.date, balance: Math.round(bal * 100) / 100 });
  }
  return out;
}

export function monthlyResults(bets: Bet[]): { month: string; profit: number; loss: number; net: number }[] {
  const map = new Map<string, { profit: number; loss: number }>();
  for (const b of bets) {
    if (b.status === "pending") continue;
    const m = b.date.slice(0, 7);
    const cur = map.get(m) ?? { profit: 0, loss: 0 };
    const p = betProfit(b);
    if (p >= 0) cur.profit += p; else cur.loss += -p;
    map.set(m, cur);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, v]) => ({
    month, profit: Math.round(v.profit * 100) / 100, loss: Math.round(v.loss * 100) / 100, net: Math.round((v.profit - v.loss) * 100) / 100,
  }));
}

export function statsByType(bets: Bet[], type: "simple" | "parlay") {
  const list = bets.filter((b) => b.type === type);
  const settled = list.filter((b) => b.status !== "pending");
  const won = list.filter((b) => b.status === "won").length;
  const lost = list.filter((b) => b.status === "lost").length;
  const profit = settled.filter((b) => betProfit(b) > 0).reduce((s, b) => s + betProfit(b), 0);
  const loss = -settled.filter((b) => betProfit(b) < 0).reduce((s, b) => s + betProfit(b), 0);
  const winRate = won + lost > 0 ? (won / (won + lost)) * 100 : 0;
  return { profit, loss, net: profit - loss, winRate, total: list.length, won, lost };
}

export function exportCSV(bets: Bet[]) {
  const headers = ["date", "event", "type", "stake", "odds", "status", "profit"];
  const rows = bets.map((b) => [b.date, `"${b.event.replace(/"/g, '""')}"`, b.type, b.stake, b.odds, b.status, betProfit(b)]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
