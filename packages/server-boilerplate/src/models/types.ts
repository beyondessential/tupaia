/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseType } from '@tupaia/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

// Extracts keys that have object-like values from type T
export type ObjectLikeKeys<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? K : never;
}[keyof T];

// Flattens nested object to shallow object with keys joined by J
// eg. Flatten<{ cat: { cute: true } }, '_is_'> => { cat_is_cute: true }
export type Flatten<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, Record<string, any>>,
  J extends string = '.',
  K extends keyof T & string = keyof T & string
> = UnionToIntersection<
  {
    [V in K]: { [field in keyof T[V] & string as `${V}${J}${field}`]: T[V][field] };
  }[K]
>;

export type PartialOrArray<T> = {
  [field in keyof T]?: T[field] extends Record<string, unknown>
    ? PartialOrArray<T[field]>
    : T[field] | T[field][];
};

export type DbConditional<T> = PartialOrArray<Omit<T, ObjectLikeKeys<T>>> &
  PartialOrArray<Flatten<Pick<T, ObjectLikeKeys<T>>, '->>'>>;

export type Joined<T, U extends string> = {
  [field in keyof T as field extends string ? `${U}.${field}` : never]: T[field];
};

export type Model<BaseModel extends DatabaseModel, Fields, Type extends DatabaseType> = {
  find: (filter: DbConditional<Fields>) => Promise<Type[]>;
  findOne: (filter: DbConditional<Fields>) => Promise<Type>;
} & BaseModel;
