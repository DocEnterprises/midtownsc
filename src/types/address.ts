export interface AddressResult {
  id: string;
  place_name: string;
  center: [number, number];
  context: Array<{
    id: string;
    text: string;
  }>;
}

export interface AddressSearchResponse {
  type: string;
  features: Array<{
    id: string;
    place_name: string;
    center: [number, number];
    context: Array<{
      id: string;
      text: string;
    }>;
  }>;
}