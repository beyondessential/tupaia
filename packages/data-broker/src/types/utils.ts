/**
 * Return the values of the provided object type `T`
 */
export type Values<T extends Record<string, unknown>> = T[keyof T] extends never
  ? unknown
  : T[keyof T];

export type Join<T, S, U extends string> = T extends string
  ? S extends string
    ? `${T}${U}${S}`
    : never
  : never;

/**
 * Make keys listed in `K` required in `T`
 */
export type RequireKeys<T, K extends keyof T> = T & { [key in K]-?: T[key] };

/**
 * Override fields of `T` using the fields of `S`
 */
export type Override<T, S extends Record<string, unknown> = Record<string, never>> = Omit<
  T,
  keyof S
> &
  S;
