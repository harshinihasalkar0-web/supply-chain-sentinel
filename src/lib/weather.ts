import type { WeatherInfo } from "./risk-engine";

const KEY_STORAGE = "openweather_api_key";

export function getApiKey(): string | null {
  return localStorage.getItem(KEY_STORAGE);
}
export function setApiKey(k: string) {
  localStorage.setItem(KEY_STORAGE, k);
}

function mapCondition(main: string): WeatherInfo["condition"] {
  const m = main.toLowerCase();
  if (m.includes("thunder") || m.includes("storm") || m.includes("tornado") || m.includes("hurricane")) return "Storm";
  if (m.includes("rain") || m.includes("drizzle") || m.includes("snow")) return "Rain";
  if (m.includes("cloud")) return "Cloudy";
  if (m.includes("clear")) return "Clear";
  return "Cloudy";
}

// Deterministic mock weather based on city name hash – lets the app run without an API key
function mockWeather(city: string): WeatherInfo {
  let h = 0;
  for (let i = 0; i < city.length; i++) h = (h * 31 + city.charCodeAt(i)) >>> 0;
  const conds: WeatherInfo["condition"][] = ["Clear", "Cloudy", "Rain", "Storm", "Cloudy", "Clear"];
  const condition = conds[h % conds.length];
  return {
    condition,
    description: `${condition} (simulated)`,
    temp: 15 + (h % 20),
  };
}

export async function fetchWeather(city: string): Promise<WeatherInfo> {
  const key = getApiKey();
  if (!key) return mockWeather(city);
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${key}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) return mockWeather(city);
    const data = await res.json();
    const main = data.weather?.[0]?.main ?? "Clouds";
    return {
      condition: mapCondition(main),
      description: data.weather?.[0]?.description ?? main,
      temp: Math.round(data.main?.temp ?? 20),
    };
  } catch {
    return mockWeather(city);
  }
}
