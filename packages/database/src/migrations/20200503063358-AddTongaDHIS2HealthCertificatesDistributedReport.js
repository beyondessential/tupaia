'use strict';

import { insertObject } from '../utilities/migration';

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

const ALL_VALUE_CODES = [
  'CD65', // Shopkeeper - New
  'CD66', // Shopkeeper - Renewal
  'CD67', // Food Handler - New
  'CD68', // Food Handler - Renewal
];

const DATA_BUILDER_CONFIG = {
  dataClasses: {
    Shopkeeper: {
      numerator: {
        dataSource: {
          type: 'single',
          codes: ['CD65', 'CD66'],
        },
      },
      denominator: {
        dataSource: {
          type: 'single',
          codes: ALL_VALUE_CODES,
        },
      },
    },
    'Food Handler': {
      numerator: {
        dataSource: {
          type: 'single',
          codes: ['CD67', 'CD68'],
        },
      },
      denominator: {
        dataSource: {
          type: 'single',
          codes: ALL_VALUE_CODES,
        },
      },
    },
  },
};

const VIEW_JSON_CONFIG = {
  name: 'Health Certificates Distributed',
  type: 'chart',
  chartType: 'pie',
  valueType: 'fractionAndPercentage',
  periodGranularity: 'month',
  defaultTimePeriod: {
    start: {
      unit: 'year',
      modifier: 'start_of',
    },
  },
};

const DASHBOARD_GROUP = 'Tonga_Communicable_Diseases_National';

const REPORT_ID = 'TO_CD_Health_Certificates_Distributed';

const REPORT = {
  id: REPORT_ID,
  dataBuilder: 'percentagesPerDataClassByMonth',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON_CONFIG,
  dataServices: [{ isDataRegional: false }],
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${REPORT_ID}}'
    WHERE code = '${DASHBOARD_GROUP}';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT_ID}';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
    WHERE code = '${DASHBOARD_GROUP}';
  `);
};

exports._meta = {
  version: 1,
};
