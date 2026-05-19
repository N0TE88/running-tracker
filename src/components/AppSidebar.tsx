import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Flame,
  LineChart,
  LogOut,
  Map as MapIcon,
  Target,
  TrendingUp,
  User,
} from "lucide-react";
import { runsStore, useRunsStore } from "@/lib/runs-store";

const navItems = [
  { to: "/", label: "Overview", icon: Activity },
  { to: "/runs", label: "Runs", icon: TrendingUp },
  { to: "/charts", label: "Charts", icon: BarChart3 },
  { to: "/stats", label: "Stats", icon: LineChart },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/streak", label: "Streak", icon: Flame },
  { to: "/map", label: "Live GPS", icon: MapIcon },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { streak, user } = useRunsStore();
  const navigate = useNavigate();

  return (
    <nav className="flex w-64 shrink-0 flex-col gap-6 border-r border-border bg-background/60 p-6 backdrop-blur">
      <Link to="/" className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-full bg-gradient-accent shadow-glow">
          <div className="size-2.5 animate-pulse rounded-full bg-background" />
        </div>
        <span className="font-display text-xl font-extrabold tracking-tighter">PHANTOM</span>
      </Link>

      <div className="flex flex-col gap-0.5">
        <p className="mb-2 px-3 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Menu
        </p>
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-white/5 text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" strokeWidth={1.75} />
              <span>{label}</span>
              {active && <span className="ml-auto size-1.5 rounded-full bg-gradient-accent" />}
            </Link>
          );
        })}
      </div>

      <div className="relative mt-auto overflow-hidden rounded-xl border border-border bg-white/5 p-4">
        <div className="relative z-10">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Streak
          </p>
          <p className="mt-1 font-display text-2xl font-black italic">
            {streak} <span className="text-sm font-bold not-italic text-muted-foreground">WEEKS</span>
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <Flame className="size-3.5 text-[#FF5CBA]" />
            <span className="font-mono text-[10px] text-muted-foreground">Every mile counts</span>
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 size-24 rounded-full bg-gradient-accent opacity-20 blur-2xl" />
      </div>

      {user && (
        <button
          onClick={() => {
            runsStore.setUser(null);
            navigate({ to: "/login" });
          }}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="size-3.5" />
          Sign out ({user})
        </button>
      )}
    </nav>
  );
}
