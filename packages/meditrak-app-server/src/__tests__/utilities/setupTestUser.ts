import { encryptPassword } from '@tupaia/auth';
import { findOrCreateDummyRecord, getTestModels } from '@tupaia/database';

import { CAT_USER } from '../__integration__/fixtures';
import { TestModelRegistry } from '../types';

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
