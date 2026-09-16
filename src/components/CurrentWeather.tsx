import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';
import { convertTemperature } from '../utils/temperature';
import { getWeatherIcon } from '../utils/weatherCodes';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

function formatTemperature(value: number | null | undefined, unit: Unit): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }

  const displayedValue = convertTemperature(value, 'celsius', unit);
  return `${displayedValue} °${unit === 'celsius' ? 'C' : 'F'}`;
}

function formatMetric(value: number | null | undefined, suffix: string): string {
  return typeof value === 'number' && Number.isFinite(value) ? `${value} ${suffix}` : '—';
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const location =
    [city.name, city.state, city.country].filter(Boolean).join(', ') || 'Localização indisponível';
  const icon = getWeatherIcon(current.weatherCode);

  return (
    <article
      aria-labelledby="current-weather-heading"
      className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-md sm:p-8"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">Clima atual</p>
          <h2 className="mt-1 text-2xl font-bold text-white" id="current-weather-heading">
            {location}
          </h2>
        </div>
        <div aria-label={current.conditionLabel} className="text-6xl" role="img">
          {icon}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-5">
        <output
          aria-label={`Temperatura atual: ${formatTemperature(current.temperature, unit)}`}
          className="text-7xl font-bold tracking-tight text-sun sm:text-8xl"
        >
          <span className="sr-only">Temperatura atual: </span>
          {formatTemperature(current.temperature, unit)}
        </output>
        <p className="pb-2 text-lg text-slate-200">{current.conditionLabel}</p>
      </div>

      <p className="mt-3 text-sm text-slate-400">Observado em {current.observedAt}</p>

      <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-night-900/60 p-4">
          <dt className="text-sm text-slate-400">Umidade</dt>
          <dd className="mt-1 text-lg font-semibold text-white">
            {formatMetric(current.humidity, '%')}
          </dd>
        </div>
        <div className="rounded-xl bg-night-900/60 p-4">
          <dt className="text-sm text-slate-400">Vento</dt>
          <dd className="mt-1 text-lg font-semibold text-white">
            {formatMetric(current.windSpeedKmh, 'km/h')}
          </dd>
        </div>
        <div className="rounded-xl bg-night-900/60 p-4">
          <dt className="text-sm text-slate-400">Precipitação</dt>
          <dd className="mt-1 text-lg font-semibold text-white">
            {formatMetric(current.precipitation, 'mm')}
          </dd>
        </div>
        <div className="rounded-xl bg-night-900/60 p-4">
          <dt className="text-sm text-slate-400">Pressão</dt>
          <dd className="mt-1 text-lg font-semibold text-white">
            {formatMetric(current.pressureHpa, 'hPa')}
          </dd>
        </div>
      </dl>
    </article>
  );
}
