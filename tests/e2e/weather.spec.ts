import { expect, test } from '@playwright/test';

const city = {
  id: 1,
  name: 'São Paulo',
  country: 'Brasil',
  admin1: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
  timezone: 'America/Sao_Paulo',
};

const forecast = {
  timezone: 'America/Sao_Paulo',
  current: {
    time: '2026-09-16T12:00',
    temperature_2m: 18,
    relative_humidity_2m: 70,
    precipitation: 0,
    wind_speed_10m: 12,
    pressure_msl: 1015,
    weather_code: 0,
  },
  daily: {
    time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
    weather_code: [0, 1, 2, 3, 61],
    temperature_2m_min: [12, 13, 14, 15, 16],
    temperature_2m_max: [22, 23, 24, 25, 26],
    precipitation_probability_max: [0, 10, 20, 30, 40],
  },
};

test('mostra estado vazio quando o geocoding não retorna results', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get('name')).toBe('Cidade inexistente');
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await page.goto('/');
  await page.getByLabel('Pesquisar cidade').fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
});

test('renderiza o fluxo principal corretamente no viewport mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get('name')).toBe('São Paulo');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [city] }),
    });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get('latitude')).toBe(String(city.latitude));
    expect(url.searchParams.get('longitude')).toBe(String(city.longitude));
    expect(url.searchParams.get('forecast_days')).toBe('5');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(forecast),
    });
  });

  await page.goto('/');
  await page.getByLabel('Pesquisar cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: /São Paulo, São Paulo, Brasil/ })).toBeVisible();
  await expect(page.getByRole('status', { name: 'Temperatura atual: 18 °C' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Próximos dias' })).toBeVisible();
  const forecastRegion = page.getByRole('region', { name: 'Próximos dias' });
  await expect(forecastRegion.getByRole('article')).toHaveCount(5);
  await expect(forecastRegion.getByRole('article', { name: /Céu limpo/ })).toBeVisible();
  await expect(forecastRegion.getByRole('article', { name: /Chuva leve/ })).toBeVisible();
});

test('mostra erro quando o forecast está incompleto', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [city] }),
    });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ current: null, daily: null }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Pesquisar cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('alert')).toContainText('Os dados meteorológicos estão incompletos');
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /São Paulo/ })).not.toBeVisible();
});
