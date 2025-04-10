import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, Clock } from 'lucide-react';
import Map, { Marker } from 'react-map-gl';
import { useStore } from '../../store/useStore';

interface DeliveryTrackerProps {
  order: {
    id: string;
    status: string;
    deliveryAddress: string;
    trackingInfo?: {
      location: {
        lat: number;
        lng: number;
      };
      estimatedDelivery: string;
    };
  };
}

const CHELSEA_COORDINATES = [-74.0014, 40.7465];

const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({ order }) => {
  const [showMap, setShowMap] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useStore();

  const isAdmin = user?.email === 'admin@skyclub.com';
  const driverLocation = isAdmin ? {
    lat: 40.7475,
    lng: -74.0014
  } : order.trackingInfo?.location;

  useEffect(() => {
    if (isAdmin) {
      setShowMap(true);
      setProgress(80);
    } else if (driverLocation) {
      const isNearby = Math.abs(driverLocation.lat - 40.7465) < 0.01 &&
                      Math.abs(driverLocation.lng - (-74.0014)) < 0.01;
      setShowMap(isNearby);
      setProgress(isNearby ? 80 : 50);
    }
  }, [isAdmin, driverLocation]);

  return (
    <div className="glass p-6 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-purple-400" />
          <span className="font-medium">Order #{order.id}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>ETA: {isAdmin ? '5 minutes away' : order.trackingInfo?.estimatedDelivery}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm">
        <MapPin className="w-4 h-4 text-purple-400" />
        <span>{order.deliveryAddress}</span>
      </div>

      {showMap ? (
        <div className="h-[300px] rounded-lg overflow-hidden">
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
            {/* Delivery Location Marker */}
            <Marker
              longitude={CHELSEA_COORDINATES[0]}
              latitude={CHELSEA_COORDINATES[1]}
            >
              <div className="p-2 rounded-full bg-purple-500">
                <MapPin className="w-4 h-4 text-white" />
              </div>
            </Marker>

            {/* Driver Location Marker */}
            {driverLocation && (
              <Marker
                longitude={driverLocation.lng}
                latitude={driverLocation.lat}
              >
                <div className="p-2 rounded-full bg-blue-500 animate-pulse">
                  <Package className="w-4 h-4 text-white" />
                </div>
              </Marker>
            )}
          </Map>
        </div>
      ) : (
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="absolute h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </div>
  );
};

export default DeliveryTracker;