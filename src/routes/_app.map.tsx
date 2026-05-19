import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { LiveMap, type LiveMapHandle } from "@/components/LiveMap";
import { formatPace, haversine, runsStore } from "@/lib/runs-store";

export const Route = createFileRoute("/_app/map")({
  component: MapPage,
  head: () => ({ meta: [{ title: "Live GPS — Phantom" }] }),
});

function MapPage() {
  const mapHandle = useRef<LiveMapHandle | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const routeRef = useRef<[number, number][]>([]);
  const distRef = useRef(0);

  const [tracking, setTracking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [distance, setDistance] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const onMapReady = useCallback((h: LiveMapHandle) => {
    mapHandle.current = h;
  }, []);

  function start() {
    if (!navigator.geolocation) {
      toast.error("GPS not supported on this device");
      return;
    }
    routeRef.current = [];
    distRef.current = 0;
    setDistance(0);
    setElapsed(0);
    startRef.current = Date.now();
    mapHandle.current?.reset();

    timerRef.current = window.setInterval(() => {
      if (!paused) setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 250);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (paused) return;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const route = routeRef.current;
        if (route.length > 0) {
          const [pl, pn] = route[route.length - 1];
          distRef.current += haversine(pl, pn, lat, lng);
          setDistance(distRef.current);
        }
        route.push([lat, lng]);
        mapHandle.current?.pushPoint(lat, lng);
      },
      (err) => {
        console.error(err);
        toast.error("GPS error: " + err.message);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    );

    setTracking(true);
    setPaused(false);
    toast.success("Tracking started — go run!");
  }

  function stop() {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    if (timerRef.current !== null) clearInterval(timerRef.current);
    watchIdRef.current = null;
    timerRef.current = null;

    const minutes = (Date.now() - startRef.current) / 1000 / 60;
    const dist = Number(distRef.current.toFixed(2));

    if (routeRef.current.length < 2 || dist < 0.05) {
      toast.error("Run too short to save");
    } else {
      runsStore.addRun({
        distance: dist,
        time: Number(minutes.toFixed(1)),
        date: new Date().toISOString().split("T")[0],
        route: [...routeRef.current],
      });
      toast.success(`Run saved — ${dist} km in ${minutes.toFixed(1)} min`);
    }

    setTracking(false);
    setPaused(false);
    setDistance(0);
    setElapsed(0);
    distRef.current = 0;
    routeRef.current = [];
    mapHandle.current?.reset();
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, []);

  const mins = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const secs = (elapsed % 60).toString().padStart(2, "0");
  const pace = distance > 0 ? elapsed / 60 / distance : 0;
  const cals = Math.round(distance * 62);

  return (
    <>
      <PageHeader eyebrow="Live GPS" title="LIVE TRACKING">
        {tracking ? (
          <div className="flex gap-2">
            <button
              onClick={() => setPaused((p) => !p)}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-extrabold tracking-widest text-foreground transition-colors hover:bg-white/5"
            >
              {paused ? <Play className="size-4 fill-current" /> : <Pause className="size-4" />}
              {paused ? "RESUME" : "PAUSE"}
            </button>
            <button
              onClick={stop}
              className="flex items-center gap-2 rounded-full bg-destructive px-6 py-3 text-sm font-extrabold tracking-widest text-foreground"
            >
              <Square className="size-4 fill-current" />
              STOP & SAVE
            </button>
          </div>
        ) : (
          <button
            onClick={start}
            className="flex items-center gap-2 rounded-full bg-gradient-accent px-6 py-3 text-sm font-extrabold tracking-widest text-foreground shadow-glow transition-transform hover:scale-[1.02] active:scale-95"
          >
            <Play className="size-4 fill-current" />
            START SESSION
          </button>
        )}
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <LiveStat label="Distance" value={distance.toFixed(2)} suffix="KM" />
        <LiveStat label="Pace" value={formatPace(pace)} suffix="/KM" accent />
        <LiveStat label="Time" value={`${mins}:${secs}`} />
        <LiveStat label="Calories" value={String(cals)} suffix="KCAL" />
      </div>

      <LiveMap onReady={onMapReady} height={520} />

      {!tracking && (
        <p className="mt-4 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Allow location access when prompted. Your route is saved to "Runs" when you stop.
        </p>
      )}
    </>
  );
}

function LiveStat({
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
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-4xl font-black italic ${accent ? "text-gradient-accent" : ""}`}
      >
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
