import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/lib/data-context";
import { fmt } from "@/lib/bet-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  const { data, addTransaction, deleteTransaction } = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "deposit" as "deposit" | "withdrawal", amount: "", date: new Date().toISOString().slice(0, 10), note: "" });

  const totalDep = data.transactions.filter((t) => t.type === "deposit").reduce((s, t) => s + t.amount, 0);
  const totalWit = data.transactions.filter((t) => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return toast.error("Monto inválido");
    addTransaction({ type: form.type, amount: amt, date: form.date, note: form.note || undefined });
    toast.success("Movimiento registrado");
    setOpen(false);
    setForm({ ...form, amount: "", note: "" });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Depósitos y retiros</h1>
          <p className="text-sm text-muted-foreground">Lleva el control del dinero que entra y sale de tu bankroll.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Nuevo movimiento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar movimiento</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "deposit" | "withdrawal" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Depósito</SelectItem>
                    <SelectItem value="withdrawal">Retiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Monto</Label>
                  <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="100.00" />
                </div>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nota (opcional)</Label>
                <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Casa de apuestas, método..." />
              </div>
              <DialogFooter><Button type="submit" className="w-full">Guardar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-[color:var(--profit)]"><ArrowDownToLine className="h-4 w-4" /><span className="text-xs uppercase tracking-wider">Depositado</span></div>
          <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{fmt(totalDep)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-[color:var(--info)]"><ArrowUpFromLine className="h-4 w-4" /><span className="text-xs uppercase tracking-wider">Retirado</span></div>
          <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{fmt(totalWit)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Nota</th>
              <th className="px-4 py-3 text-right">Monto</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {data.transactions.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No hay movimientos registrados.</td></tr>
            )}
            {[...data.transactions].sort((a, b) => b.date.localeCompare(a.date)).map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-4 py-3">{t.date}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-md px-2 py-0.5 text-xs ${t.type === "deposit" ? "bg-[color:var(--profit)]/15 text-[color:var(--profit)]" : "bg-[color:var(--info)]/15 text-[color:var(--info)]"}`}>
                    {t.type === "deposit" ? "Depósito" : "Retiro"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{t.note || "—"}</td>
                <td className={`px-4 py-3 text-right font-medium tabular-nums ${t.type === "deposit" ? "text-[color:var(--profit)]" : "text-[color:var(--info)]"}`}>
                  {t.type === "deposit" ? "+" : "−"}{fmt(t.amount)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => deleteTransaction(t.id)} className="text-muted-foreground hover:text-[color:var(--loss)]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
