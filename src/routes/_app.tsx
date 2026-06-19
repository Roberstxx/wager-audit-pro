import { createFileRoute, Outlet, Link, useRouter, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { LayoutDashboard, ListChecks, Wallet, BarChart3, LogOut, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/bets", label: "Apuestas", icon: ListChecks },
  { to: "/transactions", label: "Depósitos / Retiros", icon: Wallet },
  { to: "/analytics", label: "Análisis", icon: BarChart3 },
] as const;

function AppLayout() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) router.navigate({ to: "/auth" });
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-border bg-card/40 backdrop-blur md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold leading-none">Bet Tracker</p>
            <p className="text-xs text-muted-foreground">Auditoría personal</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <div className="mb-2 rounded-lg bg-muted/40 p-3 text-sm">
            <p className="font-medium">{user.username}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={() => { logout(); router.navigate({ to: "/auth" }); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="font-display font-semibold">Bet Tracker</span>
        </div>
        <button onClick={() => { logout(); router.navigate({ to: "/auth" }); }} className="text-sm text-muted-foreground">
          Salir
        </button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-border bg-card/80 backdrop-blur md:hidden">
        {nav.map((item) => {
          const active = location.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} className={cn("flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]", active ? "text-primary" : "text-muted-foreground")}>
              <Icon className="h-5 w-5" />
              {item.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>

      <main className="md:pl-64">
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 md:px-8 md:pt-10 md:pb-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
