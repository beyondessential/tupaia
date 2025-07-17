import { encryptPassword } from '@tupaia/auth';
import {
  buildAndInsertProjectsAndHierarchies,
  EntityHierarchyCacher,
  findOrCreateDummyRecord,
  getTestDatabase,
  getTestModels,
} from '@tupaia/database';
import { TestableServer } from '@tupaia/server-boilerplate';
import { createBasicHeader } from '@tupaia/utils';

import { createApp } from '../../app';
import { ENTITIES, ENTITY_RELATIONS, PROJECTS } from '../__integration__/fixtures';
import { TestModelRegistry } from '../types';

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

  hierarchyCacher.listenForChanges();
  await buildAndInsertProjectsAndHierarchies(models, projectsForInserting);
  await models.database.waitForAllChangeHandlers();
  hierarchyCacher.stopListeningForChanges();

  const { VERIFIED } = models.user.emailVerifiedStatuses;

  const passwordHash = await encryptPassword(userAccountPassword);

  await findOrCreateDummyRecord(
    models.user,
    {
      email: userAccountEmail,
    },
    {
      first_name: 'Ash',
      last_name: 'Ketchum',
      password_hash: passwordHash,
      verified_email: VERIFIED,
    },
  );
};

export const setupTestApp = async () => {
  const app = new TestableServer(createApp(getTestDatabase()));
  app.setDefaultHeader('Authorization', createBasicHeader(userAccountEmail, userAccountPassword));
  return app;
};
