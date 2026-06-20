const fs = require('fs');

let content = fs.readFileSync('components/MockMapPicker.tsx', 'utf-8');

const interfaces = `
export interface GoogleMapsAPI {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMapInstance;
    Marker: new (options: Record<string, unknown>) => GoogleMarkerInstance;
    Geocoder: new () => GoogleGeocoderInstance;
    Animation: { DROP: number };
    event: {
      addListener: (instance: unknown, eventName: string, handler: (e: { latLng: { lat: () => number; lng: () => number } }) => void) => void;
      clearInstanceListeners: (instance: unknown) => void;
    };
    places: {
      Autocomplete: new (input: HTMLInputElement, options: Record<string, unknown>) => GoogleAutocompleteInstance;
    };
  };
}

export interface GoogleMapInstance {
  setCenter: (latLng: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  panTo: (latLng: { lat: number; lng: number }) => void;
}

export interface GoogleMarkerInstance {
  setPosition: (latLng: { lat: number; lng: number }) => void;
  setMap: (map: GoogleMapInstance | null) => void;
}

export interface GoogleGeocoderInstance {
  geocode: (
    request: { location: { lat: number; lng: number } },
    callback: (
      results: Array<{ formatted_address: string; address_components: Array<{ types: string[]; short_name: string }> }>,
      status: string
    ) => void
  ) => void;
}

export interface GoogleAutocompleteInstance {
  addListener: (eventName: string, handler: () => void) => void;
  getPlace: () => {
    geometry?: {
      location: { lat: () => number; lng: () => number };
    };
    name?: string;
  };
}
`;

content = content.replace(
  "import { CITIES, Neighborhood, getNeighborhoodName } from '../data/constants';",
  "import { CITIES, Neighborhood, getNeighborhoodName } from '../data/constants';\n" + interfaces
);

content = content.replace(
  'const [googleMap, setGoogleMap] = useState<unknown>(null);',
  'const [googleMap, setGoogleMap] = useState<GoogleMapInstance | null>(null);'
);
content = content.replace(
  'const [googleMarker, setGoogleMarker] = useState<unknown>(null);',
  'const [googleMarker, setGoogleMarker] = useState<GoogleMarkerInstance | null>(null);'
);

content = content.replace(
  /const \{ Geocoder \} = \(window as unknown as \{ google: \{ maps: \{ Geocoder: new \(\) => unknown \} \} \}\)[\s\S]*?\.google\.maps;/g,
  'const { Geocoder } = (window as unknown as { google: GoogleMapsAPI }).google.maps;'
);

content = content.replace(
  /const google = \(window as unknown as \{ google: \{ maps: \{ Map: new \(el: unknown, opt: unknown\) => unknown; Marker: new \(opt: unknown\) => unknown \} \} \}\)\.google;/g,
  'const google = (window as unknown as { google: GoogleMapsAPI }).google;'
);

// Fix `geocoder` cast
content = content.replace(
  'const geocoder = new Geocoder();',
  'const geocoder = new Geocoder() as GoogleGeocoderInstance;'
);

// Fix mapInstance and markerInstance casts
content = content.replace(
  'const mapInstance = new google.maps.Map(mapRef.current, {',
  'const mapInstance = new google.maps.Map(mapRef.current, {}) as GoogleMapInstance; //'
);

fs.writeFileSync('components/MockMapPicker.tsx', content);
