import type { WeatherData } from './weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'Sao Paulo',
    country: 'Brasil',
    state: 'Sao Paulo',
    latitude: -23.5475,
    longitude: -46.63611,
    timezone: 'America/Sao_Paulo',
  },
  timezone: 'America/Sao_Paulo',
  unit: 'celsius',
  current: {
    temperature: 22,
    weatherCode: 2,
    conditionLabel: 'Parcialmente nublado',
    observedAt: '2026-09-16T10:00',
    humidity: 68,
    precipitation: 0.2,
    windSpeedKmh: 12.5,
  },
  forecast: [
    {
      date: '2026-09-16',
      weatherCode: 2,
      conditionLabel: 'Parcialmente nublado',
      temperatureMin: 18,
      temperatureMax: 25,
    },
    {
      date: '2026-09-17',
      weatherCode: 61,
      conditionLabel: 'Chuva leve',
      temperatureMin: 17,
      temperatureMax: 23,
    },
    {
      date: '2026-09-18',
      weatherCode: 3,
      conditionLabel: 'Nublado',
      temperatureMin: 17,
      temperatureMax: 24,
    },
    {
      date: '2026-09-19',
      weatherCode: 1,
      conditionLabel: 'Principalmente limpo',
      temperatureMin: 17,
      temperatureMax: 26,
    },
    {
      date: '2026-09-20',
      weatherCode: 0,
      conditionLabel: 'Ceu limpo',
      temperatureMin: 18,
      temperatureMax: 27,
    },
  ],
};
