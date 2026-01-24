import { JOIN_TYPES } from '@tupaia/database';
import { GETHandler } from '../GETHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
} from '../../permissions';
import {
  assertAccessRequestPermissions,
  createAccessRequestDBFilter,
} from './assertAccessRequestPermissions';

/**
 * Handles endpoints:
 * - /accessRequests
 * - /accessRequests/:accessRequestId
 */

export class GETAccessRequests extends GETHandler {
  defaultJoinType = JOIN_TYPES.LEFT_OUTER;

  permissionsFilteredInternally = /** @type {const} */ (true);

  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to view access requests',
      ),
    );
  }

  async findSingleRecord(accessRequestId, options) {
    const accessRequest = await super.findSingleRecord(accessRequestId, options);

    const accessRequestChecker = accessPolicy =>
      assertAccessRequestPermissions(accessPolicy, this.models, accessRequestId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, accessRequestChecker]),
    );

    return accessRequest;
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createAccessRequestDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
    );

    const dbOptions = {
      ...options,
      distinct: true,
      sort: null,
    };

    return { dbConditions, dbOptions };
  }

  async getPermissionsViaParentFilter(criteria, options) {
    // Add additional filter by user id
    const dbConditions = {
      'access_request.user_id': this.parentRecordId,
      ...criteria,
    };

    return this.getPermissionsFilter(dbConditions, options);
  }
}
