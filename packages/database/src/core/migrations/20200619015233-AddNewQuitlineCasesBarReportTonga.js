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

const DASHBOARD_GROUP_CODE = 'TO_Health_Promotion_Unit_Country';

const REPORT = {
  id: 'TO_HPU_New_Quit_Support_Cases',
  dataBuilder: 'sumPerMonth',
  dataBuilderConfig: {
    dataClasses: {
      value: {
        codes: [
          'HP217', // 10-19- male
          'HP218', // 10-19- female
          'HP219a', // 20-29- male
          'HP219b', // 20-29- female
          'HP220a', // 30-39- male
          'HP220b', // 30-39- female
          'HP221a', // 40-49- male
          'HP221b', // 40-49- female
          'HP222a', // 50-59- male
          'HP222b', // 50-59- female
          'HP223', // 60 + years male
          'HP224', // 60 + years female
        ],
      },
    },
  },
  viewJson: {
    name: 'New cases registered for Quit support',
    type: 'chart',
    chartType: 'bar',
    periodGranularity: 'month',
    presentationOptions: { hideAverage: true },
  },
  dataServices: [{ isDataRegional: false }],
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
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
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
