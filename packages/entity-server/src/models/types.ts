/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseType } from '@tupaia/database';
import { ObjectLikeKeys, Flatten } from '../types';

type FilterComparators = '!=' | 'ilike' | '=';

type AdvancedFilterValue<T> = {
  comparator: FilterComparators;
  comparisonValue: T | T[];
};

/**
 * Example:
 * {
 *    type: 'facility',
 *    name: {
 *        comparator: 'ilike',
 *        comparisonValue: '%Pallet%'
 *    }
 * }
 */
type NormalCriteria<T> = {
  [field in keyof T]?: T[field] | T[field][] | AdvancedFilterValue<T[field]>;
};

export enum QueryConjunctions {
  AND = '_and_',
  OR = '_or_',
  RAW = '_raw_',
}

/**
 * Example:
 * {
 *    _and_: {
 *        country_code: ['TO', 'KI']
 *    }
 * }
 */
type ConjunctionCriteria<T> = {
  [field in QueryConjunctions]?: FilterCriteria<T>;
}

type FilterCriteria<T> = NormalCriteria<T> & ConjunctionCriteria<T>;

export type DbConditional<T> = FilterCriteria<Omit<T, ObjectLikeKeys<T>>> &
  FilterCriteria<Flatten<Pick<T, ObjectLikeKeys<T>>, '->>'>>;

export type Joined<T, U extends string> = {
  [field in keyof T as field extends string ? `${U}.${field}` : never]: T[field];
};

export type Model<BaseModel extends DatabaseModel, Fields, Type extends DatabaseType> = {
  find: (filter: DbConditional<Fields>) => Promise<Type[]>;
  findOne: (filter: DbConditional<Fields>) => Promise<Type>;
} & BaseModel;
