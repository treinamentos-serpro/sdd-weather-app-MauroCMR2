import type { TemperatureUnit } from '../types/weather';

export function convertTemperature(
  value: number,
  from: TemperatureUnit,
  to: TemperatureUnit,
): number {
  if (from === to) {
    return Math.round(value);
  }

  const converted = from === 'celsius' ? value * (9 / 5) + 32 : (value - 32) * (5 / 9);
  return Math.round(converted);
}

export function formatTemperature(value: number): string {
  return `${Math.round(value)}°`;
}

export function unitLabel(unit: TemperatureUnit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}
