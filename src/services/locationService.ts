// src/services/locationService.ts
import { LocationData } from '../types';

/**
 * Query Nominatim to convert an area or PIN code to lat/lon.
 * Returns the first useful match.
 *
 * NOTE: Nominatim requires a User-Agent header for polite usage.
 */
export async function getLatLon(query: string): Promise<LocationData> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

  // Nominatim asks clients to include a valid User-Agent
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'hospital-surge-forecast-app/1.0 (your-email@example.com)',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed (status ${response.status})`);
  }

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error('Location not found');
  }

  // Use the top result
  const bestMatch = data[0];

  return {
    area: bestMatch.display_name,
    latitude: parseFloat(bestMatch.lat),
    longitude: parseFloat(bestMatch.lon),
  };
}
