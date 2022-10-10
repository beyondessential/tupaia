/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import pick from 'lodash.pick';
import { EntityApiInterface } from '../../connections';

export class MockEntityApi implements EntityApiInterface {
  private readonly entities: Record<string, Record<string, any>[]>;
  private readonly relations: Record<string, { parent: string; child: string }[]>;

  private getDescendants(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions: { fields?: string[]; filter?: { type: string } } = {},
  ) {
    const entitiesInHierarchy = this.entities[hierarchyName] || [];
    const relationsInHierarchy = this.relations[hierarchyName] || [];
    const ancestorEntities = entitiesInHierarchy.filter(e => entityCodes.includes(e.code));
    const ancestorEntityQueue = [...ancestorEntities];
    const descendantEntities = [];
    while (ancestorEntityQueue.length > 0) {
      const parent = ancestorEntityQueue.shift();
      if (parent === undefined) {
        continue;
      }

      const isDefined = <T>(val: T): val is Exclude<T, undefined> => val !== undefined;
      const children = relationsInHierarchy
        .filter(({ parent: parentCode }) => parent.code === parentCode)
        .map(({ child }) => entitiesInHierarchy.find(entity => entity.code === child))
        .filter(isDefined);

      descendantEntities.push(...children);
      ancestorEntityQueue.push(...children);
    }

    const { fields, filter } = queryOptions;

    const filteredDescendants = filter
      ? descendantEntities.filter(entity => entity.type === filter.type)
      : descendantEntities;

    return fields ? filteredDescendants.map(e => pick(e, fields)) : filteredDescendants;
  }

  public constructor(
    entities: Record<string, Record<string, any>[]> = {},
    relations: Record<string, { parent: string; child: string }[]> = {},
  ) {
    this.entities = entities;
    this.relations = relations;
  }

  public async getEntity(
    hierarchyName: string,
    entityCode: string,
    queryOptions?:
      | { field?: string | undefined; fields?: string[] | undefined; filter?: any }
      | undefined,
  ) {
    return this.getEntities(hierarchyName, [entityCode], queryOptions);
  }

  public async getEntities(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions: { fields?: string[] } = {},
  ) {
    const foundEntities = this.entities[hierarchyName]?.filter(e => entityCodes.includes(e.code));
    const { fields } = queryOptions;
    return fields ? foundEntities.map(e => pick(e, fields)) : foundEntities;
  }

  public getDescendantsOfEntity(
    hierarchyName: string,
    entityCode: string,
    queryOptions?:
      | { field?: string | undefined; fields?: string[] | undefined; filter?: any }
      | undefined,
    includeRootEntity?: boolean,
  ): Promise<any> {
    return this.getDescendantsOfEntities(hierarchyName, [entityCode], queryOptions);
  }

  public async getDescendantsOfEntities(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions: { fields?: string[]; filter?: { type: string } } = {},
  ) {
    return this.getDescendants(hierarchyName, entityCodes, queryOptions);
  }

  public getRelativesOfEntity(
    hierarchyName: string,
    entityCode: string,
    queryOptions?:
      | { field?: string | undefined; fields?: string[] | undefined; filter?: any }
      | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public getRelativesOfEntities(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?:
      | { field?: string | undefined; fields?: string[] | undefined; filter?: any }
      | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public async getRelationshipsOfEntity(
    hierarchyName: string,
    entityCode: string,
    groupBy: 'ancestor' | 'descendant',
    queryOptions?: any,
    ancestorQueryOptions?: any,
    descendantQueryOptions?: any,
  ) {
    return this.getRelationshipsOfEntities(
      hierarchyName,
      [entityCode],
      groupBy,
      queryOptions,
      ancestorQueryOptions,
      descendantQueryOptions,
    );
  }

  public async getRelationshipsOfEntities(
    hierarchyName: string,
    entityCodes: string[],
    groupBy: 'ancestor' | 'descendant',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    queryOptions: { fields?: string[]; filter?: { type: string } } = {},
    ancestorQueryOptions: { filter?: { type: string } } = {},
    descendantQueryOptions: { filter?: { type: string } } = {},
  ) {
    const entitiesInHierarchy = this.entities[hierarchyName] || [];
    const ancestorEntities = ancestorQueryOptions.filter?.type
      ? this.getDescendants(hierarchyName, entityCodes, ancestorQueryOptions)
      : entitiesInHierarchy.filter(e => entityCodes.includes(e.code));

    const ancestorEntityCodes = ancestorEntities.map(e => e.code);
    return ancestorEntityCodes.reduce((obj: Record<string, any[]>, ancestor) => {
      // eslint-disable-next-line no-param-reassign
      obj[ancestor] = this.getDescendants(hierarchyName, [ancestor], descendantQueryOptions);
      return obj;
    }, {});
  }
}
