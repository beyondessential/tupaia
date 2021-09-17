/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { hashAndSaltPassword } from '@tupaia/auth';

import {
  findOrCreateDummyRecord,
  buildAndInsertProjectsAndHierarchies,
  getTestModels,
  EntityHierarchyCacher,
} from '@tupaia/database';

import { TestModelRegistry } from '../types';
import { TestableEntityServer } from './TestableEntityServer';
import { PROJECTS, ENTITIES, ENTITY_RELATIONS } from '../__integration__/fixtures';

const models = getTestModels() as TestModelRegistry;
const hierarchyCacher = new EntityHierarchyCacher(models);

export const setupTestApp = async () => {
  const projectsForInserting = PROJECTS.map(project => {
    const relationsInProject = ENTITY_RELATIONS.filter(
      relation => relation.hierarchy === project.code,
    );
    const entityCodesInProject = relationsInProject.map(relation => relation.child);
    const entitiesInProject = entityCodesInProject.map(entityCode =>
      ENTITIES.find(entity => entity.code === entityCode),
    );
    return { ...project, entities: entitiesInProject, relations: relationsInProject };
  });

  const insertedProjects = await buildAndInsertProjectsAndHierarchies(models, projectsForInserting);
  await hierarchyCacher.buildAndCacheHierarchies(
    insertedProjects.map(insertedProject => insertedProject.entityHierarchy.id),
  );

  const { VERIFIED } = models.user.emailVerifiedStatuses;
  const userAccountEmail = 'ash-ketchum@pokemon.org';
  const userAccountPassword = 'test';

  await findOrCreateDummyRecord(
    models.user,
    {
      email: userAccountEmail,
    },
    {
      first_name: 'Ash',
      last_name: 'Ketchum',
      ...hashAndSaltPassword(userAccountPassword),
      verified_email: VERIFIED,
    },
  );
  return new TestableEntityServer(userAccountEmail, userAccountPassword);
};
