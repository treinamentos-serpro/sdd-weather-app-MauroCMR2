import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const units: Array<{ value: Unit; label: string }> = [
  { value: 'celsius', label: '°C' },
  { value: 'fahrenheit', label: '°F' },
];

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div
      className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md"
      role="group"
      aria-label="Unidade de temperatura"
    >
      {units.map((option) => {
        const isActive = unit === option.value;

        return (
          <button
            aria-pressed={isActive}
            className={`min-h-10 min-w-12 rounded-lg px-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 ${
              isActive
                ? 'bg-accent-600 text-white'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
