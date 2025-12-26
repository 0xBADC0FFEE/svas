import type { Readable } from 'svelte/store'
import type { Maybe } from './Maybe'
import { waitUntil } from './waitUntil'

export function having<T>(store: Readable<Maybe<T>>): Promise<T> {
  return waitUntil(store, (value) => value !== null && !(value instanceof Error)) as Promise<T>
}
