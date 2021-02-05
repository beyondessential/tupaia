/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertTupaiaAdminPanelAccess,
} from '../../permissions';
import {
  assertUserAccountPermissions,
  createUserAccountDBFilter,
} from './assertUserAccountPermissions';

/**
 * Handles endpoints:
 * - /users
 * - /users/:userId
 */

export class GETUserAccounts extends GETHandler {
  permissionsFilteredInternally = true;

  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertTupaiaAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to view user accounts',
      ),
    );
  }

  async findSingleRecord(userAccountId, options) {
    const userAccount = await super.findSingleRecord(userAccountId, options);

    const userAccountChecker = accessPolicy =>
      assertUserAccountPermissions(accessPolicy, this.models, userAccountId);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, userAccountChecker]));

    return userAccount;
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createUserAccountDBFilter(this.accessPolicy, this.models, criteria);
    return { dbConditions, dbOptions: options };
  }
}
