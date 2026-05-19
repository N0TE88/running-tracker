import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { useRunsStore } from "@/lib/runs-store";

export const Route = createFileRoute("/_app/charts")({
  component: ChartsPage,
  head: () => ({ meta: [{ title: "Charts — Phantom" }] }),
});

function ChartsPage() {
  const { runs } = useRunsStore();
  const data = runs.map((r) => ({ date: r.date.slice(5), distance: r.distance, pace: r.pace }));

  return (
    <>
      <PageHeader eyebrow="Performance Trend" title="CHARTS" />

      {runs.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-8">
          <ChartCard title="Distance Over Time" subtitle="Kilometers per run">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF5CBA" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#2B00FF" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#71717A" fontSize={11} />
                <YAxis stroke="#71717A" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#17151c",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="distance"
                  stroke="#FF5CBA"
                  strokeWidth={2.5}
                  fill="url(#distGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Pace Progression" subtitle="Min / km — lower is faster">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#71717A" fontSize={11} />
                <YAxis stroke="#71717A" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#17151c",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="pace"
                  stroke="#2B00FF"
                  strokeWidth={2.5}
                  dot={{ fill: "#FF5CBA", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h3 className="font-display text-xl font-extrabold tracking-tight">{title}</h3>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Empty() {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Log runs to see charts
      </p>
    </div>
  );
}
