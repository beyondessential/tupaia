/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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

  permissionsFilteredInternally = true;

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
    return { dbConditions, dbOptions: options };
  }
}
