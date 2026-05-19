import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { calories, formatPace, useRunsStore } from "@/lib/runs-store";

export const Route = createFileRoute("/_app/analytics")({
  component: AnalyticsPage,
  head: () => ({ meta: [{ title: "Analytics — Phantom" }] }),
});

function AnalyticsPage() {
  const { runs } = useRunsStore();
  const bestPace = runs.length ? Math.min(...runs.map((r) => Number(r.pace) || Infinity)) : 0;
  const longest = runs.length ? Math.max(...runs.map((r) => r.distance)) : 0;
  const totalCal = runs.reduce((s, r) => s + calories(r.distance), 0);
  const data = runs.map((r) => ({ date: r.date.slice(5), distance: r.distance }));

  return (
    <>
      <PageHeader eyebrow="Advanced Insights" title="ANALYTICS" />

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Stat label="Fastest Pace" value={bestPace ? formatPace(bestPace) : "—"} suffix="/KM" accent />
        <Stat label="Longest Run" value={longest.toFixed(1)} suffix="KM" />
        <Stat label="Total Calories" value={String(totalCal)} suffix="KCAL" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4">
          <h3 className="font-display text-xl font-extrabold tracking-tight">DISTANCE ANALYTICS</h3>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Run-by-run distance breakdown
          </p>
        </div>
        {runs.length === 0 ? (
          <div className="grid h-72 place-items-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={data}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5CBA" />
                  <stop offset="100%" stopColor="#2B00FF" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#71717A" fontSize={11} />
              <YAxis stroke="#71717A" fontSize={11} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{
                  background: "#17151c",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="distance" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}

function Stat({
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
        className={`mt-3 font-display text-4xl font-black italic ${accent ? "text-gradient-accent" : ""}`}
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
