import { type FormEvent, useRef, useState } from 'react';
import { normalizeCityInput, validateCityInput } from '../utils/input';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [city, setCity] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled) {
      return;
    }

    const error = validateCityInput(city);
    if (error) {
      setValidationError(error);
      inputRef.current?.focus();
      return;
    }

    setValidationError(null);
    const normalizedCity = normalizeCityInput(city);
    onSearch(normalizedCity);
  }

  return (
    <form
      className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md sm:p-5"
      role="search"
      onSubmit={handleSubmit}
    >
      <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="search-city-input">
        Pesquisar cidade
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          aria-describedby={validationError ? 'search-city-error' : undefined}
          aria-invalid={validationError !== null}
          className="min-h-12 flex-1 rounded-xl border border-white/10 bg-night-900/70 px-4 text-white outline-none placeholder:text-slate-500 focus:border-accent-400 focus:ring-2 focus:ring-accent-400/40 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          id="search-city-input"
          ref={inputRef}
          name="city"
          onChange={(event) => {
            setCity(event.target.value);
            setValidationError(null);
          }}
          placeholder="Digite o nome da cidade"
          type="search"
          value={city}
        />
        <button
          className="min-h-12 rounded-xl bg-accent-600 px-6 font-semibold text-white transition hover:bg-accent-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent-600"
          disabled={disabled}
          type="submit"
        >
          Buscar
        </button>
      </div>
      {validationError && (
        <p className="mt-2 text-sm text-red-100" id="search-city-error" role="alert">
          {validationError}
        </p>
      )}
    </form>
  );
}
