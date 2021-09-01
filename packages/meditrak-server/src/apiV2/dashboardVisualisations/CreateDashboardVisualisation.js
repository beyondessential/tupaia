/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ObjectValidator } from '@tupaia/utils';

import { CreateHandler } from '../CreateHandler';
import { assertBESAdminAccess } from '../../permissions';
import { constructNewRecordValidationRules } from '../utilities';

/**
 * Handles POST endpoints:
 * - /dashboardVisualisations
 */

export class CreateDashboardVisualisation extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }

  async createReport(transactingModels, reportObject) {
    const { code, permission_group: permissionGroupName, config } = reportObject;
    const permissionGroup = await transactingModels.permissionGroup.findOne({
      name: permissionGroupName,
    });
    const report = {
      code,
      config,
      permission_group_id: permissionGroup.id,
    };
    return transactingModels.report.create(report);
  }

  async createDashboardItem(transactingModels, dashboardItemObject) {
    return transactingModels.dashboardItem.create(dashboardItemObject);
  }

  async createRecord() {
    await this.assertPermissions(assertBESAdminAccess);

    return this.models.wrapInTransaction(async transactingModels => {
      const { report: reportObject, dashboardItem: dashboardItemObject } = this.newRecordData;
      await this.createReport(transactingModels, reportObject);
      const dashboardItem = await this.createDashboardItem(transactingModels, dashboardItemObject);

      return {
        report: reportObject,
        dashboardItem: { ...dashboardItemObject, id: dashboardItem.id },
      };
    });
  }

  async validateNewRecord() {
    // Validate that the record matches required format
    const { report, dashboardItem } = this.newRecordData;

    const reportValidator = new ObjectValidator(
      constructNewRecordValidationRules(this.models, 'report'),
    );
    const dashboardItemValidator = new ObjectValidator(
      constructNewRecordValidationRules(this.models, 'dashboard_item'),
    );

    await reportValidator.validate(report);
    await dashboardItemValidator.validate(dashboardItem);
  }
}
