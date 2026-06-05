import { describe, it, expect } from 'vitest'
import { calcRate } from '@/lib/rateCalculator'

describe('calcRate – Dual Mode Calculation (Fat+SNF vs Fat Only)', () => {
  // ── Fat Only (1D Table) + Water Deduction ─────────────────────────────────
  describe('Mode: SNF Disabled (Fat Only)', () => {
    it('returns 1D base rate for fat 4.2 (38) and 0% water', () => {
      expect(calcRate(4.2, 0)).toBe(38)
    })

    it('deducts 10% for fat 4.2 and 10% water (38 * 0.9 = 34.2)', () => {
      expect(calcRate(4.2, 10)).toBe(34.2)
    })

    it('handles low fat (3.2 -> 32 base) with water', () => {
      expect(calcRate(3.2, 20)).toBe(25.6) // 32 * 0.8
    })

    it('handles high fat (5.5 -> 46 base) with water', () => {
      expect(calcRate(5.5, 5)).toBe(43.7) // 46 * 0.95
    })
  })

  // ── Fat + SNF (2D Table) + Water Deduction ────────────────────────────────
  describe('Mode: SNF Enabled (Fat + SNF Table)', () => {
    it('returns 2D base rate for fat 4.2, snf 8.2 (38) and 0% water', () => {
      expect(calcRate(4.2, 0, 8.2)).toBe(38)
    })

    it('returns 2D base rate for fat 4.2, low snf 7.5 (36) and 0% water', () => {
      expect(calcRate(4.2, 0, 7.5)).toBe(36)
    })

    it('returns 2D base rate for fat 4.2, high snf 9.0 (40) and 0% water', () => {
      expect(calcRate(4.2, 0, 9.0)).toBe(40)
    })

    it('deducts 10% from 2D base rate (fat 4.2, snf 9.0 -> 40 base)', () => {
      expect(calcRate(4.2, 10, 9.0)).toBe(36) // 40 * 0.9
    })
    
    it('handles low fat and low snf (fat 3.2, snf 7.0 -> 30 base) with water', () => {
      expect(calcRate(3.2, 50, 7.0)).toBe(15) // 30 * 0.5
    })
  })

  // ── Edge Cases ────────────────────────────────────────────────────────────
  describe('Edge Cases', () => {
    it('returns 0 for 100% water regardless of mode', () => {
      expect(calcRate(4.2, 100)).toBe(0)
      expect(calcRate(4.2, 100, 8.5)).toBe(0)
    })

    it('ignores snf if it is passed as 0 or undefined', () => {
      expect(calcRate(4.2, 0, 0)).toBe(38) // Fallback to 1D table base
      expect(calcRate(4.2, 0, undefined)).toBe(38)
    })
  })
})
