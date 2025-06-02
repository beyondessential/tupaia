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

const REPORT_1 = {
  id: 'Laos_Schools_MoES_Users_Percent_School',
  dataBuilder: 'composeSinglePercentage',
  dataBuilderConfig: {
    dataBuilders: {
      numerator: {
        dataBuilder: 'sumLatest',
        dataBuilderConfig: {
          dataElementCodes: ['SchFF013'],
          aggregationEntityType: 'school',
          dataSourceEntityType: 'school',
        },
      },
      denominator: {
        dataBuilder: 'sumLatest',
        dataBuilderConfig: {
          dataElementCodes: ['SchPop035', 'SchPop036'],
          aggregationEntityType: 'school',
          dataSourceEntityType: 'school',
        },
      },
    },
    aggregationEntityType: 'school',
    dataSourceEntityType: 'school',
  },
  viewJson: {
    name: 'Teachers using resources available on MoES website',
    type: 'view',
    viewType: 'singleValue',
    valueType: 'fractionAndPercentage',
  },
  dataServices: [{ isDataRegional: true }],
};

const REPORT_2 = {
  id: 'Laos_Schools_Primary_Standardised_Tests_School',
  dataBuilder: 'composeSinglePercentage',
  dataBuilderConfig: {
    dataBuilders: {
      numerator: {
        dataBuilder: 'sumLatest',
        dataBuilderConfig: {
          dataElementCodes: ['SchFF015'],
          aggregationEntityType: 'school',
          dataSourceEntityType: 'school',
        },
      },
      denominator: {
        dataBuilder: 'sumLatest',
        dataBuilderConfig: {
          dataElementCodes: ['SchPop035', 'SchPop036'],
          aggregationEntityType: 'school',
          dataSourceEntityType: 'school',
        },
      },
    },
    aggregationEntityType: 'school',
    dataSourceEntityType: 'school',
  },
  viewJson: {
    name: 'Primary teachers reporting using standardized tests to access students learning (gaps)',
    type: 'view',
    viewType: 'singleValue',
    valueType: 'fractionAndPercentage',
  },
  dataServices: [{ isDataRegional: true }],
};

const DASHBOARD_GROUP_CODES = ['LA_Laos_Schools_School_Laos_Schools_User'];

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT_1);
  await insertObject(db, 'dashboardReport', REPORT_2);

  await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT_1.id} }'
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);

  await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT_2.id} }'
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT_1.id}';
    DELETE FROM "dashboardReport" WHERE id = '${REPORT_2.id}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT_1.id}')
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT_2.id}')
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
