/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from './GETHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
  hasBESAdminAccess,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../permissions';

const createDBFilter = (accessPolicy, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria; // no additional criteria, BES Admin users have full access
  }
  const permittedCountryCodes = accessPolicy.getEntitiesAllowed(
    TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  );
  const { countryCode: incomingCountryCode } = criteria;
  if (!incomingCountryCode) {
    return { ...criteria, countryCode: permittedCountryCodes };
  }

  const countryCodesRequested = Array.isArray(incomingCountryCode)
    ? incomingCountryCode
    : [incomingCountryCode];
  const countryCodesFilter = countryCodesRequested.filter(c => permittedCountryCodes.includes(c));
  return { ...criteria, countryCode: countryCodesFilter };
};

/**
 * Handles endpoints:
 * - /disasters
 * - /disasters/:disasterId
 */
export class GETDisasters extends GETHandler {
  permissionsFilteredInternally = true;

  customJoinConditions = {
    country: ['country.code', 'disaster.countryCode'],
    entity: ['entity.code', 'disaster.countryCode'],
  };

  async assertUserHasAccess() {
    return this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, assertAdminPanelAccess]),
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

  async getPermissionsFilter(criteria, options) {
    const dbConditions = createDBFilter(this.accessPolicy, criteria);
    return { dbConditions, dbOptions: options };
  }
}
