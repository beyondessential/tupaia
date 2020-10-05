/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Demo } from './setup';
import { testAccessPolicyHandler } from './testAccessPolicyHandler';
import { testAsPublicUser } from './testAsPublicUser';
import { testAsAdminUser } from './testAsAdminUser';

describe('buildAccessPolicy', () => {
  beforeAll(async () => {
    await Demo.initialise();
  });

  describe('Demo Land public user', testAsPublicUser);

  describe('Tonga admin user', testAsAdminUser);

  describe('Handles entities of all types/nesting agnostically', testAccessPolicyHandler);
});
