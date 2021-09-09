'use strict';

import { arrayToDbString, insertObject } from '../utilities';

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

const OLD_DASHBOARD_ID = 'Total_Number_Of_People_1st_Dose_Covid_Vaccine_By_District';

const FJ_DASHBOARD_ID = 'FJ_Total_Number_Of_People_1st_Dose_Covid_Vaccine';
const NR_DASHBOARD_ID = 'NR_Total_Number_Of_People_1st_Dose_Covid_Vaccine';

const FJ_DASHBOARD_GROUP_CODES = [
  'FJ_Covid_Fiji_Country_COVID-19',
  'FJ_Covid_Fiji_District_COVID-19',
];
const NR_DASHBOARD_GROUP_CODES = [
  'NR_Covid_Nauru_District_COVID-19',
  'NR_Covid_Nauru_Country_COVID-19',
];

const DASHBOARD_OBJECT = {
  dataBuilder: 'sum',
  dataBuilderConfig: {
    aggregationType: 'FINAL_EACH_DAY',
    dataElementCodes: ['COVIDVac4'],
    entityAggregation: {
      dataSourceEntityType: 'sub_district',
    },
  },
  viewJson: {
    name: 'Total number of people received 1st dose of COVID-19 vaccine',
    type: 'view',
    viewType: 'singleValue',
    valueType: 'number',
  },
};

exports.up = async function (db) {
  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", '${OLD_DASHBOARD_ID}')
    WHERE code IN (${arrayToDbString([...FJ_DASHBOARD_GROUP_CODES, ...NR_DASHBOARD_GROUP_CODES])});
  `);

  await db.runSql(`
    DELETE FROM "dashboardReport" 
    WHERE id =  '${OLD_DASHBOARD_ID}';
  `);

  await insertObject(db, 'dashboardReport', {
    id: FJ_DASHBOARD_ID,
    ...DASHBOARD_OBJECT,
  });

  await insertObject(db, 'dashboardReport', {
    id: NR_DASHBOARD_ID,
    ...DASHBOARD_OBJECT,
  });

  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${FJ_DASHBOARD_ID}}'
    WHERE code IN (${arrayToDbString(FJ_DASHBOARD_GROUP_CODES)});
  `);

  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${NR_DASHBOARD_ID}}'
    WHERE code IN (${arrayToDbString(NR_DASHBOARD_GROUP_CODES)});
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
