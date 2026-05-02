import { LightingFixture } from './types'

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function calcTotalWatts(fixtures: LightingFixture[]): number {
  return fixtures.reduce((sum, f) => sum + f.wattage * f.lampCount * f.totalFixture, 0)
}

export function formatWatts(w: number): string {
  return w >= 1000 ? `${(w / 1000).toFixed(1)} kW` : `${w} W`
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n)
}
