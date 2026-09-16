import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
  timezone?: string;
}

export default function ForecastList({ forecast, unit, timezone }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-list-title">
      <h2 className="mb-4 text-xl font-bold text-white" id="forecast-list-title">
        Próximos dias
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day) => (
          <ForecastCard day={day} key={day.date} timezone={timezone} unit={unit} />
        ))}
      </div>
    </section>
  );
}
