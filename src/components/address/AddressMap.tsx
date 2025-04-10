import React from 'react';
import Map, { Marker } from 'react-map-gl';
import { MapPin } from 'lucide-react';
import { AddressResult } from './types';

interface Props {
  address: AddressResult;
}

export const AddressMap: React.FC<Props> = ({ address }) => {
  return (
    <div className="h-48 rounded-lg overflow-hidden">
      <Map
        initialViewState={{
          longitude: address.center[0],
          latitude: address.center[1],
          zoom: 15
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      >
        <Marker
          longitude={address.center[0]}
          latitude={address.center[1]}
        >
          <div className="p-2 rounded-full bg-purple-500">
            <MapPin className="w-4 h-4 text-white" />
          </div>
        </Marker>
      </Map>
    </div>
  );
};

export default AddressMap;