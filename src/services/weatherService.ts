import { EnvironmentalData } from "../types";
import { categorizeAQI } from "../utils/aqi";

export async function fetchEnvironmentData(
  lat: number,
  lon: number
): Promise<EnvironmentalData> {
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5,pm10`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,uv_index`;

  const [aqiRes, weatherRes] = await Promise.all([
    fetch(aqiUrl),
    fetch(weatherUrl),
  ]);

  const aqiData = await aqiRes.json();
  const weatherData = await weatherRes.json();

  const now = new Date();
  const isoHour = now.toISOString().slice(0, 13);

  const times: string[] = weatherData.hourly.time;
  let hourIndex = times.findIndex((t) => t.startsWith(isoHour));

  if (hourIndex === -1) {
    const nowUTC = Date.parse(now.toISOString());
    const diffs = times.map((t) => Math.abs(Date.parse(t) - nowUTC));
    hourIndex = diffs.indexOf(Math.min(...diffs));
  }

  const temp = weatherData.hourly.temperature_2m[hourIndex];
  const humidity = weatherData.hourly.relative_humidity_2m[hourIndex];
  const uv = weatherData.hourly.uv_index[hourIndex];

  const pm25 = aqiData.hourly.pm2_5[hourIndex] ?? 0;
  const pm10 = aqiData.hourly.pm10[hourIndex] ?? 0;

  const category = categorizeAQI(pm25, pm10);

  let condition: EnvironmentalData["weather"]["condition"];
  if (humidity > 80) condition = "Humid";
  else if (temp > 32) condition = "Hot";
  else if (temp >= 25) condition = "Warm";
  else if (temp >= 18) condition = "Clear";
  else condition = "Cool";

  return {
    aqi: { pm25, pm10, category },
    weather: { temperature: temp, humidity, condition },
    uvIndex: uv,
  };
}
