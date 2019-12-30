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
const REPORT_NAME = 'Contact Tracing - Contacts';

exports.up = async function(db) {
  return insertObject(db, 'dashboardReport', {
    id: REPORT_ID,
    drillDownLevel: 1,
    dataBuilder: 'tableOfEvents',
    dataBuilderConfig: {
      columns: {
        CD3b_003: {},
        CD3b_004: {},
        CD3b_005: {},
        CD3b_006: {},
        CD3b_007: {
          title: 'Result Status',
          additionalData: [
            'CD3b_008_A30_9',
            'CD3b_009_A74_9',
            'CD3b_010_A54_9',
            'CD3b_011_A53_9',
            'CD3b_012_Z21',
            'CD3b_013_B16_9',
            'CD3b_014_A01_0',
            'CD3b_014a_A39_9',
          ],
        },
        CD3b_015: {},
      },
      programCode: 'CD3b',
      stripFromColumnNames: 'CD3b ',
    },
    viewJson: {
      name: REPORT_NAME,
      type: 'chart',
      chartType: 'matrix',
      placeholder: '/static/media/PEHSMatrixPlaceholder.png',
      periodGranularity: 'one_month_at_a_time',
    },
    dataServices: [{ isDataRegional: false }],
  });
};

exports.down = function(db) {
  return db.runSql(
    `DELETE FROM "dashboardReport" WHERE "id" = '${REPORT_ID}' AND "drillDownLevel" = 1;`,
  );
};

exports._meta = {
  version: 1,
};
