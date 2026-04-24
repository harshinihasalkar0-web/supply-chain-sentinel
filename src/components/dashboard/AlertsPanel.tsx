import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

// ✅ simple type (backend compatible)
type Supplier = any;

export function AlertsPanel({ suppliers }: { suppliers: Supplier[] }) {

  const alerts: { title: string; body: string }[] = [];

  // 🔴 High risk suppliers
  const highRisk = suppliers.filter(
    (s) => s.risk_level === "High"
  );

  if (highRisk.length) {
    alerts.push({
      title: "High Risk Suppliers ⚠️",
      body: `${highRisk.length} supplier(s) at high risk: ${highRisk
        .slice(0, 4)
        .map((s) => s.name)
        .join(", ")}`,
    });
  }

  // 🟡 Medium risk warning
  const mediumRisk = suppliers.filter(
    (s) => s.risk_level === "Medium"
  );

  if (mediumRisk.length > 3) {
    alerts.push({
      title: "Moderate Risk Detected",
      body: `${mediumRisk.length} suppliers showing moderate risk`,
    });
  }

  // 🌍 Location clustering
  const cityCount: Record<string, number> = {};

  suppliers.forEach((s) => {
    cityCount[s.city] = (cityCount[s.city] || 0) + 1;
  });

  const clusters = Object.entries(cityCount).filter(
    ([_, count]) => count >= 2
  );

  if (clusters.length) {
    alerts.push({
      title: "Geographic Risk",
      body: `Multiple suppliers in same city: ${clusters
        .map(([city, count]) => `${city} (${count})`)
        .join(", ")}`,
    });
  }

  // ✅ Default message
  if (!alerts.length) {
    alerts.push({
      title: "All Systems Normal",
      body: "No major risks detected",
    });
  }

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-lg font-semibold">Live Alerts</h3>

      <div className="space-y-3">
        {alerts.map((a, i) => (
          <div
            key={i}
            className="flex gap-3 border p-3 rounded-lg"
          >
            <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />

            <div>
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="text-xs text-gray-500">{a.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}