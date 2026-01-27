import { once } from "./once"
import type { Readable } from "svelte/store"
import type { Maybe } from "./Maybe"

export function awaited<T>(store: Readable<Maybe<T>>): Promise<T | Error> {
  return once(store, (value) => value !== null) as Promise<T | Error>
}
