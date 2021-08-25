/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';
import { ObjectValidator, constructRecordExistsWithId } from '@tupaia/utils';

import { EditHandler } from '../EditHandler';
import { assertBESAdminAccess } from '../../permissions';

export class EditDashboardVisualisation extends EditHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }

  async updateReport(transactingModels, reportCode, reportObject) {
    const { code, permission_group: permissionGroupName, config } = reportObject;
    const permissionGroup = await transactingModels.permissionGroup.findOne({
      name: permissionGroupName,
    });
    const report = {
      code,
      config,
      permission_group_id: permissionGroup.id,
    };

    return transactingModels.report.update({ code: reportCode }, report);
  }

  async validateRecordExists() {
    const validationCriteria = {
      id: [constructRecordExistsWithId(this.database, TYPES.DASHBOARD_ITEM)],
    };

    const validator = new ObjectValidator(validationCriteria);
    return validator.validate({ id: this.recordId }); // Will throw an error if not valid
  }

  async updateDashboardItem(transactingModels, dashboardItemCode, dashboardItemObject) {
    return transactingModels.dashboardItem.update({ code: dashboardItemCode }, dashboardItemObject);
  }

  async editRecord() {
    await this.assertPermissions(assertBESAdminAccess);

    return this.models.wrapInTransaction(async transactingModels => {
      const { report: reportObject, dashboardItem: dashboardItemObject } = this.updatedFields;
      if (dashboardItemObject.id && dashboardItemObject.id !== this.recordId) {
        throw new Error(`dashboardItem.id is different from resource id: ${this.recordId}`);
      }
      const dashboardItem = await transactingModels.dashboardItem.findById(this.recordId);
      await this.updateReport(transactingModels, dashboardItem.report_code, reportObject);
      await this.updateDashboardItem(transactingModels, dashboardItem.code, dashboardItemObject);

      return { report: reportObject, dashboardItem: dashboardItemObject };
    });
  }
}
