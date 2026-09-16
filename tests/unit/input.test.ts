import { describe, expect, it } from 'vitest';
import { normalizeCityInput, validateCityInput } from '../../src/utils/input';

describe('input de cidade', () => {
  it('normaliza espaços nas extremidades e no interior', () => {
    expect(normalizeCityInput('  São   José  ')).toBe('São José');
  });

  it('aceita caracteres especiais comuns em nomes de cidades', () => {
    expect(validateCityInput("São José-dos-Campos d' Oeste")).toBeNull();
  });

  it.each(['', '   '])('rejeita entrada vazia: %j', (value) => {
    expect(validateCityInput(value)).toBe('Informe o nome de uma cidade.');
  });
});
