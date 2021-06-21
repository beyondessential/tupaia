/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { OutboundConnection, AuthHandler } from '@tupaia/server-boilerplate';

import { PartialOrArray } from '../types';
import { EntityFields } from '../models';
import {
  GroupByAncestorRelationshipsResponseBody,
  GroupByDescendantRelationshipsResponseBody,
} from '../routes/hierarchy/relationships';
import {
  FlattableEntityFieldName,
  ExtendedEntityFieldName,
  EntityResponseObject,
  FlattenedEntity,
} from '../routes/hierarchy/types';

type EntityFilterObject = PartialOrArray<EntityFields>;

type EntityApiQueryOptions = {
  field?: FlattableEntityFieldName;
  fields?: ExtendedEntityFieldName[];
  filter?: EntityFilterObject;
};
type RelationshipsSubQueryOptions = Omit<EntityApiQueryOptions, 'fields'>;

type EntityApiResponse<T extends ExtendedEntityFieldName[]> = Required<
  Pick<EntityResponseObject, T[number]>
>;

const { ENTITY_API_URL = 'http://localhost:8050/v1' } = process.env;

const CLAUSE_DELIMITER = ';';
const FIELD_VALUE_DELIMITER = ':';
const NESTED_FIELD_DELIMITER = '_';
const MULTIPLE_VALUES_DELIMITER = ',';

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

  //Ignore all other values
  return filterArray;
};

type Prefix<T, P extends string> = {
  [field in keyof T & string as `${P}_${field}`]: T[field];
};

export class EntityApi {
  baseUrl = ENTITY_API_URL;

  private readonly outboundConnection: OutboundConnection;
  private readonly authHander: AuthHandler;

  constructor(apiConnection: OutboundConnection, authHandler: AuthHandler) {
    this.outboundConnection = apiConnection;
    this.authHander = authHandler;
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
  ): Promise<FlattenedEntity | Pick<EntityResponseObject, T[number]>> {
    return this.outboundConnection.get(
      await this.authHander.getAuthHeader(),
      this.baseUrl,
      `hierarchy/${hierarchyName}/${entityCode}`,
      {
        ...this.stringifyQueryParameters(queryOptions),
      },
    );
  }

  public async getEntities(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      field: FlattableEntityFieldName;
      filter?: EntityFilterObject;
    },
  ): Promise<FlattenedEntity[]>;
  public async getEntities<T extends ExtendedEntityFieldName[]>(
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
  ): Promise<FlattenedEntity[] | EntityApiResponse<T>[]> {
    return this.outboundConnection.get(
      await this.authHander.getAuthHeader(),
      this.baseUrl,
      `hierarchy/${hierarchyName}`,
      {
        ...this.stringifyQueryParameters(queryOptions),
        entities: entityCodes.join(MULTIPLE_VALUES_DELIMITER),
      },
    );
  }

  public async getDescendantsOfEntity(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      field: FlattableEntityFieldName;
      filter?: EntityFilterObject;
    },
    includeRootEntity?: boolean,
  ): Promise<FlattenedEntity[]>;
  public async getDescendantsOfEntity<T extends ExtendedEntityFieldName[]>(
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
  ): Promise<FlattenedEntity[] | EntityApiResponse<T>[]> {
    return this.outboundConnection.get(
      await this.authHander.getAuthHeader(),
      this.baseUrl,
      `hierarchy/${hierarchyName}/${entityCode}/descendants`,
      {
        ...this.stringifyQueryParameters(queryOptions),
        includeRootEntity: `${includeRootEntity}`,
      },
    );
  }

  public async getDescendantsOfEntities(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      field: FlattableEntityFieldName;
      filter?: EntityFilterObject;
    },
    includeRootEntity?: boolean,
  ): Promise<FlattenedEntity[]>;
  public async getDescendantsOfEntities<T extends ExtendedEntityFieldName[]>(
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
  ): Promise<FlattenedEntity[] | EntityApiResponse<T>[]> {
    return this.outboundConnection.get(
      await this.authHander.getAuthHeader(),
      this.baseUrl,
      `hierarchy/${hierarchyName}/descendants`,
      {
        ...this.stringifyQueryParameters(queryOptions),
        entities: entityCodes.join(MULTIPLE_VALUES_DELIMITER),
        includeRootEntity: `${includeRootEntity}`,
      },
    );
  }

  public async getRelativesOfEntity(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: {
      field: FlattableEntityFieldName;
      filter?: EntityFilterObject;
    },
  ): Promise<FlattenedEntity[]>;
  public async getRelativesOfEntity<T extends ExtendedEntityFieldName[]>(
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
  ): Promise<FlattenedEntity[] | EntityApiResponse<T>[]> {
    return this.outboundConnection.get(
      await this.authHander.getAuthHeader(),
      this.baseUrl,
      `hierarchy/${hierarchyName}/${entityCode}/relatives`,
      {
        ...this.stringifyQueryParameters(queryOptions),
      },
    );
  }

  public async getRelativesOfEntities(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: {
      field: FlattableEntityFieldName;
      filter?: EntityFilterObject;
    },
  ): Promise<FlattenedEntity[]>;
  public async getRelativesOfEntities<T extends ExtendedEntityFieldName[]>(
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
  ): Promise<FlattenedEntity[] | EntityApiResponse<T>[]> {
    return this.outboundConnection.get(
      await this.authHander.getAuthHeader(),
      this.baseUrl,
      `hierarchy/${hierarchyName}/relatives`,
      {
        ...this.stringifyQueryParameters(queryOptions),
        entities: entityCodes.join(MULTIPLE_VALUES_DELIMITER),
      },
    );
  }

  public async getRelationshipsOfEntityByAncestor(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: EntityApiQueryOptions,
    ancestorQueryOptions?: RelationshipsSubQueryOptions,
    descendantQueryOptions?: RelationshipsSubQueryOptions,
  ): Promise<GroupByAncestorRelationshipsResponseBody> {
    return this.outboundConnection.get(
      await this.authHander.getAuthHeader(),
      this.baseUrl,
      `hierarchy/${hierarchyName}/${entityCode}/relationships`,
      {
        ...this.stringifyQueryParameters(queryOptions),
        ...this.stringifyRelationshipsSubQueryParameters(ancestorQueryOptions, 'ancestor'),
        ...this.stringifyRelationshipsSubQueryParameters(descendantQueryOptions, 'descendant'),
        groupBy: 'ancestor',
      },
    );
  }

  public async getRelationshipsOfEntityByDescendant(
    hierarchyName: string,
    entityCode: string,
    queryOptions?: EntityApiQueryOptions,
    ancestorQueryOptions?: RelationshipsSubQueryOptions,
    descendantQueryOptions?: RelationshipsSubQueryOptions,
  ): Promise<GroupByDescendantRelationshipsResponseBody> {
    return this.outboundConnection.get(
      await this.authHander.getAuthHeader(),
      this.baseUrl,
      `hierarchy/${hierarchyName}/${entityCode}/relationships`,
      {
        ...this.stringifyQueryParameters(queryOptions),
        ...this.stringifyRelationshipsSubQueryParameters(ancestorQueryOptions, 'ancestor'),
        ...this.stringifyRelationshipsSubQueryParameters(descendantQueryOptions, 'descendant'),
        groupBy: 'descendant',
      },
    );
  }

  public async getRelationshipsOfEntitiesByAncestor(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: EntityApiQueryOptions,
    ancestorQueryOptions?: RelationshipsSubQueryOptions,
    descendantQueryOptions?: RelationshipsSubQueryOptions,
  ): Promise<GroupByAncestorRelationshipsResponseBody> {
    return this.outboundConnection.get(
      await this.authHander.getAuthHeader(),
      this.baseUrl,
      `hierarchy/${hierarchyName}/relationships`,
      {
        ...this.stringifyQueryParameters(queryOptions),
        ...this.stringifyRelationshipsSubQueryParameters(ancestorQueryOptions, 'ancestor'),
        ...this.stringifyRelationshipsSubQueryParameters(descendantQueryOptions, 'descendant'),
        entities: entityCodes.join(MULTIPLE_VALUES_DELIMITER),
        groupBy: 'ancestor',
      },
    );
  }

  public async getRelationshipsOfEntitiesByDescendant(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: EntityApiQueryOptions,
    ancestorQueryOptions?: RelationshipsSubQueryOptions,
    descendantQueryOptions?: RelationshipsSubQueryOptions,
  ): Promise<GroupByDescendantRelationshipsResponseBody> {
    return this.outboundConnection.get(
      await this.authHander.getAuthHeader(),
      this.baseUrl,
      `hierarchy/${hierarchyName}/relationships`,
      {
        ...this.stringifyQueryParameters(queryOptions),
        ...this.stringifyRelationshipsSubQueryParameters(ancestorQueryOptions, 'ancestor'),
        ...this.stringifyRelationshipsSubQueryParameters(descendantQueryOptions, 'descendant'),
        entities: entityCodes.join(MULTIPLE_VALUES_DELIMITER),
        groupBy: 'descendant',
      },
    );
  }
}
