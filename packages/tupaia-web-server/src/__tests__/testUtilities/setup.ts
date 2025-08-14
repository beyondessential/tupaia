import { encryptPassword } from '@tupaia/auth';
import {
  buildAndInsertProjectsAndHierarchies,
  EntityHierarchyCacher,
  findOrCreateDummyRecord,
  getTestDatabase,
  getTestModels,
} from '@tupaia/database';
import { TestableServer } from '@tupaia/server-boilerplate';
import { createBasicHeader, requireEnv } from '@tupaia/utils';

import { createApp } from '../../app';
import { ENTITIES, ENTITY_RELATIONS, PROJECTS } from './fixtures';
import { TestModelRegistry } from './testModelRegistry';

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

  hierarchyCacher.listenForChanges();
  await buildAndInsertProjectsAndHierarchies(models, projectsForInserting);
  await models.database.waitForAllChangeHandlers();
  hierarchyCacher.stopListeningForChanges();

  const { VERIFIED } = models.user.emailVerifiedStatuses;
  const newPasswordHash = await encryptPassword(userAccountPassword);

  await findOrCreateDummyRecord(
    models.user,
    {
      email: userAccountEmail,
    },
    {
      first_name: 'Ash',
      last_name: 'Ketchum',
      password_hash: newPasswordHash,
      verified_email: VERIFIED,
    },
  );

  const apiClientEmail = requireEnv('API_CLIENT_NAME');
  const apiClientPassword = requireEnv('API_CLIENT_PASSWORD');
  const newApiClientPassword = await encryptPassword(apiClientPassword);

  const apiClient = await findOrCreateDummyRecord(
    models.user,
    {
      email: apiClientEmail,
    },
    {
      first_name: 'API',
      last_name: 'Client',
      password_hash: newApiClientPassword,
      verified_email: VERIFIED,
    },
  );

  const publicPermissionGroup = await findOrCreateDummyRecord(
    models.permissionGroup,
    {
      name: 'Public',
    },
    {},
  );

  const demoLand = await models.entity.findOne({ code: 'DL' });

  await findOrCreateDummyRecord(
    models.userEntityPermission,
    {
      user_id: apiClient.id,
      entity_id: demoLand.id,
      permission_group_id: publicPermissionGroup.id,
    },
    {},
  );
};

export const setupTestApp = async () => {
  await setupTestData();
  const app = new TestableServer(await createApp(getTestDatabase()));
  app.setDefaultHeader('Authorization', createBasicHeader(userAccountEmail, userAccountPassword));
  return app;
};
