import {
  get,
  writable,
  type Readable,
  type Subscriber,
  type Unsubscriber,
  type Updater,
  type Writable
} from 'svelte/store'

class Value<T> implements Writable<T | null> {
  private readonly store: Writable<T | null>
  private readonly default: T | null

  public constructor(options: Options<T>) {
    this.default = options.default ?? null

    this.store = options.persist === undefined || typeof window === 'undefined'
      ? writable<T | null>(this.default)
      : persistent<T>(options.persist as string, this.default, options.session)

    if (options.bind)
      this.bind(options.bind)
  }

  public set(value: T | null): void {

    this.store.set(value)
  }

  public update(updater: Updater<T | null>): void {
    this.store.update((value) => {
      const updated = updater(value)

      return updated
    })
  }

  public subscribe(run: Subscriber<T | null>, invalidate?: () => void): Unsubscriber {
    return this.store.subscribe(run, invalidate)
  }

  public extract(): T | null {
    return get(this.store)
  }

  private bind(store: Readable<unknown | null>): void {
    store.subscribe((value) => {
      if (value === null)
        this.store.set(this.default)
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

  if (json === null) return null

  try {
    return JSON.parse(json) as T
  } catch (error) {
    console.error(`Invalid storage value for ${key}`, error)

    return null
  }
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
   * Default value.
   */
  default?: T
}
