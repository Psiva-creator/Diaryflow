import type { FatRange, SNFRange, RateTable, RateTable2D } from '@/types'

/**
 * 1D Base rates (Fat only) used when SNF is disabled.
 */
export const BASE_FAT_RATES: RateTable = {
  '3.0-3.4': 32,
  '3.5-3.9': 35,
  '4.0-4.4': 38,
  '4.5-4.9': 42,
  '5.0+':    46,
}

/**
 * 2D Rate Table (Fat vs SNF) used when SNF is enabled.
 */
export const RATE_TABLE_2D: RateTable2D = {
  '3.0-3.4': { 'below 8': 30, '8-8.5': 32, 'above 8.5': 33 },
  '3.5-3.9': { 'below 8': 33, '8-8.5': 35, 'above 8.5': 36 },
  '4.0-4.4': { 'below 8': 36, '8-8.5': 38, 'above 8.5': 40 },
  '4.5-4.9': { 'below 8': 40, '8-8.5': 42, 'above 8.5': 44 },
  '5.0+':    { 'below 8': 44, '8-8.5': 46, 'above 8.5': 48 },
}

/**
 * Calculate the rate per litre based on fat%, water%, and optional snf%.
 * If snf is provided (> 0), uses the 2D table. 
 * Otherwise, uses the 1D base fat rates.
 * Finally applies the water deduction.
 */
export function calcRate(fat: number, water: number, snf?: number): number {
  let fatKey: FatRange
  if (fat < 3.5) fatKey = '3.0-3.4'
  else if (fat < 4.0) fatKey = '3.5-3.9'
  else if (fat < 4.5) fatKey = '4.0-4.4'
  else if (fat < 5.0) fatKey = '4.5-4.9'
  else fatKey = '5.0+'

  let baseRate = 0

  // Check if SNF should be used
  if (snf !== undefined && snf > 0) {
    let snfKey: SNFRange
    if (snf < 8) snfKey = 'below 8'
    else if (snf <= 8.5) snfKey = '8-8.5'
    else snfKey = 'above 8.5'
    baseRate = RATE_TABLE_2D[fatKey]?.[snfKey] ?? 38
  } else {
    baseRate = BASE_FAT_RATES[fatKey] ?? 38
  }
  
  // Deduct based on water percentage
  const multiplier = Math.max(0, 1 - (water / 100))
  const finalRate = baseRate * multiplier

  // Return rounded to 2 decimal places
  return Math.round(finalRate * 100) / 100
}
