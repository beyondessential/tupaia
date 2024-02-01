/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { hashAndSaltPassword } from '@tupaia/auth';
import { createBasicHeader } from '@tupaia/utils';
import { TestableServer } from '@tupaia/server-boilerplate';

import {
  findOrCreateDummyRecord,
  buildAndInsertProjectsAndHierarchies,
  getTestModels,
  EntityHierarchyCacher,
  getTestDatabase,
  findOrCreateDummyCountryEntity,
} from '@tupaia/database';

import { createApp } from '../../app';
import { TestModelRegistry } from './testModelRegistry';
import { PROJECTS, ENTITIES, ENTITY_RELATIONS } from './fixtures';

// Don't generate the proxy middlewares while we're testing
jest.mock('http-proxy-middleware');

const models = getTestModels() as TestModelRegistry;
const hierarchyCacher = new EntityHierarchyCacher(models);
hierarchyCacher.setDebounceTime(50); // short debounce time so tests run more quickly

const userAccountEmail = 'ash-ketchum@pokemon.org';
const userAccountPassword = 'test';

export const setupTestData = async () => {
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

  // add something for the api client to have access to
  await findOrCreateDummyCountryEntity(models, {
    code: 'DL',
    name: 'Demo Land',
    type: 'country',
  });

  hierarchyCacher.listenForChanges();
  await buildAndInsertProjectsAndHierarchies(models, projectsForInserting);
  await models.database.waitForAllChangeHandlers();
  hierarchyCacher.stopListeningForChanges();

  const { VERIFIED } = models.user.emailVerifiedStatuses;

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
};

export const setupTestApp = async () => {
  await setupTestData();
  const app = new TestableServer(await createApp(getTestDatabase()));
  app.setDefaultHeader('Authorization', createBasicHeader(userAccountEmail, userAccountPassword));
  return app;
};
