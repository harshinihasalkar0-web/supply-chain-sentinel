import { runAnalysis } from "@/lib/api";
import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, KeyRound, FileDown, Upload, Loader2 } from "lucide-react";
import { getApiKey, setApiKey } from "@/lib/weather";
import { toast } from "sonner";

type SupplierInput = {
  name: string;
  city: string;
  dependency: string;
  category: string;
  tier: string;
  parent_supplier?: string;
};

interface Props {
  onData: (data: any[]) => void;
}

export function UploadPanel({ onData }: Props) {
  const [key, setKey] = useState(getApiKey() ?? "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFile = (file: File) => {
    setIsAnalyzing(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      // The regex helps remove hidden BOM characters from Excel CSVs
      transformHeader: (h) => h.replace(/^\uFEFF/, "").trim().toLowerCase(),

      complete: async (res: any) => {
        const rows: SupplierInput[] = res.data
          .map((r: any) => {
            const clean: any = {};
            Object.keys(r).forEach((k) => {
              const key = k.trim().toLowerCase();
              const value = String(r[k] ?? "").trim();
              clean[key] = value;
            });

            return {
              name: clean.name,
              city: clean.city,
              dependency: clean.dependency || "Medium",
              category: clean.category || "General",
              tier: clean.tier || "Tier 1",
              parent_supplier: clean.parent_supplier || "",
            };
          })
          .filter((r: SupplierInput) => r.name && r.city);

        if (!rows.length) {
          toast.error("No valid suppliers found in CSV ❌");
          setIsAnalyzing(false);
          return;
        }

        try {
          const result = await runAnalysis(rows);
          const data = Array.isArray(result) ? result : result?.suppliers || [];

          onData(data);
          toast.success(`Analyzed ${data.length} suppliers successfully ✅`);
        } catch (err) {
          console.error("Analysis Error:", err);
          toast.error("Backend analysis failed ❌");
        } finally {
          setIsAnalyzing(false);
        }
      },
      error: (error) => {
        console.error("Parse Error:", error);
        toast.error("CSV parse failed ❌");
        setIsAnalyzing(false);
      },
    });
  };

  const handleBackendCheck = async () => {
    try {
      await runAnalysis([]);
      toast.success("Backend connection verified ✅");
    } catch {
      toast.error("Could not reach backend server ❌");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-end">
        
        {/* API KEY SECTION */}
        <div className="flex-1 space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
            <KeyRound className="h-4 w-4" />
            OpenWeather API Key
          </label>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Enter your API key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="max-w-sm"
            />
            <Button
              onClick={() => {
                setApiKey(key);
                toast.success("API key saved locally ✅");
              }}
            >
              Save
            </Button>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-3 items-center">
          
          {/* STYLED UPLOAD BUTTON */}
          <div className="relative">
            <input
              type="file"
              id="csv-upload"
              accept=".csv"
              className="sr-only" // Hide the default browser input
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = ""; // Reset to allow re-uploading same file
              }}
              disabled={isAnalyzing}
            />
            <label htmlFor="csv-upload">
              <Button asChild disabled={isAnalyzing} className="cursor-pointer">
                <span>
                  {isAnalyzing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {isAnalyzing ? "Analyzing..." : "Upload CSV"}
                </span>
              </Button>
            </label>
          </div>

          <Button variant="outline" onClick={handleBackendCheck} disabled={isAnalyzing}>
            <Sparkles className="mr-2 h-4 w-4" />
            Test API
          </Button>

          <Button variant="ghost" asChild>
            <a href="/sample-suppliers.csv" download>
              <FileDown className="mr-2 h-4 w-4" />
              Template
            </a>
          </Button>

        </div>
      </div>
    </Card>
  );
}