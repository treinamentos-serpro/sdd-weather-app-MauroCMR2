import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchWithTimeout,
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const city: City = {
  id: 1,
  name: 'São Paulo',
  country: 'Brasil',
  state: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
};

function mockResponse(body: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 503,
    json: async () => body,
  } as Response;
}

function completeForecastResponse() {
  return {
    timezone: 'America/Sao_Paulo',
    current: {
      time: '2026-09-16T12:00',
      temperature_2m: 18,
      relative_humidity_2m: 80,
      precipitation: 2,
      wind_speed_10m: 10,
      pressure_msl: 1015,
      weather_code: 3,
    },
    daily: {
      time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
      weather_code: [3, 61, 80, 1, 0],
      temperature_2m_min: [12, 11, 13, 14, 15],
      temperature_2m_max: [20, 19, 22, 24, 25],
      precipitation_probability_max: [20, 90, 70, 10, null],
    },
  };
}

describe('weatherService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe('searchCities', () => {
    it('retorna vazio para input vazio sem chamar fetch', async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      await expect(searchCities('   ')).resolves.toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('mapeia os resultados de geocoding', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockResponse({
            results: [
              {
                id: 1,
                name: 'São Paulo',
                country: 'Brasil',
                admin1: 'São Paulo',
                latitude: -23.55,
                longitude: -46.63,
                timezone: 'America/Sao_Paulo',
              },
            ],
          }),
        ),
      );

      await expect(searchCities(' São Paulo ')).resolves.toEqual([cityWithTimezone]);
    });

    it('descarta locais sem campos obrigatórios e normaliza opcionais nulos', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockResponse({
            results: [
              {
                id: 2,
                name: 'Lisboa',
                country: null,
                admin1: null,
                latitude: 38.72,
                longitude: -9.14,
                timezone: null,
              },
              { id: null, name: null, latitude: null, longitude: null },
            ],
          }),
        ),
      );

      await expect(searchCities('Lisboa')).resolves.toEqual([
        {
          id: 2,
          name: 'Lisboa',
          country: '',
          state: undefined,
          latitude: 38.72,
          longitude: -9.14,
          timezone: undefined,
        },
      ]);
    });

    it('retorna vazio quando results está ausente', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse({})));

      await expect(searchCities('Cidade inexistente')).resolves.toEqual([]);
    });

    it('lança WeatherServiceError quando a resposta não é ok', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse({}, false)));

      await expect(searchCities('São Paulo')).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('lança erro para falha de rede ou JSON inválido', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
      await expect(searchCities('São Paulo')).rejects.toThrow(
        'Não foi possível conectar ao serviço meteorológico',
      );

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => {
            throw new SyntaxError('invalid json');
          },
        }),
      );
      await expect(searchCities('São Paulo')).rejects.toThrow(
        'O serviço meteorológico retornou uma resposta inválida',
      );
    });

    it('informa claramente quando a requisição excede o timeout', async () => {
      vi.useFakeTimers();
      vi.stubGlobal(
        'fetch',
        vi.fn(
          (_url: string, options?: RequestInit) =>
            new Promise((_resolve, reject) => {
              options?.signal?.addEventListener('abort', () =>
                reject(new DOMException('Aborted', 'AbortError')),
              );
            }),
        ),
      );

      const request = fetchWithTimeout('https://example.test/weather');
      const failure = expect(request).rejects.toThrow('A consulta demorou mais de 10 segundos');
      await vi.advanceTimersByTimeAsync(10_000);
      await failure;
    });
  });

  describe('getWeather', () => {
    it('mapeia current e daily para cinco dias', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockResponse({
            timezone: 'America/Sao_Paulo',
            current: {
              time: '2026-09-16T12:00',
              temperature_2m: 18,
              relative_humidity_2m: 80,
              precipitation: 2,
              wind_speed_10m: 10,
              pressure_msl: 1015,
              weather_code: 3,
            },
            daily: {
              time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
              weather_code: [3, 61, 80, 1, 0],
              temperature_2m_min: [12, 11, 13, 14, 15],
              temperature_2m_max: [20, 19, 22, 24, 25],
              precipitation_probability_max: [20, 90, 70, 10, null],
            },
          }),
        ),
      );

      const result = await getWeather(city);

      expect(result.current).toMatchObject({
        temperature: 18,
        weatherCode: 3,
        conditionLabel: 'Nublado',
        precipitation: 2,
      });
      expect(result.forecast).toHaveLength(5);
      expect(result.forecast[0]).toMatchObject({
        date: '2026-09-16',
        temperatureMin: 12,
        temperatureMax: 20,
        precipitationProbability: 20,
      });
      expect(result.forecast[4].precipitationProbability).toBe(0);
    });

    it('converte métricas atuais nulas em campos ausentes seguros', async () => {
      const completeResponse = completeForecastResponse();
      const body = {
        ...completeResponse,
        current: {
          ...completeResponse.current,
          relative_humidity_2m: null,
          precipitation: null,
          wind_speed_10m: null,
          pressure_msl: null,
        },
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(body)));

      const result = await getWeather(city);

      expect(result.current).toMatchObject({
        humidity: undefined,
        precipitation: undefined,
        windSpeedKmh: undefined,
        pressureHpa: undefined,
      });
    });

    it('lança WeatherServiceError quando current ou daily estão ausentes', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(mockResponse({ current: null, daily: null })),
      );

      await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('lança erro para resposta HTTP não-ok', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse({}, false)));

      await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('lança erro para falha de rede ou JSON inválido', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
      await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => {
            throw new SyntaxError('invalid json');
          },
        }),
      );
      await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it.each([
      {
        description: 'horário atual ausente',
        current: { time: undefined },
      },
      {
        description: 'temperatura atual ausente',
        current: { temperature_2m: undefined },
      },
      {
        description: 'código climático atual ausente',
        current: { weather_code: undefined },
      },
      {
        description: 'menos de cinco datas',
        daily: { time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19'] },
      },
      {
        description: 'temperatura mínima ausente',
        daily: { temperature_2m_min: [12, 11, 13, 14] },
      },
      {
        description: 'temperatura máxima ausente',
        daily: { temperature_2m_max: [20, 19, 22, 24] },
      },
      {
        description: 'datas duplicadas',
        daily: { time: ['2026-09-16', '2026-09-16', '2026-09-18', '2026-09-19', '2026-09-20'] },
      },
      {
        description: 'datas não consecutivas',
        daily: { time: ['2026-09-16', '2026-09-18', '2026-09-19', '2026-09-20', '2026-09-21'] },
      },
    ])('lança erro para resposta parcial: $description', async ({ current, daily }) => {
      const completeResponse = completeForecastResponse();
      const body = {
        ...completeResponse,
        current: { ...completeResponse.current, ...current },
        daily: { ...completeResponse.daily, ...daily },
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(body)));

      await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
    });
  });
});

const cityWithTimezone: City = {
  ...city,
  timezone: 'America/Sao_Paulo',
};
