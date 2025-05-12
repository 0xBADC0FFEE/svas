import {
  get,
  writable,
  type Readable,
  type Subscriber,
  type Unsubscriber,
  type Updater,
  type Writable
} from 'svelte/store'
import { browser } from '$app/environment'

class Value<T> implements Writable<T | null> {
  private readonly store: Writable<T | null>
  private readonly map?: (item: T) => T

  public constructor(options: Options<T>) {
    const persist = browser && options.persist !== undefined
    const def = options.default ?? null

    this.store = persist
      ? persistent<T>(options.persist as string, def, options.session)
      : writable<T | null>(def)

    if (browser) {
      if (options.bind) this.bind(options.bind)

      if (options.map) this.map = options.map
    }
  }

  public set(value: T | null): void {
    if (value !== null && this.map) value = this.map(value)

    this.store.set(value)
  }

  public update(updater: Updater<T | null>): void {
    this.store.update(updater)
  }

  public subscribe(run: Subscriber<T | null>, invalidate?: () => void): Unsubscriber {
    return this.store.subscribe(run, invalidate)
  }

  public extract(): T | null {
    return get(this.store)
  }

  private bind(store: Readable<unknown | null>): void {
    store.subscribe((value) => {
      if (value === null) this.store.set(null)
    })
  }
}

export function value<T>(options: Options<T> = {}): Value<T> {
  return new Value<T>(options)
}

function persistent<T>(key: string, def: T | null, session?: boolean): Writable<T | null> {
  const store = writable(load<T>(key) ?? def)
  const type = session ? 'sessionStorage' : 'localStorage'

  store.subscribe((value) => {
    if (value === null) window[type].removeItem(key)
    else window[type].setItem(key, JSON.stringify(value))
  })

  return store
}

function load<T>(key: string): T | null {
  const json = window.localStorage.getItem(key)

  return json === null ? null : (JSON.parse(json) as T)
}

interface Options<T> {
  /**
   * Key to persist the collection.
   */
  persist?: string

  /**
   * Persist the collection in the session storage.
   * If `persist` is not set, `session` is ignored.
   */
  session?: boolean

  /**
   * Nullify values when the bound store is null.
   */
  bind?: Readable<unknown | null>

  /**
   * Maps values on set.
   */
  map?: (item: T) => T

  /**
   * Default value.
   */
  default?: T
}
