// =======================
//  CPCB-Compliant AQI Levels
// =======================
export const AQI_LEVELS = {
  GOOD:        { min: 0,   max: 50,  label: "Good",         color: "#10B981" }, // green
  SATISFACTORY:{ min: 51,  max: 100, label: "Satisfactory", color: "#84CC16" }, // lime
  MODERATE:    { min: 101, max: 200, label: "Moderate",     color: "#F59E0B" }, // amber
  POOR:        { min: 201, max: 300, label: "Poor",         color: "#F97316" }, // orange
  VERY_POOR:   { min: 301, max: 400, label: "Very Poor",    color: "#EF4444" }, // red
  SEVERE:      { min: 401, max: 500, label: "Severe",       color: "#7F1D1D" }, // dark red
};

// AQI color lookup by label (UI uses this)
export const AQI_COLORS: Record<string, string> = {
  Good: "#10B981",
  Satisfactory: "#84CC16",
  Moderate: "#F59E0B",
  Poor: "#F97316",
  "Very Poor": "#EF4444",
  Severe: "#7F1D1D",
};

// =======================
// Weather Condition Colors
// =======================
export const WEATHER_COLORS: Record<string, string> = {
  Hot: "#F97316",     // orange
  Warm: "#FBBF24",    // yellow
  Clear: "#3B82F6",   // blue
  Cool: "#60A5FA",    // light blue
  Humid: "#2563EB",   // deep blue
  Cold: "#1E3A8A",    // navy
};

// =======================
// UV Index Colors
// =======================
export const UV_COLORS: Record<string, string> = {
  Low: "#10B981",        // green
  Moderate: "#F59E0B",   // amber
  High: "#EF4444",       // red
  VeryHigh: "#7C2D12",   // dark red
};

// =======================
// Risk Colors (Prediction)
// =======================
export const RISK_COLORS = {
  low: "#10B981",     // green
  medium: "#F59E0B",  // amber
  high: "#EF4444",    // red
};

// =======================
// Mock Locations (kept for fallback)
// =======================
export const MOCK_LOCATIONS = {
  "New York": { lat: 40.7128, lon: -74.006 },
  "Los Angeles": { lat: 34.0522, lon: -118.2437 },
  Chicago: { lat: 41.8781, lon: -87.6298 },
  Houston: { lat: 29.7604, lon: -95.3698 },
};
