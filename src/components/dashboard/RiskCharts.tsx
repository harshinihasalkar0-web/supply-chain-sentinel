import { Card } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import type { AnalyzedSupplier } from "@/lib/risk-engine";

export function RiskCharts({ suppliers }: { suppliers: AnalyzedSupplier[] }) {
  // Simulated trend (last 8 weeks) anchored on current avg
  const avg = suppliers.length
    ? suppliers.reduce((a, s) => a + s.riskScore, 0) / suppliers.length
    : 0;
  const trend = Array.from({ length: 8 }).map((_, i) => {
    const noise = Math.sin(i * 0.9) * 6 + (i - 3) * 1.4;
    return { week: `W${i + 1}`, risk: Math.max(0, Math.min(100, Math.round(avg + noise))) };
  });

  const totals = suppliers.reduce(
    (acc, s) => {
      acc.weather += s.weatherScore;
      acc.dependency += s.dependencyScore;
      acc.geo += s.geoScore;
      acc.logistics += s.logisticsScore;
      return acc;
    },
    { weather: 0, dependency: 0, geo: 0, logistics: 0 }
  );
  const breakdown = [
    { name: "Dependency", value: totals.dependency, color: "hsl(168 95% 50%)" },
    { name: "Weather", value: totals.weather, color: "hsl(280 90% 65%)" },
    { name: "Geopolitical", value: totals.geo, color: "hsl(0 85% 60%)" },
    { name: "Logistics", value: totals.logistics, color: "hsl(38 95% 55%)" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="gradient-card border-border/60 p-5 shadow-card lg:col-span-3">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Risk Trend</h3>
          <p className="text-xs text-muted-foreground">Aggregate exposure over the last 8 weeks</p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trend}>
            <defs>
              <linearGradient id="riskLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(168 95% 50%)" />
                <stop offset="100%" stopColor="hsl(280 90% 65%)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(226 30% 18%)" />
            <XAxis dataKey="week" stroke="hsl(215 20% 65%)" fontSize={12} />
            <YAxis stroke="hsl(215 20% 65%)" fontSize={12} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                background: "hsl(226 35% 9%)",
                border: "1px solid hsl(226 30% 18%)",
                borderRadius: 12,
              }}
            />
            <Line type="monotone" dataKey="risk" stroke="url(#riskLine)" strokeWidth={3} dot={{ r: 4, fill: "hsl(168 95% 50%)" }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="gradient-card border-border/60 p-5 shadow-card lg:col-span-2">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Risk Breakdown</h3>
          <p className="text-xs text-muted-foreground">Contribution by tier</p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
              {breakdown.map((b) => <Cell key={b.name} fill={b.color} />)}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(226 35% 9%)",
                border: "1px solid hsl(226 30% 18%)",
                borderRadius: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
