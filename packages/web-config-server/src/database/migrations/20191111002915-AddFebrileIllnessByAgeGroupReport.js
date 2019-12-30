'use strict';

import { insertObject, arrayToDbString } from '../migrationUtilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const REPORT = {
  id: 'PG_Strive_PNG_Febrile_Cases_By_Age',
  name: '% Febrile Cases by Age',
  programCode: 'SCRF',
};
const DATA_VALUES = {
  underFive: { STR_CRF12: { operator: '<', value: 5 } },
  fiveOrOlder: { STR_CRF12: { operator: '>=', value: 5 } },
  hasFever: { STR_CRF125: '1' },
};
const DASHBOARD_GROUP_CODES = ['PG_Strive_PNG_Facility'];

exports.up = async function(db) {
  await insertObject(db, 'dashboardReport', {
    id: REPORT.id,
    dataBuilder: 'percentagesOfEventCounts',
    dataBuilderConfig: {
      programCode: REPORT.programCode,
      dataClasses: {
        'Less than 5 years old': {
          numerator: {
            dataValues: DATA_VALUES.underFive,
          },
          denominator: {
            dataValues: DATA_VALUES.hasFever,
          },
        },
        'Five years or older': {
          numerator: {
            dataValues: DATA_VALUES.fiveOrOlder,
          },
          denominator: {
            dataValues: DATA_VALUES.hasFever,
          },
        },
      },
    },
    viewJson: {
      name: REPORT.name,
      type: 'chart',
      chartType: 'pie',
      periodGranularity: 'one_week_at_a_time',
      valueType: 'percentage',
    },
  });

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
`);
};

exports.down = function(db) {
  return db.runSql(`
  DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';

  UPDATE
    "dashboardGroup"
  SET
    "dashboardReports" = array_remove("dashboardReports", '${REPORT.id}')
  WHERE
    "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
`);
};

exports._meta = {
  version: 1,
};
