import { encryptPassword } from '@tupaia/auth';
import {
  buildAndInsertProjectsAndHierarchies,
  ClosureCacheBuilder,
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

  await buildAndInsertProjectsAndHierarchies(models, projectsForInserting);
  await models.database.waitForAllChangeHandlers();

  // TUP-3068: read paths read ancestor_descendant_relation. The change-handler-driven
  // EntityHierarchyCacher doesn't run in test setup (no listener wired), so populate
  // the closure cache explicitly before assertions.
  const closureCacheBuilder = new ClosureCacheBuilder(models);
  await closureCacheBuilder.rebuildAll();

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
