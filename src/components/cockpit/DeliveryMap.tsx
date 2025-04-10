import React from 'react';
import Map, { Marker } from 'react-map-gl';
import { Package, MapPin } from 'lucide-react';
import * as turf from '@turf/turf';

const CHELSEA_COORDINATES = [-74.0014, 40.7465];
const NYC_BOUNDS = [
  [-74.2591, 40.4774], // SW coords
  [-73.7002, 40.9176]  // NE coords
];

interface Props {
  driverLocation?: {
    lat: number;
    lng: number;
  };
  deliveryAddress: string;
  isAdmin?: boolean;
}

const DeliveryMap: React.FC<Props> = ({ driverLocation, deliveryAddress, isAdmin }) => {
  // For admin testing, use simulated coordinates near Chelsea
  const testDeliveryLocation = {
    lat: 40.7475, // Slightly north of Chelsea
    lng: -74.0014
  };

  const deliveryCoords = isAdmin ? testDeliveryLocation : {
    lat: 40.7128, // Default to NYC coordinates
    lng: -74.0060
  };

  return (
    <Map
      initialViewState={{
        longitude: CHELSEA_COORDINATES[0],
        latitude: CHELSEA_COORDINATES[1],
        zoom: 14
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
    >
      {/* Driver Marker */}
      {driverLocation && (
        <Marker
          longitude={driverLocation.lng}
          latitude={driverLocation.lat}
        >
          <div className="bg-purple-500 p-2 rounded-full animate-pulse">
            <Package className="w-4 h-4 text-white" />
          </div>
        </Marker>
      )}

      {/* Delivery Location Marker */}
      <Marker
        longitude={deliveryCoords.lng}
        latitude={deliveryCoords.lat}
      >
        <div className="bg-green-500 p-2 rounded-full">
          <MapPin className="w-4 h-4 text-white" />
        </div>
      </Marker>
    </Map>
  );
};

export default DeliveryMap;