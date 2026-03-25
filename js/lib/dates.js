export function today() {
  return new Date().toLocaleDateString('en-CA');
}

export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('en-CA');
}

export function daysBetween(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

export function formatRelative(isoStr) {
  const now = Date.now();
  const then = new Date(isoStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'maintenant';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 172800) return 'hier';
  return `${Math.floor(diff / 86400)}j`;
}

export function getWeekday(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 0 ? 6 : day - 1; // 0=Mon..6=Sun
}

export function isSameDay(a, b) {
  return a === b;
}

export function dateRange(start, end) {
  const dates = [];
  const current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    dates.push(current.toLocaleDateString('en-CA'));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function isDueToday(frequency) {
  return isDueOnDate(frequency, today());
}

export function isDueOnDate(frequency, dateStr) {
  const weekday = getWeekday(dateStr);
  if (frequency === 'daily') return true;
  if (frequency === 'weekly_3') return [0, 2, 4].includes(weekday);
  if (frequency === 'weekly_5') return weekday <= 4;
  // custom:0,1,3 = Lun, Mar, Jeu (0=Mon..6=Sun)
  if (frequency && frequency.startsWith('custom:')) {
    const days = frequency.slice(7).split(',').map(Number);
    return days.includes(weekday);
  }
  return true;
}
