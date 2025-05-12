import { readable, type Readable } from 'svelte/store'
import type { Maybe } from './Maybe'

export function combined<T extends Readable<unknown>[]>(...stores: T): Readable<Maybe<Values<T>>> {
  return readable<Maybe<Values<T>>>(null, (set) => {
    const values = new Array(stores.length).fill(null)

    const unsubs = stores.map((store, index) =>
      store.subscribe((value) => {
        if (value instanceof Error) {
          values[index] = null
          set(value)
        } else if (value === null) {
          values[index] = value
          set(value)
        } else {
          values[index] = value

          if (values.every((value) => value !== null)) set(values as Values<T>)
        }
      })
    )

    return () => {
      unsubs.forEach((unsub) => unsub())
    }
  })
}

type Value<T> = T extends Readable<infer U | null | Error> ? U : never

type Values<T extends Readable<Maybe<unknown>>[]> = T extends [infer U, ...infer R]
  ? [Value<U>, ...Values<R extends Readable<unknown | null | Error>[] ? R : []>]
  : []
