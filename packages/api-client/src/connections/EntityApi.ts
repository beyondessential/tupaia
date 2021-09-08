/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import type {
  EntityFields,
  GroupByAncestorRelationshipsResponseBody,
  GroupByDescendantRelationshipsResponseBody,
  FlattableEntityFieldName,
  ExtendedEntityFieldName,
  FlattenedEntity,
  EntityResponseObject,
} from '@tupaia/entity-server/src/type-exports';

import type { FilterCriteria, AdvancedFilterValue } from '@tupaia/server-boilerplate/src/type-exports';

import { ApiConnection } from './ApiConnection';
import { BaseApi } from './BaseApi';

const CLAUSE_DELIMITER = ';';
const NESTED_FIELD_DELIMITER = '_';
const MULTIPLE_VALUES_DELIMITER = ',';

// Inspired by Google Analytics filter: https://developers.google.com/analytics/devguides/reporting/core/v3/reference?hl=en#filters
const comparatorToOperator = {
  '=': '==' as const, // Exact match
  '!=': '!=' as const, // Does not match
  ilike: '=@' as const, // Contains sub string
};

type ValueOf<T> = T extends Record<string, any> ? T[keyof T] : never;

type NonNullableFields<T> = {
  [field in keyof T]: NonNullable<T[field]>;
};

type EntityApiFilter = FilterCriteria<NonNullableFields<EntityFields>>;

type EntityApiQueryOptions = {
  field?: FlattableEntityFieldName;
  fields?: ExtendedEntityFieldName[];
  filter?: EntityApiFilter;
};

type RelationshipsSubQueryOptions = Omit<EntityApiQueryOptions, 'fields'>;

type EntityApiResponse<T extends ExtendedEntityFieldName[]> = Required<
  Pick<EntityResponseObject, T[number]>
>;

const isAdvancedFilter = (
  filter: EntityApiFilter | ValueOf<EntityApiFilter>,
): filter is AdvancedFilterValue<any> =>
  typeof filter === 'object' &&
  filter !== null &&
  Object.keys(filter).length === 2 &&
  'comparator' in filter &&
  'comparisonValue' in filter;

const recurseFilter = (
  filter: EntityApiFilter | ValueOf<EntityApiFilter>,
  filterArray: [string[], ValueOf<typeof comparatorToOperator>, string[]][] = [],
  nestedKeys: string[] = [],
) => {
  if (isAdvancedFilter(filter)) {
    const value = filter.comparisonValue;
    filterArray.push([
      nestedKeys,
      comparatorToOperator[filter.comparator],
      Array.isArray(value) ? value : [value],
    ]);
    return filterArray;
  }

  if (typeof filter === 'object') {
    Object.entries(filter).forEach(([subKey, value]) =>
      recurseFilter(value, filterArray, nestedKeys.concat(subKey)),
    );
    return filterArray;
  }

  if (Array.isArray(filter)) {
    filterArray.push([nestedKeys, '==', filter]);
    return filterArray;
  }

  if (typeof filter === 'string') {
    filterArray.push([nestedKeys, '==', [filter]]);
    return filterArray;
  }

  // Ignore all other values
  return filterArray;
};

type Prefix<T, P extends string> = {
  [field in keyof T & string as `${P}_${field}`]: T[field];
};

export class EntityApi extends BaseApi {

  private stringifyFields(fields?: ExtendedEntityFieldName[]) {
    return fields ? fields.join(',') : undefined;
  }

  private stringifyFilter(filter?: EntityApiFilter) {
    return filter
      ? recurseFilter(filter)
          .map(
            ([keys, operator, values]) =>
              `${keys.join(NESTED_FIELD_DELIMITER)}${operator}${values.join(
                MULTIPLE_VALUES_DELIMITER,
              )}`,
          )
          .join(CLAUSE_DELIMITER)
      : undefined;
  }

  private stringifyQueryParameters(queryOptions?: EntityApiQueryOptions) {
    if (!queryOptions) {
      return undefined;
    }

    const { field, fields, filter } = queryOptions;
    return { field, fields: this.stringifyFields(fields), filter: this.stringifyFilter(filter) };
  }

  private stringifyRelationshipsSubQueryParameters<Pref extends 'ancestor' | 'descendant'>(
    queryOptions: RelationshipsSubQueryOptions | undefined,
    prefix: Pref,
  ) {
    const stringifiedParameters = this.stringifyQueryParameters(queryOptions);
    if (!stringifiedParameters) {
      return undefined;
    }

    const { field, filter } = stringifiedParameters;
    return {
      [`${prefix}_field`]: field,
      [`${prefix}_filter`]: filter,
    } as Prefix<{ field?: string; filter?: string }, `${Pref}_`>;
  }

  public async getEntity(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      field: FlattableEntityFieldName;
      filter?: EntityApiFilter;
    },
  ): Promise<FlattenedEntity>;
  public async getEntity<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      fields: T;
      filter?: EntityApiFilter;
    },
  ): Promise<EntityApiResponse<T>>;
  public async getEntity<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      field?: FlattableEntityFieldName;
      fields?: T;
      filter?: EntityApiFilter;
    },
  ) {
    return this.connection.get(`hierarchy/${hierarchyName}/${entityCode}`, {
      ...this.stringifyQueryParameters(queryOptions),
    });
  }

  public async getEntities(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      field: FlattableEntityFieldName;
      filter?: EntityApiFilter;
    },
  ): Promise<FlattenedEntity[]>;
  public async getEntities<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      fields: T;
      filter?: EntityApiFilter;
    },
  ): Promise<EntityApiResponse<T>[]>;
  public async getEntities<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      field?: FlattableEntityFieldName;
      fields?: T;
      filter?: EntityApiFilter;
    },
  ) {
    return this.connection.post(
      `hierarchy/${hierarchyName}`,
      {
        ...this.stringifyQueryParameters(queryOptions),
      },
      {
        entities: entityCodes,
      },
    );
  }

  public async getDescendantsOfEntity(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      field: FlattableEntityFieldName;
      filter?: EntityApiFilter;
    },
    includeRootEntity?: boolean,
  ): Promise<FlattenedEntity[]>;
  public async getDescendantsOfEntity<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      fields: T;
      filter?: EntityApiFilter;
    },
    includeRootEntity?: boolean,
  ): Promise<EntityApiResponse<T>[]>;
  public async getDescendantsOfEntity<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      field?: FlattableEntityFieldName;
      fields?: T;
      filter?: EntityApiFilter;
    },
    includeRootEntity = false,
  ) {
    return this.connection.get(`hierarchy/${hierarchyName}/${entityCode}/descendants`, {
      ...this.stringifyQueryParameters(queryOptions),
      includeRootEntity: `${includeRootEntity}`,
    });
  }

  public async getDescendantsOfEntities(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      field: FlattableEntityFieldName;
      filter?: EntityApiFilter;
    },
    includeRootEntity?: boolean,
  ): Promise<FlattenedEntity[]>;
  public async getDescendantsOfEntities<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      fields: T;
      filter?: EntityApiFilter;
    },
    includeRootEntity?: boolean,
  ): Promise<EntityApiResponse<T>[]>;
  public async getDescendantsOfEntities<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      field?: FlattableEntityFieldName;
      fields?: T;
      filter?: EntityApiFilter;
    },
    includeRootEntity = false,
  ) {
    return this.connection.post(
      `hierarchy/${hierarchyName}/descendants`,
      {
        ...this.stringifyQueryParameters(queryOptions),
        includeRootEntity: `${includeRootEntity}`,
      },
      {
        entities: entityCodes,
      },
    );
  }

  public async getRelativesOfEntity(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      field: FlattableEntityFieldName;
      filter?: EntityApiFilter;
    },
  ): Promise<FlattenedEntity[]>;
  public async getRelativesOfEntity<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      fields: T;
      filter?: EntityApiFilter;
    },
  ): Promise<EntityApiResponse<T>[]>;
  public async getRelativesOfEntity<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      field?: FlattableEntityFieldName;
      fields?: T;
      filter?: EntityApiFilter;
    },
  ) {
    return this.connection.get(`hierarchy/${hierarchyName}/${entityCode}/relatives`, {
      ...this.stringifyQueryParameters(queryOptions),
    });
  }

  public async getRelativesOfEntities(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      field: FlattableEntityFieldName;
      filter?: EntityApiFilter;
    },
  ): Promise<FlattenedEntity[]>;
  public async getRelativesOfEntities<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      fields: T;
      filter?: EntityApiFilter;
    },
  ): Promise<EntityApiResponse<T>[]>;
  public async getRelativesOfEntities<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      field?: FlattableEntityFieldName;
      fields?: T;
      filter?: EntityApiFilter;
    },
  ) {
    return this.connection.post(
      `hierarchy/${hierarchyName}/relatives`,
      {
        ...this.stringifyQueryParameters(queryOptions),
      },
      {
        entities: entityCodes,
      },
    );
  }

  public async getRelationshipsOfEntity(
    hierarchyName: string,
    entityCode: string,
    groupBy: 'ancestor',
    queryOptions?: EntityApiQueryOptions,
    ancestorQueryOptions?: RelationshipsSubQueryOptions,
    descendantQueryOptions?: RelationshipsSubQueryOptions,
  ): Promise<GroupByAncestorRelationshipsResponseBody>;
  public async getRelationshipsOfEntity(
    hierarchyName: string,
    entityCode: string,
    groupBy: 'descendant',
    queryOptions?: EntityApiQueryOptions,
    ancestorQueryOptions?: RelationshipsSubQueryOptions,
    descendantQueryOptions?: RelationshipsSubQueryOptions,
  ): Promise<GroupByDescendantRelationshipsResponseBody>;
  public async getRelationshipsOfEntity(
    hierarchyName: string,
    entityCode: string,
    groupBy: 'ancestor' | 'descendant',
    queryOptions?: EntityApiQueryOptions,
    ancestorQueryOptions?: RelationshipsSubQueryOptions,
    descendantQueryOptions?: RelationshipsSubQueryOptions,
  ) {
    return this.connection.get(`hierarchy/${hierarchyName}/${entityCode}/relationships`, {
      ...this.stringifyQueryParameters(queryOptions),
      ...this.stringifyRelationshipsSubQueryParameters(ancestorQueryOptions, 'ancestor'),
      ...this.stringifyRelationshipsSubQueryParameters(descendantQueryOptions, 'descendant'),
      groupBy,
    });
  }

  public async getRelationshipsOfEntities(
    hierarchyName: string,
    entityCodes: string[],
    groupBy: 'ancestor',
    queryOptions?: EntityApiQueryOptions,
    ancestorQueryOptions?: RelationshipsSubQueryOptions,
    descendantQueryOptions?: RelationshipsSubQueryOptions,
  ): Promise<GroupByAncestorRelationshipsResponseBody>;

  public async getRelationshipsOfEntities(
    hierarchyName: string,
    entityCodes: string[],
    groupBy: 'descendant',
    queryOptions?: EntityApiQueryOptions,
    ancestorQueryOptions?: RelationshipsSubQueryOptions,
    descendantQueryOptions?: RelationshipsSubQueryOptions,
  ): Promise<GroupByDescendantRelationshipsResponseBody>;
  public async getRelationshipsOfEntities(
    hierarchyName: string,
    entityCodes: string[],
    groupBy: 'ancestor' | 'descendant',
    queryOptions?: EntityApiQueryOptions,
    ancestorQueryOptions?: RelationshipsSubQueryOptions,
    descendantQueryOptions?: RelationshipsSubQueryOptions,
  ) {
    return this.connection.post(
      `hierarchy/${hierarchyName}/relationships`,
      {
        ...this.stringifyQueryParameters(queryOptions),
        ...this.stringifyRelationshipsSubQueryParameters(ancestorQueryOptions, 'ancestor'),
        ...this.stringifyRelationshipsSubQueryParameters(descendantQueryOptions, 'descendant'),
        groupBy,
      },
      {
        entities: entityCodes,
      },
    );
  }
}
