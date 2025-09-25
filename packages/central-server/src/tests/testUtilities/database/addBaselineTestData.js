import { encryptPassword } from '@tupaia/auth';
import { generateId } from '@tupaia/database';
import { FACT_CURRENT_SYNC_TICK } from '@tupaia/constants';

import { configureEnv } from '../../../configureEnv';
import { createUser as createUserAccessor } from '../../../dataAccessors';
import { TEST_API_USER_EMAIL, TEST_API_USER_PASSWORD, TEST_USER_EMAIL } from '../constants';
import { getModels } from './getModels';

const models = getModels();

configureEnv();

export async function addBaselineTestData() {
  await models.localSystemFact.updateOrCreate({ key: FACT_CURRENT_SYNC_TICK }, { value: '1' });

  // if there's a pre-existing Demo Land in the DB, use that, otherwise create
  // one with a test ID so it'll get cleaned up later
  await models.entity.findOrCreate(
    {
      code: 'DL',
    },
    {
      id: generateId(),
      name: 'Demo Land',
      type: 'country',
      country_code: 'DL',
    },
  );

  const adminGroup = await models.permissionGroup.findOrCreate(
    {
      name: 'Admin',
    },
    {
      id: generateId(),
    },
  );

  const donorGroup = await models.permissionGroup.findOrCreate(
    {
      name: 'Donor',
    },
    {
      id: generateId(),
      parent_id: adminGroup.id,
    },
  );

  await models.permissionGroup.findOrCreate(
    {
      name: 'Public',
    },
    {
      id: generateId(),
      parent_id: donorGroup.id,
    },
  );

  await createUserAccessor(models, {
    emailAddress: TEST_USER_EMAIL,
    password: 'test.password',
    firstName: 'Test',
    lastName: 'User',
    employer: 'Automation',
    position: 'Test',
    contactNumber: '',
    countryName: 'Demo Land',
    permissionGroupName: 'Admin',
    verifiedEmail: 'verified',
  });

  const apiUser = await createUserAccessor(models, {
    emailAddress: TEST_API_USER_EMAIL,
    password: TEST_API_USER_PASSWORD,
    firstName: 'API',
    lastName: 'Client',
    employer: 'Automation',
    position: 'Test',
    contactNumber: '',
    countryName: 'Demo Land',
    permissionGroupName: 'Public',
    verifiedEmail: 'verified',
  });

  await models.apiClient.findOrCreate(
    {
      username: TEST_API_USER_EMAIL,
    },
    {
      user_account_id: apiUser.userId,
      secret_key_hash: await encryptPassword(TEST_API_USER_PASSWORD),
    },
  );
}
