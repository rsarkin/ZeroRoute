/**
 * Provides relatable equivalents for given CO2 values.
 * For example, converting kg CO2 saved into "smartphones charged" or "trees planted".
 */

export function getImpactEquivalents(co2Kg: number) {
  if (co2Kg === 0) {
    return {
      smartphones: 0,
      trees: 0,
      kmsDriven: 0
    };
  }

  // Equivalents based on EPA / generic estimations
  // 1 kg CO2 = ~122 smartphones charged
  // 1 tree absorbs ~21 kg CO2 per year
  // 1 kg CO2 = ~4 km driven by an average passenger vehicle

  return {
    smartphones: Math.round(co2Kg * 122),
    trees: Number((co2Kg / 21).toFixed(2)),
    kmsDriven: Math.round(co2Kg * 4)
  };
}
