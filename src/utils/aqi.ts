import { AQICategory } from "../types";

export function categorizeAQI(pm25: number, pm10: number): AQICategory {
  const pm25Cat =
    pm25 <= 30 ? "Good" :
    pm25 <= 60 ? "Satisfactory" :
    pm25 <= 90 ? "Moderate" :
    pm25 <= 120 ? "Poor" :
    pm25 <= 250 ? "Very Poor" :
    "Severe";

  const pm10Cat =
    pm10 <= 50 ? "Good" :
    pm10 <= 100 ? "Satisfactory" :
    pm10 <= 250 ? "Moderate" :
    pm10 <= 350 ? "Poor" :
    pm10 <= 430 ? "Very Poor" :
    "Severe";

  const order = ["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"];

  return order[
    Math.max(order.indexOf(pm25Cat), order.indexOf(pm10Cat))
  ] as AQICategory;
}
