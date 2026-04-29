import { findOrCreateDummyRecord, getTestDatabase, getTestModels, ModelRegistry } from '@tupaia/database';
import { TestableServer } from '@tupaia/server-boilerplate';
import { createBasicHeader } from '@tupaia/utils';
import { encryptPassword } from '@tupaia/auth';

// @ts-expect-error - central-server createApp is a JS file without types
import { createApp } from '../../../central-server/src/createApp';

const models = getTestModels() as ModelRegistry & { user: any };

const userAccountEmail = 'ash-ketchum@pokemon.org';
const userAccountPassword = 'test';

export const setupTestApp = async () => {
  const passwordHash = await encryptPassword(userAccountPassword);
  const { VERIFIED } = models.user.emailVerifiedStatuses;
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
  const app = new TestableServer(createApp(getTestDatabase(), models), 2);
  app.setDefaultHeader('Authorization', createBasicHeader(userAccountEmail, userAccountPassword));
  return app;
};
