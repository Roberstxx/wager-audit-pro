import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/lib/data-context";
import { betProfit, exportCSV, fmt } from "@/lib/bet-utils";
import type { Bet, BetStatus, BetType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/bets")({
  component: BetsPage,
});

type FormState = {
  date: string;
  event: string;
  type: BetType;
  stake: string;
  odds: string;
  status: BetStatus;
};

const empty: FormState = {
  date: new Date().toISOString().slice(0, 10),
  event: "",
  type: "simple",
  stake: "",
  odds: "",
  status: "pending",
};

function BetsPage() {
  const { data, addBet, updateBet, deleteBet } = useData();
  const money = (value: number) => fmt(value, data.currency);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Bet | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [q, setQ] = useState("");
  const [fType, setFType] = useState<"all" | BetType>("all");
  const [fStatus, setFStatus] = useState<"all" | BetStatus>("all");
  const [fFrom, setFFrom] = useState("");
  const [fTo, setFTo] = useState("");

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (b: Bet) => {
    setEditing(b);
    setForm({
      date: b.date,
      event: b.event,
      type: b.type,
      stake: String(b.stake),
      odds: String(b.odds),
      status: b.status,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const stake = parseFloat(form.stake);
    const odds = parseFloat(form.odds);
    if (!form.event.trim()) return toast.error("Describe el evento");
    if (!stake || stake <= 0) return toast.error("Stake inválido");
    if (!odds || odds <= 1) return toast.error("La cuota debe ser mayor a 1");
    const payload = {
      date: form.date,
      event: form.event.trim(),
      type: form.type,
      stake,
      odds,
      status: form.status,
    };
    if (editing) {
      updateBet(editing.id, payload);
      toast.success("Apuesta actualizada");
    } else {
      addBet(payload);
      toast.success("Apuesta registrada");
    }
    setOpen(false);
  };

  const filtered = useMemo(() => {
    return data.bets
      .filter((b) => {
        if (q && !b.event.toLowerCase().includes(q.toLowerCase())) return false;
        if (fType !== "all" && b.type !== fType) return false;
        if (fStatus !== "all" && b.status !== fStatus) return false;
        if (fFrom && b.date < fFrom) return false;
        if (fTo && b.date > fTo) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data.bets, q, fType, fStatus, fFrom, fTo]);

  const downloadCSV = () => {
    const csv = exportCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apuestas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Apuestas</h1>
          <p className="text-sm text-muted-foreground">
            Registra cada apuesta, edita resultados y exporta tu historial.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadCSV}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew}>
                <Plus className="mr-2 h-4 w-4" /> Nueva apuesta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar apuesta" : "Registrar apuesta"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={form.type}
                      onValueChange={(v) => setForm({ ...form, type: v as BetType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Pick simple</SelectItem>
                        <SelectItem value="parlay">Parlay (combinada)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Evento</Label>
                  <Input
                    value={form.event}
                    onChange={(e) => setForm({ ...form, event: e.target.value })}
                    placeholder="Ej: Real Madrid vs Barcelona — Over 2.5"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Stake</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.stake}
                      onChange={(e) => setForm({ ...form, stake: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cuota</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.odds}
                      onChange={(e) => setForm({ ...form, odds: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) => setForm({ ...form, status: v as BetStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="won">Ganada</SelectItem>
                        <SelectItem value="lost">Perdida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {form.stake && form.odds && (
                  <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                    Retorno potencial:{" "}
                    <span className="font-medium text-foreground">
                      {money(parseFloat(form.stake) * parseFloat(form.odds))}
                    </span>
                    {" · "}Ganancia neta si gana:{" "}
                    <span className="font-medium text-[color:var(--profit)]">
                      {money(
                        parseFloat(form.stake) * parseFloat(form.odds) - parseFloat(form.stake),
                      )}
                    </span>
                  </div>
                )}
                <DialogFooter>
                  <Button type="submit" className="w-full">
                    {editing ? "Guardar cambios" : "Registrar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar evento..."
              className="pl-9"
            />
          </div>
        </div>
        <Select value={fType} onValueChange={(v) => setFType(v as typeof fType)}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="simple">Pick simple</SelectItem>
            <SelectItem value="parlay">Parlay</SelectItem>
          </SelectContent>
        </Select>
        <Select value={fStatus} onValueChange={(v) => setFStatus(v as typeof fStatus)}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="won">Ganadas</SelectItem>
            <SelectItem value="lost">Perdidas</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <Input type="date" value={fFrom} onChange={(e) => setFFrom(e.target.value)} />
          <Input type="date" value={fTo} onChange={(e) => setFTo(e.target.value)} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Evento</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-right">Stake</th>
                <th className="px-4 py-3 text-right">Cuota</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">P/L</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    No hay apuestas para mostrar.
                  </td>
                </tr>
              )}
              {filtered.map((b) => {
                const p = betProfit(b);
                return (
                  <tr key={b.id} className="border-t border-border">
                    <td className="px-4 py-3 whitespace-nowrap">{b.date}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{b.event}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs">
                        {b.type === "simple" ? "Simple" : "Parlay"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{money(b.stake)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{b.odds.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs ${b.status === "won" ? "bg-[color:var(--profit)]/15 text-[color:var(--profit)]" : b.status === "lost" ? "bg-[color:var(--loss)]/15 text-[color:var(--loss)]" : "bg-muted text-muted-foreground"}`}
                      >
                        {b.status === "won"
                          ? "Ganada"
                          : b.status === "lost"
                            ? "Perdida"
                            : "Pendiente"}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium tabular-nums ${b.status === "pending" ? "text-muted-foreground" : p >= 0 ? "text-[color:var(--profit)]" : "text-[color:var(--loss)]"}`}
                    >
                      {b.status === "pending" ? "—" : `${p >= 0 ? "+" : ""}${money(p)}`}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(b)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteBet(b.id)}
                          className="text-muted-foreground hover:text-[color:var(--loss)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
