import { ObjectValidator } from '@tupaia/utils';

import { CreateHandler } from '../CreateHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertPermissionGroupsAccess,
  assertVizBuilderAccess,
} from '../../permissions';
import { constructNewRecordValidationRules } from '../utilities';

/**
 * Handles POST endpoints:
 * - /dashboardVisualisations
 */

export class CreateDashboardVisualisation extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertVizBuilderAccess],
        'You require Viz Builder User or BES Admin permission to create visualisations.',
      ),
    );
  }

  getDashboardItemRecord() {
    return this.newRecordData.dashboardItem;
  }

  getReportRecord() {
    const { report, dashboardItem } = this.newRecordData;

    if (dashboardItem.legacy) {
      const { config, ...otherReportFields } = report;
      return { ...otherReportFields, data_builder_config: config };
    }
    return report;
  }

  async createReport(transactingModels, reportRecord) {
    const { code, permission_group: permissionGroupName, config } = reportRecord;

    const permissionGroup = await transactingModels.permissionGroup.findOne({
      name: permissionGroupName,
    });
    if (!permissionGroup) {
      throw new Error(`Could not find permission group with name '${permissionGroupName}'`);
    }
    await assertPermissionGroupsAccess(this.accessPolicy, [permissionGroupName]);

    const report = {
      code,
      config,
      permission_group_id: permissionGroup.id,
    };
    return transactingModels.report.create(report);
  }

  async attachPermissionGroupId(dashboardItemRecord, reportRecord) {
    const dashboardItemRecordWithPermissionGroupId = { ...dashboardItemRecord };
    const { permission_group: permissionGroupName } = reportRecord;
    const permissionGroup = await this.models.permissionGroup.findOne({
      name: permissionGroupName,
    });
    dashboardItemRecordWithPermissionGroupId.permission_group_ids = [permissionGroup.id];
    return dashboardItemRecordWithPermissionGroupId;
  }

  async createRecord() {
    const dashboardItemRecord = this.getDashboardItemRecord();
    const reportRecord = this.getReportRecord();
    const dashboardItemRecordWithPermissionGroupId = await this.attachPermissionGroupId(
      dashboardItemRecord,
      reportRecord,
    );

    return this.models.wrapInTransaction(async transactingModels => {
      if (dashboardItemRecord.legacy) {
        await transactingModels.legacyReport.create(reportRecord);
      } else {
        await this.createReport(transactingModels, reportRecord);
      }
      const dashboardItem = await transactingModels.dashboardItem.create(
        dashboardItemRecordWithPermissionGroupId,
      );

      return {
        // The request/response schema differs slightly from the DB record schema
        // (eg request: report.config, DB: legacy_report.data_builder_config)
        // Use the requested data in the response to maintain their schema
        report: this.newRecordData.report,
        dashboardItem: { ...this.newRecordData.dashboardItem, id: dashboardItem.id },
      };
    });
  }

  async validateNewRecord() {
    const dashboardItemRecord = this.getDashboardItemRecord();
    const reportRecord = this.getReportRecord();

    const reportRecordType = dashboardItemRecord.legacy ? 'legacy_report' : 'report';
    const reportValidator = new ObjectValidator(
      constructNewRecordValidationRules(this.models, reportRecordType),
    );
    const dashboardItemValidator = new ObjectValidator(
      constructNewRecordValidationRules(this.models, 'dashboard_item'),
    );

    await reportValidator.validate(reportRecord);
    await dashboardItemValidator.validate(dashboardItemRecord);
  }
}
