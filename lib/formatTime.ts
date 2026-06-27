export function formatTime(date: Date): string {
  const pad = (value: number, length = 2) => String(value).padStart(length, "0")

  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`
}
