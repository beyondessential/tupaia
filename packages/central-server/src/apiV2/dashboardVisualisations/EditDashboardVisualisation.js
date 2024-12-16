/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { RECORDS } from '@tupaia/database';
import {
  ObjectValidator,
  constructRecordExistsWithCode,
  constructRecordExistsWithId,
} from '@tupaia/utils';

import { EditHandler } from '../EditHandler';
import {
  assertAllPermissions,
  assertAnyPermissions,
  assertBESAdminAccess,
  assertPermissionGroupAccess,
  assertVizBuilderAccess,
} from '../../permissions';
import { assertDashboardItemEditPermissions } from '../dashboardItems/assertDashboardItemsPermissions';

const isFieldUpdated = (oldObject, newObject, fieldName) =>
  newObject[fieldName] !== undefined && newObject[fieldName] !== oldObject[fieldName];

const buildReport = async (models, reportRecord) => {
  const { code, permission_group: permissionGroupName, config } = reportRecord;
  const permissionGroup = await models.permissionGroup.findOne({ name: permissionGroupName });

  return {
    code,
    config,
    permission_group_id: permissionGroup.id,
  };
};

export class EditDashboardVisualisation extends EditHandler {
  async assertUserHasAccess() {
    const dashboardItemChecker = accessPolicy =>
      assertDashboardItemEditPermissions(accessPolicy, this.models, this.recordId);

    await this.assertPermissions(
      assertAnyPermissions([
        assertBESAdminAccess,
        assertAllPermissions([assertVizBuilderAccess, dashboardItemChecker]),
      ]),
    );
  }

  getDashboardItemRecord() {
    return this.updatedFields.dashboardItem;
  }

  getReportRecord() {
    const { report, dashboardItem } = this.updatedFields;

    if (dashboardItem.legacy) {
      const { config, ...otherReportFields } = report;
      return { ...otherReportFields, data_builder_config: config };
    }
    return report;
  }

  async upsertReport(models, dashboardItem, reportRecord) {
    const dashboardItemRecord = this.getDashboardItemRecord();
    const legacy = dashboardItemRecord.legacy ?? dashboardItem.legacy;
    const { report_code: code } = dashboardItemRecord;

    const report = legacy ? reportRecord : await buildReport(models, reportRecord);

    if (isFieldUpdated(dashboardItem, dashboardItemRecord, 'legacy')) {
      // `Legacy` value has been updated, need to use a different table for the report
      return legacy ? models.legacyReport.create(report) : models.report.create(report);
    }
    return legacy
      ? models.legacyReport.update({ code }, report)
      : models.report.update({ code }, report);
  }

  async validateRecordExists() {
    const { legacy } = this.updatedFields.dashboardItem;
    const validationCriteria = {
      id: [constructRecordExistsWithId(this.database, RECORDS.DASHBOARD_ITEM)],
    };

    const validationData = { id: this.recordId };

    // if not a legacy dashboard item, check that the report exists. If it's a legacy report, sometimes there are cases where the report won't exist, e.g. in the case of component type dashboard items
    if (!legacy) {
      validationCriteria.code = [constructRecordExistsWithCode(this.models.report)]; // check that a record with the same code exists
      validationData.code = this.updatedFields.dashboardItem.code;
    }

    const validator = new ObjectValidator(validationCriteria);
    return validator.validate(validationData); // Will throw an error if not valid
  }

  async updateDashboardItem(transactingModels, dashboardItem, dashboardItemRecord) {
    const { code } = dashboardItem;
    return transactingModels.dashboardItem.update({ code }, dashboardItemRecord);
  }

  async editRecord() {
    const { report } = this.req.body;
    // Skip permission check as legacy report has no permission group
    if (report.permission_group) {
      assertPermissionGroupAccess(this.accessPolicy, report.permission_group);
    }
    return this.models.wrapInTransaction(async transactingModels => {
      const dashboardItemRecord = this.getDashboardItemRecord();
      const reportRecord = this.getReportRecord();

      if (dashboardItemRecord.id !== undefined && dashboardItemRecord.id !== this.recordId) {
        throw new Error(`dashboardItem.id is different from resource id: ${this.recordId}`);
      }

      const dashboardItem = await transactingModels.dashboardItem.findById(this.recordId);
      await this.upsertReport(transactingModels, dashboardItem, reportRecord);
      await this.updateDashboardItem(transactingModels, dashboardItem, dashboardItemRecord);

      return { report: reportRecord, dashboardItem: dashboardItemRecord };
    });
  }
}
