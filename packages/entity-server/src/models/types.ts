/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseType } from '@tupaia/database';

export type DbConditional<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [field in keyof T]?: T[field] extends Record<any, any>
    ? DbConditional<T[field]>
    : T[field] | T[field][];
};

export type Joined<T, U extends string> = {
  [field in keyof T as field extends string ? `${U}.${field}` : never]: T[field];
};

export type Model<BaseModel extends DatabaseModel, Fields, Type extends DatabaseType> = {
  find: (filter: DbConditional<Fields>) => Promise<Type[]>;
  findOne: (filter: DbConditional<Fields>) => Promise<Type>;
} & BaseModel;
