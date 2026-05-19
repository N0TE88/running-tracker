import { createFileRoute } from "@tanstack/react-router";
import { Target } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { runsStore, useRunsStore } from "@/lib/runs-store";

export const Route = createFileRoute("/_app/goals")({
  component: GoalsPage,
  head: () => ({ meta: [{ title: "Goals — Phantom" }] }),
});

function GoalsPage() {
  const { runs, goal } = useRunsStore();
  const [input, setInput] = useState("");
  const total = runs.reduce((s, r) => s + r.distance, 0);
  const pct = goal ? Math.min(100, (total / goal) * 100) : 0;

  return (
    <>
      <PageHeader eyebrow="Training Targets" title="GOALS" />

      <div className="ring-gradient mb-8 rounded-2xl bg-card p-6">
        <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Set Weekly Distance Goal
        </p>
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="number"
            placeholder="km per week"
            className="flex-1 rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm outline-none focus:border-[#FF5CBA]"
          />
          <button
            onClick={() => {
              const v = Number(input);
              if (v > 0) {
                runsStore.setGoal(v);
                setInput("");
              }
            }}
            className="rounded-full bg-gradient-accent px-6 py-3 text-sm font-extrabold tracking-widest text-foreground shadow-glow"
          >
            SET GOAL
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-accent/20">
              <Target className="size-5 text-[#FF5CBA]" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Current Goal
              </p>
              <p className="font-display text-2xl font-extrabold tracking-tight">
                {goal ? `${goal} km` : "Not set"}
              </p>
            </div>
          </div>
          <span className="text-gradient-accent font-display text-5xl font-black italic">
            {Math.round(pct)}%
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-accent transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between font-mono text-xs text-muted-foreground">
          <span>{total.toFixed(1)} km done</span>
          <span>{goal ? `${goal} km target` : "—"}</span>
        </div>
      </div>
    </>
  );
}
