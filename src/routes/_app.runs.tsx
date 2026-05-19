import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { RunDetailsModal } from "@/components/RunDetailsModal";
import { calories, formatPace, runsStore, useRunsStore, type Run } from "@/lib/runs-store";

export const Route = createFileRoute("/_app/runs")({
  component: RunsPage,
  head: () => ({ meta: [{ title: "Runs — Phantom" }] }),
});

function RunsPage() {
  const { runs } = useRunsStore();
  const [distance, setDistance] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selected, setSelected] = useState<Run | null>(null);

  function add() {
    const d = Number(distance);
    const t = Number(time);
    if (!d || !t || !date) return;
    runsStore.addRun({ distance: d, time: t, date });
    setDistance("");
    setTime("");
  }

  return (
    <>
      <PageHeader eyebrow="Run History" title="ALL RUNS" />

      <div className="ring-gradient mb-8 rounded-2xl bg-card p-6">
        <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Log a run manually
        </p>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <input
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            type="number"
            step="0.1"
            placeholder="Distance (km)"
            className="rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm outline-none focus:border-[#FF5CBA]"
          />
          <input
            value={time}
            onChange={(e) => setTime(e.target.value)}
            type="number"
            placeholder="Time (min)"
            className="rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm outline-none focus:border-[#FF5CBA]"
          />
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            className="rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm outline-none focus:border-[#FF5CBA]"
          />
          <button
            onClick={add}
            className="flex items-center justify-center gap-2 rounded-full bg-gradient-accent px-6 py-3 text-sm font-extrabold tracking-widest text-foreground shadow-glow transition-transform hover:scale-[1.02] active:scale-95"
          >
            <Plus className="size-4" />
            ADD RUN
          </button>
        </div>
      </div>

      {runs.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            No runs logged yet
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {runs
            .slice()
            .reverse()
            .map((r) => (
              <div
                key={r.id}
                className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-white/10"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-3xl font-black italic tracking-tighter">
                      {r.distance}
                      <span className="ml-1 font-sans text-sm font-bold not-italic text-muted-foreground">
                        KM
                      </span>
                    </h2>
                    <p className="font-mono text-xs text-muted-foreground">{r.date}</p>
                  </div>
                  <span className="rounded-full bg-gradient-accent/15 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#FF5CBA]">
                    {formatPace(r.pace)} /km
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-3 gap-2 border-y border-border py-3">
                  <CellM label="Time" value={`${r.time}m`} />
                  <CellM label="Cals" value={String(calories(r.distance))} />
                  <CellM label="GPS" value={r.route ? "Yes" : "—"} />
                </div>

                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => setSelected(r)}
                    className="flex-1 rounded-full border border-border py-2 text-xs font-bold tracking-widest text-foreground transition-colors hover:bg-white/5"
                  >
                    DETAILS
                  </button>
                  <button
                    onClick={() => runsStore.deleteRun(r.id)}
                    className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {selected && <RunDetailsModal run={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function CellM({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-sm">{value}</p>
    </div>
  );
}
