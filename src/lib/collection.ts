import {
  writable,
  type Readable,
  type Writable,
  type Subscriber,
  type Unsubscriber
} from 'svelte/store'
import { browser } from '$app/environment'
import type { Maybe } from './Maybe'
import type { GetOptions, Values } from './values'

export class Collection<T extends Identifiable, E extends Error = Error> implements Readable<Maybe<T[], E>> {
  private readonly store: Writable<Maybe<T[], E>>
  private readonly values?: Values<T, E>
  private readonly fetch: Options<T, E>['get']
  private readonly map: Options<T, E>['map']
  private readonly sort: Options<T, E>['sort']
  private readonly revalidate: number
  private readonly stale: boolean
  private timestamp: number = 0

  public constructor(options: Options<T, E>) {
    this.store = writable(null)
    this.values = options.values
    this.fetch = options.get
    this.map = options.map
    this.sort = options.sort
    this.revalidate = options.revalidate ?? DEFAULTS.revalidate
    this.stale = options.stale ?? DEFAULTS.stale

    if (browser) {
      if (options.persist !== undefined) this.persist(options.persist)

      if (options.bind !== undefined) this.bind(options.bind)
    }
  }

  public subscribe(run: Subscriber<Maybe<T[], E>>, invalidate?: () => void): Unsubscriber {
    this.sync()

    return this.store.subscribe(run, invalidate)
  }

  public add<I = T>(item: Input<T, typeof this.map, I>): void {
    const value = this.map?.(item) ?? item

    this.values?.set(value.id, value)

    this.store.update((items) => {
      if (items === null || items instanceof Error) return [value]
      else {
        if (items.find((item) => item.id === value.id) !== undefined) return items

        items.unshift(value)

        if (this.sort !== undefined) items.sort(this.sort)

        return items
      }
    })
  }

  public get(id: string, options?: GetOptions): Readable<Maybe<T, E>> {
    if (this.values === undefined) throw new Error('Collection: values is not defined')

    return this.values.get(id, options)
  }

  public extract(id: string): T | null {
    if (this.values === undefined) throw new Error('Collection: values is not defined')

    return this.values.extract(id)
  }

  public delete(id: string): void {
    this.values?.delete(id)

    this.store.update((items) => {
      if (items === null || items instanceof Error) return items

      return items.filter((item) => item.id !== id)
    })
  }

  public set<I = T>(item: Input<T, typeof this.map, I>, options?: SetOptions): Readable<T | E> {
    const value = this.map?.(item) ?? item

    this.store.update((items) => {
      if (items === null || items instanceof Error) return [item]

      const index = items.findIndex((i) => i.id === value.id)

      if (index === -1) return options?.add === true ? [value, ...items] : items

      items[index] = value

      if (this.sort !== undefined && options?.sort !== false) items.sort(this.sort)

      return items
    })

    if (options?.sync === false) return this.values?.get(value.id) as Readable<T | E>
    else return this.values?.set(value.id, value, options) as Readable<T | E>
  }

  public preset<I = T>(item: Input<T, typeof this.map, I>): void {
    this.set(item, { stash: true })
  }

  public reset(id: string): void {
    if (this.values === undefined) throw new Error('Collection: values is not defined')

    const value = this.values?.reset(id)

    if (value === null || value instanceof Error) return

    this.set(value, { sync: false })
  }

  public update(id: string, update: (item: T) => T | void, options?: SetOptions): void {
    if (this.values === undefined) throw new Error('Collection: values is not defined')

    const asis = this.values.extract(id)

    if (asis === null) return

    const tobe = update(asis) ?? asis

    this.set(tobe, options)
  }

  public sync(): this {
    const stale = this.timestamp === 0 || this.timestamp + this.revalidate < Date.now()

    if (stale) {
      if (!this.stale) this.clear()

      this.refresh()
    }

    return this
  }

  public replace<I = T>(items: Array<Input<T, typeof this.map, I>>): void {
    const values = this.map === undefined ? items : items.map((item) => this.map!(item))

    this.store.set(values)
    this.timestamp = Date.now()

    if (this.values !== undefined) for (const value of values) this.values.set(value.id, value)
  }

  private refresh(): void {
    if (this.fetch === undefined) return

    this.fetch().then((items) => {
      if (!(items instanceof Error)) this.replace(items)
      else this.store.set(items)
    })

    this.timestamp = Date.now()
  }

  private persist(key: string) {
    const stored = localStorage.getItem(key)

    if (stored !== null) {
      const items = JSON.parse(stored) as T[]

      this.store.set(items)

      if (this.values?.persistent === false)
        for (const item of items) this.values.set(item.id, item)
    }

    this.store.subscribe((items) => {
      if (items instanceof Error) return

      if (items === null) localStorage.removeItem(key)
      else localStorage.setItem(key, JSON.stringify(items))
    })
  }

  private bind(store: Readable<unknown | null>): void {
    store.subscribe((value) => {
      if (value === null) this.clear()
    })
  }

  private clear(): void {
    this.store.set(null)
    this.values?.clear()
    this.timestamp = 0
  }
}

type Input<T, M, Default> = M extends (arg: infer P) => T ? P : Default

interface Options<T = unknown, E extends Error = Error> {
  /** Fetches the collection. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get?: () => Promise<any[] | E>

  /** Maps the fetched item to the type of the collection. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map?: (item: any) => T

  /** Sorting function applied on updates. */
  sort?: (a: T, b: T) => number

  /** Time in milliseconds before revalidating the collection. */
  revalidate?: number

  /** Whether to keep the collection while revalidating. */
  stale?: boolean

  /** Values store. */
  values?: Values<T, E>

  /** Key to persist the collection. */
  persist?: string

  /** Nullifies the collection when the bound store is null. */
  bind?: Readable<unknown | null>
}

export interface Identifiable {
  id: string
}

export interface SetOptions {
  /** Whether to sort the collection after setting the item. Defaults to true. */
  sort?: boolean

  /** Whether to add the item to the collection if it does not exist. Defaults to false. */
  add?: boolean

  /** Whether value is transient. Defaults to false. */
  stash?: boolean

  /** Whether to sync the collection values after setting the item. Defaults to true. */
  sync?: boolean
}

export function collection<T extends Identifiable, E extends Error = Error>(
  options: Options<T, E>
): Collection<T, E> {
  return new Collection(options)
}

const DEFAULTS = {
  revalidate: 300_000,
  stale: false
} as const satisfies Omit<Options, 'get'>
