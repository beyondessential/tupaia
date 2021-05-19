/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import ViewRouteHandler from './view';
import { DashboardItemPermissionChecker } from './permissions';

export default class extends ViewRouteHandler {
  static PermissionsChecker = DashboardItemPermissionChecker;

  fetchReport = async ({ itemCode, drillDownLevel }) => {
    const baseDashboardItem = await this.models.dashboardItem.findOne({
      code: itemCode,
      legacy: true,
    });
    let dashboardItem = baseDashboardItem;
    if (drillDownLevel) {
      const drillDownCode = baseDashboardItem.config.drillDown?.itemCodes[drillDownLevel];
      if (!drillDownCode) {
        throw new Error(`No drill down exists for level ${drillDownLevel}`);
      }
      dashboardItem = await this.models.dashboardItem.findOne({
        code: drillDownCode,
      });
    }
    const legacyReport = await this.models.legacyReport.findOne({ id: dashboardItem.report_code });
    return {
      viewJson: dashboardItem.config,
      dataBuilder: legacyReport.dataBuilder,
      dataBuilderConfig: legacyReport.dataBuilderConfig,
      dataServices: legacyReport.dataServices,
    };
  };
}
