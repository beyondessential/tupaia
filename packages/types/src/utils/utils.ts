// TODO: Switch to 'Awaited' when upgrading to typescript 4.5+
export type Resolved<T> = T extends PromiseLike<infer R> ? R : T;

/**
 * Returns keys of type that cannot be null, eg.
 * NonNullKeys<{ cat: string; dog: number; fish: boolean | null; }> => 'cat' | 'dog'
 */
export type NonNullKeys<T> = { [K in keyof T]-?: null | T[K] extends T[K] ? never : K }[keyof T];

/**
 * Returns keys of type that can be null, eg.
 * NullableKeys<{ cat: string; dog: number; fish: boolean | null; }> => 'fish'
 */
export type NullableKeys<T> = { [K in keyof T]-?: null | T[K] extends T[K] ? K : never }[keyof T];

/**
 * Maps keys of type that fields which can be null are instead optional (useful for serializing database items to JSON output)
 * NullableKeysToOptional<{ cat: string; dog: number; fish: boolean | null; }> => { cat: string; dog: number; fish?: boolean; }
 */
export type NullableKeysToOptional<T> = Pick<T, NonNullKeys<T>> & {
  [P in NullableKeys<T>]?: Exclude<T[P], null>;
};

/**
 * Deeply partial object, eg.
 * RecursivePartial<{ cat: { age: number } }> = { cat?: { age?: number } }
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

/**
 * Extracts keys that have numeric values from type T
 */
export type NumericKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

/**
 * Extracts keys that have object-like values from type T
 */
export type ObjectLikeKeys<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? K : never;
}[keyof T];

// Extracts fields that have object-like values from type T
export type ObjectLikeFields<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? T[K] : never;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

// Flattens nested object to shallow object with keys joined by J
// eg. Flatten<{ cat: { cute: true } }, '_is_'> => { cat_is_cute: true }
export type Flatten<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, Record<string, any>>,
  J extends string = '.',
  K extends keyof T & string = keyof T & string,
> = UnionToIntersection<
  {
    [V in K]: { [field in keyof T[V] & string as `${V}${J}${field}`]: T[V][field] };
  }[K]
>;

export type ValueOf<T> = T extends Record<string | number | symbol, unknown> ? T[keyof T] : never;

export type Writable<T> = { -readonly [field in keyof T]?: T[field] };
