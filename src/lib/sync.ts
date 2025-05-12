import type { Collection, Identifiable, SetOptions } from './collection'

export function sync<T extends Comparable, I = T>(
  input: Input<T, Parameters<Collection<T>['add']>[0], I>,
  collection: Collection<T>,
  options?: Options
) {
  const tobe = input as Comparable

  if (tobe._deleted !== null && tobe._deleted !== undefined) {
    collection.delete(tobe.id)

    return
  }

  const asis = collection.extract(tobe.id)

  if (asis === null) collection.add(tobe)
  else if (asis._version < tobe._version) collection.set(tobe, { add: true, ...options })
  else console.debug('Sync skipped', tobe)
}

type Input<T, M, Default> = M extends (arg: infer P) => T ? P : Default;

interface Comparable extends Identifiable {
  _version: number
  _deleted?: number | null
}

type Options = SetOptions
