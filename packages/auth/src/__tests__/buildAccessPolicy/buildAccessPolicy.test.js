/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { testAccessPolicyHandler } from './testAccessPolicyHandler';
import { testAsAdminUser } from './testAsAdminUser';
import { testAsPublicUser } from './testAsPublicUser';

describe('buildAccessPolicy', () => {
  describe('Demo Land public user', testAsPublicUser);

  describe('Tonga admin user', testAsAdminUser);

  describe('Handles entities of all types/nesting agnostically', testAccessPolicyHandler);
});
