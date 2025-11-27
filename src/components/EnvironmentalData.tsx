import { Cloud, Sun, Wind } from "lucide-react";
import { EnvironmentalData } from "../types";
import { AQI_COLORS, WEATHER_COLORS } from "../utils/constants";

interface Props {
  data: EnvironmentalData | null;
}

export function EnvironmentalDataSection({ data }: Props) {
  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Environmental Data
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* AQI CARD */}
        <div
          className="rounded-xl shadow-md p-6 text-white transition hover:shadow-lg"
          style={{
            backgroundColor: AQI_COLORS[data.aqi.category] || "#6B7280",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Wind className="w-6 h-6" />
            <h3 className="text-xl font-bold">Air Quality</h3>
          </div>

          <p className="text-3xl font-bold">{data.aqi.category}</p>
          <p className="text-sm opacity-90">PM2.5: {data.aqi.pm25}µg/m³</p>
          <p className="text-sm opacity-90">PM10: {data.aqi.pm10}µg/m³</p>
        </div>

        {/* WEATHER CARD */}
        <div
          className="rounded-xl shadow-md p-6 text-white transition hover:shadow-lg"
          style={{
            backgroundColor:
              WEATHER_COLORS[data.weather.condition] || "#60A5FA",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="w-6 h-6" />
            <h3 className="text-xl font-bold">Weather</h3>
          </div>

          <p className="text-3xl font-bold">{data.weather.temperature}°C</p>
          <p className="text-sm opacity-90">{data.weather.condition}</p>
          <p className="text-sm opacity-90">
            Humidity: {data.weather.humidity}%
          </p>
        </div>

        {/* UV CARD */}
        <div className="bg-purple-500 rounded-xl shadow-md p-6 text-white transition hover:shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Sun className="w-6 h-6" />
            <h3 className="text-xl font-bold">UV Index</h3>
          </div>

          <p className="text-3xl font-bold">{data.uvIndex}</p>
          <p className="text-sm opacity-90">
            {data.uvIndex > 8
              ? "Very High"
              : data.uvIndex > 4
              ? "High"
              : "Moderate"}
          </p>
          <p className="text-sm opacity-90">Solar radiation level</p>
        </div>
      </div>
    </div>
  );
}
