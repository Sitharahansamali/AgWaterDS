/**
 * Official administrative units of Nigeria (ADM1 level: 36 States + Federal Capital Territory)
 * Prepared for the AgWaterDS database administrative units structure.
 */

export const NIGERIA_ADMIN_UNITS = [
  { id: 'NG001', name: 'Abia', country: 'Nigeria', code: 'NGA' },
  { id: 'NG002', name: 'Adamawa', country: 'Nigeria', code: 'NGA' },
  { id: 'NG003', name: 'Akwa Ibom', country: 'Nigeria', code: 'NGA' },
  { id: 'NG004', name: 'Anambra', country: 'Nigeria', code: 'NGA' },
  { id: 'NG005', name: 'Bauchi', country: 'Nigeria', code: 'NGA' },
  { id: 'NG006', name: 'Bayelsa', country: 'Nigeria', code: 'NGA' },
  { id: 'NG007', name: 'Benue', country: 'Nigeria', code: 'NGA' },
  { id: 'NG008', name: 'Borno', country: 'Nigeria', code: 'NGA' },
  { id: 'NG009', name: 'Cross River', country: 'Nigeria', code: 'NGA' },
  { id: 'NG010', name: 'Delta', country: 'Nigeria', code: 'NGA' },
  { id: 'NG011', name: 'Ebonyi', country: 'Nigeria', code: 'NGA' },
  { id: 'NG012', name: 'Edo', country: 'Nigeria', code: 'NGA' },
  { id: 'NG013', name: 'Ekiti', country: 'Nigeria', code: 'NGA' },
  { id: 'NG014', name: 'Enugu', country: 'Nigeria', code: 'NGA' },
  { id: 'NG015', name: 'Federal Capital Territory', country: 'Nigeria', code: 'NGA' },
  { id: 'NG016', name: 'Gombe', country: 'Nigeria', code: 'NGA' },
  { id: 'NG017', name: 'Imo', country: 'Nigeria', code: 'NGA' },
  { id: 'NG018', name: 'Jigawa', country: 'Nigeria', code: 'NGA' },
  { id: 'NG019', name: 'Kaduna', country: 'Nigeria', code: 'NGA' },
  { id: 'NG020', name: 'Kano', country: 'Nigeria', code: 'NGA' },
  { id: 'NG021', name: 'Katsina', country: 'Nigeria', code: 'NGA' },
  { id: 'NG022', name: 'Kebbi', country: 'Nigeria', code: 'NGA' },
  { id: 'NG023', name: 'Kogi', country: 'Nigeria', code: 'NGA' },
  { id: 'NG024', name: 'Kwara', country: 'Nigeria', code: 'NGA' },
  { id: 'NG025', name: 'Lagos', country: 'Nigeria', code: 'NGA' },
  { id: 'NG026', name: 'Nasarawa', country: 'Nigeria', code: 'NGA' },
  { id: 'NG027', name: 'Niger', country: 'Nigeria', code: 'NGA' },
  { id: 'NG028', name: 'Ogun', country: 'Nigeria', code: 'NGA' },
  { id: 'NG029', name: 'Ondo', country: 'Nigeria', code: 'NGA' },
  { id: 'NG030', name: 'Osun', country: 'Nigeria', code: 'NGA' },
  { id: 'NG031', name: 'Oyo', country: 'Nigeria', code: 'NGA' },
  { id: 'NG032', name: 'Plateau', country: 'Nigeria', code: 'NGA' },
  { id: 'NG033', name: 'Rivers', country: 'Nigeria', code: 'NGA' },
  { id: 'NG034', name: 'Sokoto', country: 'Nigeria', code: 'NGA' },
  { id: 'NG035', name: 'Taraba', country: 'Nigeria', code: 'NGA' },
  { id: 'NG036', name: 'Yobe', country: 'Nigeria', code: 'NGA' },
  { id: 'NG037', name: 'Zamfara', country: 'Nigeria', code: 'NGA' },
]

export const INDICATOR_DEFINITIONS = [
  {
    id: 'evapotranspiration',
    name: 'Evapotranspiration',
    code: 'ET',
    unit: 'mm/day',
    description: 'Actual and reference atmospheric water loss from vegetated soil and plant surfaces.',
  },
  {
    id: 'soil_moisture',
    name: 'Soil Moisture',
    code: 'SM',
    unit: '% volumetric',
    description: 'Root-zone soil volumetric water content available for agricultural vegetation.',
  },
  {
    id: 'water_balance',
    name: 'Water Balance',
    code: 'WB',
    unit: 'mm',
    description: 'Hydrological relationship between water supply, agricultural demand, and net deficit.',
    metrics: [
      { id: 'water_supply', label: 'Water Supply', description: 'Available hydrological water inflow' },
      { id: 'water_demand', label: 'Water Demand', description: 'Agricultural crop water requirement' },
      { id: 'water_deficit', label: 'Water Deficit', description: 'Net moisture deficit or shortfall' },
    ],
  },
  {
    id: 'crop_water_demand',
    name: 'Crop Water Demand',
    code: 'CWD',
    unit: 'mm',
    description: 'Total theoretical depth of irrigation water required to sustain target agricultural crops.',
  },
]

