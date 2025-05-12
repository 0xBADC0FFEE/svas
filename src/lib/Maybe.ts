export type Maybe<T, E extends Error = Error> = null | T | E

// opposite of Maybe - not a null or Error
export type Just<T extends Maybe<unknown>> = Exclude<T, null | Error>
