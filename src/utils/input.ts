export function normalizeCityInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

export function validateCityInput(input: string): string | null {
  const normalized = normalizeCityInput(input);

  if (!normalized) {
    return 'Informe o nome de uma cidade.';
  }

  if (normalized.length > 100) {
    return 'O nome da cidade deve ter no máximo 100 caracteres.';
  }

  if (/\p{C}/u.test(normalized)) {
    return 'Use apenas caracteres válidos no nome da cidade.';
  }

  return null;
}
