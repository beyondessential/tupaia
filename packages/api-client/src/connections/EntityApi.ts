/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { BaseApi } from './BaseApi';
import { PublicInterface } from './types';

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

const isAdvancedFilter = (filter: any): boolean =>
  typeof filter === 'object' &&
  filter !== null &&
  Object.keys(filter).length === 2 &&
  'comparator' in filter &&
  'comparisonValue' in filter;

const recurseFilter = (
  filter: any,
  filterArray: [string[], ValueOf<typeof comparatorToOperator>, string[]][] = [],
  nestedKeys: string[] = [],
) => {
  if (isAdvancedFilter(filter)) {
    const value = filter.comparisonValue;
    filterArray.push([
      nestedKeys,
      // @ts-expect-error For now this is unsafe, but will be fixed once entity server types are back
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
  private stringifyFields(fields?: string[]) {
    return fields ? fields.join(',') : undefined;
  }

  private stringifyFilter(filter?: any) {
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

  private stringifyQueryParameters(queryOptions?: any) {
    if (!queryOptions) {
      return undefined;
    }

    const { field, fields, filter } = queryOptions;
    return { field, fields: this.stringifyFields(fields), filter: this.stringifyFilter(filter) };
  }

  private stringifyRelationshipsSubQueryParameters<Pref extends 'ancestor' | 'descendant'>(
    queryOptions: any | undefined,
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
      field?: string;
      fields?: string[];
      filter?: any;
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
      field?: string;
      fields?: string[];
      filter?: any;
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
      field?: string;
      fields?: string[];
      filter?: any;
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
      field?: string;
      fields?: string[];
      filter?: any;
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
      field?: string;
      fields?: string[];
      filter?: any;
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
      field?: string;
      fields?: string[];
      filter?: any;
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
    groupBy: 'ancestor' | 'descendant',
    queryOptions?: any,
    ancestorQueryOptions?: any,
    descendantQueryOptions?: any,
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
    groupBy: 'ancestor' | 'descendant',
    queryOptions?: any,
    ancestorQueryOptions?: any,
    descendantQueryOptions?: any,
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

export interface EntityApiInterface extends PublicInterface<EntityApi> {}
