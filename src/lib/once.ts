import type { Readable, Unsubscriber } from "svelte/store";

export function once<T>(store: Readable<T>, condition: (value: T) => boolean): Promise<T> {
  const promise = new Promise<T>((resolve) => {
    let completed = false
    let unsubscribe: Unsubscriber | null = null

    unsubscribe = store.subscribe((value) => {
      if (!condition(value))
        return

      unsubscribe?.()
      completed = true
      resolve(value)
    })

    if (completed)
      unsubscribe?.()
  })

  return promise
}
