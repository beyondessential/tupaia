/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';
import { ObjectValidator, constructRecordExistsWithId } from '@tupaia/utils';

import { EditHandler } from '../EditHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
  assertPermissionGroupAccess,
} from '../../permissions';

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
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertAdminPanelAccess],
        'You require Tupaia Admin Panel or BES Admin permission to edit visualisations.',
      ),
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
    const validationCriteria = {
      id: [constructRecordExistsWithId(this.database, TYPES.DASHBOARD_ITEM)],
    };

    const validator = new ObjectValidator(validationCriteria);
    return validator.validate({ id: this.recordId }); // Will throw an error if not valid
  }

  async updateDashboardItem(transactingModels, dashboardItem, dashboardItemRecord) {
    const { code } = dashboardItem;
    return transactingModels.dashboardItem.update({ code }, dashboardItemRecord);
  }

  async editRecord() {
    const { report } = this.req.body;
    await assertPermissionGroupAccess(this.accessPolicy, report.permission_group);
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
