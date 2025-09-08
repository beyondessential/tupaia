import { ObjectValidator } from '@tupaia/utils';

import { CreateHandler } from '../CreateHandler';
import {
  assertBESAdminAccess,
  assertAnyPermissions,
  assertPermissionGroupsAccess,
  assertVizBuilderAccess,
} from '../../permissions';
import { constructNewRecordValidationRules } from '../utilities';

/**
 * Handles POST endpoints:
 * - /mapOverlayVisualisations
 */

export class CreateMapOverlayVisualisation extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertVizBuilderAccess],
        'BES Admin or Viz Builder User permission required to create a map overlay',
      ),
    );
  }

  getMapOverlayRecord() {
    return this.newRecordData.mapOverlay;
  }

  getReportRecord() {
    const { report, mapOverlay } = this.newRecordData;

    if (mapOverlay.legacy) {
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

  async createRecord() {
    const mapOverlayRecord = this.getMapOverlayRecord();
    const reportRecord = this.getReportRecord();

    return this.models.wrapInTransaction(async transactingModels => {
      if (mapOverlayRecord.legacy) {
        await transactingModels.legacyReport.create(reportRecord);
      } else {
        await this.createReport(transactingModels, reportRecord);
      }
      const mapOverlay = await transactingModels.mapOverlay.create(mapOverlayRecord);

      return {
        // The request/response schema differs slightly from the DB record schema
        // (eg request: report.config, DB: legacy_report.data_builder_config)
        // Use the requested data in the response to maintain their schema
        report: this.newRecordData.report,
        mapOverlay: { ...this.newRecordData.mapOverlay, id: mapOverlay.id },
      };
    });
  }

  async validateNewRecord() {
    const mapOverlayRecord = this.getMapOverlayRecord();
    const reportRecord = this.getReportRecord();

    const reportRecordType = mapOverlayRecord.legacy ? 'legacy_report' : 'report';
    const reportValidator = new ObjectValidator(
      constructNewRecordValidationRules(this.models, reportRecordType),
    );
    const mapOverlayValidator = new ObjectValidator(
      constructNewRecordValidationRules(this.models, 'map_overlay'),
    );

    await reportValidator.validate(reportRecord);
    await mapOverlayValidator.validate(mapOverlayRecord);
  }
}
