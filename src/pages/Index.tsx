import { useState } from "react";
import { Activity, Radar, LogOut } from "lucide-react";
import { UploadPanel } from "@/components/dashboard/UploadPanel";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { RiskCharts } from "@/components/dashboard/RiskCharts";
import { SupplierTable } from "@/components/dashboard/SupplierTable";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { Recommendations } from "@/components/dashboard/Recommendations";
import { runAnalysis } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

type Supplier = any;

const Index = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  const { logout, user } = useAuth();
  const { toast } = useToast();

  // 🔥 Backend call
  const handleAnalysis = async (rows: any[]) => {
    setLoading(true);
    try {
      const result = await runAnalysis(rows);

      // Safe fallback
      const data = Array.isArray(result)
        ? result
        : result?.suppliers || [];

      setSuppliers(data);
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">

      {/* HEADER */}
      <header className="border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Radar className="h-6 w-6 text-blue-500" />
          <h1 className="text-lg font-bold">
            Rebel Supply Chain
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-gray-500">
              Welcome, {user.name}
            </span>
          )}

          <Button onClick={logout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* MAIN */}
      <main className="p-6 space-y-6">

        {/* TITLE */}
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" />
          <h2 className="text-2xl font-bold">
            Operational Dashboard
          </h2>
        </div>

        {/* 🔥 Upload */}
        <UploadPanel onData={handleAnalysis} />

        {/* 🔥 Content */}
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Upload CSV to start
          </div>
        ) : (
          <>
            <KpiCards suppliers={suppliers} />
            <RiskCharts suppliers={suppliers} />

            <div className="grid md:grid-cols-2 gap-4">
              <AlertsPanel suppliers={suppliers} />
              <Recommendations suppliers={suppliers} />
            </div>

            <SupplierTable suppliers={suppliers} />
          </>
        )}

      </main>
    </div>
  );
};

export default Index;