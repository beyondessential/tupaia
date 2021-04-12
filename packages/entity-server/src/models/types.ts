/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseType } from '@tupaia/database';
import { ObjectLikeKeys, Flatten } from '../types';

type PartialOrArray<T> = {
  [field in keyof T]?: T[field] | T[field][];
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
