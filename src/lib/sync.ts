import { Collection, type Identifiable, type SetOptions } from './collection'
import { Value } from './value'

export function sync<T extends Comparable>(
  store: Collection<T> | Value<T>,
  tobe: T,
  options?: Options
) {
  if (store instanceof Collection)
    syncCollection(store, tobe, options)
  else if (store instanceof Value)
    syncValue(store, tobe)
}

function syncCollection<T extends Comparable>(
  collection: Collection<T>,
  tobe: T,
  options?: Options
) {
  if (tobe._deleted !== null && tobe._deleted !== undefined && options?.delete !== false) {
    collection.delete(tobe.id)

    return
  }

  const asis = collection.extract(tobe.id)

  if (asis === null) collection.add(tobe)
  else if (asis._version < tobe._version) collection.set(tobe, { add: true, ...options })
}

function syncValue<T extends Comparable>(
  value: Value<T>,
  tobe: T,
) {
  const asis = value.extract()

  if (asis === null) value.set(tobe)
  else if (asis._version < tobe._version) value.set(tobe)
}

interface Comparable extends Identifiable {
  _version: number
  _deleted?: number | null
}

interface Options extends SetOptions {
  /** Whether to delete the item `_deleted` is set. Defaults to `true`. */
  delete?: boolean
}
