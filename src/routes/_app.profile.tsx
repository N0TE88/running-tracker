import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { formatPace, runsStore, useRunsStore } from "@/lib/runs-store";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile — Phantom" }] }),
});

function ProfilePage() {
  const { runs, user, streak } = useRunsStore();
  const [name, setName] = useState(user ?? "");
  const totalDist = runs.reduce((s, r) => s + r.distance, 0);
  const totalTime = runs.reduce((s, r) => s + r.time, 0);
  const avgPace = totalDist ? totalTime / totalDist : 0;

  return (
    <>
      <PageHeader eyebrow="Athlete Profile" title="PROFILE" />

      <div className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-card p-8">
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-gradient-accent opacity-15 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="grid size-24 place-items-center rounded-full bg-gradient-accent text-4xl shadow-glow">
            🏃
          </div>
          <div className="flex-1">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Signed in as
            </p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">
              {user ?? "Anonymous Runner"}
            </h2>
            <p className="text-sm text-muted-foreground">Dedicated Runner · {streak}-week streak</p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Update display name"
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2 font-mono text-sm outline-none focus:border-[#FF5CBA]"
            />
            <button
              onClick={() => name.trim() && runsStore.setUser(name.trim())}
              className="rounded-full bg-gradient-accent px-5 py-2 text-xs font-extrabold tracking-widest text-foreground shadow-glow"
            >
              SAVE
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <BigStat label="Total Runs" value={String(runs.length)} />
        <BigStat label="Total Distance" value={totalDist.toFixed(1)} suffix="KM" accent />
        <BigStat label="Average Pace" value={formatPace(avgPace)} suffix="/KM" />
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
