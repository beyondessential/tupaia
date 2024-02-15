/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { hashAndSaltPassword } from '@tupaia/auth';
import { TestableServer } from '@tupaia/server-boilerplate';

import {
  getTestModels,
  EntityHierarchyCacher,
  getTestDatabase,
  findOrCreateDummyRecord,
} from '@tupaia/database';
import { createBasicHeader } from '@tupaia/utils';
import { MockDataTableApi, MockTupaiaApiClient } from '@tupaia/api-client';
import { TestModelRegistry } from '../../types';
import { createApp } from '../../../app';
import { analyticsDataTable, eventsDataTable } from '../../testUtils';
import { PUBLIC_PERMISSION_GROUP, REPORT } from './integration.fixtures';

export const models = getTestModels() as TestModelRegistry;
const hierarchyCacher = new EntityHierarchyCacher(models);
hierarchyCacher.setDebounceTime(50); // short debounce time so tests run more quickly

const userAccountEmail = 'ash-ketchum@pokemon.org';
const userAccountPassword = 'test';

// mock out the api client, specifically the data table service
jest.mock('@tupaia/api-client', () => {
  const actual = jest.requireActual('@tupaia/api-client');
  return {
    ...actual,
    TupaiaApiClient: jest.fn().mockImplementation(() => {
      return new MockTupaiaApiClient({
        dataTable: new MockDataTableApi({ analytics: analyticsDataTable, events: eventsDataTable }),
      });
    }),
  };
});

export const setupTestData = async () => {
  const permissionGroup = await findOrCreateDummyRecord(
    models.permissionGroup,
    {
      name: PUBLIC_PERMISSION_GROUP.name,
    },
    PUBLIC_PERMISSION_GROUP,
  );
  // add report
  await findOrCreateDummyRecord(
    models.report,
    {
      code: REPORT.code,
    },
    {
      ...REPORT,
      permission_group_id: permissionGroup.id,
    },
  );

  // add user
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
