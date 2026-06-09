'use strict';

import { insertObject, arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

const CHURCH = 'Church';
const WORKPLACE = 'Workplace';
const SCHOOL = 'School';
const COMMUNITY = 'Community';

const DATA_ELEMENT = 'HP4';

const COMMON_DENOMINATOR = {
  dataValues: {
    [DATA_ELEMENT]: '*',
  },
};

const DATA_BUILDER_CONFIG = {
  dataClasses: {
    [CHURCH]: {
      numerator: {
        dataValues: {
          [DATA_ELEMENT]: CHURCH,
        },
      },
      denominator: COMMON_DENOMINATOR,
    },
    [WORKPLACE]: {
      numerator: {
        dataValues: {
          [DATA_ELEMENT]: WORKPLACE,
        },
      },
      denominator: COMMON_DENOMINATOR,
    },
    [SCHOOL]: {
      numerator: {
        dataValues: {
          [DATA_ELEMENT]: SCHOOL,
        },
      },
      denominator: COMMON_DENOMINATOR,
    },
    [COMMUNITY]: {
      numerator: {
        dataValues: {
          [DATA_ELEMENT]: COMMUNITY,
        },
      },
      denominator: COMMON_DENOMINATOR,
    },
  },
  programCode: 'HP01',
};

const REPORT_ID = 'TO_HPU_Activity_Sessions_By_Setting';

const DASHBOARD_GROUP_CODES = ['TO_Health_Promotion_Unit_Country'];
/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const VIEW_JSON_CONFIG = {
  name: 'Number of physical activity sessions by setting type',
  type: 'chart',
  chartType: 'pie',
  periodGranularity: 'one_year_at_a_time',
  valueType: 'fractionAndPercentage',
};

const REPORT = {
  id: REPORT_ID,
  dataBuilder: 'percentagesOfEventCounts',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON_CONFIG,
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
        "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
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
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
