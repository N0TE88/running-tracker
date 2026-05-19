import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { runsStore } from "@/lib/runs-store";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Phantom" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [loading, setLoading] = useState(false);

  function login() {
    if (!u.trim() || !p.trim()) return;
    setLoading(true);
    setTimeout(() => {
      runsStore.setUser(u.trim());
      navigate({ to: "/" });
    }, 500);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-32 top-1/4 size-[480px] rounded-full bg-[#2B00FF] opacity-25 blur-[120px]" />
        <div className="absolute -right-32 bottom-1/4 size-[480px] rounded-full bg-[#FF5CBA] opacity-25 blur-[120px]" />
      </div>

      <div className="grid w-full max-w-5xl gap-12 lg:grid-cols-2">
        <div className="flex flex-col justify-center">
          <span className="mb-6 inline-flex w-fit items-center rounded-full border border-border bg-white/5 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            ATHLETE OS · v2
          </span>
          <h1 className="font-display text-6xl font-black italic leading-[0.95] tracking-tighter">
            RUN FURTHER.
            <br />
            <span className="text-gradient-accent">TRAIN SMARTER.</span>
          </h1>
          <p className="mt-6 max-w-md text-muted-foreground">
            A premium training cockpit for runners who care about every kilometer, every split, and
            every streak.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <span className="grid size-7 place-items-center rounded-md bg-gradient-accent/20 text-[#FF5CBA]">
                ⚡
              </span>
              Real-time pace & distance analytics
            </li>
            <li className="flex items-center gap-3">
              <span className="grid size-7 place-items-center rounded-md bg-gradient-accent/20 text-[#FF5CBA]">
                🔥
              </span>
              Streaks, goals & personal records
            </li>
            <li className="flex items-center gap-3">
              <span className="grid size-7 place-items-center rounded-md bg-gradient-accent/20 text-[#FF5CBA]">
                🗺
              </span>
              Live GPS route mapping & replay
            </li>
          </ul>
        </div>

        <div className="ring-gradient relative rounded-3xl bg-card p-8 shadow-glow">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-full bg-gradient-accent">
              <div className="size-2.5 rounded-full bg-background" />
            </div>
            <span className="font-display text-xl font-extrabold tracking-tighter">PHANTOM</span>
          </div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your fitness journey begins here.</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
          >
            <div>
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Username
              </label>
              <input
                value={u}
                onChange={(e) => setU(e.target.value)}
                placeholder="marathonmike"
                className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm outline-none transition-colors focus:border-[#FF5CBA]"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                value={p}
                onChange={(e) => setP(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm outline-none transition-colors focus:border-[#FF5CBA]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-accent py-3 text-sm font-extrabold tracking-widest text-foreground shadow-glow transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-60"
            >
              {loading ? "SIGNING IN..." : "START TRAINING →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
