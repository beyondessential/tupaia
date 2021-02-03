/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export class TestUserPasswordUndefinedError extends Error {
  constructor() {
    super('Please specify a value for CYPRESS_TEST_USER_PASSWORD in packages/web-frontend/.env');
    this.name = 'TestUserPasswordUndefinedError';
  }
}
