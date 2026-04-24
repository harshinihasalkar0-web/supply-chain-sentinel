import { Card } from "@/components/ui/card";

type Supplier = any;

export function KpiCards({ suppliers }: { suppliers: Supplier[] }) {
  const total = suppliers.length;

  const highRisk = suppliers.filter(
    (s) => s.risk_level === "High"
  ).length;

  const avgRisk =
    suppliers.reduce((sum, s) => sum + (s.risk_score || 0), 0) /
    (suppliers.length || 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      <Card className="p-4">
        <h3 className="text-sm text-gray-500">Total Suppliers</h3>
        <p className="text-2xl font-bold">{total}</p>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm text-gray-500">High Risk</h3>
        <p className="text-2xl font-bold text-red-500">{highRisk}</p>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm text-gray-500">Average Risk</h3>
        <p className="text-2xl font-bold">
          {avgRisk.toFixed(1)}
        </p>
      </Card>

    </div>
  );
}