// Format a number to 2 decimal places as a string (no currency symbols).
// Returns null when the value is null or undefined so callers can show a placeholder.
export function formatAmount(value) {
  if (value == null) return null

  return Number(value).toFixed(2)
}
