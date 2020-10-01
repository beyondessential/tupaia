/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { clearTestData, getTestDatabase } from '@tupaia/database';
import winston from 'winston';

// TODO This is used to silence `winston` logs thrown by `@tupaia/utils.ObjectValidator`
// Remove when https://github.com/beyondessential/tupaia-backlog/issues/1201 is addressed
winston.configure({
  transports: [new winston.transports.Console({ silent: true })],
});

afterAll(async () => {
  await clearTestData(getTestDatabase());
});
