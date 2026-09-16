import { useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherHookStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

type LastOperation = { type: 'search'; name: string } | { type: 'select'; city: City };

interface UseWeatherResult {
  status: WeatherHookStatus;
  data?: WeatherData;
  cities: City[];
  error?: Error;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

function toError(error: unknown): Error {
  if (error instanceof WeatherServiceError) {
    return error;
  }

  return new Error('Não foi possível concluir a consulta. Tente novamente.');
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherHookStatus>('idle');
  const [data, setData] = useState<WeatherData>();
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<Error>();
  const [query, setQuery] = useState('');
  const requestId = useRef(0);
  const lastOperation = useRef<LastOperation | undefined>(undefined);

  async function selectCity(city: City): Promise<void> {
    const currentRequest = ++requestId.current;
    lastOperation.current = { type: 'select', city };
    setStatus('loading');
    setError(undefined);

    try {
      const weather = await getWeather(city);
      if (currentRequest !== requestId.current) return;

      setData(weather);
      setStatus('success');
    } catch (caughtError) {
      if (currentRequest !== requestId.current) return;

      setError(toError(caughtError));
      setStatus('error');
    }
  }

  async function search(name: string): Promise<void> {
    const normalizedName = name.trim();
    const currentRequest = ++requestId.current;
    lastOperation.current = { type: 'search', name: normalizedName };
    setQuery(normalizedName);
    setStatus('loading');
    setError(undefined);
    setData(undefined);
    setCities([]);

    try {
      const results = await searchCities(normalizedName);
      if (currentRequest !== requestId.current) return;

      setCities(results);
      if (!results.length) {
        setStatus('empty');
        return;
      }

      await selectCity(results[0]);
    } catch (caughtError) {
      if (currentRequest !== requestId.current) return;

      setError(toError(caughtError));
      setStatus('error');
    }
  }

  async function retry(): Promise<void> {
    const operation = lastOperation.current;
    if (!operation) return;

    if (operation.type === 'search') {
      await search(operation.name);
      return;
    }

    await selectCity(operation.city);
  }

  return { status, data, cities, error, query, search, selectCity, retry };
}
