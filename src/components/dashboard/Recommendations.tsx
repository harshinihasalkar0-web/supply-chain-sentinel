import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

// ✅ simple backend-compatible type
type Supplier = any;

export function Recommendations({ suppliers }: { suppliers: Supplier[] }) {

  // 🔥 Sort by risk_score (backend field)
  const top = [...suppliers]
    .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
    .slice(0, 5);

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Recommendations</h3>
      </div>

      <div className="space-y-3">

        {top.length === 0 ? (
          <p className="text-sm text-gray-500">No data available</p>
        ) : (
          top.map((s: any) => (
            <div
              key={s.name}
              className="border rounded-lg p-3"
            >
              {/* Supplier Info */}
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold">
                  {s.name}
                  <span className="text-xs text-gray-500 ml-2">
                    {s.city} · {s.tier || "N/A"}
                  </span>
                </p>

                <span className="text-xs font-mono text-gray-500">
                  {s.risk_score || 0}/100
                </span>
              </div>

              {/* Recommendation Logic */}
              <p className="mt-2 text-xs text-gray-600">
                {s.risk_level === "High"
                  ? "⚠ High risk — consider alternative suppliers"
                  : s.risk_level === "Medium"
                  ? "⚠ Moderate risk — monitor closely"
                  : "✅ Low risk — stable supplier"}
              </p>
            </div>
          ))
        )}

      </div>
    </Card>
  );
}