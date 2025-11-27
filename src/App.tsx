import { useState } from 'react';
import { Header } from './components/Header';
import { LocationInput } from './components/LocationInput';
import { EnvironmentalDataSection } from './components/EnvironmentalData';
import { SurgeChart } from './components/SurgeChart';
import { ExplainabilitySection } from './components/ExplainabilitySection';
import { StaffingRecommendationSection } from './components/StaffingRecommendation';
import { LocationData, EnvironmentalData, SurgeChartData, Explanation, StaffingRecommendation } from './types';
import { fetchEnvironmentData } from './services/weatherService';
import { predictSurge, explainPrediction, recommendStaffing } from './services/predictionService';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData | null>(null);
  const [surgeChartData, setSurgeChartData] = useState<SurgeChartData[] | null>(null);
  const [expectedLoad, setExpectedLoad] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Medium' | 'High' | null>(null);
  const [explanations, setExplanations] = useState<Explanation[] | null>(null);
  const [recommendations, setRecommendations] = useState<StaffingRecommendation[] | null>(null);

  const handleLocationSubmit = async (selectedLocation: LocationData) => {
    setIsLoading(true);

    const envData = await fetchEnvironmentData(selectedLocation.latitude, selectedLocation.longitude);
    setEnvironmentalData(envData);
    setLocation(selectedLocation);

    const { chartData, expectedLoad: load, riskLevel: risk } = predictSurge(envData);
    setSurgeChartData(chartData);
    setExpectedLoad(load);
    setRiskLevel(risk);

    const expl = explainPrediction(envData, risk);
    setExplanations(expl);

    const staffRec = recommendStaffing(risk, load);
    setRecommendations(staffRec);

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <LocationInput onLocationSubmit={handleLocationSubmit} isLoading={isLoading} />

      {location && (
        <>
          <div className="max-w-6xl mx-auto px-6 py-4">
            <p className="text-gray-700 text-sm">
              <strong>Location:</strong> {location.area} (Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)})
            </p>
          </div>

          <EnvironmentalDataSection data={environmentalData} />
          <SurgeChart data={surgeChartData} expectedLoad={expectedLoad} riskLevel={riskLevel} />
          <ExplainabilitySection explanations={explanations} />
          <StaffingRecommendationSection recommendations={recommendations} />

          <div className="max-w-6xl mx-auto px-6 py-12 text-center">
            <p className="text-gray-600 text-sm">
              Last updated: {new Date().toLocaleTimeString()} | Data is simulated for demonstration purposes
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
