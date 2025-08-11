import type { Maybe } from './Maybe'
import { get, type Readable } from 'svelte/store'

export function ensure<T>(store: Readable<Maybe<T>>): T {
  const value = get(store)

  if (value === null || value instanceof Error)
    throw new Error('Store contains null or an error')

  return value
}
