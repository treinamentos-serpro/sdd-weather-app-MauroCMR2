import type { ForecastDay, Unit } from '../types/weather';
import { formatDayLabel } from '../utils/format';
import { convertTemperature } from '../utils/temperature';
import { getWeatherIcon } from '../utils/weatherCodes';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
  timezone?: string;
}

function displayTemperature(value: number | null | undefined, unit: Unit): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }

  const converted = convertTemperature(value, 'celsius', unit);
  return `${converted}°`;
}

export default function ForecastCard({ day, unit, timezone = 'UTC' }: ForecastCardProps) {
  const maxTemperature = displayTemperature(day.temperatureMax, unit);
  const minTemperature = displayTemperature(day.temperatureMin, unit);
  const rainProbability =
    typeof day.precipitationProbability === 'number' &&
    Number.isFinite(day.precipitationProbability)
      ? `${day.precipitationProbability}%`
      : 'Indisponível';

  return (
    <article
      aria-label={`${formatDayLabel(day.date, timezone)}: ${day.conditionLabel}`}
      className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md sm:p-4"
    >
      <p className="text-sm font-semibold capitalize text-slate-300">
        {formatDayLabel(day.date, timezone)}
      </p>
      <div aria-hidden="true" className="mt-4 text-4xl" role="img">
        {getWeatherIcon(day.weatherCode)}
      </div>
      <p className="mt-3 text-sm text-slate-300">{day.conditionLabel}</p>
      <p className="mt-4 text-lg font-bold text-white">
        <span>
          <span className="sr-only">Máxima: </span>
          {maxTemperature}
        </span>
        <span className="ml-2 font-normal text-slate-400">
          <span className="sr-only">Mínima: </span>
          {minTemperature}
        </span>
      </p>
      <p className="mt-3 text-sm text-slate-400">Chuva: {rainProbability}</p>
    </article>
  );
}
