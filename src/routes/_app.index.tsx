import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { RunDetailsModal } from "@/components/RunDetailsModal";
import {
  athleteMessage,
  formatPace,
  getWeekRuns,
  useRunsStore,
  type Run,
} from "@/lib/runs-store";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
  head: () => ({ meta: [{ title: "Dashboard — Phantom" }] }),
});

function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return <div className="h-8 w-24" />;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => `${(i / Math.max(values.length - 1, 1)) * 96},${32 - ((v - min) / range) * 28 - 2}`)
    .join(" ");
  return (
    <svg viewBox="0 0 96 32" className="h-8 w-24" fill="none">
      <defs>
        <linearGradient id="spark" x1="0" x2="1">
          <stop offset="0" stopColor="#FF5CBA" />
          <stop offset="1" stopColor="#2B00FF" />
        </linearGradient>
      </defs>
      <polyline
        points={pts}
        stroke="url(#spark)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomePage() {
  const { runs, goal, streak, user } = useRunsStore();
  const [selected, setSelected] = useState<Run | null>(null);

  const week = getWeekRuns(runs);
  const weekDist = week.reduce((s, r) => s + r.distance, 0);
  const weekTime = week.reduce((s, r) => s + r.time, 0);
  const avgPace = weekDist ? weekTime / weekDist : 0;
  const totalDist = runs.reduce((s, r) => s + r.distance, 0);
  const goalPct = goal ? Math.min(100, (totalDist / goal) * 100) : 0;
  const recent = runs.slice(-5).reverse();
  const distSpark = runs.slice(-12).map((r) => r.distance);

  return (
    <>
      <PageHeader eyebrow={`Welcome back${user ? `, ${user}` : ""}`} title="DASHBOARD">
        <Link
          to="/map"
          className="group flex items-center gap-2 rounded-full bg-gradient-accent px-6 py-3 text-sm font-extrabold tracking-widest text-foreground shadow-glow transition-transform hover:scale-[1.02] active:scale-95"
        >
          <Play className="size-4 fill-current" />
          START SESSION
        </Link>
      </PageHeader>

      {/* Stats grid */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="ring-gradient col-span-1 flex aspect-[2/1] flex-col justify-between rounded-2xl bg-card p-6 md:col-span-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Weekly Distance · {athleteMessage(weekDist)}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-7xl font-black italic tracking-tighter">
              {weekDist.toFixed(1)}
            </span>
            <span className="text-gradient-accent text-xl font-bold">KM</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-accent transition-all duration-1000"
              style={{ width: `${Math.min(100, (weekDist / Math.max(goal || 50, 1)) * 100)}%` }}
            />
          </div>
        </div>

        <StatCard
          label="Avg Pace"
          value={formatPace(avgPace)}
          suffix="/KM"
          hint={week.length ? `${week.length} run${week.length > 1 ? "s" : ""} this week` : "No runs yet"}
        />
        <StatCard
          label="Streak"
          value={String(streak)}
          suffix="WEEKS"
          hint={goal ? `${Math.round(goalPct)}% of goal` : "Set a goal"}
          accent
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent activities */}
        <div className="space-y-6 lg:col-span-2">
          <h2 className="font-display text-xl font-extrabold tracking-tight">RECENT ACTIVITIES</h2>
          {recent.length === 0 ? (
            <EmptyCard message="No runs yet. Start your first session." />
          ) : (
            <div className="space-y-3">
              {recent.map((r, idx) => (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="group flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-white/10 hover:bg-surface-2"
                >
                  <div className="flex items-center gap-4">
                    <div className="grid size-12 place-items-center rounded-lg border border-border bg-background">
                      <span
                        className={`font-display font-black tracking-tighter ${
                          idx === 0 ? "text-gradient-accent" : "text-muted-foreground"
                        }`}
                      >
                        {String(recent.length - idx).padStart(2, "0")}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold">{r.distance} km run</h3>
                      <p className="font-mono text-xs text-muted-foreground">
                        {r.date.toUpperCase()} {r.route ? "// GPS" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 text-right">
                    <Cell label="Time">{r.time} min</Cell>
                    <Cell label="Pace">{formatPace(r.pace)}</Cell>
                    <Sparkline values={recent.map((x) => x.distance).reverse()} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <h2 className="font-display text-xl font-extrabold tracking-tight">PERFORMANCE</h2>
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-card p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,color-mix(in_oklab,#2B00FF_30%,transparent),transparent_60%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Total Distance
                </p>
                <p className="mt-2 font-display text-5xl font-black italic">
                  {totalDist.toFixed(1)}
                  <span className="ml-1 font-sans text-sm font-medium not-italic text-muted-foreground">
                    KM
                  </span>
                </p>
              </div>
              <Sparkline values={distSpark.length ? distSpark : [0]} />
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Total Runs
                </p>
                <p className="font-display text-3xl font-black italic">{runs.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Goal Progress
              </p>
              <span className="text-gradient-accent font-mono text-xs">{Math.round(goalPct)}%</span>
            </div>
            <p className="mb-4 font-display font-bold italic leading-tight">
              {goal ? `Reach ${goal} km` : "No goal set"}
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-accent"
                style={{ width: `${goalPct}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>{totalDist.toFixed(1)} km</span>
              <span>{goal || 0} km</span>
            </div>
          </div>
        </div>
      </div>

      {selected && <RunDetailsModal run={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function StatCard({
  label,
  value,
  suffix,
  hint,
  accent,
}: {
  label: string;
  value: string;
  suffix?: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6">
      <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <p
        className={`font-display text-4xl font-black italic ${accent ? "text-gradient-accent" : ""}`}
      >
        {value}
        {suffix && (
          <span className="ml-1 font-sans text-sm font-medium not-italic text-muted-foreground">
            {suffix}
          </span>
        )}
      </p>
      {hint && <span className="font-mono text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="font-mono">{children}</p>
    </div>
  );
}

function EmptyCard({ message }: { message: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{message}</p>
    </div>
  );
}
