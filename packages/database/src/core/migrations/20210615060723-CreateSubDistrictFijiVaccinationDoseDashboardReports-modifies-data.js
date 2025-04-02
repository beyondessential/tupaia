'use strict';

import { insertObject, arrayToDbString } from '../utilities/migration';

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

const DISTRICT_REPORT_IDS = [
  'FJ_Covid_Fiji_District_COVID-19_Num_Of_1st_Vaccine_Dose_Taken',
  'FJ_Covid_Fiji_District_COVID-19_Num_Of_2nd_Vaccine_Dose_Taken',
];

const DASHBOARD_GROUP_CODES = ['FJ_Covid_Fiji_SubDistrict_COVID-19'];

const getDataBuilderConfig = doseNum => ({
  dataClasses: {
    value: {
      codes: [doseNum === 1 ? 'COVIDVac4' : 'COVIDVac8'],
    },
  },
  aggregationType: 'FINAL_EACH_DAY',
  entityAggregation: {
    dataSourceEntityType: 'sub_district',
  },
});

const getViewJson = doseNum => ({
  name: `Number of people received ${
    doseNum === 1 ? '1st' : '2nd'
  } dose of COVID-19 vaccine by day`,
  type: 'chart',
  chartType: 'bar',
  periodGranularity: 'day',
  presentationOptions: {
    hideAverage: true,
  },
});

const getReport = ({ id, doseNum }) => ({
  id,
  dataBuilder: 'sumPerPeriod',
  dataBuilderConfig: getDataBuilderConfig(doseNum),
  viewJson: getViewJson(doseNum),
  dataServices: [{ isDataRegional: true }],
});

const SUB_DISTRICT_REPORTS = [
  {
    id: 'FJ_Covid_Fiji_SubDistrict_COVID-19_Num_Of_1st_Vaccine_Dose_Taken',
    doseNum: 1,
  },
  {
    id: 'FJ_Covid_Fiji_SubDistrict_COVID-19_Num_Of_2nd_Vaccine_Dose_Taken',
    doseNum: 2,
  },
];

exports.up = async function (db) {
  // Add new SUB_DISTIRCT level reports
  Promise.all(
    SUB_DISTRICT_REPORTS.map(reportConfig =>
      insertObject(db, 'dashboardReport', getReport(reportConfig)),
    ),
  );

  // Remove DISTRICT level reports from SUB_DISTRICT level dashboard group
  await Promise.all(
    DISTRICT_REPORT_IDS.map(reportId =>
      db.runSql(`
        UPDATE "dashboardGroup" 
        SET "dashboardReports" = array_remove("dashboardReports", '${reportId}')
        WHERE code IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
      `),
    ),
  );

  // Add new SUB_DISTRICT level reports into SUB_DISTRICT level dashboard group
  await Promise.all(
    SUB_DISTRICT_REPORTS.map(({ id }) =>
      db.runSql(`
        UPDATE "dashboardGroup" 
        SET "dashboardReports" = array_prepend('${id}', "dashboardReports")
        WHERE code IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
      `),
    ),
  );
};

exports.down = async function (db) {
  // Delete new SUB_DISTIRCT level reports
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id IN (${arrayToDbString(
      SUB_DISTRICT_REPORTS.map(dash => dash.id),
    )});
  `);

  // Add DISTRICT level reports back into SUB_DISTRICT level dashboard group
  await db.runSql(`
    UPDATE "dashboardGroup" 
    SET "dashboardReports" = "dashboardReports" || array[${arrayToDbString(DISTRICT_REPORT_IDS)}]
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);

  // Remove new SUB_DISTRICT level reports from SUB_DISTRICT level dashboard group
  await Promise.all(
    SUB_DISTRICT_REPORTS.map(({ id }) => {
      return db.runSql(`    
        UPDATE "dashboardGroup"
        SET "dashboardReports" = array_remove("dashboardReports", '${id}')
        WHERE code IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
    `);
    }),
  );
};

exports._meta = {
  version: 1,
};
