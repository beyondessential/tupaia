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
} from '@tupaia/database';

import { TestModelRegistry } from './testModelRegistry';
import { PROJECTS, ENTITIES, ENTITY_RELATIONS } from './fixtures';
import { createApp } from '../../app';

// Don't generate the proxy middlewares while we're testing
jest.mock('http-proxy-middleware');

const models = getTestModels() as TestModelRegistry;
const hierarchyCacher = new EntityHierarchyCacher(models);
hierarchyCacher.setDebounceTime(50); // short debounce time so tests run more quickly

const userAccountEmail = 'link@hyrule.com';
const userAccountPassword = 'test';

export const setupTestData = async () => {
  const projectsForInserting = PROJECTS.map(project => {
    const relationsInProject = ENTITY_RELATIONS[project.code];
    const entityCodesInProject = relationsInProject.map(relation => relation.child);
    const entitiesInProject = entityCodesInProject.map(entityCode =>
      ENTITIES.find(entity => entity.code === entityCode),
    );
    return { ...project, entities: entitiesInProject, relations: relationsInProject };
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
      first_name: 'Link',
      ...hashAndSaltPassword(userAccountPassword),
      verified_email: VERIFIED,
    },
  );
};

export const setupTestApp = async () => {
  const app = new TestableServer(createApp(getTestDatabase()));
  app.setDefaultHeader('Authorization', createBasicHeader(userAccountEmail, userAccountPassword));
  return app;
};
