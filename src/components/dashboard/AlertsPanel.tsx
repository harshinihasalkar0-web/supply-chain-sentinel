import { Card } from "@/components/ui/card";
import { AlertTriangle, CloudRain, Network, ShieldAlert } from "lucide-react";
import type { AnalyzedSupplier } from "@/lib/risk-engine";

export function AlertsPanel({ suppliers }: { suppliers: AnalyzedSupplier[] }) {
  const alerts: { icon: any; title: string; body: string; tone: string }[] = [];

  const critical = suppliers.filter((s) => s.dependency === "High" && s.riskLevel === "High");
  if (critical.length) {
    alerts.push({
      icon: ShieldAlert,
      title: "Critical Supplier Risk Detected",
      body: `${critical.length} high-dependency supplier${critical.length > 1 ? "s" : ""} at HIGH risk: ${critical.map((s) => s.name).join(", ")}.`,
      tone: "gradient-danger",
    });
  }

  const stormy = suppliers.filter((s) => s.weather.condition === "Storm" || s.weather.condition === "Rain");
  if (stormy.length) {
    alerts.push({
      icon: CloudRain,
      title: "Weather Disruption in Key Region",
      body: `Adverse weather impacting ${stormy.length} location${stormy.length > 1 ? "s" : ""} – ${[...new Set(stormy.map((s) => s.city))].slice(0, 4).join(", ")}.`,
      tone: "gradient-accent",
    });
  }

  const cityCount = suppliers.reduce<Record<string, number>>((a, s) => ((a[s.city] = (a[s.city] ?? 0) + 1), a), {});
  const clusters = Object.entries(cityCount).filter(([, n]) => n >= 2);
  if (clusters.length) {
    alerts.push({
      icon: Network,
      title: "Supply Chain Vulnerability Identified",
      body: `Geographic concentration risk in ${clusters.map(([c, n]) => `${c} (${n})`).join(", ")}. Consider diversifying.`,
      tone: "gradient-warning",
    });
  }

  if (!alerts.length) {
    alerts.push({
      icon: AlertTriangle,
      title: "All Systems Nominal",
      body: "No critical risks detected across your current supplier network.",
      tone: "gradient-primary",
    });
  }

  return (
    <Card className="gradient-card border-border/60 p-5 shadow-card">
      <h3 className="mb-4 text-lg font-semibold">Live Alerts</h3>
      <div className="space-y-3">
        {alerts.map((a, i) => (
          <div key={i} className="flex gap-3 rounded-xl border border-border/50 bg-background/40 p-3">
            <div className={`h-9 w-9 shrink-0 rounded-lg ${a.tone} flex items-center justify-center text-primary-foreground shadow-glow`}>
              <a.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
