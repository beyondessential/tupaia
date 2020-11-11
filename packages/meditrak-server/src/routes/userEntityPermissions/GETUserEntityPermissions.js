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
  assertUserEntityPermissionPermissions,
  createUserEntityPermissionDBFilter,
} from './assertUserEntityPermissionPermissions';

/**
 * Handles endpoints:
 * - /userEntityPermissions
 * - /userEntityPermissions/:userEntityPermissionId
 */

export class GETUserEntityPermissions extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertTupaiaAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to user entity permissions',
      ),
    );
  }

  async findSingleRecord(userEntityPermissionId, options) {
    const userEntityPermission = await super.findSingleRecord(userEntityPermissionId, options);

    const userEntityPermissionChecker = accessPolicy =>
      assertUserEntityPermissionPermissions(accessPolicy, this.models, userEntityPermissionId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, userEntityPermissionChecker]),
    );

    return userEntityPermission;
  }

  async findRecords(criteria, options) {
    const dbConditions = await createUserEntityPermissionDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
    );
    const userEntityPermissions = await super.findRecords(dbConditions, options);

    return userEntityPermissions;
  }
}
