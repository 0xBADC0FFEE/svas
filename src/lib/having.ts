import type { Readable, Unsubscriber } from 'svelte/store'
import type { Maybe } from './Maybe'

/**
 * Execute a callback once the store has a non-null and non-error value.
 */

export async function having<T>(store: Readable<Maybe<T>>): Promise<T>

export function having<T>(
  store: Readable<Maybe<T>>,
  callback: (value: T) => unknown | Promise<unknown>
): void

export function having<T>(
  store: Readable<Maybe<T>>,
  callback?: (value: T) => unknown | Promise<unknown>
): void | Promise<T> {
  const promise = new Promise<T>((resolve) => {
    let completed = false
    let unsubscribe: Unsubscriber | null = null

    unsubscribe = store.subscribe((value: Maybe<T>) => {
      if (value === null || value instanceof Error) return

      // A
      unsubscribe?.()
      completed = true
      resolve(value)
    })

    // B
    if (completed) unsubscribe?.()

    // the execution order of A and B is uncertain
  })

  if (callback === undefined) return promise
  else promise.then(callback)
}
