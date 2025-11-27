// src/components/LocationInput.tsx
import { useState } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { LocationData } from '../types';
import { getLatLon } from '../services/locationService';

interface LocationInputProps {
  onLocationSubmit: (location: LocationData) => void;
  isLoading: boolean;
}

export function LocationInput({ onLocationSubmit, isLoading }: LocationInputProps) {
  const [input, setInput] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!input.trim()) return;

    try {
      setLocalLoading(true);
      const location = await getLatLon(input);
      onLocationSubmit(location);
    } catch (err: any) {
      console.error('Geocoding error:', err);
      setError(err?.message || 'Failed to find location');
    } finally {
      setLocalLoading(false);
    }
  };

  const disabled = isLoading || localLoading;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Select Location</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter area name or PIN code (e.g., Koramangala, 560034)"
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
            disabled={disabled}
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2"
          >
            {disabled ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Predicting...
              </>
            ) : (
              'Predict'
            )}
          </button>
        </form>

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

        <p className="text-gray-600 text-sm mt-3">Try: Koramangala Bangalore, Goregaon, or a PIN like 560034</p>
      </div>
    </div>
  );
}
