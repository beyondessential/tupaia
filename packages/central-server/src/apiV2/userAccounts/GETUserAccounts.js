import { JOIN_TYPES } from '@tupaia/database';
import { GETHandler } from '../GETHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
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
  permissionsFilteredInternally = /** @type {const} */ (true);

  defaultJoinType = JOIN_TYPES.LEFT_OUTER;

  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to view user accounts',
      ),
    );
  }

  async findSingleRecord(userAccountId, options) {
    const userAccount = await super.findSingleRecord(userAccountId, options);

    const userAccountChecker = accessPolicy =>
      assertUserAccountPermissions(accessPolicy, this.models, userAccountId);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, userAccountChecker]));

    return { ...userAccount, accessPolicy: this.accessPolicy.policy };
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createUserAccountDBFilter(this.accessPolicy, this.models, criteria);

    return { dbConditions, dbOptions: options };
  }
}
