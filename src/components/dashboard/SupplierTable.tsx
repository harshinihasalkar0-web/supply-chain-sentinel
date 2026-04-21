import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudRain, Sun, Zap } from "lucide-react";
import type { AnalyzedSupplier } from "@/lib/risk-engine";

const weatherIcon = (c: string) => {
  if (c === "Storm") return <Zap className="h-4 w-4 text-warning" />;
  if (c === "Rain") return <CloudRain className="h-4 w-4 text-accent" />;
  if (c === "Cloudy") return <Cloud className="h-4 w-4 text-muted-foreground" />;
  return <Sun className="h-4 w-4 text-warning" />;
};

const levelClass = (lvl: string) =>
  lvl === "High"
    ? "bg-destructive/15 text-destructive border-destructive/40"
    : lvl === "Medium"
    ? "bg-warning/15 text-warning border-warning/40"
    : "bg-success/15 text-success border-success/40";

export function SupplierTable({ suppliers }: { suppliers: AnalyzedSupplier[] }) {
  const sorted = [...suppliers].sort((a, b) => b.riskScore - a.riskScore);
  return (
    <Card className="gradient-card overflow-hidden border-border/60 shadow-card">
      <div className="border-b border-border/60 p-5">
        <h3 className="text-lg font-semibold">Supplier Risk Register</h3>
        <p className="text-xs text-muted-foreground">Sorted by risk score · {suppliers.length} suppliers</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left">Supplier</th>
              <th className="px-5 py-3 text-left">City / Country</th>
              <th className="px-5 py-3 text-left">Category</th>
              <th className="px-5 py-3 text-left">Weather</th>
              <th className="px-5 py-3 text-left">Risk</th>
              <th className="px-5 py-3 text-left">Level</th>
              <th className="px-5 py-3 text-left">Prediction</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.name} className="border-t border-border/40 transition hover:bg-secondary/30">
                <td className="px-5 py-3 font-medium">{s.name}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {s.city} <span className="text-xs">· {s.country}</span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{s.category}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-2">
                    {weatherIcon(s.weather.condition)}
                    <span className="text-xs">{s.weather.condition} · {s.weather.temp}°</span>
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full ${s.riskLevel === "High" ? "gradient-danger" : s.riskLevel === "Medium" ? "gradient-warning" : "gradient-primary"}`}
                        style={{ width: `${s.riskScore}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs">{s.riskScore}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Badge variant="outline" className={levelClass(s.riskLevel)}>{s.riskLevel}</Badge>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">
                  {s.prediction.label}
                  <span className="ml-1 text-[10px] opacity-60">({Math.round(s.prediction.confidence * 100)}%)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
