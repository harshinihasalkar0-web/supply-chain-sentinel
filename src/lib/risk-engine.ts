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
  const riskScore = Math.min(100, ds + ws + gs + ls);
  const riskLevel = classify(riskScore);
  return {
    ...input,
    country,
    weather,
    dependencyScore: ds,
    weatherScore: ws,
    geoScore: gs,
    logisticsScore: ls,
    riskScore,
    riskLevel,
    prediction: predict(weather, geo, input.dependency),
    recommendation: recommend(riskLevel, weather.condition),
  };
}
