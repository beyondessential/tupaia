/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { isDefined } from '@tupaia/tsutils';
import pick from 'lodash.pick';

export const entityApiMock = (
  entities: Record<string, Record<string, any>[]>,
  relations: Record<string, { parent: string; child: string }[]> = {},
) => {
  const getDescendantsOfEntities = (
    hierarchyName: string,
    entityCodes: string[],
    queryOptions: { fields?: string[]; filter?: { type: string } } = {},
  ) => {
    const entitiesInHierarchy = entities[hierarchyName] || [];
    const relationsInHierarchy = relations[hierarchyName] || [];
    const ancestorEntities = entitiesInHierarchy.filter(e => entityCodes.includes(e.code));
    const ancestorEntityQueue = [...ancestorEntities];
    const descendantEntities = [];
    while (ancestorEntityQueue.length > 0) {
      const parent = ancestorEntityQueue.shift();
      if (parent === undefined) {
        continue;
      }

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
  };

  return {
    getEntities: async (
      hierarchyName: string,
      entityCodes: string[],
      queryOptions: { fields?: string[] } = {},
    ) => {
      const foundEntities = entities[hierarchyName]?.filter(e => entityCodes.includes(e.code));
      const { fields } = queryOptions;
      return fields ? foundEntities.map(e => pick(e, fields)) : foundEntities;
    },
    getDescendantsOfEntities: async (
      hierarchyName: string,
      entityCodes: string[],
      queryOptions: { fields?: string[]; filter?: { type: string } } = {},
    ) => getDescendantsOfEntities(hierarchyName, entityCodes, queryOptions),
    getRelationshipsOfEntities: async (
      hierarchyName: string,
      entityCodes: string[],
      groupBy: 'ancestor',
      queryOptions: { fields?: string[]; filter?: { type: string } } = {},
      ancestorQueryOptions: { filter?: { type: string } } = {},
      descendantQueryOptions: { filter?: { type: string } } = {},
    ) => {
      const entitiesInHierarchy = entities[hierarchyName] || [];
      const ancestorEntities = ancestorQueryOptions.filter?.type
        ? getDescendantsOfEntities(hierarchyName, entityCodes, ancestorQueryOptions)
        : entitiesInHierarchy.filter(e => entityCodes.includes(e.code));

      const ancestorEntityCodes = ancestorEntities.map(e => e.code);
      return ancestorEntityCodes.reduce((obj: Record<string, any[]>, ancestor) => {
        obj[ancestor] = getDescendantsOfEntities(hierarchyName, [ancestor], descendantQueryOptions);
        return obj;
      }, {});
    },
  };
};
