/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { encryptPassword } from '@tupaia/auth';
import { findOrCreateDummyRecord, getTestModels } from '@tupaia/database';
import { TestModelRegistry } from '../types';
import { CAT_USER } from '../__integration__/fixtures';

const models = getTestModels() as TestModelRegistry;

export const setupTestUser = async () => {
  const { VERIFIED } = models.user.emailVerifiedStatuses;
  const { email, firstName, lastName, password } = CAT_USER;
  const passwordHash = await encryptPassword(password);

  return findOrCreateDummyRecord(
    models.user,
    {
      email,
    },
    {
      first_name: firstName,
      last_name: lastName,
      password_hash: passwordHash,
      verified_email: VERIFIED,
    },
  );
};
