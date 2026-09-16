import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const { status, data, error, search, retry } = useWeather();
  const [unit, setUnit] = useState<Unit>('celsius');
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (status !== 'loading' && status !== 'idle') {
      resultRef.current?.focus();
    }
  }, [status]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#26365f,_#0b1020_55%)] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-400">
              Weather App
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">
              O tempo para seus próximos planos.
            </h1>
            <p className="mt-3 max-w-xl text-slate-300">
              Consulte as condições atuais e a previsão dos próximos quatro dias.
            </p>
          </div>
          <UnitToggle unit={unit} onChange={setUnit} />
        </header>

        <section className="mb-8" aria-label="Busca de cidade">
          <SearchBar disabled={status === 'loading'} onSearch={(city) => void search(city)} />
        </section>

        <section ref={resultRef} aria-busy={status === 'loading'} aria-live="polite" tabIndex={-1}>
          {status === 'idle' && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
              <p className="text-lg font-semibold text-white">Encontre o clima da sua cidade</p>
              <p className="mt-2 text-slate-300">Digite uma cidade para começar sua consulta.</p>
            </div>
          )}

          {status === 'loading' && <LoadingState message="Buscando condições meteorológicas..." />}

          {status === 'empty' && (
            <EmptyState
              title="Nenhuma cidade encontrada"
              tip="Confira a grafia ou tente pesquisar outra cidade."
            />
          )}

          {status === 'error' && (
            <ErrorState
              message={error?.message ?? 'Não foi possível carregar o clima agora.'}
              onRetry={() => void retry()}
            />
          )}

          {status === 'success' && data && (
            <div className="space-y-8">
              <CurrentWeather city={data.city} current={data.current} unit={unit} />
              <ForecastList forecast={data.forecast} timezone={data.timezone} unit={unit} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
