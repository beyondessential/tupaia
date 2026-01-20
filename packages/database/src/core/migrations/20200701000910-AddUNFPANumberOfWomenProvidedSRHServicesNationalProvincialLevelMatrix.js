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
  'WS_Unfpa_Country',
  'WS_Unfpa_District',
  'MH_Unfpa_Country',
  'MH_Unfpa_District',
  'TO_Unfpa_Country',
  'TO_Unfpa_District',
  'FM_Unfpa_Country',
  'FM_Unfpa_District',
  'VU_Unfpa_Country',
  'VU_Unfpa_District',
  'FJ_Unfpa_Country',
  'FJ_Unfpa_District',
  'SB_Unfpa_Country',
  'SB_Unfpa_District',
  'DL_Unfpa_Country',
  'DL_Unfpa_District',
  'KI_Unfpa_Country',
  'KI_Unfpa_District',
];

const REPORT_ID = 'UNFPA_RH_Number_Of_Women_Provided_SRH_Services_Matrix_National_Provincial';

const DATA_BUILDER_CONFIG = {
  rows: ['Delivery', 'ANC', 'PNC', 'Number of Facilities Surveyed'],
  cells: [
    [
      {
        calc: 'SUM',
        dataElement: 'RHS3UNFPA644',
      },
    ],
    [
      {
        calc: 'SUM',
        dataElement: 'RHS3UNFPA633',
      },
    ],
    [
      {
        calc: 'SUM',
        dataElement: 'RHS3UNFPA636',
      },
    ],
    [
      {
        calc: 'COUNT_ENTITIES_IN_ANALYTICS',
        dataElement: 'NONE',
        // Uses dataElements from other cells
      },
    ],
  ],
  columns: {
    type: '$period',
    periodType: 'quarter',
    aggregationType: 'FINAL_EACH_QUARTER',
  },
  entityAggregation: {
    dataSourceEntityType: 'facility',
    // NO AGGREGATION, would break COUNT_ENTITIES_IN_ANALYTICS!
  },
};

const VIEW_JSON = {
  name: 'Number of women provided SRH services in past 6 months',
  type: 'matrix',
  placeholder: '/static/media/PEHSMatrixPlaceholder.png',
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
