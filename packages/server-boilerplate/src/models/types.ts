/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseType } from '@tupaia/database';
import { ObjectLikeKeys, ObjectLikeFields, Flatten } from '@tupaia/types';

type FilterComparators = '!=' | 'ilike' | '=' | '>' | '<' | '<=' | '>=' | 'in' | 'not in';
type ComparisonTypes = 'where' | 'whereBetween' | 'whereIn' | 'orWhere';

export type AdvancedFilterValue<T> = {
  comparisonType?: ComparisonTypes;
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
export type FilterCriteria<T> = {
  [field in keyof T]?: T[field] extends Record<string, unknown>
    ? PartialOrArray<T[field]>
    : T[field] | T[field][] | AdvancedFilterValue<T[field]>;
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
  [field in QueryConjunctions]?: DbFilterCriteria<T>;
};

type DbFilterCriteria<T> = FilterCriteria<T> & ConjunctionCriteria<T>;

export type PartialOrArray<T> = {
  [field in keyof T]?: T[field] extends Record<string, unknown>
    ? PartialOrArray<T[field]>
    : T[field] | T[field][];
};

export type DbFilter<T> = DbFilterCriteria<Omit<T, ObjectLikeKeys<T>>> &
  DbFilterCriteria<Flatten<ObjectLikeFields<T>, '->>'>>;

export type Joined<T, U extends string> = {
  [field in keyof T as field extends string ? `${U}.${field}` : never]: T[field];
};

export type QueryOptions = {
  limit?: number;
  offset?: number;
  sort?: string[];
};

type BaseModelOverrides<Fields = unknown, Type = unknown> = {
  find: (filter: DbFilter<Fields>, customQueryOptions?: QueryOptions) => Promise<Type[]>;
  findOne: (filter: DbFilter<Fields>, customQueryOptions?: QueryOptions) => Promise<Type>;
};

export type Model<BaseModel extends DatabaseModel, Fields, Type extends DatabaseType> = Omit<
  BaseModel,
  keyof BaseModelOverrides
> &
  BaseModelOverrides<Fields, Type>;
