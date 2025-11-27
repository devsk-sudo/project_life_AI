// src/components/SurgeChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { RISK_COLORS } from "../utils/constants";

import { SurgeChartData } from "../types";

interface SurgeChartProps {
  data: SurgeChartData[] | null;
  expectedLoad: number | null;
  riskLevel: "Low" | "Medium" | "High" | null;
}

// ---- helper to map risk → color ----
function getRiskColor(level: string | null): string {
  if (!level) return "#6b7280"; // gray fallback
  return (
    RISK_COLORS[level.toLowerCase() as "low" | "medium" | "high"] ??
    "#6b7280"
  );
}

export function SurgeChart({ data, expectedLoad, riskLevel }: SurgeChartProps) {
  if (!data || !expectedLoad || !riskLevel) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          72-Hour Patient Load Forecast
        </h3>

        <span
          className="px-4 py-1 rounded-full text-white font-medium"
          style={{ backgroundColor: getRiskColor(riskLevel) }}
        >
          {riskLevel} Risk
        </span>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#2563eb"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center shadow-sm">
          <p className="text-sm text-gray-500">Expected Load (72h)</p>
          <p className="text-2xl font-bold text-blue-600">{expectedLoad}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg text-center shadow-sm">
          <p className="text-sm text-gray-500">Minimum</p>
          <p className="text-2xl font-bold text-green-600">
            {Math.min(...data.map((d) => d.predicted))}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg text-center shadow-sm">
          <p className="text-sm text-gray-500">Maximum</p>
          <p className="text-2xl font-bold text-orange-600">
            {Math.max(...data.map((d) => d.predicted))}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg text-center shadow-sm">
          <p className="text-sm text-gray-500">Variance</p>
          <p className="text-2xl font-bold text-purple-600">
            {Math.max(...data.map((d) => d.predicted)) -
              Math.min(...data.map((d) => d.predicted))}
          </p>
        </div>
      </div>
    </div>
  );
}
