export type Dependency = "High" | "Medium" | "Low";

export interface SupplierInput {
  name: string;
  city: string;
  dependency: Dependency;
  category: string;
  tier?: string;
  parent_supplier?: string;
}

export interface WeatherInfo {
  condition: "Clear" | "Cloudy" | "Rain" | "Storm" | "Unknown";
  description: string;
  temp: number;
}

export interface AnalyzedSupplier extends SupplierInput {
  weather: WeatherInfo;
  dependencyScore: number;
  weatherScore: number;
  geoScore: number;
  logisticsScore: number;
  cascadingRiskImpact: number;
  upstreamRiskSource: string | null;
  riskScore: number;
  baseRiskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  prediction: { label: string; confidence: number };
  recommendation: string;
  country: string;
  tier: string;
  parent_supplier: string | null;
  isCriticalNode: boolean;
  isSinglePointOfFailure: boolean;
  riskReason: string;
  alternativeSupplier: string | null;
}

// Static city -> country + geopolitical tier
const CITY_MAP: Record<string, { country: string; geo: "High" | "Medium" | "Low" }> = {
  shanghai: { country: "China", geo: "Medium" },
  beijing: { country: "China", geo: "Medium" },
  "hong kong": { country: "China", geo: "Medium" },
  delhi: { country: "India", geo: "Medium" },
  mumbai: { country: "India", geo: "Medium" },
  bangalore: { country: "India", geo: "Low" },
  oslo: { country: "Norway", geo: "Low" },
  stockholm: { country: "Sweden", geo: "Low" },
  karachi: { country: "Pakistan", geo: "High" },
  cairo: { country: "Egypt", geo: "Medium" },
  munich: { country: "Germany", geo: "Low" },
  berlin: { country: "Germany", geo: "Low" },
  "ho chi minh city": { country: "Vietnam", geo: "Medium" },
  hanoi: { country: "Vietnam", geo: "Medium" },
  istanbul: { country: "Turkey", geo: "Medium" },
  "rio de janeiro": { country: "Brazil", geo: "Medium" },
  "sao paulo": { country: "Brazil", geo: "Medium" },
  tokyo: { country: "Japan", geo: "Low" },
  osaka: { country: "Japan", geo: "Low" },
  lagos: { country: "Nigeria", geo: "High" },
  moscow: { country: "Russia", geo: "High" },
  "saint petersburg": { country: "Russia", geo: "High" },
  kyiv: { country: "Ukraine", geo: "High" },
  tehran: { country: "Iran", geo: "High" },
  caracas: { country: "Venezuela", geo: "High" },
  seoul: { country: "South Korea", geo: "Low" },
  taipei: { country: "Taiwan", geo: "Medium" },
  bangkok: { country: "Thailand", geo: "Low" },
  "new york": { country: "USA", geo: "Low" },
  "los angeles": { country: "USA", geo: "Low" },
  london: { country: "UK", geo: "Low" },
  paris: { country: "France", geo: "Low" },
  dubai: { country: "UAE", geo: "Low" },
};

export function lookupCity(city: string) {
  const k = city.trim().toLowerCase();
  return CITY_MAP[k] ?? { country: "Unknown", geo: "Medium" as const };
}

export function dependencyScore(d: Dependency): number {
  return d === "High" ? 50 : d === "Medium" ? 30 : 10;
}

export function weatherScore(w: WeatherInfo["condition"]): number {
  switch (w) {
    case "Storm": return 30;
    case "Rain": return 20;
    case "Cloudy": return 10;
    default: return 0;
  }
}

export function geoScore(tier: "High" | "Medium" | "Low"): number {
  return tier === "High" ? 20 : tier === "Medium" ? 10 : 0;
}

export function logisticsScore(category: string): number {
  const c = category.toLowerCase();
  if (c.includes("semi") || c.includes("electron") || c.includes("chip")) return 15;
  if (c.includes("energy") || c.includes("chem") || c.includes("mining")) return 12;
  if (c.includes("food") || c.includes("textile")) return 8;
  return 5;
}

export function classify(score: number): "Low" | "Medium" | "High" {
  if (score >= 65) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

export function recommend(level: "Low" | "Medium" | "High", weather: WeatherInfo["condition"]) {
  if (level === "High") {
    return weather === "Storm" || weather === "Rain"
      ? "Activate backup supplier immediately. Diversify geography and pre-stock 4-week buffer."
      : "Add backup supplier, diversify geography, and renegotiate SLA terms.";
  }
  if (level === "Medium") {
    return "Monitor closely and prepare alternative routes. Validate secondary suppliers quarterly.";
  }
  return "Stable supply. Maintain standard monitoring cadence.";
}

export function predict(weather: WeatherInfo, geo: "High" | "Medium" | "Low", dep: Dependency) {
  const bad = weather.condition === "Storm" || weather.condition === "Rain";
  const high = geo === "High" || dep === "High";
  if (bad && high) return { label: "Potential Disruption (2–4 weeks)", confidence: 0.86 };
  if (bad) return { label: "Possible Delay (1–2 weeks)", confidence: 0.72 };
  if (high) return { label: "Watchlist – Geopolitical Pressure", confidence: 0.58 };
  return { label: "Stable Outlook (30 days)", confidence: 0.91 };
}

export function analyze(input: SupplierInput, weather: WeatherInfo): AnalyzedSupplier {
  const { country, geo } = lookupCity(input.city);
  const ds = dependencyScore(input.dependency);
  const ws = weatherScore(weather.condition);
  const gs = geoScore(geo);
  const ls = logisticsScore(input.category);
  const baseRiskScore = Math.min(100, ds + ws + gs + ls);
  const riskLevel = classify(baseRiskScore);
  return {
    ...input,
    tier: (input.tier ?? "Tier 1").trim() || "Tier 1",
    parent_supplier: (input.parent_supplier ?? "").trim() || null,
    country,
    weather,
    dependencyScore: ds,
    weatherScore: ws,
    geoScore: gs,
    logisticsScore: ls,
    cascadingRiskImpact: 0,
    upstreamRiskSource: null,
    baseRiskScore,
    riskScore: baseRiskScore,
    riskLevel,
    prediction: predict(weather, geo, input.dependency),
    recommendation: recommend(riskLevel, weather.condition),
    isCriticalNode: false,
    isSinglePointOfFailure: false,
    riskReason: "",
    alternativeSupplier: null,
  };
}

// ---------- Multi-tier post-processing ----------

function explain(s: AnalyzedSupplier): string {
  const bits: string[] = [];
  if (s.dependency === "High") bits.push("high dependency");
  else if (s.dependency === "Medium") bits.push("medium dependency");
  if (s.weather.condition === "Storm") bits.push("storm conditions");
  else if (s.weather.condition === "Rain") bits.push("adverse weather");
  else if (s.weather.condition === "Cloudy") bits.push("cloudy weather");
  if (s.geoScore >= 20) bits.push("high geopolitical exposure");
  else if (s.geoScore >= 10) bits.push("moderate geopolitical exposure");
  if (s.logisticsScore >= 12) bits.push("complex logistics profile");
  if (s.cascadingRiskImpact > 0 && s.upstreamRiskSource)
    bits.push(`upstream risk from ${s.upstreamRiskSource}`);
  const reason = bits.length ? bits.join(", ") : "stable signals across all factors";
  const lvl = s.riskLevel === "High" ? "High risk" : s.riskLevel === "Medium" ? "Moderate risk" : "Low risk";
  return `${lvl} due to ${reason}.`;
}

function betterPrediction(s: AnalyzedSupplier): { label: string; confidence: number } {
  if (s.cascadingRiskImpact >= 20)
    return { label: "Supply instability risk due to upstream supplier failure", confidence: 0.88 };
  if (s.weather.condition === "Storm" || s.weather.condition === "Rain")
    return { label: "Disruption likely in 2–4 weeks due to severe weather patterns", confidence: 0.82 };
  if (s.riskLevel === "High")
    return { label: "Elevated disruption probability within 30 days", confidence: 0.74 };
  if (s.riskLevel === "Medium")
    return { label: "Watchlist – monitor signals weekly", confidence: 0.62 };
  return { label: "Stable outlook with no immediate disruption signals", confidence: 0.93 };
}

/**
 * Apply cascading risk, vulnerability flags, alternatives and explanations
 * across the full supplier graph.
 */
export function enrichGraph(suppliers: AnalyzedSupplier[]): AnalyzedSupplier[] {
  const byName = new Map(suppliers.map((s) => [s.name.toLowerCase(), s]));

  // Downstream count: how many suppliers reference this supplier as parent.
  const downstream = new Map<string, number>();
  for (const s of suppliers) {
    if (s.parent_supplier) {
      const k = s.parent_supplier.toLowerCase();
      downstream.set(k, (downstream.get(k) ?? 0) + 1);
    }
  }

  // Cascading risk from parent
  for (const s of suppliers) {
    if (s.parent_supplier) {
      const parent = byName.get(s.parent_supplier.toLowerCase());
      if (parent) {
        let bump = 0;
        if (parent.riskLevel === "High") bump = 20;
        else if (parent.riskLevel === "Medium") bump = 10;
        if (bump > 0) {
          s.cascadingRiskImpact = bump;
          s.upstreamRiskSource = parent.name;
          s.riskScore = Math.min(100, s.baseRiskScore + bump);
          s.riskLevel = classify(s.riskScore);
        }
      }
    }
  }

  // Vulnerability flags + alternatives + explanation
  for (const s of suppliers) {
    const downCount = downstream.get(s.name.toLowerCase()) ?? 0;
    s.isCriticalNode = downCount >= 2;

    const alt = suppliers.find(
      (x) =>
        x.name !== s.name &&
        x.category.toLowerCase() === s.category.toLowerCase() &&
        x.riskScore < s.riskScore &&
        x.city.toLowerCase() !== s.city.toLowerCase()
    );
    s.alternativeSupplier = alt
      ? `${alt.name} (${alt.city}, ${alt.riskLevel} Risk)`
      : null;

    s.isSinglePointOfFailure = s.dependency === "High" && !alt;

    if (s.riskLevel === "High") {
      s.recommendation = s.alternativeSupplier
        ? `Activate alternative: ${s.alternativeSupplier}. Diversify geography and pre-stock 4-week buffer.`
        : "⚠ No safe alternative available. Urgently qualify a new supplier and increase safety stock.";
    } else {
      s.recommendation = recommend(s.riskLevel, s.weather.condition);
    }

    s.prediction = betterPrediction(s);
    s.riskReason = explain(s);
  }

  return suppliers;
}
