import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ✅ simple backend type
type Supplier = any;

export function RiskCharts({ suppliers }: { suppliers: Supplier[] }) {

  // 🔥 Average risk from backend
  const avg =
    suppliers.length > 0
      ? suppliers.reduce((sum, s) => sum + (s.risk_score || 0), 0) /
        suppliers.length
      : 0;

  // 🔥 Fake trend (based on backend avg)
  const trend = Array.from({ length: 8 }).map((_, i) => ({
    week: `W${i + 1}`,
    risk: Math.max(
      0,
      Math.min(100, Math.round(avg + Math.sin(i) * 10))
    ),
  }));

  // 🔥 Risk distribution (backend)
  const high = suppliers.filter((s) => s.risk_level === "High").length;
  const medium = suppliers.filter((s) => s.risk_level === "Medium").length;
  const low = suppliers.filter((s) => s.risk_level === "Low").length;

  const breakdown = [
    { name: "High", value: high, color: "#ef4444" },
    { name: "Medium", value: medium, color: "#f59e0b" },
    { name: "Low", value: low, color: "#10b981" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-5">

      {/* 📈 LINE CHART */}
      <Card className="p-5 lg:col-span-3">
        <h3 className="text-lg font-semibold mb-3">Risk Trend</h3>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="week" />
            <YAxis domain={[0, 100]} />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="risk"
              stroke="#3b82f6"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 🥧 PIE CHART */}
      <Card className="p-5 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-3">Risk Distribution</h3>

        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={breakdown}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={90}
            >
              {breakdown.map((b) => (
                <Cell key={b.name} fill={b.color} />
              ))}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

    </div>
  );
}