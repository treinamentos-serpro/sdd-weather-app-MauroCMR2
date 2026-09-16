import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { searchCities, WeatherServiceError } from '../../src/services/weatherService';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/services/weatherService')>();

  return {
    ...actual,
    getWeather: vi.fn(),
    searchCities: vi.fn(),
  };
});

function WeatherHarness() {
  const { error, retry, search, status } = useWeather();

  return (
    <>
      <button type="button" onClick={() => void search('Lisboa')}>
        Buscar Lisboa
      </button>
      <button type="button" onClick={() => void retry()}>
        Tentar novamente
      </button>
      <output>{status}</output>
      <p>{error?.message}</p>
    </>
  );
}

describe('useWeather', () => {
  it('mostra erro de rede e repete a última busca no retry', async () => {
    const searchCitiesMock = vi.mocked(searchCities);
    searchCitiesMock
      .mockRejectedValueOnce(
        new WeatherServiceError(
          'Não foi possível conectar ao serviço meteorológico. Verifique sua conexão e tente novamente.',
        ),
      )
      .mockResolvedValueOnce([]);
    const user = userEvent.setup();

    render(<WeatherHarness />);

    await user.click(screen.getByRole('button', { name: 'Buscar Lisboa' }));
    await waitFor(() =>
      expect(
        screen.getByText(/Não foi possível conectar ao serviço meteorológico/),
      ).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('empty'));
    expect(searchCitiesMock).toHaveBeenNthCalledWith(2, 'Lisboa');
  });
});
