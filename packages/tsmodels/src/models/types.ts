import { DatabaseModel, DatabaseRecord } from '@tupaia/database';
import { ObjectLikeKeys, ObjectLikeFields, Flatten } from '@tupaia/types';

type FilterComparators = '!=' | 'ilike' | '=' | '>' | '<' | '<=' | '>=' | 'in' | 'not in' | '@>';
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
  [QueryConjunctions.AND]?: DbFilterCriteria<T>;
  [QueryConjunctions.OR]?: DbFilterCriteria<T>;
  [QueryConjunctions.RAW]?: {
    sql: string;
    parameters: string[];
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
  joinType?: string;
  joinCondition: string[];
  fields?: Record<string, string | undefined>;
}

export type QueryOptions = {
  limit?: number;
  offset?: number;
  sort?: string[];
  rawSort?: string;
  joinWith?: string;
  columns?: string[] | Record<string, string>[];
  joinCondition?: [string, string];
  // Instance property of DatabaseModel, gets turned into multiJoin
  // TODO: Consolidate these two
  joins?: MultiJoinItem[];
  // Passed to BaseDatabase#find options param TODO: Consolidate these two
  multiJoin?: MultiJoinItem[];
};

type BaseModelOverrides<Fields = unknown, RecordT = unknown> = {
  find: (filter: DbFilter<Fields>, customQueryOptions?: QueryOptions) => Promise<RecordT[]>;
  findOne: (filter: DbFilter<Fields>, customQueryOptions?: QueryOptions) => Promise<RecordT>;
  findById: (id: string, customQueryOptions?: QueryOptions) => Promise<RecordT>;
  update: (whereCondition: DbFilter<Fields>, fieldsToUpdate: Partial<Fields>) => Promise<void>;
  all: () => Promise<RecordT[]>;
};

export type Model<BaseModel extends DatabaseModel, Fields, RecordT extends DatabaseRecord> = Omit<
  BaseModel,
  keyof BaseModelOverrides
> &
  BaseModelOverrides<Fields, RecordT>;
