import { useSyncExternalStore } from "react";

export type Run = {
  id: number;
  distance: number;
  time: number; // minutes
  pace: number; // min/km
  date: string; // YYYY-MM-DD
  route?: [number, number][];
};

type State = {
  runs: Run[];
  goal: number;
  streak: number;
  user: string | null;
};

const isBrowser = typeof window !== "undefined";

function read(): State {
  if (!isBrowser) return { runs: [], goal: 0, streak: 0, user: null };
  try {
    return {
      runs: JSON.parse(localStorage.getItem("runs") ?? "[]"),
      goal: Number(localStorage.getItem("goal") ?? 0),
      streak: Number(localStorage.getItem("streak") ?? 0),
      user: localStorage.getItem("user"),
    };
  } catch {
    return { runs: [], goal: 0, streak: 0, user: null };
  }
}

let state: State = read();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function set(partial: Partial<State>) {
  state = { ...state, ...partial };
  if (isBrowser) {
    if (partial.runs !== undefined) localStorage.setItem("runs", JSON.stringify(state.runs));
    if (partial.goal !== undefined) localStorage.setItem("goal", String(state.goal));
    if (partial.streak !== undefined) localStorage.setItem("streak", String(state.streak));
    if (partial.user !== undefined) {
      if (state.user) localStorage.setItem("user", state.user);
      else localStorage.removeItem("user");
    }
  }
  notify();
}

export const runsStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get() {
    return state;
  },
  getServer(): State {
    return { runs: [], goal: 0, streak: 0, user: null };
  },
  addRun(r: Omit<Run, "id" | "pace"> & { pace?: number }) {
    const pace = r.pace ?? (r.distance > 0 ? Number((r.time / r.distance).toFixed(2)) : 0);
    set({ runs: [...state.runs, { ...r, pace, id: Date.now() }] });
    refreshStreak();
  },
  deleteRun(id: number) {
    set({ runs: state.runs.filter((r) => r.id !== id) });
    refreshStreak();
  },
  setGoal(goal: number) {
    set({ goal });
    refreshStreak();
  },
  setUser(user: string | null) {
    set({ user });
  },
};

function refreshStreak() {
  const { runs, goal } = state;
  if (!goal) {
    set({ streak: 0 });
    return;
  }
  const today = new Date();
  const weekTotal = (end: Date) => {
    const start = new Date(end);
    start.setDate(end.getDate() - 7);
    return runs
      .filter((r) => {
        const d = new Date(r.date);
        return d > start && d <= end;
      })
      .reduce((s, r) => s + r.distance, 0);
  };
  let count = 0;
  for (let i = 0; i < 52; i++) {
    const end = new Date();
    end.setDate(today.getDate() - i * 7);
    if (weekTotal(end) >= goal) count++;
    else break;
  }
  set({ streak: count });
}

export function useRunsStore() {
  return useSyncExternalStore(runsStore.subscribe, runsStore.get, runsStore.getServer);
}

/* ===== Helpers ===== */

export function calories(distance: number) {
  return Math.round(distance * 62);
}

export function getWeekRuns(runs: Run[]) {
  const now = Date.now();
  return runs.filter((r) => (now - new Date(r.date).getTime()) / 86400000 <= 7);
}

export function athleteMessage(km: number) {
  if (km === 0) return "Time to start your week";
  if (km < 10) return "Light week — build momentum";
  if (km < 25) return "Strong consistency";
  return "Elite training week";
}

export function formatPace(pace: number) {
  if (!pace || !isFinite(pace)) return "0:00";
  const m = Math.floor(pace);
  const s = Math.round((pace - m) * 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
