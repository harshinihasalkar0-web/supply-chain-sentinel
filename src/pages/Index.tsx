import { useEffect, useState } from "react";
import { Activity, Radar } from "lucide-react";
import { UploadPanel } from "@/components/dashboard/UploadPanel";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { RiskCharts } from "@/components/dashboard/RiskCharts";
import { SupplierTable } from "@/components/dashboard/SupplierTable";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { Recommendations } from "@/components/dashboard/Recommendations";
import { analyze, type AnalyzedSupplier, type SupplierInput } from "@/lib/risk-engine";
import { fetchWeather } from "@/lib/weather";

const SAMPLE: SupplierInput[] = [
  { name: "ABC Corp", city: "Shanghai", dependency: "High", category: "Electronics" },
  { name: "XYZ Ltd", city: "Delhi", dependency: "Medium", category: "Raw Materials" },
  { name: "Nordic Steel", city: "Oslo", dependency: "Low", category: "Metals" },
  { name: "Pacific Textiles", city: "Karachi", dependency: "High", category: "Textiles" },
  { name: "Bavarian Motors", city: "Munich", dependency: "Low", category: "Automotive" },
  { name: "Tokyo Chips", city: "Tokyo", dependency: "Low", category: "Semiconductors" },
  { name: "Lagos Energy", city: "Lagos", dependency: "High", category: "Energy" },
  { name: "Moscow Refinery", city: "Moscow", dependency: "High", category: "Chemicals" },
];

const Index = () => {
  const [suppliers, setSuppliers] = useState<AnalyzedSupplier[]>([]);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async (rows: SupplierInput[]) => {
    setLoading(true);
    const results = await Promise.all(
      rows.map(async (r) => {
        const w = await fetchWeather(r.city);
        return analyze(r, w);
      })
    );
    setSuppliers(results);
    setLoading(false);
  };

  useEffect(() => { runAnalysis(SAMPLE); /* eslint-disable-next-line */ }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 backdrop-blur-md">
        <div className="container flex items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <div className="gradient-primary shadow-glow flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground">
              <Radar className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Rebel <span className="text-gradient-primary">Supply Chain</span>
              </h1>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">AI Resilience & Risk Analyzer</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground md:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Engine online · {suppliers.length} signals tracked
          </div>
        </div>
      </header>

      <main className="container space-y-6 py-8">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Operational Intelligence Dashboard</h2>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Upload your supplier register or use the sample dataset. The engine fuses dependency, weather, geopolitical and logistics signals into a unified resilience score — and predicts disruptions before they hit.
          </p>
        </section>

        <UploadPanel onData={runAnalysis} onLoadSample={() => runAnalysis(SAMPLE)} />

        {loading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">Analyzing signals…</div>
        ) : suppliers.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">Upload a CSV to begin.</div>
        ) : (
          <>
            <KpiCards suppliers={suppliers} />
            <RiskCharts suppliers={suppliers} />
            <div className="grid gap-4 lg:grid-cols-2">
              <AlertsPanel suppliers={suppliers} />
              <Recommendations suppliers={suppliers} />
            </div>
            <SupplierTable suppliers={suppliers} />
          </>
        )}

        <footer className="pt-8 text-center text-xs text-muted-foreground">
          Built with React + Tailwind · Weather via OpenWeatherMap (optional) · CSV format: <code className="rounded bg-secondary/60 px-1.5 py-0.5">name,city,dependency,category</code>
        </footer>
      </main>
    </div>
  );
};

export default Index;
