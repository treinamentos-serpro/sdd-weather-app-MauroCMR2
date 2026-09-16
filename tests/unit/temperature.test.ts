import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/utils/temperature';

describe('temperature', () => {
  it('converte Celsius para Fahrenheit nos valores de referência', () => {
    expect(convertTemperature(0, 'celsius', 'fahrenheit')).toBe(32);
    expect(convertTemperature(100, 'celsius', 'fahrenheit')).toBe(212);
    expect(convertTemperature(-40, 'celsius', 'fahrenheit')).toBe(-40);
  });

  it('converte e arredonda de acordo com a unidade de destino', () => {
    expect(convertTemperature(20, 'celsius', 'celsius')).toBe(20);
    expect(convertTemperature(0, 'celsius', 'fahrenheit')).toBe(32);
    expect(convertTemperature(68, 'fahrenheit', 'celsius')).toBe(20);
    expect(convertTemperature(37, 'celsius', 'fahrenheit')).toBe(99);
    expect(convertTemperature(100, 'fahrenheit', 'celsius')).toBe(38);
  });

  it('formata com arredondamento e símbolo de grau', () => {
    expect(formatTemperature(20.4)).toBe('20°');
    expect(formatTemperature(20.5)).toBe('21°');
    expect(formatTemperature(-4.6)).toBe('-5°');
  });

  it('retorna o rótulo da unidade', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
