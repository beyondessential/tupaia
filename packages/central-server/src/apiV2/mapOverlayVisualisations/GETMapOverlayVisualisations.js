import { keyBy } from 'es-toolkit/compat';

import { RECORDS } from '@tupaia/database';
import { camelKeys } from '@tupaia/utils';

import { GETHandler } from '../GETHandler';
import {
  assertBESAdminAccess,
  assertAnyPermissions,
  assertAdminPanelAccess,
  assertPermissionGroupsAccess,
} from '../../permissions';

const buildReportObject = (report, legacy, permissionGroupsById) => {
  if (legacy) {
    return {
      code: report.code,
      dataBuilder: report.data_builder,
      config: report.data_builder_config,
      dataServices: report.data_services,
    };
  }

  return {
    code: report.code,
    config: report.config,
    permissionGroup: permissionGroupsById[report.permission_group_id]?.name || null,
    latestDataParameters: report.latest_data_parameters || {},
  };
};

const buildVisualisationObject = (mapOverlayObject, referencedRecords) => {
  const { model, ...mapOverlay } = mapOverlayObject;
  const { reportsByCode, legacyReportsByCode, permissionGroupsById } = referencedRecords;
  const { report_code: reportCode, legacy } = mapOverlay;

  const report = reportsByCode[reportCode] || legacyReportsByCode[reportCode];
  if (!report) {
    throw new Error(`Cannot find a report for visualisation "${mapOverlay.report_code}"`);
  }

  return {
    mapOverlay: camelKeys(mapOverlay),
    report: buildReportObject(report, legacy, permissionGroupsById),
  };
};

const parseCriteria = criteria => {
  const { 'map_overlay_visualisation.id': id, 'map_overlay_visualisation.code': code } = criteria;
  if (!id && !code) {
    throw new Error('Must specify at least one visualisation id or code');
  }

  return {
    'map_overlay.id': id,
    'map_overlay.code': code,
  };
};

/**
 * Handles endpoints:
 * - GET /mapOverlayVisualisations/:mapOverlayVisualisationId
 */
export class GETMapOverlayVisualisations extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertAdminPanelAccess],
        'You require Tupaia Admin Panel or BES Admin permission to fetch visualisations.',
      ),
    );
  }

  async getDbQueryOptions() {
    return undefined;
  }

  async findSingleRecord(mapOverlayVisualisationId) {
    const [mapOverlay] = await this.database.find(RECORDS.MAP_OVERLAY, {
      id: mapOverlayVisualisationId,
    });

    if (!mapOverlay) {
      throw new Error('Visualisation does not exist');
    }

    const referencedRecords = await this.findReferencedRecords([mapOverlay]);
    return buildVisualisationObject(mapOverlay, referencedRecords);
  }

  async findRecords(inputCriteria) {
    const criteria = parseCriteria(inputCriteria);

    const mapOverlays = await this.models.mapOverlay.find(criteria);
    const referencedRecords = await this.findReferencedRecords(mapOverlays);

    return mapOverlays.map(mapOverlay => buildVisualisationObject(mapOverlay, referencedRecords));
  }

  async findReferencedRecords(mapOverlays) {
    const reports = await this.findReportsByLegacyValue(mapOverlays, false);
    const legacyReports = await this.findReportsByLegacyValue(mapOverlays, true);
    const permissionGroups = await this.models.permissionGroup.find({
      id: reports.map(r => r.permission_group_id).filter(r => !!r),
    });
    const permissionGroupNames = permissionGroups.map(permissionGroup => permissionGroup.name);
    await assertPermissionGroupsAccess(this.accessPolicy, permissionGroupNames);

    return {
      reportsByCode: keyBy(reports, 'code'),
      legacyReportsByCode: keyBy(legacyReports, 'code'),
      permissionGroupsById: keyBy(permissionGroups, 'id'),
    };
  }

  async findReportsByLegacyValue(mapOverlays, legacy) {
    const codes = mapOverlays.filter(mo => mo.legacy === legacy).map(mo => mo.report_code);
    return legacy
      ? this.models.legacyReport.find({ code: codes })
      : this.models.report.find({ code: codes });
  }

  async countRecords(inputCriteria) {
    return this.database.countFast(RECORDS.MAP_OVERLAY, parseCriteria(inputCriteria), {
      joinWith: 'report',
      joinCondition: ['map_overlay.report_code', 'report.code'],
    });
  }
}
