'use strict';

import { insertObject } from '../migrationUtilities';

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

const REPORT_ID = 'TO_CD_Validation_CD3';
const REPORT_NAME = 'Contact Tracing';

exports.up = async function(db) {
  await db.runSql(`DELETE FROM "dashboardReport" WHERE id = '${REPORT_ID}'`);

  return insertObject(db, 'dashboardReport', {
    id: REPORT_ID,
    dataBuilder: 'tableOfEvents',
    dataBuilderConfig: {
      columns: {
        CD3a_007: {
          sortOrder: 1,
        },
        CD3a_003: {},
        CD3a_004: {},
        CD3a_005: {},
        CD3a_006: {},
      },
      programCode: 'CD3a',
      stripFromColumnNames: 'CD3a ',
    },
    viewJson: {
      name: REPORT_NAME,
      type: 'chart',
      chartType: 'matrix',
      placeholder: '/static/media/PEHSMatrixPlaceholder.png',
      periodGranularity: 'one_month_at_a_time',
      drillDown: {
        keyLink: 'trackedEntityInstance',
        parameterLink: 'trackedEntityInstance',
      },
    },
    dataServices: [{ isDataRegional: false }],
  });
};

exports.down = function(db) {
  return db.runSql(`DELETE FROM "dashboardReport" WHERE "id" = '${REPORT_ID}';`);
};

exports._meta = {
  version: 1,
};
