import { waitUntil } from "./waitUntil"
import type { Readable } from "svelte/store"
import type { Maybe } from "./Maybe"

export function awaited<T>(store: Readable<Maybe<T>>): Promise<T | Error> {
  return waitUntil(store, (value) => value !== null) as Promise<T | Error>
}
