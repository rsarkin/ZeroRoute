'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CITIES, Neighborhood, getNeighborhoodName } from '../data/constants';

interface MockMapPickerProps {
  selectedCityId: string;
  selectedNeighbourhoodId: string;
  onSelect: (cityId: string, neighbourhoodId: string) => void;
}

export const MockMapPicker: React.FC<MockMapPickerProps> = ({
  selectedCityId,
  selectedNeighbourhoodId,
  onSelect
}) => {
  const [activeCityId, setActiveCityId] = useState<string>(selectedCityId || CITIES[0].id);
  const activeCity = CITIES.find(c => c.id === activeCityId) || CITIES[0];

  // Google Maps JS API dynamic loader state
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [googleMap, setGoogleMap] = useState<any>(null);
  const [googleMarker, setGoogleMarker] = useState<any>(null);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!googleMapsApiKey) return;

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const handleLoad = () => {
      setIsScriptLoaded(true);
    };

    if (script) {
      if ((window as any).google) {
        setIsScriptLoaded(true);
      } else {
        script.addEventListener('load', handleLoad);
      }
      return;
    }

    script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', () => setLoadError(true));
    document.head.appendChild(script);
  }, [googleMapsApiKey]);

  const handleLocationSelect = (lat: number, lng: number, placeName?: string) => {
    if (!(window as any).google) return;
    const google = (window as any).google;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      let resolvedLocality = placeName || '';
      let resolvedCity = '';

      if (status === 'OK' && results && results[0]) {
        const components = results[0].address_components;
        components.forEach((comp: any) => {
          if (comp.types.includes('sublocality') || comp.types.includes('neighborhood')) {
            if (!resolvedLocality) resolvedLocality = comp.long_name;
          }
          if (comp.types.includes('locality')) {
            resolvedCity = comp.long_name;
            if (!resolvedLocality) resolvedLocality = comp.long_name;
          }
        });
      }

      // Fallbacks if geocoding yields limited results
      resolvedCity = resolvedCity || (activeCityId === 'pune' ? 'Pune' : 'Mumbai');
      resolvedLocality = resolvedLocality || `Area at Lat ${lat.toFixed(2)}`;

      // Match against predefined cohorts or generate custom IDs
      const rawCity = resolvedCity.toLowerCase().trim();
      const rawLocality = resolvedLocality.trim();

      const matchedCity = CITIES.find(c => c.name.toLowerCase() === rawCity || c.id === rawCity);
      let targetCityId = '';
      let targetNeighbourhoodId = '';

      if (matchedCity) {
        targetCityId = matchedCity.id;
        const matchedNeighbourhood = matchedCity.neighborhoods.find(
          n => n.name.toLowerCase() === rawLocality.toLowerCase() || n.id === rawLocality.toLowerCase()
        );
        if (matchedNeighbourhood) {
          targetNeighbourhoodId = matchedNeighbourhood.id;
        } else {
          targetNeighbourhoodId = `custom_${encodeURIComponent(rawLocality)}_${encodeURIComponent(matchedCity.name)}`;
        }
      } else {
        targetCityId = `custom_${encodeURIComponent(rawCity)}`;
        targetNeighbourhoodId = `custom_${encodeURIComponent(rawLocality)}_${encodeURIComponent(resolvedCity)}`;
      }

      onSelect(targetCityId, targetNeighbourhoodId);
    });
  };

  // Setup Google Map instance
  useEffect(() => {
    if (!isScriptLoaded || !mapContainerRef.current || !(window as any).google) return;
    const google = (window as any).google;

    // Default Centers
    const center = selectedCityId === 'pune'
      ? { lat: 18.5204, lng: 73.8567 }
      : { lat: 19.0760, lng: 72.8777 };

    const mapInstance = new google.maps.Map(mapContainerRef.current, {
      center,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      styles: [
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.fill',
          stylers: [{ color: '#ffffff' }, { lightness: 17 }]
        }
      ]
    });

    const markerInstance = new google.maps.Marker({
      position: center,
      map: mapInstance,
      draggable: true,
      animation: google.maps.Animation.DROP
    });

    setGoogleMap(mapInstance);
    setGoogleMarker(markerInstance);

    // Map Click Handler
    mapInstance.addListener('click', (e: any) => {
      if (e.latLng) {
        markerInstance.setPosition(e.latLng);
        handleLocationSelect(e.latLng.lat(), e.latLng.lng());
      }
    });

    // Marker Drag Handler
    markerInstance.addListener('dragend', () => {
      const pos = markerInstance.getPosition();
      if (pos) {
        handleLocationSelect(pos.lat(), pos.lng());
      }
    });

    // Places Autocomplete Search Box
    if (searchInputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['geocode'],
        componentRestrictions: { country: 'in' }
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const loc = place.geometry.location;
          mapInstance.setCenter(loc);
          mapInstance.setZoom(15);
          markerInstance.setPosition(loc);
          
          let extractedNeighbourhood = '';
          let extractedCity = '';
          
          if (place.address_components) {
            place.address_components.forEach((comp: any) => {
              if (comp.types.includes('sublocality') || comp.types.includes('neighborhood')) {
                extractedNeighbourhood = comp.long_name;
              }
              if (comp.types.includes('locality')) {
                extractedCity = comp.long_name;
              }
            });
          }

          const resolvedName = extractedNeighbourhood || place.name || 'Selected Place';
          handleLocationSelect(loc.lat(), loc.lng(), resolvedName);
        }
      });
    }

  }, [isScriptLoaded]);

  // Sync Map center on city selection changes
  useEffect(() => {
    if (googleMap && googleMarker && (window as any).google) {
      const google = (window as any).google;
      const center = selectedCityId === 'pune'
        ? { lat: 18.5204, lng: 73.8567 }
        : { lat: 19.0760, lng: 72.8777 };
      googleMap.setCenter(center);
      googleMap.setZoom(12);
      googleMarker.setPosition(center);
    }
  }, [selectedCityId]);

  const handleCityChange = (cityId: string) => {
    setActiveCityId(cityId);
    const firstNeighbourhood = CITIES.find(c => c.id === cityId)?.neighborhoods[0];
    if (firstNeighbourhood) {
      onSelect(cityId, firstNeighbourhood.id);
    }
  };

  // Check if Google Maps rendering should be activated
  const useRealGoogleMaps = !!googleMapsApiKey && !loadError;

  if (useRealGoogleMaps) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-[#e5e3df] rounded-xl bg-white shadow-xs">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Primary City</label>
            <div className="grid grid-cols-2 gap-2">
              {CITIES.map(city => (
                <button
                  key={city.id}
                  type="button"
                  aria-label={`Select city ${city.name}`}
                  onClick={() => handleCityChange(city.id)}
                  className={`py-3 px-4 rounded-lg text-sm font-semibold border text-center transition-all ${
                    selectedCityId === city.id || activeCityId === city.id
                      ? 'border-primary bg-card-tint-lavender text-primary-deep shadow-xs'
                      : 'border-[#e5e3df] hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="address-search" className="block text-sm font-semibold text-slate-700 mb-2">Search Location / Neighbourhood</label>
            <input
              ref={searchInputRef}
              id="address-search"
              type="text"
              className="w-full notion-input text-sm"
              placeholder="e.g., Bandra West, Koregaon Park..."
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-semibold uppercase block">Selected Locality:</span>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {getNeighborhoodName(selectedNeighbourhoodId)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center border border-[#ede9e4] rounded-lg bg-slate-50 p-4 min-h-64">
          <span className="text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Interactive Google Map</span>
          <div ref={mapContainerRef} className="w-full aspect-square max-h-64 bg-slate-200 border border-[#e5e3df] rounded-lg overflow-hidden relative" />
          <p className="text-xs text-slate-500 mt-3 text-center">
            Drag the pin or click on the map to pinpoint your exact neighborhood.
          </p>
        </div>
      </div>
    );
  }

  // Fallback SVG Map Render (Zero-Setup Simulated UI)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-[#e5e3df] rounded-xl bg-white shadow-xs">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Your City</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {CITIES.map(city => (
            <button
              key={city.id}
              type="button"
              aria-label={`Select city ${city.name}`}
              onClick={() => handleCityChange(city.id)}
              className={`py-3 px-4 rounded-lg text-sm font-semibold border text-center transition-all ${
                activeCityId === city.id
                  ? 'border-primary bg-card-tint-lavender text-primary-deep shadow-xs'
                  : 'border-[#e5e3df] hover:bg-slate-50 text-slate-700'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>

        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Your Neighborhood</label>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {activeCity.neighborhoods.map((n: Neighborhood) => (
            <button
              key={n.id}
              type="button"
              aria-label={`Select neighborhood ${n.name}`}
              onClick={() => onSelect(activeCityId, n.id)}
              className={`w-full text-left py-3 px-4 rounded-lg text-sm font-medium border transition-all flex justify-between items-center ${
                selectedNeighbourhoodId === n.id
                  ? 'border-primary bg-primary/5 text-primary-deep font-semibold'
                  : 'border-[#e5e3df] hover:bg-slate-50 text-slate-600'
              }`}
            >
              <span>{n.name}</span>
              {selectedNeighbourhoodId === n.id && (
                <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-bold">Selected</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center border border-[#ede9e4] rounded-lg bg-slate-50 p-4 min-h-64">
        <span className="text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Interactive Neighborhood Map</span>
        <div className="w-full aspect-square max-h-64 bg-slate-100 border border-[#e5e3df] rounded-lg overflow-hidden relative">
          <svg viewBox="0 0 200 200" className="w-full h-full text-slate-300">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            <path d="M 0 50 Q 80 40 200 60" fill="none" stroke="#e2e8f0" strokeWidth="12" />
            <path d="M 80 0 Q 110 90 60 200" fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <path d="M 0 140 H 200" fill="none" stroke="#e2e8f0" strokeWidth="6" />

            <path d="M -10 100 C 50 120 150 70 210 90 L 210 210 L -10 210 Z" fill="#bae6fd" opacity="0.4" />

            <circle cx="150" cy="110" r="25" fill="#bbf7d0" opacity="0.6" />
            <circle cx="40" cy="40" r="15" fill="#bbf7d0" opacity="0.6" />

            {activeCity.neighborhoods.map((n, idx) => {
              const x = 40 + (idx * 45) % 130;
              const y = 50 + (idx * 55) % 120;
              const isSelected = selectedNeighbourhoodId === n.id;
              return (
                <g key={n.id} className="cursor-pointer" onClick={() => onSelect(activeCityId, n.id)}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 10 : 6}
                    fill={isSelected ? '#5645d4' : '#94a3b8'}
                    className="transition-all duration-300"
                  />
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill="none"
                      stroke="#5645d4"
                      strokeWidth="2"
                      className="animate-ping"
                      style={{ transformOrigin: `${x}px ${y}px` }}
                    />
                  )}
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    fill={isSelected ? '#1e1b4b' : '#64748b'}
                    className="select-none bg-white font-sans"
                  >
                    {n.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <p className="text-xs text-slate-500 mt-3 text-center">
          Showing local grid for <span className="font-semibold text-slate-800">{activeCity.name}</span>. Click on map markers or list to update location.
        </p>
      </div>
    </div>
  );
};
