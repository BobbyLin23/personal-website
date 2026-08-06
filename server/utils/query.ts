export function getQueryString(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return String(value[0] ?? '')
  return ''
}
