/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { hashAndSaltPassword } from '@tupaia/auth';
import { requireEnv } from '@tupaia/utils';
import { TEST_USER } from '../../constants';

const upsertTestUserRecord = async ({ database, user }) => {
  const password = requireEnv('CYPRESS_TEST_USER_PASSWORD');
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
const grantAllPermissionsToTestUser = async database => {
  // TODO use ON CONFLICT ON CONSTRAINT (...) DO NOTHING
  // after https://github.com/beyondessential/tupaia-backlog/issues/1469 is implemented
  await database.executeSql(
    `
    INSERT INTO user_entity_permission
    SELECT generate_object_id() as id, ua.id as user_id, e.id as entity_id, pg.id as permission_group_id FROM user_account ua
    CROSS JOIN entity e
    CROSS JOIN permission_group pg
    LEFT JOIN user_entity_permission uep on uep.user_id = ua.id and uep.entity_id = e.id and uep.permission_group_id = pg.id
    WHERE ua.email LIKE ? AND e.type = 'country' AND pg.parent_id IS NULL and uep.id IS NULL
    `,
    [TEST_USER.email],
  );
};

export const createTestUser = async ({ database }) => {
  await upsertTestUserRecord({ database, user: TEST_USER });
  await grantAllPermissionsToTestUser(database);
};
