/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { hashAndSaltPassword } from '@tupaia/auth';

import { findOrCreateDummyRecord, getTestModels, EntityHierarchyCacher } from '@tupaia/database';

import { TestModelRegistry } from '../types';
import { TestableEntityServer } from './TestableEntityServer';
import {
  PROJECTS,
  ENTITIES,
  ENTITY_HIERARCHIES,
  ENTITY_RELATIONS,
} from '../__integration__/fixtures';

const models = getTestModels() as TestModelRegistry;
const entityCodesToIds: Record<string, string> = {};
const entityHierarchyNamesToIds: Record<string, string> = {};
const hierarchyCacher = new EntityHierarchyCacher(models);

export const setupTestApp = async () => {
  await Promise.all(
    ENTITIES.map(async ({ code, name, country_code, type, ...restOfEntity }) => {
      const entity = await findOrCreateDummyRecord(
        models.entity,
        {
          code,
        },
        { name, country_code, type, ...restOfEntity },
      );
      entityCodesToIds[entity.code] = entity.id;
    }),
  );

  await Promise.all(
    ENTITY_HIERARCHIES.map(async ({ name }) => {
      const entityHierarchy = await findOrCreateDummyRecord(models.entityHierarchy, { name }, {});
      entityHierarchyNamesToIds[entityHierarchy.name] = entityHierarchy.id;
    }),
  );

  await Promise.all(
    ENTITY_RELATIONS.map(({ parent, child, hierarchy }) =>
      findOrCreateDummyRecord(
        models.entityRelation,
        {
          parent_id: entityCodesToIds[parent],
          child_id: entityCodesToIds[child],
          entity_hierarchy_id: entityHierarchyNamesToIds[hierarchy],
        },
        {},
      ),
    ),
  );

  await Promise.all(
    PROJECTS.map(({ code }) =>
      findOrCreateDummyRecord(
        models.project,
        {
          code,
          entity_id: entityCodesToIds[code],
          entity_hierarchy_id: entityHierarchyNamesToIds[code],
        },
        {},
      ),
    ),
  );

  await hierarchyCacher.buildAndCacheHierarchies(Object.values(entityHierarchyNamesToIds));

  const { VERIFIED } = models.user.emailVerifiedStatuses;
  const userAccountEmail = 'ash-ketchum@pokemon.org';
  const userAccountPassword = 'test';

  await findOrCreateDummyRecord(
    models.user,
    {
      first_name: 'Ash',
      last_name: 'Ketchum',
      email: userAccountEmail,
      ...hashAndSaltPassword(userAccountPassword),
      verified_email: VERIFIED,
    },
    {},
  );
  return new TestableEntityServer(userAccountEmail, userAccountPassword);
};
