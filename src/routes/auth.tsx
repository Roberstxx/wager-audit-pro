import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { user, login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  useEffect(() => { if (user) router.navigate({ to: "/dashboard" }); }, [user, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Email y contraseña requeridos");
    const res = mode === "login"
      ? login(form.email, form.password)
      : register(form.username || form.email.split("@")[0], form.email, form.password);
    if (!res.ok) return toast.error(res.error || "Error");
    toast.success(mode === "login" ? "Sesión iniciada" : "Cuenta creada");
    router.navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="absolute inset-0 -z-10 opacity-40" style={{ background: "radial-gradient(60% 50% at 30% 20%, oklch(0.7 0.18 155 / 0.25), transparent), radial-gradient(50% 40% at 80% 80%, oklch(0.7 0.16 235 / 0.18), transparent)" }} />
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/70 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold">Bet Tracker</h1>
            <p className="text-xs text-muted-foreground">Control financiero de tus apuestas</p>
          </div>
        </div>

        <div className="mb-6 flex rounded-lg bg-muted p-1 text-sm">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded-md px-3 py-2 transition ${mode === m ? "bg-background text-foreground shadow" : "text-muted-foreground"}`}
            >
              {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="tu_usuario" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tu@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full">{mode === "login" ? "Entrar" : "Registrarme"}</Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Tus datos se guardan localmente en tu navegador. No realizamos predicciones deportivas.
        </p>
      </div>
    </div>
  );
}
