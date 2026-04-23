import type { Knex } from 'knex';

import type { ComparisonType, DatabaseModel, DatabaseRecord, JoinType } from '@tupaia/database';
import type { Flatten, ObjectLikeFields, ObjectLikeKeys } from '@tupaia/types';

type FilterComparators = '!=' | 'ilike' | '=' | '>' | '<' | '<=' | '>=' | 'in' | 'not in' | '@>';

export type AdvancedFilterValue<T> = {
  comparisonType?: ComparisonType;
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
  [QueryConjunctions.AND]?: DbFilterCriteria<T>;
  [QueryConjunctions.OR]?: DbFilterCriteria<T>;
  [QueryConjunctions.RAW]?: {
    sql: string;
    parameters: readonly Knex.RawBinding[] | Knex.ValueDict | Knex.RawBinding;
  };
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

interface MultiJoinItem {
  joinWith: string;
  joinAs?: string;
  joinType?: JoinType;
  joinCondition: [string, string];
  fields?: Record<string, string | undefined>;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sort?: readonly string[];
  rawSort?: string;
  joinWith?: string;
  columns?: readonly string[] | readonly Record<string, string>[];
  joinCondition?: readonly [string, string];
  // Instance property of DatabaseModel, gets turned into multiJoin
  // TODO: Consolidate these two
  joins?: readonly MultiJoinItem[];
  // Passed to BaseDatabase#find options param TODO: Consolidate these two
  multiJoin?: readonly MultiJoinItem[];
  onConflictIgnore?: readonly string[];
}

interface BaseModelOverrides<
  Fields extends Object = Object,
  RecordT extends DatabaseRecord = DatabaseRecord,
> {
  all: () => Promise<RecordT[]>;
  create: (fields: Partial<Fields>) => Promise<RecordT>;
  createMany: (fields: Partial<Fields>[], customQueryOptions?: QueryOptions) => Promise<RecordT[]>;
  find: (filter: DbFilter<Fields>, customQueryOptions?: QueryOptions) => Promise<RecordT[]>;

  findOne: (filter: DbFilter<Fields>, customQueryOptions?: QueryOptions) => Promise<RecordT | null>;
  findOneOrThrow: (
    filter: DbFilter<Fields>,
    customQueryOptions?: QueryOptions,
    errorMessage?: string,
  ) => Promise<RecordT>;

  findByIdOrThrow: (
    id: string,
    customQueryOptions?: QueryOptions,
    errorMessage?: string,
  ) => Promise<RecordT>;
  findById: (id: string, customQueryOptions?: QueryOptions) => Promise<RecordT | null>;
  findManyById: (id: string | string[]) => Promise<RecordT[]>;

  update: (whereCondition: DbFilter<Fields>, fieldsToUpdate: Partial<Fields>) => Promise<void>;
  updateById: (id: string, fieldsToUpdate: Partial<Fields>) => Promise<void>;
  updateOrCreate: (
    whereCondition: DbFilter<Fields>,
    fieldsToUpsert: Partial<Fields>,
  ) => Promise<RecordT[]>;
}

export type Model<
  BaseModel extends DatabaseModel,
  Fields extends Object,
  RecordT extends DatabaseRecord,
> = Omit<BaseModel, keyof BaseModelOverrides> & BaseModelOverrides<Fields, RecordT>;
