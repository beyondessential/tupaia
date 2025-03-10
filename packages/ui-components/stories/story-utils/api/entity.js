import { getSortByKey } from '@tupaia/utils';
import { ENTITIES, ENTITY_HIERARCHY_RELATIONS } from './data';

const getEntity = code => {
  const entity = ENTITIES.find(e => e.code === code);
  if (!entity) {
    throw new Error(`Could not find entity with code: ${code}`);
  }
  return entity;
};
const getEntities = (codes = []) => codes.map(getEntity).sort(getSortByKey('name'));

const getHierarchyRelations = hierarchyCode => {
  const hierarchyRelations = ENTITY_HIERARCHY_RELATIONS[hierarchyCode];
  if (!hierarchyRelations) {
    throw new Error(`Invalid hierarchy: ${hierarchyCode}`);
  }
  return hierarchyRelations;
};

export const getHierarchies = () => getEntities(Object.keys(ENTITY_HIERARCHY_RELATIONS));

export const getEntityDescendants = (hierarchyCode, entityCode) => {
  const hierarchyRelations = getHierarchyRelations(hierarchyCode);
  const children = getEntities(hierarchyRelations[entityCode]);
  return children.map(child => ({
    ...child,
    children: getEntities(hierarchyRelations[child.code]),
  }));
};
