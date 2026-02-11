import type { Snippet } from 'svelte'
import type { Readable } from 'svelte/store'

export interface Props<T> {
  store: Readable<T | null | Error>
  waiting?: Snippet
  awaited: Snippet<[T]>
  error?: Snippet<[Error]>
  silent?: boolean
}

export { default as Async } from './Async.svelte'
