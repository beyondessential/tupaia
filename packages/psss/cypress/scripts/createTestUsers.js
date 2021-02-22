/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { hashAndSaltPassword } from '@tupaia/auth';
import { TEST_USER_1, TEST_USER_2 } from '../constants';
import { TestUserPasswordUndefinedError } from '../support/helpers';

const upsertTestUserRecord = async ({ database, user }) => {
  const password = process.env.CYPRESS_TEST_USER_PASSWORD;
  if (!password) {
    throw new TestUserPasswordUndefinedError();
  }

  return database.updateOrCreate(
    'user_account',
    { email: user.email },
    {
      first_name: user.firstName,
      last_name: user.lastName,
      verified_email: 'verified',
      ...hashAndSaltPassword(password),
    },
  );
};

/**
 * Grants permissions for every country and top-level permission group
 */
const grantPermissionsToTestUser = async ({ database, user, entities }) => {
  // TODO use ON CONFLICT ON CONSTRAINT (...) DO NOTHING
  // after https://github.com/beyondessential/tupaia-backlog/issues/1469 is implemented
  await database.executeSql(
    `
    INSERT INTO user_entity_permission
    SELECT generate_object_id() as id, ua.id as user_id, e.id as entity_id, pg.id as permission_group_id FROM user_account ua
    CROSS JOIN entity e
    CROSS JOIN permission_group pg
    LEFT JOIN user_entity_permission uep on uep.user_id = ua.id and uep.entity_id = e.id and uep.permission_group_id = pg.id
    WHERE ua.email LIKE ? AND e.code in (${entities}) AND pg.name = 'PSSS' and uep.id IS NULL
    `,
    [user.email],
  );
};

export const createTestUsers = async ({ database, logger }) => {
  await upsertTestUserRecord({ database, logger, user: TEST_USER_1 });
  await upsertTestUserRecord({ database, logger, user: TEST_USER_2 });
  await grantPermissionsToTestUser({ database, user: TEST_USER_1, entities: "'TO'" });
  await grantPermissionsToTestUser({ database, user: TEST_USER_2, entities: "'TO', 'WS'" });
};
