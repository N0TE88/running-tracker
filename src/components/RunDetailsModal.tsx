import { X } from "lucide-react";
import { useEffect } from "react";
import type { Run } from "@/lib/runs-store";
import { calories, formatPace } from "@/lib/runs-store";
import { LiveMap } from "./LiveMap";

export function RunDetailsModal({ run, onClose }: { run: Run; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-8 shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {run.date}
            </p>
            <h2 className="mt-1 font-display text-4xl font-black italic tracking-tighter">
              <span className="text-gradient-accent">{run.distance}</span> KM RUN
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-4">
          <StatCell label="Time" value={`${run.time} min`} />
          <StatCell label="Pace" value={formatPace(run.pace)} suffix="/KM" />
          <StatCell label="Calories" value={String(calories(run.distance))} />
        </div>

        {run.route && run.route.length > 1 ? (
          <LiveMap initialRoute={run.route} height={360} />
        ) : (
          <div className="grid h-40 place-items-center rounded-2xl border border-dashed border-border font-mono text-xs uppercase tracking-widest text-muted-foreground">
            No GPS Route Recorded
          </div>
        )}
      </div>
    </div>
  );
}

function StatCell({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/50 p-4">
      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-black italic">
        {value}
        {suffix && (
          <span className="ml-1 font-sans text-xs font-medium not-italic text-muted-foreground">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}
