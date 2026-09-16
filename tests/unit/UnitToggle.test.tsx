import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../../src/types/weather';

const city: City = {
  id: 1,
  name: 'São Paulo',
  country: 'Brasil',
  state: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
};

const current: CurrentWeatherData = {
  temperature: 0,
  weatherCode: 0,
  conditionLabel: 'Céu limpo',
  observedAt: '2026-09-16T12:00',
};

function WeatherWithUnitToggle() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather city={city} current={current} unit={unit} />
    </>
  );
}

describe('UnitToggle + CurrentWeather', () => {
  it('exibe 32° ao trocar 0°C para Fahrenheit', async () => {
    const user = userEvent.setup();

    render(<WeatherWithUnitToggle />);

    expect(screen.getByText('0 °C')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByText('32 °F')).toBeInTheDocument();
  });

  it('mostra travessão quando uma métrica opcional não está disponível', () => {
    const incompleteCurrent = {
      ...current,
      humidity: undefined,
      precipitation: undefined,
      windSpeedKmh: undefined,
      pressureHpa: undefined,
    };

    render(<CurrentWeather city={city} current={incompleteCurrent} unit="celsius" />);

    expect(screen.getAllByText('—')).toHaveLength(4);
  });
});
