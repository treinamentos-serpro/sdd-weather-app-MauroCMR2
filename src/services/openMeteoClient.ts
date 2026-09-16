import type { AppError, Location, TemperatureUnit, WeatherResult } from '../types/weather';
import { getWeatherCondition } from '../utils/weatherCodes';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

interface GeocodingResponse {
  results?: Array<{
    id?: number;
    name?: string;
    country?: string;
    admin1?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  }>;
}

interface ForecastResponse {
  timezone?: string;
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_min?: number[];
    temperature_2m_max?: number[];
  };
}

export class WeatherApiError extends Error {
  constructor(public readonly details: AppError) {
    super(details.message);
  }
}

async function requestJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new WeatherApiError({
        code: 'http',
        message: 'O serviço meteorológico está indisponível.',
        retryable: true,
      });
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof WeatherApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new WeatherApiError({
        code: 'timeout',
        message: 'A consulta demorou além do esperado.',
        retryable: true,
      });
    }
    throw new WeatherApiError({
      code: 'network',
      message: 'Não foi possível conectar ao serviço meteorológico.',
      retryable: true,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function searchLocations(query: string): Promise<Location[]> {
  const params = new URLSearchParams({ name: query, count: '10', language: 'pt', format: 'json' });
  const data = await requestJson<GeocodingResponse>(`${GEOCODING_URL}?${params}`);
  const locations = (data.results ?? []).filter(
    (
      result,
    ): result is Required<
      Pick<typeof result, 'id' | 'name' | 'country' | 'latitude' | 'longitude'>
    > &
      typeof result =>
      typeof result.id === 'number' &&
      typeof result.name === 'string' &&
      typeof result.country === 'string' &&
      typeof result.latitude === 'number' &&
      typeof result.longitude === 'number',
  );
  return locations.map((location) => ({
    id: location.id,
    name: location.name,
    country: location.country,
    state: location.admin1,
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: location.timezone,
  }));
}

export async function fetchWeather(
  location: Location,
  unit: TemperatureUnit,
): Promise<WeatherResult> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_min,temperature_2m_max',
    forecast_days: '5',
    timezone: 'auto',
    temperature_unit: unit,
    wind_speed_unit: 'kmh',
  });
  const data = await requestJson<ForecastResponse>(`${FORECAST_URL}?${params}`);
  const daily = data.daily;
  const current = data.current;
  const dates = daily?.time ?? [];
  const codes = daily?.weather_code ?? [];
  const minimums = daily?.temperature_2m_min ?? [];
  const maximums = daily?.temperature_2m_max ?? [];

  if (
    !data.timezone ||
    !current ||
    typeof current.time !== 'string' ||
    typeof current.temperature_2m !== 'number' ||
    typeof current.weather_code !== 'number' ||
    dates.length !== 5 ||
    codes.length !== 5 ||
    minimums.length !== 5 ||
    maximums.length !== 5 ||
    dates.some(
      (date, index) =>
        !date ||
        typeof codes[index] !== 'number' ||
        typeof minimums[index] !== 'number' ||
        typeof maximums[index] !== 'number',
    )
  ) {
    throw new WeatherApiError({
      code: 'invalid-response',
      message: 'O serviço retornou dados incompletos.',
      retryable: true,
    });
  }

  return {
    location,
    timezone: data.timezone,
    unit,
    current: {
      temperature: current.temperature_2m,
      weatherCode: current.weather_code,
      conditionLabel: getWeatherCondition(current.weather_code),
      observedAt: current.time,
      humidity: current.relative_humidity_2m,
      precipitation: current.precipitation,
      windSpeedKmh: current.wind_speed_10m,
    },
    forecast: dates.map((date, index) => ({
      date,
      weatherCode: codes[index],
      conditionLabel: getWeatherCondition(codes[index]),
      temperatureMin: minimums[index],
      temperatureMax: maximums[index],
    })),
  };
}
