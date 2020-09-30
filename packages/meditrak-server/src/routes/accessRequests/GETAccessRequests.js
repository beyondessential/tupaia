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
  assertAccessRequestPermissions,
  createAccessRequestDBFilter,
} from './assertAccessRequestPermissions';

/**
 * Handles endpoints:
 * - /accessRequests
 * - /accessRequests/:accessRequestId
 */

export class GETAccessRequests extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertTupaiaAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to view access requests',
      ),
    );
  }

  async findSingleRecord(accessRequestId, options) {
    const accessRequest = await super.findSingleRecord(accessRequestId, options);

    const accessRequestChecker = accessPolicy =>
      assertAccessRequestPermissions(accessPolicy, this.models, accessRequest);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, accessRequestChecker]),
    );

    return accessRequest;
  }

  async findRecords(criteria, options) {
    const dbConditions = await createAccessRequestDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
    );
    const accessRequests = await super.findRecords(dbConditions, options);

    if (!accessRequests.length) {
      throw new Error('Your permissions do not allow access to any of the requested resources');
    }

    return accessRequests;
  }
}
