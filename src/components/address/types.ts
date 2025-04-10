export interface AddressResult {
  id: string;
  place_name: string;
  center: [number, number];
  context?: Array<{
    id: string;
    text: string;
  }>;
}

export interface DeliveryAddress {
  id: string;
  address: string;
  coordinates: [number, number];
  isDefault: boolean;
  createdAt: string;
}