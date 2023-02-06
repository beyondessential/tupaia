/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { getSortByKey } from '@tupaia/utils';
import { ENTITIES, ENTITY_HIERARCHY_RELATIONS } from './data';

const findByCode = code => {
  const entity = ENTITIES.find(e => e.code === code);
  if (!entity) {
    throw new Error(`Could not find entity with code: ${code}`);
  }
  return entity;
};
const findByCodes = (codes = []) => codes.map(findByCode).sort(getSortByKey('name'));

const findHierarchyRelations = hierarchyCode => {
  const hierarchyRelations = ENTITY_HIERARCHY_RELATIONS[hierarchyCode];
  if (!hierarchyRelations) {
    throw new Error(`Invalid hierarchy: ${hierarchyCode}`);
  }
  return hierarchyRelations;
};

export const getEntityDescendants = (hierarchyCode, entityCode) => {
  if (!hierarchyCode) {
    if (entityCode) {
      throw Error(`No hierarchy code provided for entity ${entityCode}`);
    }

    const hierarchies = findByCodes(Object.keys(ENTITY_HIERARCHY_RELATIONS));
    return hierarchies.map(hierarchy => {
      const hierarchyRelations = findHierarchyRelations(hierarchy.code);
      return {
        ...hierarchy,
        children: findByCodes(hierarchyRelations[hierarchy.code]),
      };
    });
  }

  const hierarchyRelations = findHierarchyRelations(hierarchyCode);
  const children = findByCodes(hierarchyRelations[entityCode]);
  return children.map(child => ({
    ...child,
    children: findByCodes(hierarchyRelations[child.code]),
  }));
};
