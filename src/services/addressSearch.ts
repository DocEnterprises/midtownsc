import { AddressResult, AddressSearchResponse } from '../types/address';

const NYC_BOROUGHS = ['New York City', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island', 'Manhattan'];
const NYC_BBOX = '-74.2591,40.4774,-73.7002,40.9176';

export async function searchAddress(query: string): Promise<AddressResult[]> {
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  
  if (!mapboxToken) {
    throw new Error('Mapbox token is not configured');
  }

  if (!query.trim()) {
    return [];
  }

  const url = new URL('https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(query) + '.json');
  url.searchParams.append('access_token', mapboxToken);
  url.searchParams.append('country', 'us');
  url.searchParams.append('types', 'address');
  url.searchParams.append('bbox', NYC_BBOX);
  url.searchParams.append('limit', '5');

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json() as AddressSearchResponse;

    if (!data.features || !Array.isArray(data.features)) {
      throw new Error('Invalid response format');
    }

    return data.features.filter(feature => {
      const context = feature.context || [];
      return context.some(ctx => NYC_BOROUGHS.includes(ctx.text));
    });
  } catch (error) {
    console.error('Address search error:', error);
    throw error;
  }
}