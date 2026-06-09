import { entityHierarchyFixtures } from '@tupaia/database';

// Backwards compatibility for old imports
export const {
  PROJECTS,
  COUNTRIES,
  ENTITIES,
  ENTITY_RELATIONS,
  getHierarchyWithFields,
  getHierarchiesWithFields,
  getEntityWithFields,
  getEntitiesWithFields,
} = entityHierarchyFixtures;
