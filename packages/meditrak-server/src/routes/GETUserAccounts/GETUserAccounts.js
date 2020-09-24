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
  filterUserAccountsByPermissions,
} from './assertUserAccountPermissions';

/**
 * Handles endpoints:
 * - /users
 * - /users/:userId
 */

export class GETUserAccounts extends GETHandler {
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
      assertUserAccountPermissions(accessPolicy, this.models, userAccount);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, userAccountChecker]));

    return userAccount;
  }

  async findRecords(criteria, options) {
    const userAccounts = await super.findRecords(criteria, options);

    const filteredUserAccounts = await filterUserAccountsByPermissions(
      this.req.accessPolicy,
      userAccounts,
      this.models,
    );

    if (!filteredUserAccounts.length) {
      throw new Error('Your permissions do not allow access to any of the requested resources');
    }

    return filteredUserAccounts;
  }
}
