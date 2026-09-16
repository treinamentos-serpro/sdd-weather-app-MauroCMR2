import { describe, expect, it } from 'vitest';
import { getWeatherCondition, getWeatherIcon } from '../../src/utils/weatherCodes';

describe('weatherCodes', () => {
  it('mapeia um código conhecido para condição e ícone', () => {
    expect(getWeatherCondition(0)).toBe('Céu limpo');
    expect(getWeatherIcon(0)).toBe('☀️');
  });

  it('usa fallback para código desconhecido', () => {
    expect(getWeatherCondition(123456)).toBe('Condição desconhecida');
    expect(getWeatherIcon(123456)).toBe('🌡️');
  });
});
