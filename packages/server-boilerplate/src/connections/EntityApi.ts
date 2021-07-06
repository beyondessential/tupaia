/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import type {
  EntityApiQueryOptions,
  EntityApiResponse,
  EntityFilterObject,
  RelationshipsSubQueryOptions,
  GroupByAncestorRelationshipsResponseBody,
  GroupByDescendantRelationshipsResponseBody,
  FlattableEntityFieldName,
  ExtendedEntityFieldName,
  FlattenedEntity,
} from '@tupaia/entity-server';

import { RequestConnection } from './RequestConnection';

const { ENTITY_API_URL = 'http://localhost:8050/v1' } = process.env;

export const CLAUSE_DELIMITER = ';';
export const FIELD_VALUE_DELIMITER = ':';
export const NESTED_FIELD_DELIMITER = '_';
export const MULTIPLE_VALUES_DELIMITER = ',';

const recurseFilter = (
  filter: unknown,
  filterArray: [string[], string[]][] = [],
  nestedKeys: string[] = [],
) => {
  if (typeof filter === 'object' && filter !== null) {
    Object.entries(filter).forEach(([subKey, value]) =>
      recurseFilter(value, filterArray, nestedKeys.concat(subKey)),
    );
    return filterArray;
  }

  if (Array.isArray(filter)) {
    filterArray.push([nestedKeys, filter]);
    return filterArray;
  }

  if (typeof filter === 'string') {
    filterArray.push([nestedKeys, [filter]]);
    return filterArray;
  }

  // Ignore all other values
  return filterArray;
};

type Prefix<T, P extends string> = {
  [field in keyof T & string as `${P}_${field}`]: T[field];
};

export class EntityApi {
  baseUrl = ENTITY_API_URL;

  private readonly connection: RequestConnection;

  constructor(connection: RequestConnection) {
    this.connection = connection;
  }

  private stringifyFields(fields?: EntityApiQueryOptions['fields']) {
    return fields ? fields.join(',') : undefined;
  }

  private stringifyFilter(filter?: EntityApiQueryOptions['filter']) {
    return filter
      ? recurseFilter(filter)
          .map(
            ([keys, values]) =>
              `${keys.join(NESTED_FIELD_DELIMITER)}${FIELD_VALUE_DELIMITER}${values.join(
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
      filter?: EntityFilterObject;
    },
  ): Promise<FlattenedEntity>;
  public async getEntity<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      fields: T;
      filter?: EntityFilterObject;
    },
  ): Promise<EntityApiResponse<T>>;
  public async getEntity<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      field?: FlattableEntityFieldName;
      fields?: T;
      filter?: EntityFilterObject;
    },
  ) {
    return this.connection.get(this.baseUrl, `hierarchy/${hierarchyName}/${entityCode}`, {
      ...this.stringifyQueryParameters(queryOptions),
    });
  }

  getEntities(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      field: FlattableEntityFieldName;
      filter?: EntityFilterObject;
    },
  ): Promise<FlattenedEntity[]>;
  getEntities<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      fields: T;
      filter?: EntityFilterObject;
    },
  ): Promise<EntityApiResponse<T>[]>;
  public async getEntities<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      field?: FlattableEntityFieldName;
      fields?: T;
      filter?: EntityFilterObject;
    },
  ) {
    return this.connection.get(this.baseUrl, `hierarchy/${hierarchyName}`, {
      ...this.stringifyQueryParameters(queryOptions),
      entities: entityCodes.join(MULTIPLE_VALUES_DELIMITER),
    });
  }

  getDescendantsOfEntity(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      field: FlattableEntityFieldName;
      filter?: EntityFilterObject;
    },
    includeRootEntity?: boolean,
  ): Promise<FlattenedEntity[]>;
  getDescendantsOfEntity<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      fields: T;
      filter?: EntityFilterObject;
    },
    includeRootEntity?: boolean,
  ): Promise<EntityApiResponse<T>[]>;
  public async getDescendantsOfEntity<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      field?: FlattableEntityFieldName;
      fields?: T;
      filter?: EntityFilterObject;
    },
    includeRootEntity = false,
  ) {
    return this.connection.get(
      this.baseUrl,
      `hierarchy/${hierarchyName}/${entityCode}/descendants`,
      {
        ...this.stringifyQueryParameters(queryOptions),
        includeRootEntity: `${includeRootEntity}`,
      },
    );
  }

  getDescendantsOfEntities(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      field: FlattableEntityFieldName;
      filter?: EntityFilterObject;
    },
    includeRootEntity?: boolean,
  ): Promise<FlattenedEntity[]>;
  getDescendantsOfEntities<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      fields: T;
      filter?: EntityFilterObject;
    },
    includeRootEntity?: boolean,
  ): Promise<EntityApiResponse<T>[]>;
  public async getDescendantsOfEntities<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      field?: FlattableEntityFieldName;
      fields?: T;
      filter?: EntityFilterObject;
    },
    includeRootEntity = false,
  ) {
    return this.connection.get(this.baseUrl, `hierarchy/${hierarchyName}/descendants`, {
      ...this.stringifyQueryParameters(queryOptions),
      entities: entityCodes.join(MULTIPLE_VALUES_DELIMITER),
      includeRootEntity: `${includeRootEntity}`,
    });
  }

  getRelativesOfEntity(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      field: FlattableEntityFieldName;
      filter?: EntityFilterObject;
    },
  ): Promise<FlattenedEntity[]>;
  getRelativesOfEntity<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      fields: T;
      filter?: EntityFilterObject;
    },
  ): Promise<EntityApiResponse<T>[]>;
  public async getRelativesOfEntity<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      field?: FlattableEntityFieldName;
      fields?: T;
      filter?: EntityFilterObject;
    },
  ) {
    return this.connection.get(this.baseUrl, `hierarchy/${hierarchyName}/${entityCode}/relatives`, {
      ...this.stringifyQueryParameters(queryOptions),
    });
  }

  getRelativesOfEntities(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      field: FlattableEntityFieldName;
      filter?: EntityFilterObject;
    },
  ): Promise<FlattenedEntity[]>;
  getRelativesOfEntities<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      fields: T;
      filter?: EntityFilterObject;
    },
  ): Promise<EntityApiResponse<T>[]>;
  public async getRelativesOfEntities<T extends ExtendedEntityFieldName[]>(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      field?: FlattableEntityFieldName;
      fields?: T;
      filter?: EntityFilterObject;
    },
  ) {
    return this.connection.get(this.baseUrl, `hierarchy/${hierarchyName}/relatives`, {
      ...this.stringifyQueryParameters(queryOptions),
      entities: entityCodes.join(MULTIPLE_VALUES_DELIMITER),
    });
  }

  getRelationshipsOfEntity(
    hierarchyName: string,
    entityCode: string,
    groupBy: 'ancestor',
    queryOptions?: EntityApiQueryOptions,
    ancestorQueryOptions?: RelationshipsSubQueryOptions,
    descendantQueryOptions?: RelationshipsSubQueryOptions,
  ): Promise<GroupByAncestorRelationshipsResponseBody>;
  getRelationshipsOfEntity(
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
    return this.connection.get(
      this.baseUrl,
      `hierarchy/${hierarchyName}/${entityCode}/relationships`,
      {
        ...this.stringifyQueryParameters(queryOptions),
        ...this.stringifyRelationshipsSubQueryParameters(ancestorQueryOptions, 'ancestor'),
        ...this.stringifyRelationshipsSubQueryParameters(descendantQueryOptions, 'descendant'),
        groupBy,
      },
    );
  }

  getRelationshipsOfEntities(
    hierarchyName: string,
    entityCodes: string[],
    groupBy: 'ancestor',
    queryOptions?: EntityApiQueryOptions,
    ancestorQueryOptions?: RelationshipsSubQueryOptions,
    descendantQueryOptions?: RelationshipsSubQueryOptions,
  ): Promise<GroupByAncestorRelationshipsResponseBody>;

  getRelationshipsOfEntities(
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
    return this.connection.get(this.baseUrl, `hierarchy/${hierarchyName}/relationships`, {
      ...this.stringifyQueryParameters(queryOptions),
      ...this.stringifyRelationshipsSubQueryParameters(ancestorQueryOptions, 'ancestor'),
      ...this.stringifyRelationshipsSubQueryParameters(descendantQueryOptions, 'descendant'),
      entities: entityCodes.join(MULTIPLE_VALUES_DELIMITER),
      groupBy,
    });
  }
}
