/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import ViewRouteHandler from './view';
import { DashboardItemPermissionChecker } from './permissions';

export default class extends ViewRouteHandler {
  static PermissionsChecker = DashboardItemPermissionChecker;

  fetchReport = async ({ itemCode }) => {
    const dashboardItem = await this.models.dashboardItem.findOne({
      code: itemCode,
      legacy: true,
    });
    const legacyReport = await this.models.legacyReport.findOne({ id: dashboardItem.report_code });
    return {
      viewJson: dashboardItem.config,
      dataBuilder: legacyReport.dataBuilder,
      dataBuilderConfig: legacyReport.dataBuilderConfig,
      dataServices: legacyReport.dataServices,
    };
  };
}
