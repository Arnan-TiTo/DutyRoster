import { formatISO } from 'date-fns'

export function toDateOnly(d: Date) {
  // YYYY-MM-DD
  return formatISO(d, { representation: 'date' })
}

export function minutesBetween(start: Date, end: Date) {
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000))
}
