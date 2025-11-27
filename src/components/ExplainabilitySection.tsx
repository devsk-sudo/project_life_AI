import { Lightbulb, AlertCircle } from 'lucide-react';
import { Explanation } from '../types';

interface ExplainabilitySectionProps {
  explanations: Explanation[] | null;
}

export function ExplainabilitySection({ explanations }: ExplainabilitySectionProps) {
  if (!explanations) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-orange-500 bg-orange-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-600 text-white';
      case 'medium':
        return 'bg-orange-600 text-white';
      case 'low':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-6 h-6 text-amber-600" />
        <h2 className="text-2xl font-bold text-gray-800">Why is this happening?</h2>
      </div>

      <div className="space-y-4">
        {explanations.map((exp, idx) => (
          <div key={idx} className={`rounded-lg border-l-4 p-4 ${getSeverityColor(exp.severity)}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{exp.reason}</h3>
                <p className="text-gray-700">{exp.impact}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${getSeverityBadgeColor(exp.severity)}`}>
                {exp.severity.charAt(0).toUpperCase() + exp.severity.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900">Analysis Basis</p>
          <p className="text-blue-800 text-sm mt-1">
            Surge predictions are based on environmental factors including air quality, weather conditions, and UV index levels.
            These factors correlate with respiratory issues, temperature-sensitive conditions, and disease prevalence.
          </p>
        </div>
      </div>
    </div>
  );
}
