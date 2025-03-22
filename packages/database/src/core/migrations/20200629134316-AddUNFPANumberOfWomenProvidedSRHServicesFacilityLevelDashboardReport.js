'use strict';

import { insertObject } from '../utilities/migration';
import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const DASHBOARD_GROUP_CODES = [
  'WS_Unfpa_Facility',
  'MH_Unfpa_Facility',
  'TO_Unfpa_Facility',
  'FM_Unfpa_Facility',
  'VU_Unfpa_Facility',
  'FJ_Unfpa_Facility',
  'SB_Unfpa_Facility',
  'DL_Unfpa_Facility',
  'KI_Unfpa_Facility',
];

const REPORT_ID = 'UNFPA_RH_Number_Of_Women_Provided_SRH_Services_Matrix';

const DATA_BUILDER_CONFIG = {
  rows: ['Delivery', 'ANC', 'PNC'],
  cells: [['RHS3UNFPA644'], ['RHS3UNFPA633'], ['RHS3UNFPA636']],
  columns: {
    type: '$period',
    periodType: 'quarter',
    name: '# women',
    aggregationType: 'FINAL_EACH_QUARTER',
    fillEmptyPeriods: true,
  },
  baselineColumns: [
    {
      name: 'Does this facility offer the service?',
      dataElements: ['RHS3UNFPA536', 'RHS3UNFPA4121', 'RHS3UNFPA464'],
    },
  ],
};

const VIEW_JSON = {
  name: 'Number of women provided SRH services in past 6 months',
  type: 'matrix',
  placeholder: '/static/media/PEHSMatrixPlaceholder.png',
  periodGranularity: 'one_year_at_a_time',
  presentationOptions: {
    1: {
      color: 'green',
      label: '',
      description: "**Green** indicates 'Yes' to the corresponding indicator.\n",
    },
    0: {
      color: 'red',
      label: '',
      description: "**Red** indicates 'No' to the corresponding indicator.\n",
    },
    applyLocation: {
      columnIndexes: [0],
    },
  },
};

const REPORT = {
  id: REPORT_ID,
  dataBuilder: 'tableOfValuesPerPeriod',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON,
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT.id}')
    WHERE
      "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
