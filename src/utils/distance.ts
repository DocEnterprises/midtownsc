import * as turf from '@turf/turf';

export const calculateDistance = (
  driverLat: number,
  driverLng: number,
  deliveryAddress: string,
  isAdmin: boolean = false
): number => {
  // For admin testing, always return distance less than 1 mile
  if (isAdmin) {
    return 0.5;
  }
  
  // For regular users, simulate normal delivery distance
  const timestamp = Date.now();
  const maxDistance = 5; // 5 miles max delivery radius
  const progress = (timestamp % 300000) / 300000; // 5 minutes cycle
  return maxDistance * (1 - progress);
};