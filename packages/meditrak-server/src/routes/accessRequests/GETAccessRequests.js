/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { GETHandler } from '../GETHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertTupaiaAdminPanelAccess,
  hasBESAdminAccess,
} from '../../permissions';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions/constants';
import { assertAccessRequestPermissions } from './assertAccessRequestPermissions';

const { RAW } = QUERY_CONJUNCTIONS;

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
    const dbConditions = criteria;
    if (!hasBESAdminAccess(this.accessPolicy)) {
      // If we don't have BES Admin access, add a filter to the SQL query
      const countryList = this.accessPolicy.getEntitiesByPermission(
        TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
      );
      countryList.push('DL'); // If we have admin panel anywhere, we can also view Demo Land
      const entities = await this.models.entity.find({
        code: countryList,
      });
      const entityIds = entities.map(e => e.id);
      dbConditions.entity_id = entityIds;
    }
    const accessRequests = await super.findRecords(criteria, options);

    if (!accessRequests.length) {
      throw new Error('Your permissions do not allow access to any of the requested resources');
    }

    return accessRequests;
  }
}
