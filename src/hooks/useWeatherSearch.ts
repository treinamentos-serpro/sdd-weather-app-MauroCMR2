import { useRef, useState } from 'react';
import { fetchWeather, searchLocations, WeatherApiError } from '../services/openMeteoClient';
import type {
  AppError,
  Location,
  QueryStatus,
  TemperatureUnit,
  WeatherResult,
} from '../types/weather';
import { normalizeCityInput } from '../utils/input';

interface SearchState {
  status: QueryStatus;
  locations: Location[];
  error?: AppError;
}

interface WeatherState {
  status: QueryStatus;
  result?: WeatherResult;
  error?: AppError;
}

function toAppError(error: unknown): AppError {
  if (error instanceof WeatherApiError) return error.details;
  return { code: 'network', message: 'Não foi possível concluir a consulta.', retryable: true };
}

export function useWeatherSearch() {
  const [searchState, setSearchState] = useState<SearchState>({ status: 'idle', locations: [] });
  const [weatherState, setWeatherState] = useState<WeatherState>({ status: 'idle' });
  const [query, setQuery] = useState('');
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const requestId = useRef(0);
  const selectedLocation = useRef<Location | undefined>(undefined);

  async function search(queryInput: string) {
    const normalized = normalizeCityInput(queryInput);
    setQuery(normalized);
    const currentRequest = ++requestId.current;
    setSearchState({ status: 'loading', locations: [] });
    setWeatherState({ status: 'idle' });

    try {
      const locations = await searchLocations(normalized);
      if (currentRequest !== requestId.current) return;
      if (!locations.length) {
        setSearchState({ status: 'empty', locations: [] });
        return;
      }
      setSearchState({ status: 'success', locations: [] });
      if (locations.length === 1) await selectLocation(locations[0]);
      else setSearchState({ status: 'success', locations });
    } catch (error) {
      if (currentRequest === requestId.current)
        setSearchState({ status: 'error', locations: [], error: toAppError(error) });
    }
  }

  async function selectLocation(location: Location) {
    const currentRequest = ++requestId.current;
    selectedLocation.current = location;
    setWeatherState({ status: 'loading' });
    try {
      const result = await fetchWeather(location, unit);
      if (currentRequest === requestId.current) setWeatherState({ status: 'success', result });
    } catch (error) {
      if (currentRequest === requestId.current)
        setWeatherState({ status: 'error', error: toAppError(error) });
    }
  }

  async function retry() {
    if (searchState.status === 'error' || searchState.status === 'empty') return search(query);
    if (selectedLocation.current) return selectLocation(selectedLocation.current);
  }

  return { searchState, weatherState, query, unit, setUnit, search, selectLocation, retry };
}
