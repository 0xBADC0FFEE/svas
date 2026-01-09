import { derived, type Readable } from 'svelte/store'
import type { Maybe } from './Maybe'

export function combined<T extends Readable<unknown>[]>(...stores: T): Readable<Maybe<Values<T>>> {
  return derived(stores, (values, set) => {
    const error = values.find((value) => value instanceof Error)

    if (error) 
      set(error)
    else if (values.some((value) => value === null))
      set(null)
    else
      set([...values] as Values<T>)
  })
}

type Value<T> = T extends Readable<infer U | null | Error> ? U : never

type Values<T extends Readable<Maybe<unknown>>[]> = T extends [infer U, ...infer R]
  ? [Value<U>, ...Values<R extends Readable<unknown | null | Error>[] ? R : []>]
  : []
