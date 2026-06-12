export const EMISSION_FACTORS = {
  // Energy (kg CO2 per unit)
  electricity_kwh: 0.82, // kg CO2 / kWh
  electricity_cost_to_kwh: 8.0, // Avg cost of 1 kWh is ₹8.0
  ac_kwh_per_hour: 1.5, // 1.5 kW average AC consumption
  lpg_per_cylinder: 11.5, // kg CO2 / cylinder

  // Transport (kg CO2 per km)
  car_petrol: 0.21,
  car_diesel: 0.17,
  car_cng: 0.11,
  car_ev: 0.025,
  school_bus: 0.04, // per passenger-km
  auto_rickshaw: 0.08, // CNG
  metro_train: 0.03, // per passenger-km
  walk: 0.0,
};

export interface Neighborhood {
  id: string;
  name: string;
  cityId: string;
}

export interface City {
  id: string;
  name: string;
  neighborhoods: Neighborhood[];
}

export const CITIES: City[] = [
  {
    id: "mumbai",
    name: "Mumbai",
    neighborhoods: [
      { id: "mum_bandra", name: "Bandra", cityId: "mumbai" },
      { id: "mum_andheri", name: "Andheri", cityId: "mumbai" },
      { id: "mum_juhu", name: "Juhu", cityId: "mumbai" },
      { id: "mum_sobo", name: "South Mumbai", cityId: "mumbai" }
    ]
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    neighborhoods: [
      { id: "blr_indiranagar", name: "Indiranagar", cityId: "bengaluru" },
      { id: "blr_koramangala", name: "Koramangala", cityId: "bengaluru" },
      { id: "blr_jayanagar", name: "Jayanagar", cityId: "bengaluru" },
      { id: "blr_whitefield", name: "Whitefield", cityId: "bengaluru" }
    ]
  },
  {
    id: "delhi",
    name: "Delhi",
    neighborhoods: [
      { id: "del_gkii", name: "GK-II", cityId: "delhi" },
      { id: "del_vasantkunj", name: "Vasant Kunj", cityId: "delhi" },
      { id: "del_dwarka", name: "Dwarka", cityId: "delhi" },
      { id: "del_cp", name: "Connaught Place", cityId: "delhi" }
    ]
  },
  {
    id: "pune",
    name: "Pune",
    neighborhoods: [
      { id: "pune_kothrud", name: "Kothrud", cityId: "pune" },
      { id: "pune_baner", name: "Baner", cityId: "pune" },
      { id: "pune_koregaon", name: "Koregaon Park", cityId: "pune" },
      { id: "pune_aundh", name: "Aundh", cityId: "pune" }
    ]
  }
];

// Helper to look up neighborhood name by ID
export function getNeighborhoodName(id: string): string {
  for (const city of CITIES) {
    const found = city.neighborhoods.find(n => n.id === id);
    if (found) return `${found.name}, ${city.name}`;
  }
  if (id && id.startsWith('custom_')) {
    const parts = id.replace('custom_', '').split('_');
    const neighborhood = parts[0] ? decodeURIComponent(parts[0]) : '';
    const city = parts[1] ? decodeURIComponent(parts[1]) : '';
    return `${neighborhood}, ${city}`;
  }
  return "Unknown Neighborhood";
}
