/**
 * Returns today's date as YYYY-MM-DD in the user's local timezone.
 * Unlike `new Date().toISOString().split("T")[0]` which uses UTC,
 * this respects the local clock so 11pm ET stays "today" not "tomorrow".
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
