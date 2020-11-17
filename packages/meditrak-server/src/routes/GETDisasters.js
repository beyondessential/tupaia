/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from './GETHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertTupaiaAdminPanelAccess,
  hasBESAdminAccess,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../permissions';

const createDBPermissionsFilter = accessPolicy => {
  if (hasBESAdminAccess(accessPolicy)) {
    return {}; // no additional conditions, BES Admin users have full access
  }
  const permittedCountryCodes = accessPolicy.getEntitiesAllowed(
    TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  );
  return { countryCode: permittedCountryCodes };
};

/**
 * Handles endpoints:
 * - /disasters
 * - /disasters/:disasterId
 */
export class GETDisasters extends GETHandler {
  customJoinConditions = {
    country: ['country.code', 'disaster.countryCode'],
    entity: ['entity.code', 'disaster.countryCode'],
  };

  async assertUserHasAccess() {
    return this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, assertTupaiaAdminPanelAccess]),
      'You need either BES Admin or Tupaia Admin Panel access to view disasters',
    );
  }

  async findSingleRecord(disasterId, options) {
    const disaster = await super.findSingleRecord(disasterId, options);

    const adminPanelAccessChecker = accessPolicy => {
      const { countryCode } = disaster;
      if (!accessPolicy.allows(countryCode, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
        throw new Error(
          `Access to disaster with id ${disasterId} requires admin panel access for ${countryCode}`,
        );
      }
    };

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, adminPanelAccessChecker]),
    );

    return disaster;
  }

  async findRecords(criteria, options) {
    const permissionsFilter = createDBPermissionsFilter(this.accessPolicy);
    return super.findRecords({ ...criteria, ...permissionsFilter }, options);
  }
}
