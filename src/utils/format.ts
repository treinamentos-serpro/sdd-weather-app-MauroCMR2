const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function getDayLabel(iso: string, index: number): string {
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';
  return WEEKDAYS[parseLocalDate(iso).getDay()];
}

export function getShortDate(iso: string): string {
  const date = parseLocalDate(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatDayLabel(date: string, _timezone = 'UTC'): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
    weekday: 'short',
  })
    .format(new Date(`${date}T00:00:00Z`))
    .replace('.', '');
}
