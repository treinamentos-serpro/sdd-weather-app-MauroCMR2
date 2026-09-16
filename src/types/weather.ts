export type Unit = 'celsius' | 'fahrenheit';
export type TemperatureUnit = Unit;
export type QueryStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface City {
  id: number; // Identificador da cidade no geocoding da Open-Meteo.
  name: string; // Nome da cidade.
  country: string; // Nome do pais.
  state?: string; // Estado, provincia ou regiao, quando disponivel.
  latitude: number; // Latitude em graus decimais.
  longitude: number; // Longitude em graus decimais.
  timezone?: string; // Fuso horario IANA retornado pela API.
}

export interface CurrentWeather {
  temperature: number; // Temperatura atual na unidade selecionada.
  weatherCode: number; // Codigo WMO da condicao meteorologica.
  conditionLabel: string; // Descricao acessivel do codigo em pt-BR.
  observedAt: string; // Horario da observacao no fuso da cidade.
  humidity?: number; // Umidade relativa em percentual.
  precipitation?: number; // Precipitacao atual em milimetros.
  windSpeedKmh?: number; // Velocidade do vento em km/h.
  pressureHpa?: number; // Pressao atmosferica em hPa.
}

export interface ForecastDay {
  date: string; // Data ISO 8601 do periodo diario.
  weatherCode: number; // Codigo WMO da condicao meteorologica.
  conditionLabel: string; // Descricao acessivel do codigo em pt-BR.
  temperatureMin: number; // Temperatura minima na unidade selecionada.
  temperatureMax: number; // Temperatura maxima na unidade selecionada.
  precipitationProbability?: number; // Probabilidade de chuva em percentual.
}

export interface WeatherData {
  city: City; // Cidade consultada.
  timezone: string; // Fuso usado para interpretar datas e horarios.
  unit: Unit; // Unidade das temperaturas do conjunto de dados.
  current: CurrentWeather; // Condicoes meteorologicas atuais.
  forecast: ForecastDay[]; // Previsao diaria, com cinco dias no MVP.
}

// Aliases mantidos para compatibilidade com os services e hooks existentes.
export type Location = City;
export type DailyForecast = ForecastDay;
export interface WeatherResult {
  location: City; // Cidade selecionada no fluxo legado dos services.
  current: CurrentWeather; // Condicoes meteorologicas atuais.
  forecast: ForecastDay[]; // Previsao diaria validada.
  timezone: string; // Fuso usado para datas e horarios.
  unit: Unit; // Unidade das temperaturas.
}

export interface AppError {
  code: 'timeout' | 'network' | 'http' | 'invalid-response';
  message: string;
  retryable: boolean;
}
