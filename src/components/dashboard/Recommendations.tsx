import { Card } from "@/components/ui/card";
import { Lightbulb, Sparkles } from "lucide-react";
import type { AnalyzedSupplier } from "@/lib/risk-engine";

export function Recommendations({ suppliers }: { suppliers: AnalyzedSupplier[] }) {
  const top = [...suppliers].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
  return (
    <Card className="gradient-card border-border/60 p-5 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Recommendations</h3>
      </div>
      <div className="space-y-3">
        {top.map((s) => (
          <div key={s.name} className="rounded-xl border border-border/50 bg-background/40 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                {s.name} <span className="text-xs text-muted-foreground">· {s.city} · {s.tier}</span>
              </p>
              <span className="font-mono text-xs text-muted-foreground">{s.riskScore}/100</span>
            </div>
            <p className="mt-1 text-xs italic text-muted-foreground">{s.riskReason}</p>
            <p className="mt-1 text-xs text-foreground/90">{s.recommendation}</p>
            {s.alternativeSupplier && (
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-primary">
                <Sparkles className="h-3 w-3" /> Alternative: {s.alternativeSupplier}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
