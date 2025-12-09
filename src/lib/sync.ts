import type { Collection, Identifiable, SetOptions } from './collection'

export function sync<T extends Comparable>(
  tobe: T,
  collection: Collection<T>,
  options?: Options
) {
  if (tobe._deleted !== null && tobe._deleted !== undefined) {
    collection.delete(tobe.id)

    return
  }

  const asis = collection.extract(tobe.id)

  if (asis === null) collection.add(tobe)
  else if (asis._version < tobe._version) collection.set(tobe, { add: true, ...options })
  else console.debug('Sync skipped', tobe)
}

interface Comparable extends Identifiable {
  _version: number
  _deleted?: number | null
}

type Options = SetOptions
