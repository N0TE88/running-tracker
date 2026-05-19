import { createFileRoute } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useRunsStore } from "@/lib/runs-store";

export const Route = createFileRoute("/_app/streak")({
  component: StreakPage,
  head: () => ({ meta: [{ title: "Streak — Phantom" }] }),
});

function StreakPage() {
  const { streak, goal } = useRunsStore();

  return (
    <>
      <PageHeader eyebrow="Consistency Tracker" title="STREAK" />

      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,color-mix(in_oklab,#FF5CBA_25%,transparent),transparent_60%)]" />
        <div className="relative">
          <div className="mx-auto mb-6 grid size-24 place-items-center rounded-full bg-gradient-accent shadow-glow">
            <Flame className="size-12" />
          </div>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {goal ? "Weeks meeting your goal" : "Set a goal to track your streak"}
          </p>
          <p className="mt-2 font-display text-9xl font-black italic tracking-tighter text-gradient-accent">
            {streak}
          </p>
          <p className="font-display text-xl font-bold uppercase tracking-widest">
            {streak === 1 ? "Week" : "Weeks"}
          </p>
          {goal ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Hit <span className="text-foreground">{goal} km</span> this week to keep the fire going.
            </p>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Visit <span className="text-foreground">Goals</span> to set a weekly target.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
