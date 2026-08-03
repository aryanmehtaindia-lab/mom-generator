/**
 * Formats an ISO date string (YYYY-MM-DD) to DD/MM/YYYY.
 * Returns the original value if it's empty or not a valid ISO date.
 */
export function formatDate(isoDate: string): string {
  if (!isoDate) return "";
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return isoDate;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}
