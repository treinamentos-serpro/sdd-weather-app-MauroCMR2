import { describe, expect, it } from 'vitest';
import { getDayLabel, getShortDate } from '../../src/utils/format';

describe('format', () => {
  it('rotula o primeiro e o segundo dia', () => {
    expect(getDayLabel('2026-06-16', 0)).toBe('Hoje');
    expect(getDayLabel('2026-06-17', 1)).toBe('Amanhã');
  });

  it('usa o dia da semana para os demais índices', () => {
    expect(getDayLabel('2026-06-18', 2)).toBe('Qui');
  });

  it('formata a data curta', () => {
    expect(getShortDate('2026-06-16')).toBe('16 Jun');
  });
});
