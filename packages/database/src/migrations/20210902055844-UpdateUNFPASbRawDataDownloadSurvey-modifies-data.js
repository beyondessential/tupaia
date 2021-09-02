'use strict';

import { deleteObject, findSingleRecordBySql, insertObject, generateId } from '../utilities';

var dbm;
var type;
var seed;

const OLD_REPORT_CODE = 'UNFPA_Raw_Data_Reproductive_Health_Facility';
const NEW_REPORT_CODE = 'UNFPA_Raw_Data_Reproductive_Health_Facility_SB';
const DASHBOARD_CODE = 'SB_UNFPA_Raw Data Downloads';

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const swapDashboardItemInRelation = async (db, dashboardCode, oldItemCode, newItemCode) =>
  db.runSql(`
    UPDATE dashboard_relation
    SET child_id = new_di.id
    FROM dashboard d, dashboard_item old_di, dashboard_item new_di
    WHERE
      dashboard_id = d.id AND
      child_id = old_di.id AND
      d.code = '${dashboardCode}' AND
      old_di.code = '${oldItemCode}' AND
      new_di.code = '${newItemCode}'
`);

exports.up = async function (db) {
  await insertObject(db, 'legacy_report', {
    id: generateId(),
    code: NEW_REPORT_CODE,
    data_builder: 'surveyDataExport',
    data_builder_config: {
      surveys: [
        { code: 'RHFSCSI', name: 'Reproductive Health Facility Spot Check - Solomon Islands' },
      ],
      exportDataBuilder: {
        dataBuilder: 'rawDataValues',
        dataBuilderConfig: {
          skipHeader: false,
          surveysConfig: {
            RHFSCSI: { entityAggregation: { dataSourceEntityType: 'facility' } },
          },
          transformations: [{ type: 'transposeMatrix' }],
        },
      },
    },
  });

  await insertObject(db, 'dashboard_item', {
    id: generateId(),
    code: NEW_REPORT_CODE,
    config: {
      name: 'Download Reproductive Health Facility Spot Check Raw Data - Solomon Islands',
      type: 'view',
      viewType: 'dataDownload',
      periodGranularity: 'month',
    },
    report_code: NEW_REPORT_CODE,
    legacy: true,
  });

  await swapDashboardItemInRelation(db, DASHBOARD_CODE, OLD_REPORT_CODE, NEW_REPORT_CODE);
};

exports.down = async function (db) {
  await swapDashboardItemInRelation(db, DASHBOARD_CODE, NEW_REPORT_CODE, OLD_REPORT_CODE);
  await deleteObject(db, 'legacy_report', {
    code: NEW_REPORT_CODE,
  });
  await deleteObject(db, 'dashboard_item', {
    code: NEW_REPORT_CODE,
  });
};

exports._meta = {
  version: 1,
};
