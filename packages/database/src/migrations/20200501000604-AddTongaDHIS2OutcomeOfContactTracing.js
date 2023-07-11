'use strict';

var dbm;
var type;
var seed;

const TREATMENT_IN_PROGRESS = 'Treatment in Progress';
const TREATED = 'Treated';
const UNTREATED = 'Untreated';
const NO_TREATMENT_REQUIRED = 'No Treatment Required';
const UNKNOWN = 'Unknown';

const COMMON_DENOMINATOR = {
  dataValues: {
    CD3b_015: '*',
  },
};

const DATA_BUILDER_CONFIG = {
  dataClasses: {
    [TREATMENT_IN_PROGRESS]: {
      numerator: {
        dataValues: {
          CD3b_015: TREATMENT_IN_PROGRESS,
        },
      },
      denominator: COMMON_DENOMINATOR,
    },
    [TREATED]: {
      numerator: {
        dataValues: {
          CD3b_015: TREATED,
        },
      },
      denominator: COMMON_DENOMINATOR,
    },
    [UNTREATED]: {
      numerator: {
        dataValues: {
          CD3b_015: UNTREATED,
        },
      },
      denominator: COMMON_DENOMINATOR,
    },
    [NO_TREATMENT_REQUIRED]: {
      numerator: {
        dataValues: {
          CD3b_015: NO_TREATMENT_REQUIRED,
        },
      },
      denominator: COMMON_DENOMINATOR,
    },
    [UNKNOWN]: {
      numerator: {
        dataValues: {
          CD3b_015: UNKNOWN,
        },
      },
      denominator: COMMON_DENOMINATOR,
    },
  },
  programCode: 'CD3b',
};

const REPORT_ID = 'TO_CD_Outcome_Of_Contact_Tracing';

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
  name: ' Outcome of Contact Tracing',
  type: 'chart',
  chartType: 'pie',
  periodGranularity: 'one_month_at_a_time',
  valueType: 'fractionAndPercentage',
};

exports.up = async function (db) {
  await db.runSql(`
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson", "dataServices")
    VALUES (
      '${REPORT_ID}',
      'percentagesOfEventCounts',
      '${JSON.stringify(DATA_BUILDER_CONFIG)}',
      '${JSON.stringify(VIEW_JSON_CONFIG)}',
      '[{"isDataRegional": false}]'
    );

    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${REPORT_ID}}'
    WHERE code = 'Tonga_Communicable_Diseases_National'
    AND "organisationLevel" = 'Country';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT_ID}';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
    WHERE code = 'Tonga_Communicable_Diseases_National'
    AND "organisationLevel" = 'Country';
  `);
};

exports._meta = {
  version: 1,
};
