/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { clearAllTestData } from '@tupaia/database';
import { getModels, resetTestData } from './src/__tests__/testUtilities/database';

jest.mock('@tupaia/server-utils', () => ({
  sendEmail: jest.fn(),
}));

beforeAll(async () => {
  await resetTestData();
});

afterAll(async () => {
  const models = getModels();
  const { database } = models;
  await clearAllTestData(database);
  await database.closeConnections();
});
