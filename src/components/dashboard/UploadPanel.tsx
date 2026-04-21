import { useRef, useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, KeyRound, Sparkles, FileDown } from "lucide-react";
import { getApiKey, setApiKey } from "@/lib/weather";
import type { SupplierInput, Dependency } from "@/lib/risk-engine";
import { toast } from "sonner";

interface Props {
  onData: (rows: SupplierInput[]) => void;
  onLoadSample: () => void;
}

export function UploadPanel({ onData, onLoadSample }: Props) {
  const [key, setKey] = useState(getApiKey() ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows: SupplierInput[] = res.data
          .map((r) => ({
            name: (r.name ?? "").trim(),
            city: (r.city ?? "").trim(),
            dependency: ((r.dependency ?? "Medium").trim() as Dependency),
            category: (r.category ?? "General").trim(),
          }))
          .filter((r) => r.name && r.city);
        if (!rows.length) return toast.error("No valid rows found in CSV");
        onData(rows);
        toast.success(`Loaded ${rows.length} suppliers`);
      },
      error: () => toast.error("Failed to parse CSV"),
    });
  };

  return (
    <Card className="gradient-card border-border/60 p-6 shadow-card">
      <div className="flex flex-col gap-5 md:flex-row md:items-end">
        <div className="flex-1 space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <KeyRound className="h-3.5 w-3.5" /> OpenWeather API Key (optional)
          </label>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Paste key for live weather (otherwise simulated)"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="bg-background/60"
            />
            <Button
              variant="secondary"
              onClick={() => {
                setApiKey(key);
                toast.success("API key saved locally");
              }}
            >
              Save
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <Button onClick={() => fileRef.current?.click()} className="gradient-primary text-primary-foreground shadow-glow">
            <Upload className="mr-2 h-4 w-4" /> Upload CSV
          </Button>
          <Button variant="outline" onClick={onLoadSample}>
            <Sparkles className="mr-2 h-4 w-4" /> Load Sample
          </Button>
          <Button variant="ghost" asChild>
            <a href="/sample-suppliers.csv" download>
              <FileDown className="mr-2 h-4 w-4" /> Template
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}
