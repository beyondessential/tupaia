'use strict';

import { insertObject, arrayToDbString } from '../utilities';

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

const DASHBOARD_REPORT_ID = 'LAOS_SCHOOL_BINARY_TABLE';
const DASHBOARD_REPORT_NAME = 'School Fundamentals';

const DATA_ELEMENTS = {
  SchFF001: 'Electricity available in school',
  SchFF002: 'Internet connection available in school',
  SchFF003: 'Does this school have a Dormitory',
  BCD29_event: 'Does this school have a functioning water supply?',
  BCD32_event: 'Does this school have a functioning toilet?',
  SchFF004: 'Are there hand washing facilities available?',
  SchFF008:
    'Has the school received (hard copies of) learning materials for (remote) communities with limited internet and TV access',
  SchFF009:
    'Has the school been provided with cleaning/disinfecting materials and guidance provided on their use',
  SchFF009a: 'Has the school been provided with hygiene kits',
  SchFF010:
    'Has the school received training on safe school protocols (COVID-19 prevention and control)',
  SchFF011: 'Is the school implementing remedial education programmes',
  SchFF016: 'Is the school provided with psychosocial support',
  SchQuar001: 'Has this school been identified as a COVID-19 Quarantine Center?',
};

const SCHOOL_BINARY_DASHBOARD = {
  id: DASHBOARD_REPORT_ID,
  dataBuilder: 'sumLatestPerMetric',
  dataBuilderConfig: {
    dataElementCodes: Object.keys(DATA_ELEMENTS),
    dataSourceEntityType: 'school',
  },
  viewJson: {
    name: DASHBOARD_REPORT_NAME,
    type: 'view',
    viewType: 'multiValue',
    valueType: 'boolean',
  },
  dataServices: [
    {
      isDataRegional: true,
    },
  ],
};
const DASHBOARD_GROUP_CODES = [
  'LA_Laos_Schools_School_Laos_Schools_User',
  'LA_Laos_Schools_School_Laos_Schools_Super_User',
];

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', SCHOOL_BINARY_DASHBOARD);

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${DASHBOARD_REPORT_ID} }'
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
`);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${DASHBOARD_REPORT_ID}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${DASHBOARD_REPORT_ID}')
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
