import { Card } from "@/components/ui/card";
import { Activity, AlertTriangle, ShieldCheck, Users } from "lucide-react";
import type { AnalyzedSupplier } from "@/lib/risk-engine";

export function KpiCards({ suppliers }: { suppliers: AnalyzedSupplier[] }) {
  const total = suppliers.length;
  const high = suppliers.filter((s) => s.riskLevel === "High").length;
  const avg = total ? Math.round(suppliers.reduce((a, s) => a + s.riskScore, 0) / total) : 0;
  const stable = suppliers.filter((s) => s.riskLevel === "Low").length;

  const kpis = [
    { label: "Overall Risk", value: avg, suffix: "/100", icon: Activity, accent: "gradient-primary" },
    { label: "Total Suppliers", value: total, suffix: "", icon: Users, accent: "gradient-accent" },
    { label: "High Risk", value: high, suffix: "", icon: AlertTriangle, accent: "gradient-danger" },
    { label: "Stable", value: stable, suffix: "", icon: ShieldCheck, accent: "gradient-warning" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {kpis.map((k) => (
        <Card key={k.label} className="gradient-card group relative overflow-hidden border-border/60 p-5 shadow-card">
          <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl ${k.accent}`} />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{k.label}</p>
              <p className="mt-2 text-4xl font-bold tracking-tight">
                {k.value}
                <span className="text-base font-medium text-muted-foreground">{k.suffix}</span>
              </p>
            </div>
            <div className={`rounded-xl p-2.5 ${k.accent} text-primary-foreground shadow-glow`}>
              <k.icon className="h-5 w-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
