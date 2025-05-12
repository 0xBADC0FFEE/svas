export function ok<T>(value: T): value is Exclude<T, null | Error> {
  return value !== null && !(value instanceof Error)
}
