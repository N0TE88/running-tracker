import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { calories, formatPace, useRunsStore } from "@/lib/runs-store";

export const Route = createFileRoute("/_app/stats")({
  component: StatsPage,
  head: () => ({ meta: [{ title: "Stats — Phantom" }] }),
});

function StatsPage() {
  const { runs } = useRunsStore();
  const total = runs.reduce((s, r) => s + r.distance, 0);
  const totalTime = runs.reduce((s, r) => s + r.time, 0);
  const avgPace = total ? totalTime / total : 0;
  const totalCal = runs.reduce((s, r) => s + calories(r.distance), 0);

  return (
    <>
      <PageHeader eyebrow="Lifetime Numbers" title="STATS" />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <BigStat label="Total Distance" value={total.toFixed(1)} suffix="KM" />
        <BigStat label="Total Time" value={`${Math.round(totalTime)}`} suffix="MIN" />
        <BigStat label="Avg Pace" value={formatPace(avgPace)} suffix="/KM" accent />
        <BigStat label="Total Calories" value={String(totalCal)} suffix="KCAL" />
      </div>
    </>
  );
}

function BigStat({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-3 font-display text-5xl font-black italic ${accent ? "text-gradient-accent" : ""}`}
      >
        {value}
        {suffix && (
          <span className="ml-1 font-sans text-sm font-medium not-italic text-muted-foreground">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}
