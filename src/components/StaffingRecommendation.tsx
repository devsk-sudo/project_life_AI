import { Users, CheckCircle, AlertCircle } from 'lucide-react';
import { StaffingRecommendation } from '../types';

interface StaffingRecommendationProps {
  recommendations: StaffingRecommendation[] | null;
}

export function StaffingRecommendationSection({ recommendations }: StaffingRecommendationProps) {
  if (!recommendations) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-600';
      case 'medium':
        return 'border-orange-600';
      case 'low':
        return 'border-green-600';
      default:
        return 'border-gray-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-800">Staffing Recommendations</h2>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, idx) => (
          <div key={idx} className={`border-l-4 rounded-lg p-5 bg-white shadow-md ${getPriorityBorderColor(rec.priority)}`}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">{rec.action}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getPriorityColor(rec.priority)}`}>
                {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
              </span>
            </div>

            <div className="space-y-2">
              {rec.details.map((detail, detailIdx) => (
                <div key={detailIdx} className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 border-l-4 border-indigo-600">
        <div className="flex gap-3">
          <AlertCircle className="w-6 h-6 text-indigo-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-indigo-900 mb-2">Next Steps</p>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>1. Brief all department heads on surge predictions</li>
              <li>2. Confirm staffing availability for recommended shifts</li>
              <li>3. Monitor predictions hourly as conditions change</li>
              <li>4. Prepare contingency protocols if risk escalates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
