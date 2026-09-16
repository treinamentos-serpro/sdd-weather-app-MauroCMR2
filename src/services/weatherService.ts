import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';
import { getWeatherCondition } from '../utils/weatherCodes';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

interface GeocodingResult {
  id?: number | null;
  name?: string | null;
  country?: string | null;
  admin1?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
}

interface GeocodingResponse {
  results?: GeocodingResult[] | null;
}

interface ForecastResponse {
  timezone?: string | null;
  current?: {
    time?: string | null;
    temperature_2m?: number | null;
    relative_humidity_2m?: number | null;
    precipitation?: number | null;
    wind_speed_10m?: number | null;
    pressure_msl?: number | null;
    weather_code?: number | null;
  } | null;
  daily?: {
    time?: Array<string | null> | null;
    weather_code?: Array<number | null> | null;
    temperature_2m_min?: Array<number | null> | null;
    temperature_2m_max?: Array<number | null> | null;
    precipitation_probability_max?: Array<number | null> | null;
  } | null;
}

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

export async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      error.name === 'AbortError'
    ) {
      throw new WeatherServiceError('A consulta demorou mais de 10 segundos. Tente novamente.');
    }

    throw new WeatherServiceError(
      'Não foi possível conectar ao serviço meteorológico. Verifique sua conexão e tente novamente.',
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new WeatherServiceError(
      'O serviço meteorológico retornou uma resposta inválida. Tente novamente.',
    );
  }
}

function hasConsecutiveDates(dates: string[]): boolean {
  return dates.every((date, index) => {
    if (index === 0) return true;

    const previousDate = Date.parse(`${dates[index - 1]}T00:00:00Z`);
    const currentDate = Date.parse(`${date}T00:00:00Z`);
    return currentDate - previousDate === 24 * 60 * 60 * 1000;
  });
}

function toOptionalNumber(value: number | null | undefined): number | undefined {
  return isFiniteNumber(value) ? value : undefined;
}

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidGeocodingResult(result: GeocodingResult): result is GeocodingResult & {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
} {
  return (
    typeof result.id === 'number' &&
    Number.isFinite(result.id) &&
    typeof result.name === 'string' &&
    result.name.length > 0 &&
    typeof result.latitude === 'number' &&
    Number.isFinite(result.latitude) &&
    typeof result.longitude === 'number' &&
    Number.isFinite(result.longitude)
  );
}

export async function searchCities(name: string): Promise<City[]> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return [];
  }

  const response = await fetchWithTimeout(
    `${GEOCODING_URL}?name=${encodeURIComponent(trimmedName)}`,
  );

  if (!response.ok) {
    throw new WeatherServiceError(
      'O serviço de cidades está indisponível no momento. Tente novamente.',
      response.status,
    );
  }

  const data = await readJson<GeocodingResponse>(response);

  return (data.results ?? []).filter(isValidGeocodingResult).map((result) => ({
    id: result.id,
    name: result.name,
    country: result.country ?? '',
    state: result.admin1 ?? undefined,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone ?? undefined,
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,pressure_msl,weather_code',
    daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
    forecast_days: '5',
    timezone: 'auto',
  });

  const response = await fetchWithTimeout(`${FORECAST_URL}?${params}`);

  if (!response.ok) {
    throw new WeatherServiceError(
      'O serviço meteorológico está indisponível no momento. Tente novamente.',
      response.status,
    );
  }

  const data = await readJson<ForecastResponse>(response);
  const current = data.current;
  const daily = data.daily;
  const dates = daily?.time ?? [];
  const codes = daily?.weather_code ?? [];
  const minimums = daily?.temperature_2m_min ?? [];
  const maximums = daily?.temperature_2m_max ?? [];
  const precipitationProbabilities = daily?.precipitation_probability_max ?? [];

  const validDates = dates.every(
    (date): date is string => typeof date === 'string' && date.length > 0,
  );
  const validCodes = codes.every((code): code is number => isFiniteNumber(code));
  const validMinimums = minimums.every((value): value is number => isFiniteNumber(value));
  const validMaximums = maximums.every((value): value is number => isFiniteNumber(value));

  if (!current || !daily) {
    throw new WeatherServiceError('Os dados meteorológicos estão incompletos. Tente novamente.');
  }

  if (
    typeof current.time !== 'string' ||
    !isFiniteNumber(current.temperature_2m) ||
    !isFiniteNumber(current.weather_code) ||
    dates.length !== 5 ||
    codes.length !== 5 ||
    minimums.length !== 5 ||
    maximums.length !== 5 ||
    !validDates ||
    !validCodes ||
    !validMinimums ||
    !validMaximums ||
    !hasConsecutiveDates(dates)
  ) {
    throw new WeatherServiceError('Os dados meteorológicos estão incompletos. Tente novamente.');
  }

  const currentWeather: CurrentWeather = {
    temperature: current.temperature_2m,
    weatherCode: current.weather_code,
    conditionLabel: getWeatherCondition(current.weather_code),
    observedAt: current.time,
    humidity: toOptionalNumber(current.relative_humidity_2m),
    precipitation: toOptionalNumber(current.precipitation),
    windSpeedKmh: toOptionalNumber(current.wind_speed_10m),
    pressureHpa: toOptionalNumber(current.pressure_msl),
  };

  const forecast: ForecastDay[] = dates.map((date, index) => ({
    date,
    weatherCode: codes[index],
    conditionLabel: getWeatherCondition(codes[index]),
    temperatureMin: minimums[index],
    temperatureMax: maximums[index],
    precipitationProbability: toOptionalNumber(precipitationProbabilities[index]) ?? 0,
  }));

  return {
    city,
    timezone: data.timezone ?? city.timezone ?? 'UTC',
    unit: 'celsius',
    current: currentWeather,
    forecast,
  };
}
