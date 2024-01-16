/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import {} from 'dotenv/config'; // Load the environment variables into process.env
import { encryptPassword } from '@tupaia/auth';
import { generateTestId } from '@tupaia/database';
import { createUser as createUserAccessor } from '../../../dataAccessors';
import { getModels } from './getModels';
import { TEST_USER_EMAIL } from '../constants';

const models = getModels();

export async function addBaselineTestData() {
  // if there's a pre-existing Demo Land in the DB, use that, otherwise create
  // one with a test ID so it'll get cleaned up later
  await models.entity.findOrCreate(
    {
      code: 'DL',
    },
    {
      id: generateTestId(),
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
      id: generateTestId(),
    },
  );

  const donorGroup = await models.permissionGroup.findOrCreate(
    {
      name: 'Donor',
    },
    {
      id: generateTestId(),
      parent_id: adminGroup.id,
    },
  );

  await models.permissionGroup.findOrCreate(
    {
      name: 'Public',
    },
    {
      id: generateTestId(),
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
    emailAddress: process.env.API_CLIENT_NAME,
    password: process.env.API_CLIENT_PASSWORD,
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
      username: process.env.API_CLIENT_NAME,
    },
    {
      user_account_id: apiUser.userId,
      secret_key_hash: encryptPassword(
        process.env.API_CLIENT_PASSWORD,
        process.env.API_CLIENT_SALT,
      ),
    },
  );
}
