/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { getTestDatabase } from '@tupaia/database';

afterAll(async () => {
  const database = getTestDatabase();
  await database.closeConnections();
});
