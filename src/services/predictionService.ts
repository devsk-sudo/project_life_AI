import { SurgeChartData, Explanation, StaffingRecommendation, EnvironmentalData } from '../types';

export function predictSurge(
  environmentalData: EnvironmentalData
): { chartData: SurgeChartData[]; expectedLoad: number; riskLevel: 'Low' | 'Medium' | 'High' } {
  // Mock prediction based on environmental factors
  const baseLoad = 150;
  const aqiFactor = (environmentalData.aqi.pm25 / 50) * 0.3;
  const weatherFactor = ((100 - environmentalData.weather.humidity) / 100) * 0.2;
  const uvFactor = (environmentalData.uvIndex / 12) * 0.1;

  const totalFactor = aqiFactor + weatherFactor + uvFactor;
  const expectedLoad = Math.floor(baseLoad * (1 + totalFactor));

  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  if (totalFactor > 0.4) riskLevel = 'High';
  else if (totalFactor > 0.2) riskLevel = 'Medium';

  // Generate 72-hour chart data (24-hour cycle repeated 3 times)
  const chartData: SurgeChartData[] = [];
  for (let hour = 0; hour < 72; hour++) {
    const cycleHour = hour % 24;
    const basePattern = Math.sin((cycleHour / 24) * Math.PI * 2) * 50 + expectedLoad;
    const variance = (Math.random() - 0.5) * 30;
    chartData.push({
      hour,
      predicted: Math.max(100, Math.floor(basePattern + variance)),
    });
  }

  return { chartData, expectedLoad, riskLevel };
}

export function explainPrediction(
  environmentalData: EnvironmentalData,
  riskLevel: 'Low' | 'Medium' | 'High'
): Explanation[] {
  const explanations: Explanation[] = [];

  const aqiSeverity =
    environmentalData.aqi.level === 'Very Poor'
      ? 'high'
      : environmentalData.aqi.level === 'Poor'
        ? 'medium'
        : 'low';

  explanations.push({
    reason: `Air Quality (${environmentalData.aqi.level})`,
    impact: `PM2.5: ${environmentalData.aqi.pm25}µg/m³, PM10: ${environmentalData.aqi.pm10}µg/m³`,
    severity: aqiSeverity,
  });

  const weatherSeverity = environmentalData.weather.humidity > 80 ? 'high' : 'medium';
  explanations.push({
    reason: `Weather Conditions (${environmentalData.weather.condition})`,
    impact: `Temperature: ${environmentalData.weather.temperature}°C, Humidity: ${environmentalData.weather.humidity}%`,
    severity: weatherSeverity,
  });

  const uvSeverity = environmentalData.uvIndex > 8 ? 'high' : environmentalData.uvIndex > 4 ? 'medium' : 'low';
  explanations.push({
    reason: `UV Index (${environmentalData.uvIndex})`,
    impact: `High UV exposure may increase respiratory issues`,
    severity: uvSeverity,
  });

  return explanations;
}

export function recommendStaffing(
  riskLevel: 'Low' | 'Medium' | 'High',
  expectedLoad: number
): StaffingRecommendation[] {
  const recommendations: StaffingRecommendation[] = [];

  if (riskLevel === 'High') {
    recommendations.push({
      action: 'Increase Triage Staff',
      priority: 'high',
      details: ['+2 triage nurses (Morning & Evening shifts)', 'Activate overflow waiting area', 'Prepare rapid assessment protocols'],
    });

    recommendations.push({
      action: 'Respiratory Bay Preparation',
      priority: 'high',
      details: ['Stock oxygen supplies', 'Check ventilation systems', 'Brief respiratory team'],
    });

    recommendations.push({
      action: 'OPD & Registration',
      priority: 'medium',
      details: ['Add 2 registration desks', 'Implement digital queue system', 'Increase staff to 5 (from 3)'],
    });
  } else if (riskLevel === 'Medium') {
    recommendations.push({
      action: 'Standard Staffing Boost',
      priority: 'medium',
      details: ['+1 triage nurse (Evening shift)', 'Monitor respiratory cases', 'Prepare contingency protocols'],
    });

    recommendations.push({
      action: 'OPD Desk Support',
      priority: 'low',
      details: ['Add 1 registration desk staff', 'Extend evening hours'],
    });
  } else {
    recommendations.push({
      action: 'Normal Operations',
      priority: 'low',
      details: ['Standard staffing levels adequate', 'Routine monitoring', 'No additional actions needed'],
    });
  }

  return recommendations;
}
