/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';
import { ObjectValidator, constructRecordExistsWithId } from '@tupaia/utils';

import { EditHandler } from '../EditHandler';
import { assertBESAdminAccess } from '../../permissions';

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

export class EditMapOverlayVisualisation extends EditHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }

  getMapOverlayRecord() {
    return this.updatedFields.mapOverlay;
  }

  getReportRecord() {
    const { report, mapOverlay } = this.updatedFields;

    if (mapOverlay.legacy) {
      const { config, ...otherReportFields } = report;
      return { ...otherReportFields, data_builder_config: config };
    }
    return report;
  }

  async upsertReport(models, mapOverlay, reportRecord) {
    const mapOverlayRecord = this.getMapOverlayRecord();
    const legacy = mapOverlayRecord.legacy ?? mapOverlay.legacy;
    const { report_code: code } = mapOverlayRecord;

    const report = legacy ? reportRecord : await buildReport(models, reportRecord);

    if (isFieldUpdated(mapOverlay, mapOverlayRecord, 'legacy')) {
      // `Legacy` value has been updated, need to use a different table for the report
      return legacy ? models.legacyReport.create(report) : models.report.create(report);
    }
    return legacy
      ? models.legacyReport.update({ code }, report)
      : models.report.update({ code }, report);
  }

  async validateRecordExists() {
    const validationCriteria = {
      id: [constructRecordExistsWithId(this.database, TYPES.MAP_OVERLAY)],
    };

    const validator = new ObjectValidator(validationCriteria);
    return validator.validate({ id: this.recordId }); // Will throw an error if not valid
  }

  async updateMapOverlay(transactingModels, mapOverlay, mapOverlayRecord) {
    const { code } = mapOverlay;
    return transactingModels.mapOverlay.update({ code }, mapOverlayRecord);
  }

  async editRecord() {
    await this.assertPermissions(assertBESAdminAccess);

    return this.models.wrapInTransaction(async transactingModels => {
      const mapOverlayRecord = this.getMapOverlayRecord();
      const reportRecord = this.getReportRecord();

      if (mapOverlayRecord.id !== undefined && mapOverlayRecord.id !== this.recordId) {
        throw new Error(`mapOverlay.id is different from resource id: ${this.recordId}`);
      }

      const mapOverlay = await transactingModels.mapOverlay.findById(this.recordId);
      await this.upsertReport(transactingModels, mapOverlay, reportRecord);
      await this.updateMapOverlay(transactingModels, mapOverlay, mapOverlayRecord);

      return { report: reportRecord, mapOverlay: mapOverlayRecord };
    });
  }
}
