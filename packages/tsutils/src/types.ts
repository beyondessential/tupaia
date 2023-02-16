/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

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
export type NullableKeysToOptional<T> = Pick<T, NonNullKeys<T>> &
  { [P in NullableKeys<T>]?: Exclude<T[P], null> };

/**
 * Deeply partial object, eg.
 * RecursivePartial<{ cat: { age: number } }> = { cat?: { age?: number } }
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};
