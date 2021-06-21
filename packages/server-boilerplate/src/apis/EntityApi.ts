/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import {
  EntityApiInterface,
  EntityApiQueryOptions,
  RelationshipsSubQueryOptions,
} from '@tupaia/entity-server';

import { OutboundConnection, AuthHandler } from '../connections';

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

export class EntityApi implements EntityApiInterface {
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
    queryOptions?: EntityApiQueryOptions,
  ): ReturnType<EntityApiInterface['getEntity']> {
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
    queryOptions?: EntityApiQueryOptions,
  ): ReturnType<EntityApiInterface['getEntities']> {
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
    queryOptions?: EntityApiQueryOptions,
    includeRootEntity: boolean = false,
  ): ReturnType<EntityApiInterface['getDescendantsOfEntity']> {
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
    queryOptions?: EntityApiQueryOptions,
    includeRootEntity: boolean = false,
  ): ReturnType<EntityApiInterface['getDescendantsOfEntities']> {
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
    queryOptions?: EntityApiQueryOptions,
  ): ReturnType<EntityApiInterface['getRelativesOfEntity']> {
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
    queryOptions?: EntityApiQueryOptions,
  ): ReturnType<EntityApiInterface['getRelativesOfEntities']> {
    return this.outboundConnection.get(
      await this.authHander.getAuthHeader(),
      this.baseUrl,
      `hierarchy/${hierarchyName}/descendants`,
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
  ): ReturnType<EntityApiInterface['getRelationshipsOfEntityByAncestor']> {
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
  ): ReturnType<EntityApiInterface['getRelationshipsOfEntityByDescendant']> {
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
  ): ReturnType<EntityApiInterface['getRelationshipsOfEntitiesByAncestor']> {
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
  ): ReturnType<EntityApiInterface['getRelationshipsOfEntitiesByDescendant']> {
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
