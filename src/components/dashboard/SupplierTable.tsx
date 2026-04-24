import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ✅ Backend data type (no risk-engine)
type Supplier = {
  name: string;
  risk_score: number;
  risk_level: string;
  city: string;
  country: string;
  category: string;
  tier?: string;
};

export function SupplierTable({ suppliers }: { suppliers: Supplier[] }) {

  // 🔄 Convert backend → UI format
  const formatted = suppliers.map((s) => ({
    name: s.name,
    riskScore: s.risk_score,
    riskLevel: s.risk_level,
    city: s.city,
    country: s.country,
    category: s.category,
    tier: s.tier || "N/A",
  }));

  // 🔥 Sort by risk
  const sorted = [...formatted].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <Card className="p-4">

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Supplier Risk Register</h3>
        <p className="text-xs text-gray-500">
          {suppliers.length} suppliers
        </p>
      </div>

      {/* Table */}
      <table className="w-full text-sm border">
        <thead className="bg-gray-100 text-xs uppercase">
          <tr>
            <th className="p-2 text-left">Supplier</th>
            <th className="p-2 text-left">Tier</th>
            <th className="p-2 text-left">Location</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Risk Score</th>
            <th className="p-2 text-left">Risk Level</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((s) => (
            <tr key={s.name} className="border-t">
              <td className="p-2 font-medium">{s.name}</td>
              <td className="p-2">{s.tier}</td>
              <td className="p-2">
                {s.city}, {s.country}
              </td>
              <td className="p-2">{s.category}</td>
              <td className="p-2">{s.riskScore}</td>
              <td className="p-2">
                <Badge variant="outline">{s.riskLevel}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </Card>
  );
}