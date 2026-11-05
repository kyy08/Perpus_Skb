const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function addDays(date, days) {
  return new Date(date.getTime() + days * MILLISECONDS_PER_DAY);
}

export function getLateDays(dueAt, returnedAt) {
  const difference = returnedAt.getTime() - dueAt.getTime();
  return Math.max(0, Math.ceil(difference / MILLISECONDS_PER_DAY));
}
