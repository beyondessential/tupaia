'use strict';

import { insertObject, arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

const DASHBOARD_GROUPS = [
  'LA_Laos_Schools_Country_Laos_Schools_Super_User',
  'LA_Laos_Schools_Province_Laos_Schools_Super_User',
  'LA_Laos_Schools_District_Laos_Schools_Super_User',
  'LA_Laos_Schools_School_Laos_Schools_Super_User',
];

const REPORT_ID = 'Laos_Schools_Language_Of_Students';

const ALL_VALUE_CODES = ['SchFF018', 'SchFF019', 'SchFF020', 'SchFF021', 'SchFF022', 'SchFF023'];

const DATA_BUILDER_CONFIG = {
  dataSourceEntityType: 'school',
  disableFilterOperationalFacilityValues: true,
  dataClasses: {
    'Lao-Thai': {
      numerator: {
        dataSource: {
          type: 'single',
          codes: ['SchFF018'],
        },
      },
      denominator: {
        dataSource: {
          type: 'single',
          codes: ALL_VALUE_CODES,
        },
      },
    },
    'Mon-Khmer': {
      numerator: {
        dataSource: {
          type: 'single',
          codes: ['SchFF019'],
        },
      },
      denominator: {
        dataSource: {
          type: 'single',
          codes: ALL_VALUE_CODES,
        },
      },
    },
    'Chinese-Tibetan': {
      numerator: {
        dataSource: {
          type: 'single',
          codes: ['SchFF020'],
        },
      },
      denominator: {
        dataSource: {
          type: 'single',
          codes: ALL_VALUE_CODES,
        },
      },
    },
    'Hmong-Mien': {
      numerator: {
        dataSource: {
          type: 'single',
          codes: ['SchFF021'],
        },
      },
      denominator: {
        dataSource: {
          type: 'single',
          codes: ALL_VALUE_CODES,
        },
      },
    },
    Foreigner: {
      numerator: {
        dataSource: {
          type: 'single',
          codes: ['SchFF022'],
        },
      },
      denominator: {
        dataSource: {
          type: 'single',
          codes: ALL_VALUE_CODES,
        },
      },
    },
    Other: {
      numerator: {
        dataSource: {
          type: 'single',
          codes: ['SchFF023'],
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

const VIEW_JSON = {
  name: 'Language of students',
  type: 'chart',
  chartType: 'pie',
  valueType: 'fractionAndPercentage',
  periodGranularity: 'month',
};

const DATA_SERVICES = [
  {
    isDataRegional: false,
  },
];

const DASHBOARD_REPORT = {
  id: REPORT_ID,
  dataBuilder: 'percentagesPerDataClass',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON,
  dataServices: DATA_SERVICES,
};

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', DASHBOARD_REPORT);

  await db.runSql(`	
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${REPORT_ID}}'
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUPS)})
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT_ID}';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUPS)});
  `);
};

exports._meta = {
  version: 1,
};
