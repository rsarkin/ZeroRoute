'use client';

import React, { useState } from 'react';
import { CITIES, Neighborhood } from '../data/constants';

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

  const handleCityChange = (cityId: string) => {
    setActiveCityId(cityId);
    // Select first neighborhood of the new city automatically
    const firstNeighbourhood = CITIES.find(c => c.id === cityId)?.neighborhoods[0];
    if (firstNeighbourhood) {
      onSelect(cityId, firstNeighbourhood.id);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-[#e5e3df] rounded-xl bg-white shadow-xs">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Your City</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {CITIES.map(city => (
            <button
              key={city.id}
              type="button"
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
          {/* A simulated stylized map using SVG */}
          <svg viewBox="0 0 200 200" className="w-full h-full text-slate-300">
            {/* Grid Pattern */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Roads */}
            <path d="M 0 50 Q 80 40 200 60" fill="none" stroke="#e2e8f0" strokeWidth="12" />
            <path d="M 80 0 Q 110 90 60 200" fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <path d="M 0 140 H 200" fill="none" stroke="#e2e8f0" strokeWidth="6" />

            {/* River/Water body for Mumbai/Pune/etc. */}
            <path d="M -10 100 C 50 120 150 70 210 90 L 210 210 L -10 210 Z" fill="#bae6fd" opacity="0.4" />

            {/* Green parks */}
            <circle cx="150" cy="110" r="25" fill="#bbf7d0" opacity="0.6" />
            <circle cx="40" cy="40" r="15" fill="#bbf7d0" opacity="0.6" />

            {/* Neighborhood marker locations based on name length or hash */}
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
