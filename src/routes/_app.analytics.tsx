import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/lib/data-context";
import { computeMetrics, fmt, fmtPct, monthlyResults, statsByType } from "@/lib/bet-utils";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/_app/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data } = useData();
  const money = (value: number) => fmt(value, data.currency);
  const m = useMemo(() => computeMetrics(data.bets, data.transactions), [data]);
  const monthly = useMemo(() => monthlyResults(data.bets), [data]);
  const simple = useMemo(() => statsByType(data.bets, "simple"), [data]);
  const parlay = useMemo(() => statsByType(data.bets, "parlay"), [data]);

  const distribution = [
    { name: "Ganadas", value: m.wonCount, color: "oklch(0.74 0.19 152)" },
    { name: "Perdidas", value: m.lostCount, color: "oklch(0.65 0.24 22)" },
    { name: "Pendientes", value: m.pendingCount, color: "oklch(0.68 0.02 260)" },
  ].filter((x) => x.value > 0);

  const typeCompare = [
    { name: "Picks simples", ganancia: simple.profit, perdida: simple.loss },
    { name: "Parlays", ganancia: parlay.profit, perdida: parlay.loss },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Análisis avanzado</h1>
        <p className="text-sm text-muted-foreground">
          Estadísticas, drawdown y comparativas para entender tu rentabilidad real.
        </p>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Saldo máximo histórico
          </p>
          <p className="mt-2 font-display text-2xl font-semibold tabular-nums">
            {money(m.maxBalance)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Saldo actual</p>
          <p className="mt-2 font-display text-2xl font-semibold tabular-nums">
            {money(m.currentBalance)}
          </p>
        </div>
        <div className="rounded-xl border border-[color:var(--loss)]/30 bg-[color:var(--loss)]/5 p-5">
          <p className="text-xs uppercase tracking-wider text-[color:var(--loss)]">Drawdown</p>
          <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-[color:var(--loss)]">
            {money(m.drawdown)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {m.drawdown > 0
              ? `Has devuelto ${money(m.drawdown)} (${fmtPct(m.drawdownPct)}) desde tu punto más alto.`
              : "Estás en o por encima de tu máximo histórico."}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Resultados por mes</h2>
          <div className="h-72">
            {monthly.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sin datos suficientes.
              </div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "oklch(0.68 0.02 260)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "oklch(0.68 0.02 260)" }} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.21 0.018 260)",
                      border: "1px solid oklch(0.28 0.02 260)",
                      borderRadius: 8,
                    }}
                    formatter={(v: number) => money(v)}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="profit"
                    name="Ganancia"
                    fill="oklch(0.74 0.19 152)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="loss"
                    name="Pérdida"
                    fill="oklch(0.65 0.24 22)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Picks simples vs parlays</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={typeCompare}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "oklch(0.68 0.02 260)" }} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.68 0.02 260)" }} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.21 0.018 260)",
                    border: "1px solid oklch(0.28 0.02 260)",
                    borderRadius: 8,
                  }}
                  formatter={(v: number) => money(v)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="ganancia" fill="oklch(0.74 0.19 152)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="perdida" fill="oklch(0.65 0.24 22)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Distribución de resultados</h2>
          <div className="h-72">
            {distribution.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sin datos.
              </div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={distribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {distribution.map((d, i) => (
                      <Cell key={i} fill={d.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.21 0.018 260)",
                      border: "1px solid oklch(0.28 0.02 260)",
                      borderRadius: 8,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Comparativa por tipo</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Picks simples", s: simple },
              { label: "Parlays", s: parlay },
            ].map(({ label, s }) => (
              <div key={label} className="rounded-xl border border-border bg-background/40 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-2 font-display text-xl font-semibold tabular-nums">
                  {s.total} apuestas
                </p>
                <dl className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Ganancia</dt>
                    <dd className="text-[color:var(--profit)] tabular-nums">{money(s.profit)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Pérdida</dt>
                    <dd className="text-[color:var(--loss)] tabular-nums">{money(s.loss)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Neto</dt>
                    <dd
                      className={`tabular-nums ${s.net >= 0 ? "text-[color:var(--profit)]" : "text-[color:var(--loss)]"}`}
                    >
                      {money(s.net)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Win rate</dt>
                    <dd className="tabular-nums">{fmtPct(s.winRate)}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Esta herramienta es solo para análisis financiero personal. No emite recomendaciones ni
        predicciones deportivas.
      </p>
    </div>
  );
}
