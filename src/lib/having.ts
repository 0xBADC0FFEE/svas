import type { Readable } from 'svelte/store'
import type { Maybe } from './Maybe'
import { once } from './once'

export function having<T>(store: Readable<Maybe<T>>): Promise<T> {
  return once(store, (value) => value !== null && !(value instanceof Error)) as Promise<T>
}
