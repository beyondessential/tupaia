/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { hashAndSaltPassword } from '@tupaia/auth';
import { TEST_USER } from '../constants';

const upsertTestUserRecord = async ({ database }) =>
  database.updateOrCreate(
    'user_account',
    { email: TEST_USER.email },
    {
      first_name: TEST_USER.firstName,
      last_name: TEST_USER.lastName,
      verified_email: 'verified',
      ...hashAndSaltPassword(process.env.CYPRESS_TEST_USER_PASSWORD),
    },
  );

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

export const createTestUser = async ({ database, logger }) => {
  await upsertTestUserRecord({ database, logger });
  await grantAllPermissionsToTestUser(database);
};
