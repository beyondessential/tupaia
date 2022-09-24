/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import pick from 'lodash.pick';

export const entityApiMock = (
  entities: Record<string, Record<string, any>[]>,
  relations: Record<string, { parent: string; child: string }[]> = {},
) => {
  const getEntities = (
    hierarchyName: string,
    entityCodes: string[],
    queryOptions: { field?: string; fields?: string[]; filter?: Record<string, unknown> } = {},
  ) => {
    const entitiesInHierarchy = entities[hierarchyName] || [];
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
  };

  const getDescendantsOfEntities = (
    hierarchyName: string,
    entityCodes: string[],
    queryOptions: { fields?: string[]; filter?: { type?: string } } = {},
  ) => {
    const entitiesInHierarchy = entities[hierarchyName] || [];
    const relationsInHierarchy = relations[hierarchyName] || [];
    const ancestorEntities = entitiesInHierarchy.filter(e => entityCodes.includes(e.code));
    const ancestorEntityQueue = [...ancestorEntities];
    const descendantEntityCodes = [];
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

      descendantEntityCodes.push(...children.map(e => e.code));
      ancestorEntityQueue.push(...children);
    }

    return getEntities(hierarchyName, descendantEntityCodes, queryOptions);
  };

  const getAncestorsOfEntities = (
    hierarchyName: string,
    entityCodes: string[],
    queryOptions: { fields?: string[]; filter?: { type?: string } } = {},
  ) => {
    const entitiesInHierarchy = entities[hierarchyName] || [];
    const relationsInHierarchy = relations[hierarchyName] || [];
    const descendantEntities = entitiesInHierarchy.filter(e => entityCodes.includes(e.code));
    const descendantEntityQueue = [...descendantEntities];
    const ancestorCodes = [];
    while (descendantEntityQueue.length > 0) {
      const child = descendantEntityQueue.shift();
      if (child === undefined) {
        continue;
      }

      const isDefined = <T>(val: T): val is Exclude<T, undefined> => val !== undefined;
      const parents = relationsInHierarchy
        .filter(({ child: childCode }) => child.code === childCode)
        .map(({ parent }) => entitiesInHierarchy.find(entity => entity.code === parent))
        .filter(isDefined);

      ancestorCodes.push(...parents.map(e => e.code));
      descendantEntityQueue.push(...parents);
    }

    return getEntities(hierarchyName, ancestorCodes, queryOptions);
  };

  const getRelationsOfEntities = (
    hierarchyName: string,
    entityCodes: string[],
    queryOptions: { fields?: string[]; filter?: { type?: string } } = {},
  ) => {
    return [
      ...getAncestorsOfEntities(hierarchyName, entityCodes, queryOptions),
      ...getEntities(hierarchyName, entityCodes, queryOptions),
      ...getDescendantsOfEntities(hierarchyName, entityCodes, queryOptions),
    ];
  };

  return {
    getEntities: async (
      hierarchyName: string,
      entityCodes: string[],
      queryOptions: { fields?: string[] } = {},
    ) => getEntities(hierarchyName, entityCodes, queryOptions),
    getDescendantsOfEntities: async (
      hierarchyName: string,
      entityCodes: string[],
      queryOptions: { fields?: string[]; filter?: { type: string } } = {},
    ) => getDescendantsOfEntities(hierarchyName, entityCodes, queryOptions),
    getRelationshipsOfEntities: async (
      hierarchyName: string,
      entityCodes: string[],
      groupBy: 'ancestor' | 'descendant',
      queryOptions: { field?: string } = {},
      ancestorQueryOptions: { field?: string; filter?: { type: string } } = {},
      descendantQueryOptions: { field?: string; filter?: { type: string } } = {},
    ) => {
      const { field: queryField, ...restOfQueryOptions } = queryOptions;
      const {
        field: ancestorField = queryField || 'code',
        ...restOfAncestorQueryOptions
      } = ancestorQueryOptions;
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
        ? getRelationsOfEntities(hierarchyName, entityCodes, ancestorOptions)
        : getEntities(hierarchyName, entityCodes, ancestorOptions);
      const descendantsGroupedByAncestor: Record<string, any[]> = ancestorEntities.reduce(
        (obj, ancestor) => {
          return {
            ...obj,
            [ancestor[ancestorField]]: getDescendantsOfEntities(
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
    },
  };
};
