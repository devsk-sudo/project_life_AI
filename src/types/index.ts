export interface LocationData {
  area: string;
  latitude: number;
  longitude: number;
}

export type AQICategory =
  | "Good"
  | "Satisfactory"
  | "Moderate"
  | "Poor"
  | "Very Poor"
  | "Severe";

export interface EnvironmentalData {
  aqi: {
    pm25: number;
    pm10: number;
    category: AQICategory;   // ONLY category (No numeric AQI)
  };
  weather: {
    temperature: number;
    humidity: number;
    condition: "Cool" | "Clear" | "Warm" | "Hot" | "Humid";
  };
  uvIndex: number;
}

export interface SurgeChartData {
  hour: number;
  predicted: number;
}

export interface Explanation {
  reason: string;
  impact: string;
  severity: "low" | "medium" | "high";
}

export interface StaffingRecommendation {
  action: string;
  priority: "low" | "medium" | "high";
  details: string[];
}
