'use strict';

import { insertObject, arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

const DASHBOARD_GROUPS = [
  'LA_Laos_Schools_Country_Laos_Schools_User',
  'LA_Laos_Schools_Province_Laos_Schools_User',
  'LA_Laos_Schools_District_Laos_Schools_User',
  'LA_Laos_Schools_School_Laos_Schools_User',
];

const REPORT_ID = 'Laos_Schools_Male_Female';

const ALL_VALUE_CODES = [
  'SchPop002',
  'SchPop004',
  'SchPop006',
  'SchPop008',
  'SchPop010',
  'SchPop012',
  'SchPop014',
  'SchPop016',
  'SchPop018',
  'SchPop020',
  'SchPop022',
  'SchPop024',
  'SchPop026',
  'SchPop028',
  'SchPop030',
  'SchPop032',
  'SchPop034',
  'SchPop001',
  'SchPop003',
  'SchPop005',
  'SchPop007',
  'SchPop009',
  'SchPop011',
  'SchPop013',
  'SchPop015',
  'SchPop017',
  'SchPop019',
  'SchPop021',
  'SchPop023',
  'SchPop025',
  'SchPop027',
  'SchPop029',
  'SchPop031',
  'SchPop033',
];

const DATA_BUILDER_CONFIG = {
  dataSourceEntityType: 'school',
  disableFilterOperationalFacilityValues: true,
  dataClasses: {
    Male: {
      numerator: {
        dataSource: {
          type: 'single',
          codes: [
            'SchPop002',
            'SchPop004',
            'SchPop006',
            'SchPop008',
            'SchPop010',
            'SchPop012',
            'SchPop014',
            'SchPop016',
            'SchPop018',
            'SchPop020',
            'SchPop022',
            'SchPop024',
            'SchPop026',
            'SchPop028',
            'SchPop030',
            'SchPop032',
            'SchPop034',
          ],
        },
      },
      denominator: {
        dataSource: {
          type: 'single',
          codes: ALL_VALUE_CODES,
        },
      },
    },
    Female: {
      numerator: {
        dataSource: {
          type: 'single',
          codes: [
            'SchPop001',
            'SchPop003',
            'SchPop005',
            'SchPop007',
            'SchPop009',
            'SchPop011',
            'SchPop013',
            'SchPop015',
            'SchPop017',
            'SchPop019',
            'SchPop021',
            'SchPop023',
            'SchPop025',
            'SchPop027',
            'SchPop029',
            'SchPop031',
            'SchPop033',
          ],
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
  name: 'Male/Female',
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
