/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertLegacyReportGetPermissions,
  createLegacyReportsDBFilter,
} from './assertLegacyReportsPermissions';
/**
 * Handles endpoints:
 * - /legacyReports
 * - /legacyReports/:legacyReportId
 */
export class GETLegacyReports extends GETHandler {
  permissionsFilteredInternally = true;

  async findSingleRecord(dashboardItemId, options) {
    const dashboardItem = await super.findSingleRecord(dashboardItemId, options);

    const legacyReportChecker = accessPolicy =>
      assertLegacyReportGetPermissions(accessPolicy, this.models, dashboardItemId);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, legacyReportChecker]));

    return dashboardItem;
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createLegacyReportsDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
    );
    return { dbConditions, dbOptions: options };
  }
}
