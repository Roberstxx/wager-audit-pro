import { createFileRoute, Link } from "@tanstack/react-router";
import { useData } from "@/lib/data-context";
import { buildBalanceSeries, computeMetrics, currencySymbols, fmt, fmtPct } from "@/lib/bet-utils";
import { StatCard } from "@/components/stat-card";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  Percent,
  Activity,
  AlertTriangle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useMemo } from "react";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data } = useData();
  const money = (value: number) => fmt(value, data.currency);
  const m = useMemo(() => computeMetrics(data.bets, data.transactions), [data]);
  const series = useMemo(() => buildBalanceSeries(data.bets, data.transactions), [data]);

  const alerts: { level: "warning" | "loss"; text: string }[] = [];
  if (m.drawdownPct > 20)
    alerts.push({
      level: "warning",
      text: `Atención: has perdido ${fmtPct(m.drawdownPct)} desde tu mejor punto.`,
    });
  if (m.losingStreak >= 5)
    alerts.push({
      level: "loss",
      text: `Llevas ${m.losingStreak} apuestas perdidas seguidas. Considera detenerte y revisar tu estrategia.`,
    });

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Resumen financiero de tu actividad de apuestas.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/transactions"
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm hover:border-primary/40"
          >
            Nuevo movimiento
          </Link>
          <Link
            to="/bets"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Registrar apuesta
          </Link>
        </div>
      </header>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${a.level === "warning" ? "border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 text-[color:var(--warning)]" : "border-[color:var(--loss)]/40 bg-[color:var(--loss)]/10 text-[color:var(--loss)]"}`}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{a.text}</p>
            </div>
          ))}
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label="Saldo actual"
          value={money(m.currentBalance)}
          icon={<Wallet className="h-4 w-4" />}
          tone={m.currentBalance >= 0 ? "info" : "loss"}
        />
        <StatCard
          label="Ganancia neta"
          value={money(m.netProfit)}
          icon={
            m.netProfit >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )
          }
          tone={m.netProfit >= 0 ? "profit" : "loss"}
        />
        <StatCard
          label="ROI"
          value={fmtPct(m.roi)}
          hint={`Stake total: ${money(m.totalStaked)}`}
          icon={<Percent className="h-4 w-4" />}
          tone={m.roi >= 0 ? "profit" : "loss"}
        />
        <StatCard
          label="Win rate"
          value={fmtPct(m.winRate)}
          hint={`${m.wonCount}G · ${m.lostCount}P`}
          icon={<Target className="h-4 w-4" />}
        />
        <StatCard
          label="Depositado"
          value={money(m.totalDeposited)}
          hint={`Capital inicial: ${money(m.initialCapital)}`}
          icon={<ArrowDownToLine className="h-4 w-4" />}
        />
        <StatCard
          label="Retirado"
          value={money(m.totalWithdrawn)}
          icon={<ArrowUpFromLine className="h-4 w-4" />}
        />
        <StatCard
          label="Apuestas ganadas"
          value={m.wonCount}
          hint={`${m.pendingCount} pendientes`}
          icon={<Trophy className="h-4 w-4" />}
          tone="profit"
        />
        <StatCard
          label="Apuestas perdidas"
          value={m.lostCount}
          icon={<Activity className="h-4 w-4" />}
          tone="loss"
        />
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Evolución del balance</h2>
            <p className="text-xs text-muted-foreground">
              Histórico acumulado de depósitos, retiros y resultados.
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>
              Máximo histórico:{" "}
              <span className="font-medium text-foreground">{money(m.maxBalance)}</span>
            </p>
            <p>
              Drawdown actual:{" "}
              <span className="font-medium text-[color:var(--loss)]">
                {money(m.drawdown)} ({fmtPct(m.drawdownPct)})
              </span>
            </p>
          </div>
        </div>
        <div className="h-72 w-full">
          {series.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Aún no hay datos. Registra un depósito o una apuesta para comenzar.
            </div>
          ) : (
            <ResponsiveContainer>
              <AreaChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="bal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.18 155)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.7 0.18 155)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "oklch(0.68 0.02 260)" }}
                  tickFormatter={(v) => String(v).slice(5)}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.68 0.02 260)" }}
                  tickFormatter={(v) => `${currencySymbols[data.currency]}${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.21 0.018 260)",
                    border: "1px solid oklch(0.28 0.02 260)",
                    borderRadius: 8,
                    color: "oklch(0.97 0.005 260)",
                  }}
                  formatter={(v: number) => money(v)}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="oklch(0.74 0.19 152)"
                  fill="url(#bal)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}
