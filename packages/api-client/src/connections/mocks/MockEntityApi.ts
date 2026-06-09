/* eslint-disable @typescript-eslint/no-unused-vars */
import { pick } from 'es-toolkit/compat';
import { isDefined } from '@tupaia/tsutils';
import { EntityApiInterface } from '..';

export class MockEntityApi implements EntityApiInterface {
  private readonly entitiesByHierarchy: Record<string, Record<string, any>[]>;
  private readonly relations: Record<string, { parent: string; child: string }[]>;

  private getEntitiesStub(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions: { field?: string; fields?: string[]; filter?: Record<string, unknown> } = {},
  ) {
    const entitiesInHierarchy = this.entitiesByHierarchy[hierarchyName] || [];
    const foundEntities = entitiesInHierarchy.filter(e => entityCodes.includes(e.code));
    const { field, fields, filter } = queryOptions;

    let filteredEntities = foundEntities;
    if (filter) {
      filteredEntities = filteredEntities.filter(e =>
        Object.entries(filter).every(([key, value]) => e[key] === value),
      );
    }

    if (field) {
      return filteredEntities.map(e => e[field]);
    }

    if (fields) {
      return filteredEntities.map(e => pick(e, fields));
    }

    return filteredEntities;
  }

  private getDescendants(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions: { fields?: string[]; filter?: { type?: string } } = {},
  ) {
    const entitiesInHierarchy = this.entitiesByHierarchy[hierarchyName] || [];
    const relationsInHierarchy = this.relations[hierarchyName] || [];
    const ancestorEntities = entitiesInHierarchy.filter(e => entityCodes.includes(e.code));
    const ancestorEntityQueue = [...ancestorEntities];
    const descendantEntityCodes = [];
    while (ancestorEntityQueue.length > 0) {
      const parent = ancestorEntityQueue.shift();
      if (parent === undefined) {
        continue;
      }

      const children = relationsInHierarchy
        .filter(({ parent: parentCode }) => parent.code === parentCode)
        .map(({ child }) => entitiesInHierarchy.find(entity => entity.code === child))
        .filter(isDefined);

      descendantEntityCodes.push(...children.map(e => e.code));
      ancestorEntityQueue.push(...children);
    }

    return this.getEntitiesStub(hierarchyName, descendantEntityCodes, queryOptions);
  }

  private getAncestors(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions: { fields?: string[]; filter?: { type?: string } } = {},
  ) {
    const entitiesInHierarchy = this.entitiesByHierarchy[hierarchyName] || [];
    const relationsInHierarchy = this.relations[hierarchyName] || [];
    const descendantEntities = entitiesInHierarchy.filter(e => entityCodes.includes(e.code));
    const descendantEntityQueue = [...descendantEntities];
    const ancestorCodes = [];
    while (descendantEntityQueue.length > 0) {
      const child = descendantEntityQueue.shift();
      if (child === undefined) {
        continue;
      }

      const parents = relationsInHierarchy
        .filter(({ child: childCode }) => child.code === childCode)
        .map(({ parent }) => entitiesInHierarchy.find(entity => entity.code === parent))
        .filter(isDefined);

      ancestorCodes.push(...parents.map(e => e.code));
      descendantEntityQueue.push(...parents);
    }

    return this.getEntitiesStub(hierarchyName, ancestorCodes, queryOptions);
  }

  private getRelationsOfEntities(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions: { fields?: string[]; filter?: { type?: string } } = {},
  ) {
    return [
      ...this.getAncestors(hierarchyName, entityCodes, queryOptions),
      ...this.getEntitiesStub(hierarchyName, entityCodes, queryOptions),
      ...this.getDescendants(hierarchyName, entityCodes, queryOptions),
    ];
  }

  public constructor(
    entities: Record<string, any>[] = [],
    relations: Record<string, { parent: string; child: string }[]> = {},
  ) {
    this.relations = relations;
    this.entitiesByHierarchy = {};
    Object.entries(relations).forEach(([hierarchy, relationsInHierarchy]) => {
      const entitiesInHierarchy = new Set<Record<string, any>>();
      relationsInHierarchy.forEach(({ parent, child }) => {
        const parentEntity = entities.find(e => e.code === parent);
        const childEntity = entities.find(e => e.code === child);
        if (parentEntity) entitiesInHierarchy.add(parentEntity);
        if (childEntity) entitiesInHierarchy.add(childEntity);
      });
      this.entitiesByHierarchy[hierarchy] = Array.from(entitiesInHierarchy);
    });
  }

  public async getEntity(
    hierarchyName: string,
    entityCode: string,
    queryOptions?:
      | { field?: string | undefined; fields?: string[] | undefined; filter?: any }
      | undefined,
  ) {
    return this.getEntitiesStub(hierarchyName, [entityCode], queryOptions);
  }

  public async getEntities(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions: { field?: string; fields?: string[]; filter?: Record<string, unknown> } = {},
  ) {
    return this.getEntitiesStub(hierarchyName, entityCodes, queryOptions);
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

  public getAncestorsOfEntity(
    hierarchyName: string,
    entityCode: string,
    queryOptions?:
      | { field?: string | undefined; fields?: string[] | undefined; filter?: any }
      | undefined,
    includeRootEntity?: boolean,
  ): Promise<any> {
    return this.getAncestorsOfEntities(hierarchyName, [entityCode], queryOptions);
  }

  public async getAncestorsOfEntities(
    hierarchyName: string,
    entityCodes: string[],
    queryOptions: { fields?: string[]; filter?: { type: string } } = {},
  ) {
    return this.getAncestors(hierarchyName, entityCodes, queryOptions);
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
    queryOptions: { field?: string } = {},
    ancestorQueryOptions: { field?: string; filter?: { type: string } } = {},
    descendantQueryOptions: { field?: string; filter?: { type: string } } = {},
  ) {
    const { field: queryField, ...restOfQueryOptions } = queryOptions;
    const { field: ancestorField = queryField || 'code', ...restOfAncestorQueryOptions } =
      ancestorQueryOptions;
    const ancestorOptions = {
      ...restOfQueryOptions,
      ...restOfAncestorQueryOptions,
      fields: [ancestorField, 'code'],
    };
    const descendantOptions = {
      field: 'code',
      ...queryOptions,
      ...descendantQueryOptions,
    };
    const ancestorEntities = ancestorOptions.filter?.type
      ? this.getRelationsOfEntities(hierarchyName, entityCodes, ancestorOptions)
      : this.getEntitiesStub(hierarchyName, entityCodes, ancestorOptions);
    const descendantsGroupedByAncestor: Record<string, any[]> = ancestorEntities.reduce(
      (obj, ancestor) => {
        return {
          ...obj,
          [ancestor[ancestorField]]: this.getDescendants(
            hierarchyName,
            [ancestor.code],
            descendantOptions,
          ),
        };
      },
      {} as Record<string, any[]>,
    );

    if (groupBy === 'ancestor') {
      return descendantsGroupedByAncestor;
    }
    const ancestorsGroupedByDescendant = Object.entries(descendantsGroupedByAncestor).reduce(
      (obj, [ancestor, descendants]) => {
        descendants.forEach(descendant => {
          // eslint-disable-next-line no-param-reassign
          obj[descendant] = ancestor;
        });
        return obj;
      },
      {} as Record<string, any>,
    );
    return ancestorsGroupedByDescendant;
  }

  public entitySearch(
    hierarchyName: string,
    searchString: string,
    queryOptions?: any,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
